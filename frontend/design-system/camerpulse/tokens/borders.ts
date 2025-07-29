/**
 * CamerPulse Border System
 * 
 * Border radius, width, and style tokens for consistent component styling.
 */

export const borders = {
  // Border radius (corner rounding)
  radius: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px'
  },

  // Border widths
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },

  // Border styles
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    none: 'none'
  }
} as const;

// Semantic border radius tokens
export const radiusTokens = {
  // Component radius
  button: borders.radius.lg,     // 8px - soft rounded buttons
  card: borders.radius.xl,       // 12px - welcoming cards
  input: borders.radius.md,      // 6px - approachable inputs
  badge: borders.radius.full,    // pill shape for badges
  avatar: borders.radius.full,   // circular avatars
  modal: borders.radius['2xl'],  // 16px - prominent modals
  dropdown: borders.radius.lg,   // 8px - consistent with buttons

  // Layout radius
  container: borders.radius.xl,  // 12px - main containers
  section: borders.radius['2xl'], // 16px - page sections
  overlay: borders.radius['3xl'] // 24px - special overlays
} as const;

// Border color system
export const borderColors = {
  // Neutral borders
  default: 'hsl(var(--border))',
  muted: 'hsl(var(--muted))',
  
  // Brand borders
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  
  // Semantic borders
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  
  // Interactive states
  focus: 'hsl(var(--ring))',
  hover: 'hsl(var(--primary) / 0.8)',
  active: 'hsl(var(--primary) / 0.9)'
} as const;

// Complete border utilities
export const borderUtilities = {
  // Standard borders
  'border-default': `${borders.width[1]} ${borders.style.solid} ${borderColors.default}`,
  'border-muted': `${borders.width[1]} ${borders.style.solid} ${borderColors.muted}`,
  
  // Brand borders
  'border-primary': `${borders.width[1]} ${borders.style.solid} ${borderColors.primary}`,
  'border-secondary': `${borders.width[1]} ${borders.style.solid} ${borderColors.secondary}`,
  'border-accent': `${borders.width[1]} ${borders.style.solid} ${borderColors.accent}`,
  
  // Focus borders (thicker for accessibility)
  'border-focus': `${borders.width[2]} ${borders.style.solid} ${borderColors.focus}`,
  
  // Dashed borders for drag & drop zones
  'border-dashed': `${borders.width[2]} ${borders.style.dashed} ${borderColors.muted}`,
  
  // Special patriotic border (gradient effect)
  'border-patriotic': `${borders.width[2]} ${borders.style.solid} transparent`,
  'border-civic': `${borders.width[1]} ${borders.style.solid} ${borderColors.secondary}`
} as const;

export type BorderRadius = keyof typeof borders.radius;
export type BorderWidth = keyof typeof borders.width;
export type BorderStyle = keyof typeof borders.style;
export type RadiusToken = keyof typeof radiusTokens;
export type BorderColor = keyof typeof borderColors;