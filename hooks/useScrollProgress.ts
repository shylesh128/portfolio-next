import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollProgress {
  progress: number;
  scrollY: number;
  direction: 'up' | 'down' | null;
  velocity: number;
  isScrolling: boolean;
}

export function useScrollProgress(): ScrollProgress {
  const [scrollData, setScrollData] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    direction: null,
    velocity: 0,
    isScrolling: false,
  });

  const previousScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const rafId = useRef<number | null>(null);

  const calculateProgress = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    return Math.min(Math.max(progress, 0), 1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const velocity = currentScrollY - previousScrollY.current;
        const direction = velocity > 0 ? 'down' : velocity < 0 ? 'up' : null;
        const progress = calculateProgress();

        setScrollData({
          progress,
          scrollY: currentScrollY,
          direction,
          velocity: Math.abs(velocity),
          isScrolling: true,
        });

        previousScrollY.current = currentScrollY;

        // Reset isScrolling after scroll stops
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          setScrollData((prev) => ({ ...prev, isScrolling: false }));
        }, 150);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [calculateProgress]);

  return scrollData;
}

export function useSectionInView(threshold: number = 0.3) {
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            setProgress(entry.intersectionRatio);
          }
        });
      },
      {
        threshold: Array.from({ length: 10 }, (_, i) => i * 0.1),
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, isInView, progress };
}

export default useScrollProgress;


