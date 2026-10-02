import connectDB from "@/lib/mongodb";
import { formatLocation } from "@/lib/geo";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import AnalyticsSession from "@/models/AnalyticsSession";
import AnalyticsVisitor from "@/models/AnalyticsVisitor";

type Breakdown = { label: string; value: number };

export type AnalyticsSnapshot = {
  days: number;
  generatedAt: string;
  overview: {
    sessions: number;
    visitors: number;
    returningVisitors: number;
    newVisitors: number;
    pageViews: number;
    events: number;
    averageSessionMinutes: number;
    botSessions: number;
  };
  sources: Breakdown[];
  devices: Breakdown[];
  locations: Breakdown[];
  countries: Breakdown[];
  browsers: Breakdown[];
  pages: Breakdown[];
  sections: Breakdown[];
  actions: Breakdown[];
  topVisitors: Array<{
    id: string;
    device: string;
    deviceModel: string;
    os: string;
    browser: string;
    location: string;
    firstSeenAt: string;
    lastSeenAt: string;
    totalSessions: number;
    totalPageViews: number;
  }>;
  botTraffic: Array<{
    botName: string;
    botCategory: string;
    count: number;
    lastSeenAt: string;
    topPaths: string[];
  }>;
  recentSessions: Array<{
    id: string;
    location: string;
    device: string;
    deviceModel: string;
    browser: string;
    os: string;
    source: string;
    visitorType: string;
    events: number;
    startedAt: string;
    lastSeenAt: string;
  }>;
  recentEvents: Array<{
    type: string;
    target?: string;
    path: string;
    occurredAt: string;
  }>;
};

const numberValue = (value: unknown): number => (typeof value === "number" ? value : 0);
const labelValue = (value: unknown, fallback = "unknown"): string =>
  typeof value === "string" && value ? value : fallback;

function toBreakdown(
  rows: Array<{ _id?: unknown; value?: unknown }>,
  fallback?: string
): Breakdown[] {
  return rows.map((row) => ({
    label: labelValue(row._id, fallback),
    value: numberValue(row.value),
  }));
}

