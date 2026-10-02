import { createHmac, randomUUID } from "crypto";
import type { NextApiRequest } from "next";
import connectDB from "@/lib/mongodb";
import AnalyticsEvent, {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventName,
} from "@/models/AnalyticsEvent";
import AnalyticsRateLimit from "@/models/AnalyticsRateLimit";
import AnalyticsSession, { type SessionVisitorType } from "@/models/AnalyticsSession";
import AnalyticsVisitor from "@/models/AnalyticsVisitor";
import { extractGeoLocation } from "@/lib/geo";
import { classifyVisitor } from "@/lib/bot-detection";
import { friendlySourceName, extractUtmParams } from "@/lib/referrer-map";
import { parseUserAgent, type DeviceType } from "@/lib/ua-parser";

// Re-export for backward compatibility
export type AnalyticsDevice = DeviceType;

export interface AnalyticsEventInput {
  type: AnalyticsEventName;
  path: string;
  target?: string;
  metadata?: Record<string, string>;
}

/** Client-side information sent alongside the event batch. */
export interface ClientInfo {
  deviceId?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
}

const MAX_EVENTS_PER_BATCH = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 120;
const SESSION_RETENTION_DAYS = Number(process.env.ANALYTICS_RETENTION_DAYS || 180);

function retentionExpiry(now: Date): Date {
  const days = Number.isFinite(SESSION_RETENTION_DAYS)
    ? Math.min(Math.max(Math.floor(SESSION_RETENTION_DAYS), 1), 730)
    : 180;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function analyticsSecret(): string {
  const secret = process.env.ANALYTICS_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ANALYTICS_HASH_SECRET must be set to a value of at least 32 characters");
  }
  return secret;
}

function hmac(value: string): string {
  return createHmac("sha256", analyticsSecret()).update(value).digest("base64url");
}

export function getClientIp(req: NextApiRequest): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || null;
  if (Array.isArray(forwarded)) return forwarded[0]?.split(",")[0]?.trim() || null;
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") return realIp.trim() || null;
  return req.socket.remoteAddress || null;
}

export function hashVisitorIdentifier(ip: string | null, sessionId: string): string {
  // Falling back to the session means an unavailable address cannot join visitors together.
  const source = ip && ip !== "unknown" ? `ip:${ip}` : `session:${sessionId}`;
  return hmac(source);
}

export function isAnalyticsSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

export function getAnalyticsSessionId(req: NextApiRequest): string | null {
  const value = req.headers["x-analytics-session-id"];
  const sessionId = Array.isArray(value) ? value[0] : value;
  return isAnalyticsSessionId(sessionId) ? sessionId : null;
}

function compact(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, " ");
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function safePath(value: unknown): string | undefined {
  const raw = compact(value, 600);
  if (!raw || !raw.startsWith("/")) return undefined;
  try {
    return new URL(raw, "https://analytics.local").pathname.slice(0, 300);
  } catch {
    return undefined;
  }
}

function safeMetadata(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const allowed = new Set(["destination", "source", "label"]);
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key, entry]) => allowed.has(key) && typeof entry === "string")
    .map(([key, entry]) => [key, compact(entry, 100)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function validateAnalyticsEvents(value: unknown): AnalyticsEventInput[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_EVENTS_PER_BATCH) {
    return null;
  }

  const events: AnalyticsEventInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const event = item as Record<string, unknown>;
    if (
      typeof event.type !== "string" ||
      !ANALYTICS_EVENT_NAMES.includes(event.type as AnalyticsEventName)
    ) {
      return null;
    }
    const path = safePath(event.path);
    if (!path) return null;
    const target = compact(event.target, 160);
    const metadata = safeMetadata(event.metadata);
    events.push({
      type: event.type as AnalyticsEventName,
      path,
      ...(target ? { target } : {}),
      ...(metadata ? { metadata } : {}),
    });
  }
  return events;
}

