/**
 * CamerPulse Breakpoint System
 * 
 * Mobile-first responsive breakpoints for the CamerPulse platform.
 * Optimized for mobile engagement while scaling to desktop.
 */

export const breakpoints = {
  // Mobile-first breakpoint values
  xs: '375px',      // Small mobile phones
  sm: '640px',      // Large mobile phones
  md: '768px',      // Tablets
  lg: '1024px',     // Small laptops
  xl: '1280px',     // Desktop
  '2xl': '1400px',  // Large desktop
  
  // Special breakpoints
  'safe-area': '414px',  // iPhone safe area
  'tablet-portrait': '768px',
  'tablet-landscape': '1024px',
  'desktop-small': '1280px',
  'desktop-large': '1920px'
} as const;

// Container max-widths for each breakpoint
export const containers = {
  xs: '100%',
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px'
} as const;

// Media queries for JavaScript usage
export const mediaQueries = {
  // Mobile-first media queries
  mobile: `(min-width: ${breakpoints.xs})`,
  mobileLarge: `(min-width: ${breakpoints.sm})`,
  tablet: `(min-width: ${breakpoints.md})`,
  laptop: `(min-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.xl})`,
  desktopLarge: `(min-width: ${breakpoints['2xl']})`,
  
  // Max-width queries (for mobile-only styles)
  mobileOnly: `(max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  tabletOnly: `(min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  laptopOnly: `(min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  
  // Device-specific queries
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Accessibility queries
  reduceMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  highContrast: '(prefers-contrast: high)'
} as const;

// Responsive utilities for common patterns
export const responsiveUtilities = {
  // Container padding by breakpoint
  containerPadding: {
    mobile: '1rem',      // 16px
    tablet: '1.5rem',    // 24px
    desktop: '2rem'      // 32px
  },
  
  // Section spacing by breakpoint
  sectionSpacing: {
    mobile: '2rem',      // 32px
    tablet: '3rem',      // 48px
    desktop: '4rem'      // 64px
  },
  
  // Grid gaps by breakpoint
  gridGap: {
    mobile: '1rem',      // 16px
    tablet: '1.5rem',    // 24px
    desktop: '2rem'      // 32px
  },
  
  // Typography scales by breakpoint
  headingScale: {
    mobile: '1.25',      // 25% increase
    tablet: '1.33',      // 33% increase  
    desktop: '1.5'       // 50% increase
  }
} as const;

// Component-specific responsive behaviors
export const componentBreakpoints = {
  // Navigation
  navigation: {
    mobileMenuBreakpoint: breakpoints.lg,  // Show mobile menu below 1024px
    sidebarBreakpoint: breakpoints.xl      // Show sidebar above 1280px
  },
  
  // Layout
  layout: {
    singleColumn: breakpoints.md,          // Single column below 768px
    twoColumn: breakpoints.lg,             // Two columns above 1024px
    threeColumn: breakpoints.xl            // Three columns above 1280px
  },
  
  // Cards and grids
  cards: {
    singleCard: breakpoints.sm,            // One card per row below 640px
    twoCards: breakpoints.md,              // Two cards per row above 768px
    threeCards: breakpoints.lg,            // Three cards per row above 1024px
    fourCards: breakpoints.xl              // Four cards per row above 1280px
  },
  
  // Modals and overlays
  modals: {
    fullScreen: breakpoints.md,            // Full screen modals below 768px
    centered: breakpoints.lg               // Centered modals above 1024px
  }
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type Container = keyof typeof containers;
export type MediaQuery = keyof typeof mediaQueries;
export type ComponentBreakpoint = keyof typeof componentBreakpoints;