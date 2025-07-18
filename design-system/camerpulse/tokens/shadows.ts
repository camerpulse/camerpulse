/**
 * CamerPulse Shadow System
 * 
 * Elevation and depth system using brand-aware shadows.
 * Supports both neutral and brand-colored shadows.
 */

export const shadows = {
  // Neutral shadows (elevation system)
  none: 'none',
  
  // Subtle shadows
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Brand shadows (using CamerPulse colors)
  brand: {
    // Primary red shadows
    primary: {
      glow: '0 0 20px rgb(185 18 27 / 0.3)',
      subtle: '0 4px 12px rgb(185 18 27 / 0.15)',
      strong: '0 8px 25px rgb(185 18 27 / 0.25)'
    },
    
    // Secondary green shadows  
    secondary: {
      glow: '0 0 20px rgb(31 125 44 / 0.3)',
      subtle: '0 4px 12px rgb(31 125 44 / 0.15)',
      strong: '0 8px 25px rgb(31 125 44 / 0.25)'
    },
    
    // Accent yellow shadows
    accent: {
      glow: '0 0 20px rgb(245 158 11 / 0.3)',
      subtle: '0 4px 12px rgb(245 158 11 / 0.15)',
      strong: '0 8px 25px rgb(245 158 11 / 0.25)'
    }
  },

  // Semantic shadows
  semantic: {
    success: '0 4px 12px rgb(16 185 129 / 0.15)',
    warning: '0 4px 12px rgb(245 158 11 / 0.15)',
    error: '0 4px 12px rgb(239 68 68 / 0.15)',
    info: '0 4px 12px rgb(59 130 246 / 0.15)'
  },

  // Special effect shadows
  effects: {
    // Elegant shadow for cards and modals
    elegant: '0 10px 30px -10px rgb(185 18 27 / 0.3)',
    
    // Civic engagement glow
    civic: '0 0 40px rgb(31 125 44 / 0.4)',
    
    // Interactive element shadows
    interactive: {
      rest: '0 2px 4px rgb(0 0 0 / 0.1)',
      hover: '0 4px 8px rgb(0 0 0 / 0.15)',
      active: '0 1px 2px rgb(0 0 0 / 0.1)',
      focus: '0 0 0 4px rgb(185 18 27 / 0.2)'
    },
    
    // Modal and overlay shadows
    modal: '0 25px 50px -12px rgb(0 0 0 / 0.4)',
    dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    
    // Mobile-specific shadows
    mobile: {
      card: '0 2px 8px rgb(0 0 0 / 0.1)',
      floating: '0 4px 12px rgb(0 0 0 / 0.15)',
      bottom_sheet: '0 -4px 12px rgb(0 0 0 / 0.1)'
    }
  }
} as const;

// CSS custom properties for dynamic shadows
export const shadowTokens = {
  // Elevation system
  'shadow-xs': 'var(--shadow-xs, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
  'shadow-sm': 'var(--shadow-sm, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
  'shadow-md': 'var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
  'shadow-lg': 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1))',
  'shadow-xl': 'var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1))',
  
  // Brand shadows
  'shadow-elegant': 'var(--shadow-elegant)',
  'shadow-glow': 'var(--shadow-glow)', 
  'shadow-green': 'var(--shadow-green)',
  'shadow-red': 'var(--shadow-red)',
  'shadow-yellow': 'var(--shadow-yellow)'
} as const;

export type ShadowToken = keyof typeof shadows;
export type BrandShadow = keyof typeof shadows.brand;
export type SemanticShadow = keyof typeof shadows.semantic;
export type EffectShadow = keyof typeof shadows.effects;