/** Validate and extract client info from the request body. */
export function extractClientInfo(body: Record<string, unknown>): ClientInfo {
  const info: ClientInfo = {};

  // Device ID (anonymous cookie UUID)
  if (isAnalyticsSessionId(body.deviceId)) {
    info.deviceId = body.deviceId;
  }

  // Screen dimensions
  const screen = body.screen;
  if (screen && typeof screen === "object" && !Array.isArray(screen)) {
    const s = screen as Record<string, unknown>;
    if (typeof s.width === "number" && typeof s.height === "number") {
      info.screenWidth = Math.round(Math.min(Math.max(s.width, 0), 10000));
      info.screenHeight = Math.round(Math.min(Math.max(s.height, 0), 10000));
    }
  }

  // Timezone
  if (typeof body.timezone === "string" && body.timezone.length <= 64) {
    info.timezone = body.timezone.trim() || undefined;
  }

  return info;
}

function referrerDomain(req: NextApiRequest): string {
  const raw = req.headers.referer;
  if (typeof raw !== "string") return "direct";
  try {
    const hostname = new URL(raw).hostname.toLowerCase();
    const host = req.headers.host?.split(":")[0]?.toLowerCase();
    return hostname && hostname !== host ? hostname.slice(0, 253) : "direct";
  } catch {
    return "direct";
  }
}

async function consumeRateLimit(key: string, cost: number): Promise<boolean> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
  const expiresAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS * 2);

  const withinWindow = await AnalyticsRateLimit.findOneAndUpdate(
    { key, windowStartedAt: { $gt: cutoff }, count: { $lte: RATE_LIMIT_MAX_EVENTS - cost } },
    { $inc: { count: cost }, $set: { expiresAt } },
    { returnDocument: "after" }
  ).lean();
  if (withinWindow) return true;

  const resetWindow = await AnalyticsRateLimit.findOneAndUpdate(
    { key, windowStartedAt: { $lte: cutoff } },
    { $set: { windowStartedAt: now, count: cost, expiresAt } },
    { returnDocument: "after" }
  ).lean();
  if (resetWindow) return true;

  try {
    await AnalyticsRateLimit.create({ key, windowStartedAt: now, count: cost, expiresAt });
    return true;
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }

  return Boolean(
    await AnalyticsRateLimit.findOneAndUpdate(
      { key, windowStartedAt: { $gt: cutoff }, count: { $lte: RATE_LIMIT_MAX_EVENTS - cost } },
      { $inc: { count: cost }, $set: { expiresAt } },
      { returnDocument: "after" }
    ).lean()
  );
}

