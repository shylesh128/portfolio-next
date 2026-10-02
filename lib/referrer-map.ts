/**
 * Maps referrer domains to friendly display names and extracts UTM parameters.
 */

const REFERRER_NAMES: Record<string, string> = {
  // Search engines
  "google.com": "Google Search", "google.co.in": "Google Search",
  "google.co.uk": "Google Search", "google.de": "Google Search",
  "google.fr": "Google Search", "google.ca": "Google Search",
  "google.com.au": "Google Search", "google.co.jp": "Google Search",
  "google.com.br": "Google Search", "google.es": "Google Search",
  "google.it": "Google Search", "google.ru": "Google Search",
  "bing.com": "Bing", "www.bing.com": "Bing",
  "search.yahoo.com": "Yahoo Search",
  "duckduckgo.com": "DuckDuckGo",
  "yandex.ru": "Yandex", "yandex.com": "Yandex",
  "baidu.com": "Baidu", "ecosia.org": "Ecosia",
  "search.brave.com": "Brave Search",

  // Social media
  "linkedin.com": "LinkedIn", "www.linkedin.com": "LinkedIn", "lnkd.in": "LinkedIn",
  "twitter.com": "Twitter/X", "x.com": "Twitter/X", "t.co": "Twitter/X",
  "facebook.com": "Facebook", "www.facebook.com": "Facebook",
  "l.facebook.com": "Facebook", "m.facebook.com": "Facebook",
  "instagram.com": "Instagram", "www.instagram.com": "Instagram", "l.instagram.com": "Instagram",
  "reddit.com": "Reddit", "www.reddit.com": "Reddit", "old.reddit.com": "Reddit",
  "threads.net": "Threads", "www.threads.net": "Threads",
  "mastodon.social": "Mastodon",

  // Developer platforms
  "github.com": "GitHub", "gist.github.com": "GitHub Gist",
  "gitlab.com": "GitLab",
  "stackoverflow.com": "Stack Overflow", "www.stackoverflow.com": "Stack Overflow",
  "dev.to": "DEV Community",
  "hashnode.com": "Hashnode", "hashnode.dev": "Hashnode",
  "medium.com": "Medium",
  "news.ycombinator.com": "Hacker News",
  "lobste.rs": "Lobsters",
  "producthunt.com": "Product Hunt", "www.producthunt.com": "Product Hunt",
  "codepen.io": "CodePen",

  // Messaging
  "web.whatsapp.com": "WhatsApp",
  "web.telegram.org": "Telegram",
  "discord.com": "Discord",

  // Email providers
  "mail.google.com": "Gmail",
  "outlook.live.com": "Outlook", "outlook.office365.com": "Outlook",
  "mail.yahoo.com": "Yahoo Mail",

  // Design
  "dribbble.com": "Dribbble", "behance.net": "Behance", "www.behance.net": "Behance",
  "figma.com": "Figma",
};

export function friendlySourceName(referrerDomain: string): string {
  if (!referrerDomain || referrerDomain === "direct") return "Direct";
  const lower = referrerDomain.toLowerCase();

  // Exact match
  if (REFERRER_NAMES[lower]) return REFERRER_NAMES[lower];

  // Try without "www."
  const noWww = lower.replace(/^www\./, "");
  if (REFERRER_NAMES[noWww]) return REFERRER_NAMES[noWww];

  // Catch-all for any Google domain
  if (/^google\.[a-z.]+$/.test(lower)) return "Google Search";

  // Return the domain itself (already readable) in title case for unknown sources
  return referrerDomain;
}

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Extract UTM parameters from the entry path.
 * Only captures utm_source, utm_medium, utm_campaign — ignores others.
 */
export function extractUtmParams(path: string): UtmParams {
  try {
    const url = new URL(path, "https://placeholder.local");
    const source = url.searchParams.get("utm_source")?.trim().slice(0, 100);
    const medium = url.searchParams.get("utm_medium")?.trim().slice(0, 100);
    const campaign = url.searchParams.get("utm_campaign")?.trim().slice(0, 100);
    const result: UtmParams = {};
    if (source) result.utmSource = source;
    if (medium) result.utmMedium = medium;
    if (campaign) result.utmCampaign = campaign;
    return result;
  } catch {
    return {};
  }
}
