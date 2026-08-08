import { useState, useEffect } from 'react';
import { BREAKPOINTS, Breakpoint } from '../utils/breakpoints';

/**
 * Custom hook to detect if a media query matches
 * @param query CSS media query string or a predefined breakpoint key
 */
export function useMediaQuery(query: string | Breakpoint): boolean {
    // Convert breakpoint key to media query if needed
    const mediaQuery = query in BREAKPOINTS
        ? `(min-width: ${BREAKPOINTS[query as Breakpoint]})`
        : query;

    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(mediaQuery);

        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // Define listener
        const listener = () => setMatches(media.matches);

        // Add listener
        media.addEventListener('change', listener);

        // Clean up
        return () => media.removeEventListener('change', listener);
    }, [matches, mediaQuery]);

    return matches;
}
