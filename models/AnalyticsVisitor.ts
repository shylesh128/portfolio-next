import mongoose, { Model, Schema } from "mongoose";

export interface IAnalyticsVisitor {
  deviceId: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  totalSessions: number;
  totalPageViews: number;
  // Latest known location (approximate, IP-based)
  lastCountry: string;
  lastCountryName: string;
  lastRegion: string;
  lastCity: string;
  // Latest known device info
  lastBrowser: string;
  lastOs: string;
  lastDevice: string;
  lastDeviceModel: string;
  // Classification
  visitorType: "human" | "returning" | "known_bot" | "suspicious";
  // TTL
  expiresAt: Date;
}

const AnalyticsVisitorSchema = new Schema<IAnalyticsVisitor>(
  {
    // Anonymous UUID from first-party cookie. No PII.
    deviceId: { type: String, required: true, unique: true, trim: true },
    firstSeenAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true, index: true },
    totalSessions: { type: Number, required: true, default: 0 },
    totalPageViews: { type: Number, required: true, default: 0 },
    lastCountry: { type: String, default: "unknown", maxlength: 8 },
    lastCountryName: { type: String, default: "Unknown", maxlength: 100 },
    lastRegion: { type: String, default: "unknown", maxlength: 200 },
    lastCity: { type: String, default: "unknown", maxlength: 200 },
    lastBrowser: { type: String, default: "unknown", maxlength: 60 },
    lastOs: { type: String, default: "unknown", maxlength: 60 },
    lastDevice: { type: String, default: "unknown", maxlength: 20 },
    lastDeviceModel: { type: String, default: "unknown", maxlength: 100 },
    visitorType: {
      type: String,
      enum: ["human", "returning", "known_bot", "suspicious"],
      default: "human",
    },
    // MongoDB TTL index auto-deletes old visitor records.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false }
);

AnalyticsVisitorSchema.index({ visitorType: 1, lastSeenAt: -1 });
AnalyticsVisitorSchema.index({ totalSessions: -1, lastSeenAt: -1 });

const AnalyticsVisitor: Model<IAnalyticsVisitor> =
  mongoose.models.AnalyticsVisitor ||
  mongoose.model<IAnalyticsVisitor>("AnalyticsVisitor", AnalyticsVisitorSchema);

export default AnalyticsVisitor;
