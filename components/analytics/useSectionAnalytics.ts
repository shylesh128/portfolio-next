import { useEffect } from "react";
import { useAnalytics } from "./AnalyticsProvider";

export function useSectionAnalytics(sectionIds: string[], enabled: boolean): void {
  const { track } = useAnalytics();
  const sectionKey = sectionIds.join("|");

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.id;
          if (entry.isIntersecting && section && !seen.has(section)) {
            seen.add(section);
            track("section_view", { target: section });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    sectionKey.split("|").forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [enabled, sectionKey, track]);
}
