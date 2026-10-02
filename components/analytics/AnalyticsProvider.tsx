import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import type { AnalyticsEventName } from "@/models/AnalyticsEvent";

type TrackOptions = {
  path?: string;
  target?: string;
  metadata?: Record<string, string>;
};

type AnalyticsContextValue = {
  track: (type: AnalyticsEventName, options?: TrackOptions) => void;
  getSessionId: () => string | null;
  getDeviceId: () => string | null;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: () => undefined,
  getSessionId: () => null,
  getDeviceId: () => null,
});

const SESSION_STORAGE_KEY = "portfolio.analytics.session";
const DEVICE_COOKIE_NAME = "__portfolio_vid";
const DEVICE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
const MAX_QUEUE_SIZE = 20;

// ── Privacy checks ──

function trackingIsAllowed(): boolean {
  if (typeof navigator === "undefined") return false;
  const browser = navigator as Navigator & { globalPrivacyControl?: boolean };
  return navigator.doNotTrack !== "1" && !browser.globalPrivacyControl;
}

// ── Session ID (per browser session, resets on tab close) ──

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

function loadSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;
    const created = createId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return createId();
  }
}

// ── Device ID (persistent anonymous UUID in first-party cookie) ──

function readCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return match?.[1] || null;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAge: number): void {
  try {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Cookie write failed (e.g. cookies disabled) — degrade gracefully.
  }
}

function loadDeviceId(): string {
  const existing = readCookie(DEVICE_COOKIE_NAME);
  if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) {
    // Refresh the cookie's max-age on every visit
    writeCookie(DEVICE_COOKIE_NAME, existing, DEVICE_COOKIE_MAX_AGE);
    return existing;
  }
  const created = createId();
  writeCookie(DEVICE_COOKIE_NAME, created, DEVICE_COOKIE_MAX_AGE);
  return created;
}

// ── Helpers ──

function cleanPath(path: string): string {
  try {
    return new URL(path, window.location.origin).pathname.slice(0, 300);
  } catch {
    return "/";
  }
}

function getScreenInfo(): { width: number; height: number } | undefined {
  try {
    const w = window.screen.width;
    const h = window.screen.height;
    if (typeof w === "number" && typeof h === "number" && w > 0 && h > 0) {
      return { width: w, height: h };
    }
  } catch { /* ignore */ }
  return undefined;
}

function getTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

// ── Provider ──

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const enabledRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const deviceIdRef = useRef<string | null>(null);
  const screenRef = useRef<{ width: number; height: number } | undefined>(undefined);
  const timezoneRef = useRef<string | undefined>(undefined);
  const queueRef = useRef<
    Array<{
      type: AnalyticsEventName;
      path: string;
      target?: string;
      metadata?: Record<string, string>;
    }>
  >([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback((preferBeacon = false) => {
    if (!sessionIdRef.current || queueRef.current.length === 0) return;
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    const events = queueRef.current.splice(0, MAX_QUEUE_SIZE);
    const payload = JSON.stringify({
      sessionId: sessionIdRef.current,
      deviceId: deviceIdRef.current || undefined,
      screen: screenRef.current,
      timezone: timezoneRef.current,
      events,
    });
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-analytics-session-id": sessionIdRef.current,
    };

    if (preferBeacon && typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        "/api/analytics/events",
        new Blob([payload], { type: "application/json" })
      );
      if (sent) return;
    }

    void fetch("/api/analytics/events", {
      method: "POST",
      headers,
      body: payload,
      keepalive: preferBeacon,
    })
      .then((response) => {
        // Avoid retry storms on a deliberate rate limit, but retry transient failures once later.
        if (!response.ok && response.status !== 429) {
          queueRef.current = [...events, ...queueRef.current].slice(0, MAX_QUEUE_SIZE);
        }
      })
      .catch(() => {
        queueRef.current = [...events, ...queueRef.current].slice(0, MAX_QUEUE_SIZE);
      });
  }, []);

  const track = useCallback(
    (type: AnalyticsEventName, options: TrackOptions = {}) => {
      if (!enabledRef.current || !sessionIdRef.current) return;
      queueRef.current.push({
        type,
        path: cleanPath(options.path || window.location.pathname),
        ...(options.target ? { target: options.target.slice(0, 160) } : {}),
        ...(options.metadata ? { metadata: options.metadata } : {}),
      });

      if (queueRef.current.length >= 10) {
        flush();
      } else if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(() => flush(), 2_000);
      }
    },
    [flush]
  );

  useEffect(() => {
    if (router.pathname.startsWith("/admin") || !trackingIsAllowed()) return;

    enabledRef.current = true;
    sessionIdRef.current = loadSessionId();
    deviceIdRef.current = loadDeviceId();
    screenRef.current = getScreenInfo();
    timezoneRef.current = getTimezone();
    track("page_view");

    const onRouteChange = (url: string) => {
      if (!url.startsWith("/admin")) track("page_view", { path: url });
    };
    const onPageHide = () => flush(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush(true);
    };

    router.events.on("routeChangeComplete", onRouteChange);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      router.events.off("routeChangeComplete", onRouteChange);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      flush(true);
      enabledRef.current = false;
    };
  }, [flush, router.events, router.pathname, track]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      track,
      getSessionId: () => sessionIdRef.current,
      getDeviceId: () => deviceIdRef.current,
    }),
    [track]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}
