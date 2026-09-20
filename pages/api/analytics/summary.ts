import type { NextApiRequest, NextApiResponse } from "next";
import { analyticsDashboardIsConfigured, isAnalyticsDashboardAuthorized } from "@/lib/analytics-auth";
import { getAnalyticsSnapshot, type AnalyticsSnapshot } from "@/lib/analytics-dashboard";

export default async function handler(req: NextApiRequest, res: NextApiResponse<AnalyticsSnapshot | { error: string }>) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!analyticsDashboardIsConfigured() || !isAnalyticsDashboardAuthorized(req)) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Portfolio analytics", charset="UTF-8"');
    return res.status(401).json({ error: "Authentication required" });
  }

  const days = typeof req.query.days === "string" ? Number(req.query.days) : 30;
  try {
    return res.status(200).json(await getAnalyticsSnapshot(days));
  } catch (error) {
    console.error("Analytics summary error:", error);
    return res.status(503).json({ error: "Analytics temporarily unavailable" });
  }
}
