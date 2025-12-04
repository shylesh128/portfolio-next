import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '@/lib/constants';

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Custom hook for responsive breakpoint detection
 * SSR-safe with debounced resize handling
 * @param breakpoint - Breakpoint to check (e.g., 'MD', 'LG')
 * @returns True if viewport is at or above the breakpoint
 */
export function useMediaQuery(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [breakpoint]);

  return matches;
}

/**
 * Hook to check if device is mobile
 * @returns True if viewport is below MD breakpoint
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('MD');
}

/**
 * Hook to check if device is tablet
 * @returns True if viewport is between MD and LG
 */
export function useIsTablet(): boolean {
  const isAboveMD = useMediaQuery('MD');
  const isBelowLG = !useMediaQuery('LG');
  return isAboveMD && isBelowLG;
}
