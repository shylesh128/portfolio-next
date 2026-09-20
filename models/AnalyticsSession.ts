import mongoose, { Model, Schema } from "mongoose";

export interface IAnalyticsSession {
  sessionId: string;
  visitorHash: string;
  entryPath: string;
  referrerDomain: string;
  country: string;
  language?: string;
  browser: string;
  os: string;
  device: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
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
    entryPath: { type: String, required: true, maxlength: 300 },
    referrerDomain: { type: String, default: "direct", maxlength: 253 },
    country: { type: String, default: "unknown", maxlength: 8 },
    language: { type: String, maxlength: 35 },
    browser: { type: String, default: "unknown", maxlength: 40 },
    os: { type: String, default: "unknown", maxlength: 40 },
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "bot", "unknown"],
      default: "unknown",
    },
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

const AnalyticsSession: Model<IAnalyticsSession> =
  mongoose.models.AnalyticsSession ||
  mongoose.model<IAnalyticsSession>("AnalyticsSession", AnalyticsSessionSchema);

export default AnalyticsSession;
