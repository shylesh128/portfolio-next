import { createHmac, randomUUID } from "crypto";
import type { NextApiRequest } from "next";
import connectDB from "@/lib/mongodb";
import AnalyticsEvent, {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventName,
} from "@/models/AnalyticsEvent";
import AnalyticsRateLimit from "@/models/AnalyticsRateLimit";
import AnalyticsSession from "@/models/AnalyticsSession";

export type AnalyticsDevice = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

export interface AnalyticsEventInput {
  type: AnalyticsEventName;
  path: string;
  target?: string;
  metadata?: Record<string, string>;
}

interface RequestMetadata {
  visitorHash: string;
  referrerDomain: string;
  country: string;
  language?: string;
  browser: string;
  os: string;
  device: AnalyticsDevice;
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
    if (typeof event.type !== "string" || !ANALYTICS_EVENT_NAMES.includes(event.type as AnalyticsEventName)) {
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

function parseUserAgent(userAgent: string | undefined): Pick<RequestMetadata, "browser" | "os" | "device"> {
  const ua = userAgent || "";
  const device: AnalyticsDevice = /bot|crawler|spider|slurp/i.test(ua)
    ? "bot"
    : /ipad|tablet|kindle|silk/i.test(ua)
      ? "tablet"
      : /mobi|android|iphone|ipod/i.test(ua)
        ? "mobile"
        : ua
          ? "desktop"
          : "unknown";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /firefox\//i.test(ua)
      ? "Firefox"
      : /chrome\//i.test(ua) && !/edg\//i.test(ua)
        ? "Chrome"
        : /safari\//i.test(ua) && !/chrome\//i.test(ua)
          ? "Safari"
          : /msie|trident/i.test(ua)
            ? "Internet Explorer"
            : "Other";
  const os = /windows nt/i.test(ua)
    ? "Windows"
    : /android/i.test(ua)
      ? "Android"
      : /iphone|ipad|ipod/i.test(ua)
        ? "iOS"
        : /mac os/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { browser, os, device };
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

function requestMetadata(req: NextApiRequest, sessionId: string): RequestMetadata {
  const languageHeader = req.headers["accept-language"];
  const language = typeof languageHeader === "string" ? compact(languageHeader.split(",")[0], 35) : undefined;
  const countryHeader = req.headers["x-vercel-ip-country"];
  const country = typeof countryHeader === "string" && /^[A-Za-z]{2,3}$/.test(countryHeader)
    ? countryHeader.toUpperCase()
    : "unknown";
  return {
    visitorHash: hashVisitorIdentifier(getClientIp(req), sessionId),
    referrerDomain: referrerDomain(req),
    country,
    ...(language ? { language } : {}),
    ...parseUserAgent(typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined),
  };
}

async function consumeRateLimit(key: string, cost: number): Promise<boolean> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
  const expiresAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS * 2);

  const withinWindow = await AnalyticsRateLimit.findOneAndUpdate(
    { key, windowStartedAt: { $gt: cutoff }, count: { $lte: RATE_LIMIT_MAX_EVENTS - cost } },
    { $inc: { count: cost }, $set: { expiresAt } },
    { new: true }
  ).lean();
  if (withinWindow) return true;

  const resetWindow = await AnalyticsRateLimit.findOneAndUpdate(
    { key, windowStartedAt: { $lte: cutoff } },
    { $set: { windowStartedAt: now, count: cost, expiresAt } },
    { new: true }
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
      { new: true }
    ).lean()
  );
}

export async function recordAnalyticsEvents(
  req: NextApiRequest,
  sessionId: string,
  events: AnalyticsEventInput[],
  options: { rateLimit?: boolean } = {}
): Promise<{ accepted: boolean; rateLimited?: boolean }> {
  const now = new Date();
  const metadata = requestMetadata(req, sessionId);
  await connectDB();

  if (options.rateLimit !== false && !(await consumeRateLimit(`analytics:${metadata.visitorHash}`, events.length))) {
    return { accepted: false, rateLimited: true };
  }

  const expiresAt = retentionExpiry(now);
  await AnalyticsSession.findOneAndUpdate(
    { sessionId },
    {
      $set: { lastSeenAt: now },
      $setOnInsert: {
        sessionId,
        visitorHash: metadata.visitorHash,
        entryPath: events[0].path,
        referrerDomain: metadata.referrerDomain,
        country: metadata.country,
        language: metadata.language,
        browser: metadata.browser,
        os: metadata.os,
        device: metadata.device,
        startedAt: now,
        expiresAt,
      },
      $inc: { eventCount: events.length },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await AnalyticsEvent.insertMany(
    events.map((event) => ({
      ...event,
      sessionId,
      visitorHash: metadata.visitorHash,
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
