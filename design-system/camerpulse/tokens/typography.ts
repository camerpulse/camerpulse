/**
 * CamerPulse Typography System
 * 
 * Unified typography using Inter for all text elements.
 * Includes responsive scales and semantic text styles.
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },

  // Font Sizes (Mobile-first responsive)
  fontSize: {
    // Base sizes
    xs: {
      base: '0.75rem',    // 12px
      lineHeight: '1rem'   // 16px
    },
    sm: {
      base: '0.875rem',   // 14px
      lineHeight: '1.25rem' // 20px
    },
    base: {
      base: '1rem',       // 16px
      lineHeight: '1.5rem' // 24px
    },
    lg: {
      base: '1.125rem',   // 18px
      lineHeight: '1.75rem' // 28px
    },
    xl: {
      base: '1.25rem',    // 20px
      lineHeight: '1.75rem' // 28px
    },

    // Responsive heading scales
    'heading-sm': {
      mobile: '1.25rem',     // 20px
      tablet: '1.5rem',      // 24px
      desktop: '1.75rem',    // 28px
      lineHeight: '1.2'
    },
    'heading-md': {
      mobile: '1.5rem',      // 24px
      tablet: '1.875rem',    // 30px
      desktop: '2.25rem',    // 36px
      lineHeight: '1.15'
    },
    'heading-lg': {
      mobile: '1.875rem',    // 30px
      tablet: '2.25rem',     // 36px
      desktop: '3rem',       // 48px
      lineHeight: '1.1'
    },
    'heading-xl': {
      mobile: '2.25rem',     // 36px
      tablet: '3rem',        // 48px
      desktop: '3.75rem',    // 60px
      lineHeight: '1.05'
    },
    'heading-2xl': {
      mobile: '2.5rem',      // 40px
      tablet: '3.75rem',     // 60px
      desktop: '4.5rem',     // 72px
      lineHeight: '1'
    }
  },

  // Line Heights
  lineHeight: {
    tight: '1.1',
    snug: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const;

// Semantic Typography Styles
export const textStyles = {
  // Body text
  'body-sm': 'text-sm leading-normal font-normal',
  'body-base': 'text-base leading-normal font-normal',
  'body-lg': 'text-lg leading-relaxed font-normal',
  
  // Captions and labels
  caption: 'text-xs leading-tight font-medium text-muted-foreground',
  label: 'text-sm leading-tight font-medium',
  
  // Headings (responsive)
  'h1': 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight',
  'h2': 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight tracking-tight',
  'h3': 'text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold leading-snug',
  'h4': 'text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold leading-snug',
  'h5': 'text-sm sm:text-base lg:text-lg xl:text-xl font-medium leading-snug',
  'h6': 'text-xs sm:text-sm lg:text-base xl:text-lg font-medium leading-snug',
  
  // Display text
  'display-sm': 'text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-none tracking-tight',
  'display-md': 'text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-none tracking-tight',
  'display-lg': 'text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight',
  
  // Utility text
  overline: 'text-xs font-medium uppercase tracking-wider',
  code: 'font-mono text-sm bg-muted px-1 py-0.5 rounded',
  link: 'text-primary underline-offset-4 hover:underline font-medium',
  
  // Responsive utilities
  'responsive-text': 'text-sm sm:text-base lg:text-lg',
  'responsive-title': 'text-lg sm:text-xl lg:text-2xl xl:text-3xl',
  'responsive-heading': 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'
} as const;

export type TextStyle = keyof typeof textStyles;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;