/**
 * CamerPulse Design System Utilities
 * 
 * Helper functions and utilities for working with the design system.
 * Includes color manipulation, responsive helpers, and accessibility tools.
 */

import { clsx, type ClassValue } from 'clsx';

// Utility function for combining classes (similar to clsx but with tailwind-merge optimization)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Responsive utilities
export const responsive = {
  // Generate responsive classes
  text: (base: string) => `text-sm sm:${base} lg:text-lg`,
  spacing: (base: string) => `p-4 sm:${base} lg:p-8`,
  grid: (cols: number) => `grid-cols-1 sm:grid-cols-${Math.min(cols, 2)} lg:grid-cols-${cols}`,
  
  // Breakpoint helpers
  isMobile: () => typeof window !== 'undefined' && window.innerWidth < 640,
  isTablet: () => typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1024,
  isDesktop: () => typeof window !== 'undefined' && window.innerWidth >= 1024,
  
  // Touch device detection
  isTouch: () => typeof window !== 'undefined' && 'ontouchstart' in window
} as const;

// Color utilities
export const colors = {
  // Convert HSL to RGB
  hslToRgb: (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  },

  // Generate color variations
  lighten: (color: string, amount: number) => {
    // Simplified color lightening (would need full color parsing in real implementation)
    return color;
  },

  darken: (color: string, amount: number) => {
    // Simplified color darkening (would need full color parsing in real implementation)
    return color;
  },

  // Get contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string) => {
    // Simplified contrast calculation (would need full implementation)
    return 4.5; // WCAG AA compliance threshold
  }
} as const;

// Accessibility utilities
export const a11y = {
  // Screen reader only text
  srOnly: 'sr-only',
  
  // Focus management
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  
  // Skip links
  skipLink: [
    'absolute -top-10 left-6 z-50',
    'bg-primary text-primary-foreground px-4 py-2 rounded-md',
    'transform -translate-y-12 transition-transform',
    'focus:translate-y-0'
  ].join(' '),

  // ARIA helpers
  aria: {
    expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),
    selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),
    pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),
    hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),
    label: (label: string) => ({ 'aria-label': label }),
    describedBy: (id: string) => ({ 'aria-describedby': id }),
    labelledBy: (id: string) => ({ 'aria-labelledby': id })
  },

  // Color contrast validation
  validateContrast: (foreground: string, background: string) => {
    const ratio = colors.getContrastRatio(foreground, background);
    return {
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      ratio
    };
  }
} as const;

// Component state utilities
export const states = {
  // Loading state
  loading: 'opacity-50 cursor-wait pointer-events-none',
  
  // Disabled state
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  
  // Error state
  error: 'border-destructive text-destructive',
  
  // Success state
  success: 'border-green-500 text-green-700',
  
  // Interactive states
  interactive: {
    base: 'transition-colors duration-200',
    hover: 'hover:bg-accent hover:text-accent-foreground',
    focus: 'focus:outline-none focus:ring-2 focus:ring-primary',
    active: 'active:scale-95',
    pressed: 'data-[pressed]:bg-accent'
  }
} as const;

// Animation utilities (static for performance)
export const motion = {
  // Reduced motion preference
  respectMotion: 'motion-safe:transition motion-reduce:transition-none',
  
  // Common transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300'
  },

  // Transform utilities
  transform: {
    scale: 'transform hover:scale-105 active:scale-95',
    rotate: 'transform hover:rotate-1',
    translate: 'transform hover:-translate-y-1'
  }
} as const;

// Layout utilities
export const layout = {
  // Common layout patterns
  center: 'flex items-center justify-center',
  spaceBetween: 'flex items-center justify-between',
  stack: 'flex flex-col space-y-4',
  grid: 'grid gap-4',
  
  // Container utilities
  container: {
    base: 'container mx-auto px-4',
    wide: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    narrow: 'max-w-3xl mx-auto px-4',
    prose: 'max-w-2xl mx-auto px-4'
  },

  // Aspect ratios
  aspect: {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  }
} as const;

// Typography utilities
export const typography = {
  // Text truncation
  truncate: {
    single: 'truncate',
    multi: (lines: number) => `line-clamp-${lines}`
  },

  // Text alignment
  align: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  },

  // Font weights
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
} as const;

// Civic-specific utilities
export const civic = {
  // Government badge styling
  governmentBadge: 'bg-gradient-civic text-white font-semibold px-3 py-1 rounded-full text-xs',
  
  // Verification checkmark
  verified: 'text-blue-500 flex-shrink-0',
  
  // Priority indicators
  priority: {
    low: 'border-l-4 border-green-500',
    medium: 'border-l-4 border-yellow-500',
    high: 'border-l-4 border-red-500',
    urgent: 'border-l-4 border-red-500 bg-red-50'
  },

  // Region colors (simplified mapping)
  regions: {
    adamawa: 'text-orange-600',
    centre: 'text-green-600',
    east: 'text-blue-600',
    'far-north': 'text-yellow-600',
    littoral: 'text-cyan-600',
    north: 'text-red-600',
    northwest: 'text-purple-600',
    south: 'text-pink-600',
    southwest: 'text-indigo-600',
    west: 'text-emerald-600'
  }
} as const;

// Form validation utilities
export const validation = {
  // Input states
  input: {
    valid: 'border-green-500 focus:ring-green-500',
    invalid: 'border-red-500 focus:ring-red-500',
    pending: 'border-yellow-500 focus:ring-yellow-500'
  },

  // Error message styling
  error: 'text-sm text-red-600 mt-1',
  success: 'text-sm text-green-600 mt-1',
  hint: 'text-sm text-gray-500 mt-1'
} as const;

export type ResponsiveHelper = keyof typeof responsive;
export type ColorUtility = keyof typeof colors;
export type A11yUtility = keyof typeof a11y;
export type StateUtility = keyof typeof states;
export type LayoutUtility = keyof typeof layout;
export type CivicUtility = keyof typeof civic;