import { timingSafeEqual } from "crypto";
import type { IncomingMessage } from "http";

export function analyticsDashboardIsConfigured(): boolean {
  return Boolean(process.env.ANALYTICS_DASHBOARD_USER && process.env.ANALYTICS_DASHBOARD_PASSWORD);
}

function safelyEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAnalyticsDashboardAuthorized(req: IncomingMessage): boolean {
  const user = process.env.ANALYTICS_DASHBOARD_USER;
  const password = process.env.ANALYTICS_DASHBOARD_PASSWORD;
  if (!user || !password) return false;

  const expected = `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
  const supplied = req.headers.authorization || "";
  return safelyEqual(supplied, expected);
}
