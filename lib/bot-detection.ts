/**
 * Bot and crawler detection. Classifies visitors as human, known bot,
 * or suspicious based on User-Agent patterns and request characteristics.
 */

export type VisitorClassification = "human" | "known_bot" | "suspicious";

export type BotCategory =
  | "search_crawler"
  | "social_preview"
  | "ai_crawler"
  | "monitoring"
  | "feed_reader"
  | "seo_tool"
  | "security_scanner"
  | "unknown_bot";

export interface BotInfo {
  visitorType: VisitorClassification;
  botName?: string;
  botCategory?: BotCategory;
}

interface BotPattern {
  pattern: RegExp;
  name: string;
  category: BotCategory;
}

// Order matters — more specific patterns must come before generic catch-alls.
const KNOWN_BOTS: BotPattern[] = [
  // Search engine crawlers
  { pattern: /googlebot/i, name: "Googlebot", category: "search_crawler" },
  { pattern: /bingbot/i, name: "Bingbot", category: "search_crawler" },
  { pattern: /yandexbot/i, name: "YandexBot", category: "search_crawler" },
  { pattern: /baiduspider/i, name: "Baiduspider", category: "search_crawler" },
  { pattern: /duckduckbot/i, name: "DuckDuckBot", category: "search_crawler" },
  { pattern: /slurp/i, name: "Yahoo Slurp", category: "search_crawler" },
  { pattern: /sogou/i, name: "Sogou", category: "search_crawler" },
  { pattern: /applebot/i, name: "Applebot", category: "search_crawler" },
  { pattern: /ia_archiver/i, name: "Alexa", category: "search_crawler" },

  // Social media preview bots
  { pattern: /facebookexternalhit|facebot/i, name: "Facebook", category: "social_preview" },
  { pattern: /twitterbot/i, name: "Twitter/X", category: "social_preview" },
  { pattern: /linkedinbot/i, name: "LinkedIn", category: "social_preview" },
  { pattern: /slackbot/i, name: "Slack", category: "social_preview" },
  { pattern: /telegrambot/i, name: "Telegram", category: "social_preview" },
  { pattern: /discordbot/i, name: "Discord", category: "social_preview" },
  { pattern: /whatsapp/i, name: "WhatsApp", category: "social_preview" },
  { pattern: /pinterestbot/i, name: "Pinterest", category: "social_preview" },
  { pattern: /embedly/i, name: "Embedly", category: "social_preview" },
  { pattern: /redditbot/i, name: "Reddit", category: "social_preview" },
  { pattern: /skypeuripreview/i, name: "Skype", category: "social_preview" },

  // AI crawlers
  { pattern: /gptbot/i, name: "GPTBot", category: "ai_crawler" },
  { pattern: /chatgpt-user/i, name: "ChatGPT", category: "ai_crawler" },
  { pattern: /claudebot/i, name: "ClaudeBot", category: "ai_crawler" },
  { pattern: /anthropic-ai/i, name: "Anthropic", category: "ai_crawler" },
  { pattern: /google-extended/i, name: "Google AI", category: "ai_crawler" },
  { pattern: /cohere-ai/i, name: "Cohere", category: "ai_crawler" },
  { pattern: /perplexitybot/i, name: "Perplexity", category: "ai_crawler" },
  { pattern: /bytespider/i, name: "ByteSpider", category: "ai_crawler" },
  { pattern: /ccbot/i, name: "Common Crawl", category: "ai_crawler" },

  // Monitoring / uptime
  { pattern: /uptimerobot/i, name: "UptimeRobot", category: "monitoring" },
  { pattern: /pingdom/i, name: "Pingdom", category: "monitoring" },
  { pattern: /site24x7/i, name: "Site24x7", category: "monitoring" },
  { pattern: /statuscake/i, name: "StatusCake", category: "monitoring" },
  { pattern: /newrelic/i, name: "New Relic", category: "monitoring" },
  { pattern: /datadog/i, name: "Datadog", category: "monitoring" },
  { pattern: /checkly/i, name: "Checkly", category: "monitoring" },

  // Feed readers
  { pattern: /feedly/i, name: "Feedly", category: "feed_reader" },
  { pattern: /feedfetcher/i, name: "Google Feed", category: "feed_reader" },
  { pattern: /newsblur/i, name: "NewsBlur", category: "feed_reader" },

  // SEO tools
  { pattern: /ahrefs/i, name: "Ahrefs", category: "seo_tool" },
  { pattern: /semrush/i, name: "SEMrush", category: "seo_tool" },
  { pattern: /mj12bot|majestic/i, name: "Majestic", category: "seo_tool" },
  { pattern: /dotbot/i, name: "Moz", category: "seo_tool" },
  { pattern: /screaming.?frog/i, name: "Screaming Frog", category: "seo_tool" },
  { pattern: /rogerbot/i, name: "Moz Roger", category: "seo_tool" },

  // Security scanners
  { pattern: /nessus/i, name: "Nessus", category: "security_scanner" },
  { pattern: /nikto/i, name: "Nikto", category: "security_scanner" },
  { pattern: /qualys/i, name: "Qualys", category: "security_scanner" },
  { pattern: /nmap/i, name: "Nmap", category: "security_scanner" },

  // Generic bot patterns — MUST be last
  { pattern: /bot[\/\s;)]/i, name: "Unknown Bot", category: "unknown_bot" },
  { pattern: /crawler|spider|scraper/i, name: "Unknown Crawler", category: "unknown_bot" },
  { pattern: /^curl\//i, name: "curl", category: "unknown_bot" },
  { pattern: /^wget\//i, name: "wget", category: "unknown_bot" },
  {
    pattern: /python-requests|python-urllib|aiohttp|httpx/i,
    name: "Python Script",
    category: "unknown_bot",
  },
  { pattern: /^go-http-client/i, name: "Go Script", category: "unknown_bot" },
  { pattern: /^java\//i, name: "Java Client", category: "unknown_bot" },
  { pattern: /^node-fetch|^undici|^axios/i, name: "Node Script", category: "unknown_bot" },
  { pattern: /^okhttp/i, name: "OkHttp", category: "unknown_bot" },
  { pattern: /^ruby/i, name: "Ruby Script", category: "unknown_bot" },
  { pattern: /^php\//i, name: "PHP Script", category: "unknown_bot" },
];

/**
 * Classify the visitor based on their User-Agent string.
 * Returns human if no bot indicators are detected.
 */
export function classifyVisitor(userAgent: string | undefined): BotInfo {
  const ua = userAgent || "";

  // Check known bots first
  for (const bot of KNOWN_BOTS) {
    if (bot.pattern.test(ua)) {
      return { visitorType: "known_bot", botName: bot.name, botCategory: bot.category };
    }
  }

  // Detect suspicious / headless traffic
  if (!ua || ua.length < 10) {
    return { visitorType: "suspicious", botName: "Empty UA", botCategory: "unknown_bot" };
  }
  if (/^Mozilla\/\d+\.\d+$/.test(ua)) {
    return { visitorType: "suspicious", botName: "Minimal UA", botCategory: "unknown_bot" };
  }
  if (/headlesschrome|phantomjs|selenium|puppeteer|playwright/i.test(ua)) {
    return { visitorType: "suspicious", botName: "Headless Browser", botCategory: "unknown_bot" };
  }

  return { visitorType: "human" };
}
