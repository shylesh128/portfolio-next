import mongoose, { Model, Schema } from "mongoose";
import type { DeviceType } from "@/lib/ua-parser";
import type { VisitorClassification, BotCategory } from "@/lib/bot-detection";

export type SessionVisitorType = VisitorClassification | "returning";

export interface IAnalyticsSession {
  sessionId: string;
  visitorHash: string;
  deviceId: string;
  entryPath: string;
  // Traffic source
  referrerDomain: string;
  friendlySource: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Location (approximate, from Vercel IP headers)
  country: string;
  countryName: string;
  region: string;
  city: string;
  timezone: string;
  language?: string;
  // Device / browser
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: DeviceType;
  deviceModel: string;
  screenWidth?: number;
  screenHeight?: number;
  // Visitor classification
  visitorType: SessionVisitorType;
  botName?: string;
  botCategory?: BotCategory;
  // Timing
  startedAt: Date;
  lastSeenAt: Date;
  eventCount: number;
  expiresAt: Date;
}

const AnalyticsSessionSchema = new Schema<IAnalyticsSession>(
  {
    sessionId: { type: String, required: true, unique: true, trim: true },
    // A keyed HMAC of the request IP. The raw address is never stored.
    visitorHash: { type: String, required: true, index: true },
    // Anonymous cookie UUID. Empty string if unavailable.
    deviceId: { type: String, default: "", maxlength: 128, index: true },
    entryPath: { type: String, required: true, maxlength: 300 },
    // Traffic source
    referrerDomain: { type: String, default: "direct", maxlength: 253 },
    friendlySource: { type: String, default: "Direct", maxlength: 100 },
    utmSource: { type: String, maxlength: 100 },
    utmMedium: { type: String, maxlength: 100 },
    utmCampaign: { type: String, maxlength: 100 },
    // Location (IP-based, approximate)
    country: { type: String, default: "unknown", maxlength: 8 },
    countryName: { type: String, default: "Unknown", maxlength: 100 },
    region: { type: String, default: "unknown", maxlength: 200 },
    city: { type: String, default: "unknown", maxlength: 200 },
    timezone: { type: String, default: "unknown", maxlength: 64 },
    language: { type: String, maxlength: 35 },
    // Device / browser
    browser: { type: String, default: "unknown", maxlength: 40 },
    browserVersion: { type: String, default: "", maxlength: 20 },
    os: { type: String, default: "unknown", maxlength: 40 },
    osVersion: { type: String, default: "", maxlength: 20 },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "bot", "unknown"],
      default: "unknown",
    },
    deviceModel: { type: String, default: "unknown", maxlength: 100 },
    screenWidth: { type: Number },
    screenHeight: { type: Number },
    // Visitor classification
    visitorType: {
      type: String,
      enum: ["human", "returning", "known_bot", "suspicious"],
      default: "human",
    },
    botName: { type: String, maxlength: 60 },
    botCategory: {
      type: String,
      enum: [
        "search_crawler", "social_preview", "ai_crawler", "monitoring",
        "feed_reader", "seo_tool", "security_scanner", "unknown_bot",
      ],
    },
    // Timing
    startedAt: { type: Date, required: true, index: true },
    lastSeenAt: { type: Date, required: true, index: true },
    eventCount: { type: Number, required: true, default: 0 },
    // MongoDB deletes expired records asynchronously through this TTL index.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false }
);

AnalyticsSessionSchema.index({ lastSeenAt: -1, country: 1 });
AnalyticsSessionSchema.index({ visitorHash: 1, lastSeenAt: -1 });
AnalyticsSessionSchema.index({ visitorType: 1, lastSeenAt: -1 });

const AnalyticsSession: Model<IAnalyticsSession> =
  mongoose.models.AnalyticsSession ||
  mongoose.model<IAnalyticsSession>("AnalyticsSession", AnalyticsSessionSchema);

export default AnalyticsSession;
