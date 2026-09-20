import connectDB from "@/lib/mongodb";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import AnalyticsSession from "@/models/AnalyticsSession";

type Breakdown = { label: string; value: number };

export type AnalyticsSnapshot = {
  days: number;
  generatedAt: string;
  overview: {
    sessions: number;
    visitors: number;
    pageViews: number;
    events: number;
    averageSessionMinutes: number;
  };
  sources: Breakdown[];
  devices: Breakdown[];
  countries: Breakdown[];
  pages: Breakdown[];
  sections: Breakdown[];
  actions: Breakdown[];
  recentSessions: Array<{
    id: string;
    country: string;
    device: string;
    source: string;
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

const numberValue = (value: unknown): number => typeof value === "number" ? value : 0;
const labelValue = (value: unknown, fallback = "unknown"): string =>
  typeof value === "string" && value ? value : fallback;

function toBreakdown(rows: Array<{ _id?: unknown; value?: unknown }>, fallback?: string): Breakdown[] {
  return rows.map((row) => ({ label: labelValue(row._id, fallback), value: numberValue(row.value) }));
}

export async function getAnalyticsSnapshot(requestedDays = 30): Promise<AnalyticsSnapshot> {
  const days = Math.min(Math.max(Math.floor(requestedDays), 1), 90);
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  await connectDB();

  const [sessionOverview, eventOverview, sources, devices, countries, pages, sections, actions, recentSessions, recentEvents] =
    await Promise.all([
      AnalyticsSession.aggregate([
        { $match: { lastSeenAt: { $gte: start } } },
        {
          $facet: {
            sessions: [{ $count: "value" }],
            visitors: [{ $group: { _id: "$visitorHash" } }, { $count: "value" }],
            duration: [
              { $project: { milliseconds: { $subtract: ["$lastSeenAt", "$startedAt"] } } },
              { $group: { _id: null, value: { $avg: "$milliseconds" } } },
            ],
          },
        },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { occurredAt: { $gte: start } } },
        {
          $facet: {
            all: [{ $count: "value" }],
            pageViews: [{ $match: { type: "page_view" } }, { $count: "value" }],
          },
        },
      ]),
      AnalyticsSession.aggregate([
        { $match: { lastSeenAt: { $gte: start } } },
        { $group: { _id: "$referrerDomain", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsSession.aggregate([
        { $match: { lastSeenAt: { $gte: start } } },
        { $group: { _id: "$device", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),
      AnalyticsSession.aggregate([
        { $match: { lastSeenAt: { $gte: start } } },
        { $group: { _id: "$country", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { occurredAt: { $gte: start }, type: "page_view" } },
        { $group: { _id: "$path", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { occurredAt: { $gte: start }, type: "section_view" } },
        { $group: { _id: "$target", value: { $sum: 1 } } },
        { $sort: { value: -1 } },
        { $limit: 8 },
      ]),
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
      AnalyticsSession.find({ lastSeenAt: { $gte: start } })
        .sort({ lastSeenAt: -1 })
        .limit(12)
        .select("sessionId country device referrerDomain eventCount startedAt lastSeenAt")
        .lean(),
      AnalyticsEvent.find({ occurredAt: { $gte: start } })
        .sort({ occurredAt: -1 })
        .limit(16)
        .select("type target path occurredAt")
        .lean(),
    ]);

  const sessionData = sessionOverview[0] || {};
  const eventData = eventOverview[0] || {};
  const durationMilliseconds = numberValue(sessionData.duration?.[0]?.value);

  return {
    days,
    generatedAt: new Date().toISOString(),
    overview: {
      sessions: numberValue(sessionData.sessions?.[0]?.value),
      visitors: numberValue(sessionData.visitors?.[0]?.value),
      pageViews: numberValue(eventData.pageViews?.[0]?.value),
      events: numberValue(eventData.all?.[0]?.value),
      averageSessionMinutes: Math.round((durationMilliseconds / 60_000) * 10) / 10,
    },
    sources: toBreakdown(sources, "direct"),
    devices: toBreakdown(devices),
    countries: toBreakdown(countries),
    pages: toBreakdown(pages),
    sections: toBreakdown(sections),
    actions: toBreakdown(actions),
    recentSessions: recentSessions.map((session) => ({
      id: session.sessionId.slice(0, 8),
      country: labelValue(session.country),
      device: labelValue(session.device),
      source: labelValue(session.referrerDomain, "direct"),
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