export async function recordAnalyticsEvents(
  req: NextApiRequest,
  sessionId: string,
  events: AnalyticsEventInput[],
  clientInfoOrOptions: ClientInfo & { rateLimit?: boolean } = {},
  options: { rateLimit?: boolean } = {}
): Promise<{ accepted: boolean; rateLimited?: boolean }> {
  const now = new Date();
  const expiresAt = retentionExpiry(now);

  const clientInfo: ClientInfo = clientInfoOrOptions;
  const effectiveRateLimit =
    options.rateLimit !== undefined
      ? options.rateLimit
      : clientInfoOrOptions.rateLimit !== undefined
        ? clientInfoOrOptions.rateLimit
        : true;

  // ── Gather all metadata ──
  const visitorHash = hashVisitorIdentifier(getClientIp(req), sessionId);
  const refDomain = referrerDomain(req);
  const friendly = friendlySourceName(refDomain);
  const geo = extractGeoLocation(req);
  const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined;
  const parsed = parseUserAgent(ua);
  const botInfo = classifyVisitor(ua);
  const languageHeader = req.headers["accept-language"];
  const language =
    typeof languageHeader === "string" ? compact(languageHeader.split(",")[0], 35) : undefined;
  const utm = extractUtmParams(events[0]?.path || "/");

  // Prefer client timezone, fall back to Vercel geo timezone
  const timezone = clientInfo.timezone || geo.timezone;

  await connectDB();

  // ── Rate limit ──
  if (
    effectiveRateLimit !== false &&
    !(await consumeRateLimit(`analytics:${visitorHash}`, events.length))
  ) {
    return { accepted: false, rateLimited: true };
  }

  // ── Determine visitor type (human / returning / bot) ──
  let sessionVisitorType: SessionVisitorType = botInfo.visitorType; // "human" | "known_bot" | "suspicious"

  if (clientInfo.deviceId && sessionVisitorType === "human") {
    // Check if this is a new session (first event batch for this sessionId)
    const isNewSession = !(await AnalyticsSession.exists({ sessionId }));
    const pageViewCount = events.filter((e) => e.type === "page_view").length;

    const browserLabel = [parsed.browser, parsed.browserVersion].filter(Boolean).join(" ");
    const osLabel = [parsed.os, parsed.osVersion].filter(Boolean).join(" ");

    const visitor = await AnalyticsVisitor.findOneAndUpdate(
      { deviceId: clientInfo.deviceId },
      {
        $set: {
          lastSeenAt: now,
          lastCountry: geo.country,
          lastCountryName: geo.countryName,
          lastRegion: geo.region,
          lastCity: geo.city,
          lastBrowser: browserLabel || "unknown",
          lastOs: osLabel || "unknown",
          lastDevice: parsed.device,
          lastDeviceModel: parsed.deviceModel,
          expiresAt,
        },
        $setOnInsert: {
          deviceId: clientInfo.deviceId,
          firstSeenAt: now,
          visitorType: "human",
        },
        $inc: {
          totalSessions: isNewSession ? 1 : 0,
          totalPageViews: pageViewCount,
        },
      },
      { upsert: true, returnDocument: "after" }
    ).lean();

    // Mark as returning if they've been here before
    if (visitor && visitor.totalSessions > 1) {
      sessionVisitorType = "returning";
      if (visitor.visitorType !== "returning") {
        await AnalyticsVisitor.updateOne(
          { deviceId: clientInfo.deviceId },
          { $set: { visitorType: "returning" } }
        );
      }
    }
  }

  // ── Upsert session ──
  await AnalyticsSession.findOneAndUpdate(
    { sessionId },
    {
      $set: { lastSeenAt: now },
      $setOnInsert: {
        sessionId,
        visitorHash,
        deviceId: clientInfo.deviceId || "",
        entryPath: events[0].path,
        referrerDomain: refDomain,
        friendlySource: friendly,
        ...(utm.utmSource ? { utmSource: utm.utmSource } : {}),
        ...(utm.utmMedium ? { utmMedium: utm.utmMedium } : {}),
        ...(utm.utmCampaign ? { utmCampaign: utm.utmCampaign } : {}),
        country: geo.country,
        countryName: geo.countryName,
        region: geo.region,
        city: geo.city,
        timezone,
        ...(language ? { language } : {}),
        browser: parsed.browser,
        browserVersion: parsed.browserVersion,
        os: parsed.os,
        osVersion: parsed.osVersion,
        device: parsed.device,
        deviceModel: parsed.deviceModel,
        ...(clientInfo.screenWidth ? { screenWidth: clientInfo.screenWidth } : {}),
        ...(clientInfo.screenHeight ? { screenHeight: clientInfo.screenHeight } : {}),
        visitorType: sessionVisitorType,
        ...(botInfo.botName ? { botName: botInfo.botName } : {}),
        ...(botInfo.botCategory ? { botCategory: botInfo.botCategory } : {}),
        startedAt: now,
        expiresAt,
      },
      $inc: { eventCount: events.length },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // ── Insert events ──
  await AnalyticsEvent.insertMany(
    events.map((event) => ({
      ...event,
      sessionId,
      visitorHash,
      occurredAt: now,
      expiresAt,
    })),
    { ordered: false }
  );

  return { accepted: true };
}

export function createServerSessionId(): string {
  return randomUUID().replace(/-/g, "");
}
