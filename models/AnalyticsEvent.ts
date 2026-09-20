import mongoose, { Model, Schema } from "mongoose";

export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "section_view",
  "project_click",
  "github_click",
  "linkedin_click",
  "resume_download",
  "contact_form_start",
  "contact_submit",
  "navigation",
  "theme_change",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export interface IAnalyticsEvent {
  sessionId: string;
  visitorHash: string;
  type: AnalyticsEventName;
  path: string;
  target?: string;
  metadata?: Record<string, string>;
  occurredAt: Date;
  expiresAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    sessionId: { type: String, required: true, index: true },
    visitorHash: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ANALYTICS_EVENT_NAMES, index: true },
    path: { type: String, required: true, maxlength: 300 },
    target: { type: String, maxlength: 160 },
    metadata: { type: Schema.Types.Mixed },
    occurredAt: { type: Date, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false }
);

AnalyticsEventSchema.index({ occurredAt: -1, type: 1 });
AnalyticsEventSchema.index({ sessionId: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ type: 1, target: 1, occurredAt: -1 });

const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);

export default AnalyticsEvent;
