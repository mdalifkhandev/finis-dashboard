/**
 * Centralized breakpoint system matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