export async function getAnalyticsSnapshot(requestedDays = 30): Promise<AnalyticsSnapshot> {
  const days = Math.min(Math.max(Math.floor(requestedDays), 1), 90);
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  await connectDB();

  // Filter out bots from human-oriented metrics
  const humanFilter = { lastSeenAt: { $gte: start }, visitorType: { $nin: ["known_bot", "suspicious"] } };

  const [
    sessionOverview,
    eventOverview,
    sources,
    devices,
    locations,
    browsers,
    pages,
    sections,
    actions,
    topVisitors,
    botTraffic,
    recentSessions,
    recentEvents,
  ] = await Promise.all([
    // ── Session overview (humans only) ──
    AnalyticsSession.aggregate([
      { $match: humanFilter },
      {
        $facet: {
          sessions: [{ $count: "value" }],
          visitors: [{ $group: { _id: "$visitorHash" } }, { $count: "value" }],
          duration: [
            { $project: { milliseconds: { $subtract: ["$lastSeenAt", "$startedAt"] } } },
            { $group: { _id: null, value: { $avg: "$milliseconds" } } },
          ],
          returning: [
            { $match: { visitorType: "returning" } },
            { $group: { _id: "$visitorHash" } },
            { $count: "value" },
          ],
          newHumans: [
            { $match: { visitorType: "human" } },
            { $group: { _id: "$visitorHash" } },
            { $count: "value" },
          ],
        },
      },
    ]),

    // ── Event overview ──
    AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: start } } },
      {
        $facet: {
          all: [{ $count: "value" }],
          pageViews: [{ $match: { type: "page_view" } }, { $count: "value" }],
        },
      },
    ]),

    // ── Sources (friendly names, humans only) ──
    AnalyticsSession.aggregate([
      { $match: humanFilter },
      { $group: { _id: { $ifNull: ["$friendlySource", "$referrerDomain"] }, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 10 },
    ]),

    // ── Devices (humans only) ──
    AnalyticsSession.aggregate([
      { $match: humanFilter },
      { $group: { _id: "$device", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),

    // ── Locations — city-level when available, otherwise country (humans only) ──
    AnalyticsSession.aggregate([
      { $match: humanFilter },
      {
        $group: {
          _id: {
            $cond: [
              { $and: [{ $ne: ["$city", "unknown"] }, { $ne: ["$countryName", "Unknown"] }] },
              {
                $concat: [
                  "$city", ", ",
                  { $cond: [{ $ne: ["$region", "unknown"] }, { $concat: ["$region", ", "] }, ""] },
                  "$countryName",
                ],
              },
              { $ifNull: ["$countryName", "$country"] },
            ],
          },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 10 },
    ]),

    // ── Browsers (humans only) ──
    AnalyticsSession.aggregate([
      { $match: humanFilter },
      {
        $group: {
          _id: {
            $cond: [
              { $gt: [{ $strLenCP: { $ifNull: ["$browserVersion", ""] } }, 0] },
              { $concat: ["$browser", " ", "$browserVersion"] },
              "$browser",
            ],
          },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),

    // ── Top pages ──
    AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: start }, type: "page_view" } },
      { $group: { _id: "$path", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),

    // ── Sections ──
    AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: start }, type: "section_view" } },
      { $group: { _id: "$target", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]),

    // ── Actions ──
    AnalyticsEvent.aggregate([
      {
        $match: {
          occurredAt: { $gte: start },
          type: { $nin: ["page_view", "section_view"] },
        },
      },
      { $group: { _id: "$type", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 10 },
    ]),

    // ── Top returning visitors ──
    AnalyticsVisitor.find({
      lastSeenAt: { $gte: start },
      visitorType: { $in: ["human", "returning"] },
      totalSessions: { $gte: 2 },
    })
      .sort({ totalSessions: -1, lastSeenAt: -1 })
      .limit(10)
      .select(
        "deviceId lastDevice lastDeviceModel lastOs lastBrowser lastCity lastRegion lastCountryName firstSeenAt lastSeenAt totalSessions totalPageViews"
      )
      .lean(),

    // ── Bot traffic ──
    AnalyticsSession.aggregate([
      {
        $match: {
          lastSeenAt: { $gte: start },
          visitorType: { $in: ["known_bot", "suspicious"] },
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$botName", "Unknown Bot"] },
          botCategory: { $first: { $ifNull: ["$botCategory", "unknown_bot"] } },
          count: { $sum: 1 },
          lastSeenAt: { $max: "$lastSeenAt" },
          paths: { $addToSet: "$entryPath" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
      {
        $project: {
          botName: "$_id",
          botCategory: 1,
          count: 1,
          lastSeenAt: 1,
          topPaths: { $slice: ["$paths", 5] },
        },
      },
    ]),

    // ── Recent sessions ──
    AnalyticsSession.find({ lastSeenAt: { $gte: start } })
      .sort({ lastSeenAt: -1 })
      .limit(15)
      .select(
        "sessionId city region countryName country device deviceModel browser browserVersion os osVersion friendlySource referrerDomain visitorType eventCount startedAt lastSeenAt"
      )
      .lean(),

    // ── Recent events ──
    AnalyticsEvent.find({ occurredAt: { $gte: start } })
      .sort({ occurredAt: -1 })
      .limit(16)
      .select("type target path occurredAt")
      .lean(),
  ]);

  const sessionData = sessionOverview[0] || {};
  const eventData = eventOverview[0] || {};
  const durationMilliseconds = numberValue(sessionData.duration?.[0]?.value);

  // Bot session count
  const botCount = await AnalyticsSession.countDocuments({
    lastSeenAt: { $gte: start },
    visitorType: { $in: ["known_bot", "suspicious"] },
  });

  return {
    days,
    generatedAt: new Date().toISOString(),
    overview: {
      sessions: numberValue(sessionData.sessions?.[0]?.value),
      visitors: numberValue(sessionData.visitors?.[0]?.value),
      returningVisitors: numberValue(sessionData.returning?.[0]?.value),
      newVisitors: numberValue(sessionData.newHumans?.[0]?.value),
      pageViews: numberValue(eventData.pageViews?.[0]?.value),
      events: numberValue(eventData.all?.[0]?.value),
      averageSessionMinutes: Math.round((durationMilliseconds / 60_000) * 10) / 10,
      botSessions: botCount,
    },
    sources: toBreakdown(sources, "Direct"),
    devices: toBreakdown(devices),
    locations: toBreakdown(locations, "Unknown"),
    countries: toBreakdown(locations, "Unknown"),
    browsers: toBreakdown(browsers),
    pages: toBreakdown(pages),
    sections: toBreakdown(sections),
    actions: toBreakdown(actions),
    topVisitors: (topVisitors as unknown as Array<Record<string, unknown>>).map((v) => ({
      id: String(v.deviceId || "").slice(0, 8),
      device: labelValue(v.lastDevice),
      deviceModel: labelValue(v.lastDeviceModel),
      os: labelValue(v.lastOs),
      browser: labelValue(v.lastBrowser),
      location: formatLocation({
        city: labelValue(v.lastCity),
        region: labelValue(v.lastRegion),
        countryName: labelValue(v.lastCountryName),
      }),
      firstSeenAt: v.firstSeenAt instanceof Date ? v.firstSeenAt.toISOString() : String(v.firstSeenAt || ""),
      lastSeenAt: v.lastSeenAt instanceof Date ? v.lastSeenAt.toISOString() : String(v.lastSeenAt || ""),
      totalSessions: numberValue(v.totalSessions),
      totalPageViews: numberValue(v.totalPageViews),
    })),
    botTraffic: (botTraffic as Array<Record<string, unknown>>).map((b) => ({
      botName: labelValue(b.botName, "Unknown Bot"),
      botCategory: labelValue(b.botCategory, "unknown_bot"),
      count: numberValue(b.count),
      lastSeenAt: b.lastSeenAt instanceof Date ? b.lastSeenAt.toISOString() : String(b.lastSeenAt || ""),
      topPaths: Array.isArray(b.topPaths) ? b.topPaths.map(String) : [],
    })),
    recentSessions: recentSessions.map((session) => ({
      id: session.sessionId.slice(0, 8),
      location: formatLocation({
        city: labelValue(session.city),
        region: labelValue(session.region),
        countryName: labelValue(session.countryName),
        country: labelValue(session.country),
      }),
      device: labelValue(session.device),
      deviceModel: labelValue(session.deviceModel),
      browser: [session.browser, session.browserVersion].filter(Boolean).join(" ") || "unknown",
      os: [session.os, session.osVersion].filter(Boolean).join(" ") || "unknown",
      source: labelValue(session.friendlySource || session.referrerDomain, "Direct"),
      visitorType: labelValue(session.visitorType, "human"),
      events: numberValue(session.eventCount),
      startedAt: session.startedAt.toISOString(),
      lastSeenAt: session.lastSeenAt.toISOString(),
    })),
    recentEvents: recentEvents.map((event) => ({
      type: event.type,
      ...(event.target ? { target: event.target } : {}),
      path: event.path,
      occurredAt: event.occurredAt.toISOString(),
    })),
  };
}
