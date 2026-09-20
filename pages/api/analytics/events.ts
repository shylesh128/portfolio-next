import type { NextApiRequest, NextApiResponse } from "next";
import {
  getAnalyticsSessionId,
  isAnalyticsSessionId,
  recordAnalyticsEvents,
  validateAnalyticsEvents,
} from "@/lib/analytics";

type ResponseBody = { accepted: true } | { accepted: false; error: string };

export const config = {
  api: { bodyParser: { sizeLimit: "32kb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseBody>) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ accepted: false, error: "Method not allowed" });
  }

  const sessionId = getAnalyticsSessionId(req) || (isAnalyticsSessionId(req.body?.sessionId) ? req.body.sessionId : null);
  const events = validateAnalyticsEvents(req.body?.events);
  if (!sessionId || !events) {
    return res.status(400).json({ accepted: false, error: "Invalid analytics payload" });
  }

  try {
    const result = await recordAnalyticsEvents(req, sessionId, events);
    if (result.rateLimited) {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({ accepted: false, error: "Rate limit exceeded" });
    }
    return res.status(202).json({ accepted: true });
  } catch (error) {
    console.error("Analytics ingestion error:", error);
    return res.status(503).json({ accepted: false, error: "Analytics temporarily unavailable" });
  }
}
