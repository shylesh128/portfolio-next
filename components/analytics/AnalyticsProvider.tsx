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
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  track: () => undefined,
  getSessionId: () => null,
});

const STORAGE_KEY = "portfolio.analytics.session";
const MAX_QUEUE_SIZE = 20;

function trackingIsAllowed(): boolean {
  if (typeof navigator === "undefined") return false;
  const browser = navigator as Navigator & { globalPrivacyControl?: boolean };
  return navigator.doNotTrack !== "1" && !browser.globalPrivacyControl;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

function loadSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;
    const created = createSessionId();
    window.sessionStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return createSessionId();
  }
}

function cleanPath(path: string): string {
  try {
    return new URL(path, window.location.origin).pathname.slice(0, 300);
  } catch {
    return "/";
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const enabledRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const queueRef = useRef<Array<{ type: AnalyticsEventName; path: string; target?: string; metadata?: Record<string, string> }>>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback((preferBeacon = false) => {
    if (!sessionIdRef.current || queueRef.current.length === 0) return;
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    const events = queueRef.current.splice(0, MAX_QUEUE_SIZE);
    const payload = JSON.stringify({ sessionId: sessionIdRef.current, events });
    const headers = {
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
    }).then((response) => {
      // Avoid retry storms on a deliberate rate limit, but retry transient failures once later.
      if (!response.ok && response.status !== 429) {
        queueRef.current = [...events, ...queueRef.current].slice(0, MAX_QUEUE_SIZE);
      }
    }).catch(() => {
      queueRef.current = [...events, ...queueRef.current].slice(0, MAX_QUEUE_SIZE);
    });
  }, []);

  const track = useCallback((type: AnalyticsEventName, options: TrackOptions = {}) => {
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
  }, [flush]);

  useEffect(() => {
    if (router.pathname.startsWith("/admin") || !trackingIsAllowed()) return;

    enabledRef.current = true;
    sessionIdRef.current = loadSessionId();
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

  const value = useMemo<AnalyticsContextValue>(() => ({
    track,
    getSessionId: () => sessionIdRef.current,
  }), [track]);

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}
