/**
 * CamerPulse Spacing System
 * 
 * Consistent spacing scale for padding, margins, and gaps.
 * Follows an 8px base grid system for visual harmony.
 */

export const spacing = {
  // Base spacing scale (8px grid)
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px'
} as const;

// Semantic spacing tokens
export const spacingTokens = {
  // Component spacing
  component: {
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[4],    // 16px
    lg: spacing[6],    // 24px
    xl: spacing[8],    // 32px
    '2xl': spacing[12] // 48px
  },

  // Layout spacing
  layout: {
    xs: spacing[4],    // 16px
    sm: spacing[6],    // 24px
    md: spacing[8],    // 32px
    lg: spacing[12],   // 48px
    xl: spacing[16],   // 64px
    '2xl': spacing[24] // 96px
  },

  // Section spacing
  section: {
    xs: spacing[8],    // 32px
    sm: spacing[12],   // 48px
    md: spacing[16],   // 64px
    lg: spacing[24],   // 96px
    xl: spacing[32],   // 128px
    '2xl': spacing[40] // 160px
  },

  // Container padding
  container: {
    mobile: spacing[4],   // 16px
    tablet: spacing[6],   // 24px
    desktop: spacing[8]   // 32px
  }
} as const;

// Grid system
export const grid = {
  // Container max-widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px'
  },

  // Column spans (12-column grid)
  columns: {
    1: '8.333333%',
    2: '16.666667%',
    3: '25%',
    4: '33.333333%',
    5: '41.666667%',
    6: '50%',
    7: '58.333333%',
    8: '66.666667%',
    9: '75%',
    10: '83.333333%',
    11: '91.666667%',
    12: '100%'
  },

  // Gutters
  gap: {
    xs: spacing[2],    // 8px
    sm: spacing[4],    // 16px
    md: spacing[6],    // 24px
    lg: spacing[8],    // 32px
    xl: spacing[12]    // 48px
  }
} as const;

// Touch targets (for mobile accessibility)
export const touchTargets = {
  // Minimum touch target sizes
  minimum: {
    width: spacing[11],  // 44px (iOS/Android minimum)
    height: spacing[11]  // 44px
  },
  comfortable: {
    width: spacing[12],  // 48px (comfortable size)
    height: spacing[12]  // 48px
  },
  large: {
    width: spacing[14],  // 56px (large touch area)
    height: spacing[14]  // 56px
  }
} as const;

export type SpacingToken = keyof typeof spacing;
export type ComponentSpacing = keyof typeof spacingTokens.component;
export type LayoutSpacing = keyof typeof spacingTokens.layout;
export type SectionSpacing = keyof typeof spacingTokens.section;