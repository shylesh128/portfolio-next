/**
 * Enhanced User-Agent parser. Extracts browser, OS, device type,
 * versions, and device model when reliably available.
 * No external dependencies — just regex patterns.
 */

export type DeviceType = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

export interface ParsedUserAgent {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: DeviceType;
  /** Reliably identified model or "unknown". Never fabricated. */
  deviceModel: string;
}

function extractVersion(ua: string, pattern: RegExp): string {
  const match = ua.match(pattern);
  if (!match?.[1]) return "";
  return match[1].replace(/_/g, ".").split(".").slice(0, 2).join(".");
}

function extractDeviceModel(ua: string, device: DeviceType): string {
  if (device === "bot") return "";

  // Apple devices — UA reliably identifies the product line
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/iPod/i.test(ua)) return "iPod";

  // Samsung — model numbers like SM-G998B, SM-S918B
  const samsung = ua.match(/SM-([A-Z]\d{3,4}[A-Z]?)/i);
  if (samsung) return `Samsung ${samsung[1]}`;

  // Google Pixel
  const pixel = ua.match(/(Pixel\s*\d*\s*(?:Pro|a|XL)?)/i);
  if (pixel) return `Google ${pixel[1].trim()}`;

  // OnePlus
  const oneplus = ua.match(/(OnePlus\s*\S+)/i);
  if (oneplus) return oneplus[1];

  // Xiaomi / Redmi / POCO
  const xiaomi = ua.match(/(Redmi\s*\S+|Mi\s*\d+\S*|POCO\s*\S+)/i);
  if (xiaomi) return xiaomi[1];

  // Huawei
  const huawei = ua.match(/HUAWEI\s*(\S+)/i);
  if (huawei) return `Huawei ${huawei[1]}`;

  // Desktop platforms — can't distinguish laptop vs desktop from UA
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/CrOS/i.test(ua)) return "Chromebook";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "Linux PC";

  return "unknown";
}

export function parseUserAgent(userAgent: string | undefined): ParsedUserAgent {
  const ua = userAgent || "";

  // ── Device type ──
  let device: DeviceType;
  if (/bot|crawler|spider|slurp|feed|fetch|scan|check|monitor/i.test(ua)) {
    device = "bot";
  } else if (/ipad|tablet|kindle|silk|playbook/i.test(ua)) {
    device = "tablet";
  } else if (/mobi|android(?!.*\btablet\b)|iphone|ipod|windows phone|bb\d+|blackberry/i.test(ua)) {
    device = "mobile";
  } else if (ua.length > 0) {
    device = "desktop";
  } else {
    device = "unknown";
  }

  // ── Browser (order matters — more specific first) ──
  let browser: string;
  let browserVersion: string;

  if (/SamsungBrowser/i.test(ua)) {
    browser = "Samsung Browser";
    browserVersion = extractVersion(ua, /SamsungBrowser\/(\S+)/i);
  } else if (/UCBrowser|UCWEB/i.test(ua)) {
    browser = "UC Browser";
    browserVersion = extractVersion(ua, /UCBrowser\/(\S+)/i);
  } else if (/OPR|Opera/i.test(ua)) {
    browser = "Opera";
    browserVersion = extractVersion(ua, /(?:OPR|Opera)\/(\S+)/i);
  } else if (/Edg\//i.test(ua)) {
    browser = "Edge";
    browserVersion = extractVersion(ua, /Edg\/(\S+)/i);
  } else if (/Brave/i.test(ua)) {
    browser = "Brave";
    browserVersion = extractVersion(ua, /Brave\/(\S+)/i);
  } else if (/Vivaldi/i.test(ua)) {
    browser = "Vivaldi";
    browserVersion = extractVersion(ua, /Vivaldi\/(\S+)/i);
  } else if (/YaBrowser/i.test(ua)) {
    browser = "Yandex Browser";
    browserVersion = extractVersion(ua, /YaBrowser\/(\S+)/i);
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browser = "Firefox";
    browserVersion = extractVersion(ua, /(?:Firefox|FxiOS)\/(\S+)/i);
  } else if (/CriOS/i.test(ua)) {
    browser = "Chrome";
    browserVersion = extractVersion(ua, /CriOS\/(\S+)/i);
  } else if (/Chrome/i.test(ua) && !/Edg\//i.test(ua) && !/OPR/i.test(ua)) {
    browser = "Chrome";
    browserVersion = extractVersion(ua, /Chrome\/(\S+)/i);
  } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = "Safari";
    browserVersion = extractVersion(ua, /Version\/(\S+)/i);
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = "Internet Explorer";
    browserVersion = extractVersion(ua, /(?:MSIE |rv:)(\d+\.\d+)/i);
  } else {
    browser = ua ? "Other" : "unknown";
    browserVersion = "";
  }

  // ── OS ──
  let os: string;
  let osVersion: string;

  if (/Windows NT/i.test(ua)) {
    os = "Windows";
    const ntVer = extractVersion(ua, /Windows NT (\d+\.\d+)/i);
    const ntMap: Record<string, string> = {
      "10.0": "10+", "6.3": "8.1", "6.2": "8", "6.1": "7", "6.0": "Vista",
    };
    osVersion = ntMap[ntVer] || ntVer;
  } else if (/Android/i.test(ua)) {
    os = "Android";
    osVersion = extractVersion(ua, /Android (\d+[\d.]*)/i);
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
    osVersion = extractVersion(ua, /OS (\d+[_\d.]*)/i);
  } else if (/Mac OS X|macOS/i.test(ua)) {
    os = "macOS";
    osVersion = extractVersion(ua, /Mac OS X (\d+[_\d.]*)/i);
  } else if (/CrOS/i.test(ua)) {
    os = "ChromeOS";
    osVersion = extractVersion(ua, /CrOS \S+ (\d+\.\d+)/i);
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
    osVersion = "";
  } else {
    os = ua ? "Other" : "unknown";
    osVersion = "";
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    deviceModel: extractDeviceModel(ua, device),
  };
}
