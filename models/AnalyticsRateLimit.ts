import mongoose, { Model, Schema } from "mongoose";

export interface IAnalyticsRateLimit {
  key: string;
  windowStartedAt: Date;
  count: number;
  expiresAt: Date;
}

const AnalyticsRateLimitSchema = new Schema<IAnalyticsRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    windowStartedAt: { type: Date, required: true },
    count: { type: Number, required: true, default: 0 },
    // Keeps short-lived limiter records out of the database automatically.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false }
);

const AnalyticsRateLimit: Model<IAnalyticsRateLimit> =
  mongoose.models.AnalyticsRateLimit ||
  mongoose.model<IAnalyticsRateLimit>("AnalyticsRateLimit", AnalyticsRateLimitSchema);

export default AnalyticsRateLimit;
