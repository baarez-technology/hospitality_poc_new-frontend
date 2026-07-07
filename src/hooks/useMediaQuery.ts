import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Predefined breakpoints aligned with Tailwind config
// Mobile  : < 744px  → iPhone 14 / Pro / Pro Max
// Tablet  : 744-1023px → iPad Mini / Air / Pro 11"
// Desktop : ≥ 1024px → iPad Pro 12.9" landscape and up
export const useIsMobile = () => useMediaQuery('(max-width: 743px)');
export const useIsTablet = () => useMediaQuery('(min-width: 744px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
