import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../lib/mongodb";
import Contact from "../../models/Contact";
import { sendContactNotification } from "../../lib/email";

// ===================
// Configuration
// ===================
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 2,
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// ===================
// Types
// ===================
type ApiResponse =
  | { success: true; message: string }
  | { success: false; error: string };

interface FormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// ===================
// Rate Limiter
// ===================
const rateLimitStore = new Map<string, number[]>();

function getValidTimestamps(timestamps: number[]): number[] {
  const cutoff = Date.now() - RATE_LIMIT.windowMs;
  return timestamps.filter((t) => t > cutoff);
}

function isRateLimited(ip: string): number | null {
  const timestamps = getValidTimestamps(rateLimitStore.get(ip) || []);

  if (timestamps.length >= RATE_LIMIT.maxRequests) {
    const oldestExpiry = Math.min(...timestamps) + RATE_LIMIT.windowMs;
    return Math.ceil((oldestExpiry - Date.now()) / 60000);
  }

  rateLimitStore.set(ip, [...timestamps, Date.now()]);
  return null;
}

function cleanupStore(): void {
  rateLimitStore.forEach((timestamps, ip) => {
    const valid = getValidTimestamps(timestamps);
    valid.length ? rateLimitStore.set(ip, valid) : rateLimitStore.delete(ip);
  });
}

// ===================
// Request Helpers
// ===================
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0]?.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function getMetadata(req: NextApiRequest) {
  const lang = req.headers["accept-language"];
  return {
    userAgent: req.headers["user-agent"],
    referrer: req.headers["referer"],
    country: req.headers["x-vercel-ip-country"] as string | undefined,
    language: typeof lang === "string" ? lang.split(",")[0].trim() : undefined,
  };
}

function validateForm(data: FormData): string | null {
  if (!data.name || !data.email || !data.message) {
    return "Name, email, and message are required";
  }
  if (!EMAIL_REGEX.test(data.email)) {
    return "Please provide a valid email address";
  }
  return null;
}

// ===================
// Response Helpers
// ===================
const respond = {
  success: (res: NextApiResponse<ApiResponse>, message: string) =>
    res.status(201).json({ success: true, message }),

  error: (res: NextApiResponse<ApiResponse>, status: number, error: string) =>
    res.status(status).json({ success: false, error }),
};

// ===================
// API Handler
// ===================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Method check
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return respond.error(res, 405, `Method ${req.method} not allowed`);
  }

  // Periodic cleanup (~10% of requests)
  if (Math.random() < 0.1) cleanupStore();

  // Rate limiting
  const ip = getClientIp(req);
  const retryMinutes = isRateLimited(ip);

  if (retryMinutes) {
    res.setHeader("Retry-After", retryMinutes * 60);
    const s = retryMinutes === 1 ? "" : "s";
    return respond.error(
      res,
      429,
      `Too many messages. Try again in ${retryMinutes} minute${s}.`
    );
  }

  // Validate form
  const formData = req.body as FormData;
  const validationError = validateForm(formData);

  if (validationError) {
    return respond.error(res, 400, validationError);
  }

  try {
    await connectDB();

    // Save contact
    const contact = await Contact.create({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subject: formData.subject?.trim(),
      message: formData.message.trim(),
      ip,
      ...getMetadata(req),
    });

    // Send email in background
    sendContactNotification({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
    }).catch((err) => console.error("Email failed:", err));

    return respond.success(res, "Thank you! I will get back to you soon.");
  } catch (err) {
    console.error("Contact error:", err);
    return respond.error(res, 500, "Something went wrong. Please try again.");
  }
}
