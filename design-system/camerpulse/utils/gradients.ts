/**
 * CamerPulse Gradient System
 * 
 * Brand gradients and background utilities for the platform.
 * Based on Cameroon's flag colors and CamerPulse branding.
 */

export const gradients = {
  // Primary brand gradients
  brand: {
    // Main CamerPulse gradient (Red to Green)
    primary: 'linear-gradient(135deg, #B9121B 0%, #1F7D2C 100%)',
    
    // Civic engagement gradient (Green to Yellow)
    civic: 'linear-gradient(135deg, #1F7D2C 0%, #F59E0B 100%)',
    
    // Patriotic gradient (Flag colors)
    flag: 'linear-gradient(to right, #007E33 33%, #C8102E 33%, #C8102E 66%, #FFD700 66%)',
    
    // Pulse effect gradient
    pulse: 'linear-gradient(45deg, #B9121B, #F59E0B, #1F7D2C)',
    
    // Subtle brand gradient
    subtle: 'linear-gradient(135deg, #B9121B10 0%, #1F7D2C10 100%)'
  },

  // Cameroon flag inspired
  cameroon: {
    // Horizontal flag layout
    horizontal: 'linear-gradient(to right, #007E33 33.333%, #C8102E 33.333%, #C8102E 66.666%, #FFD700 66.666%)',
    
    // Vertical flag layout
    vertical: 'linear-gradient(to bottom, #007E33 33.333%, #C8102E 33.333%, #C8102E 66.666%, #FFD700 66.666%)',
    
    // Diagonal flag interpretation
    diagonal: 'linear-gradient(135deg, #007E33 0%, #C8102E 50%, #FFD700 100%)',
    
    // Radial patriotic
    radial: 'radial-gradient(circle at center, #C8102E 0%, #007E33 50%, #FFD700 100%)'
  },

  // Semantic gradients
  semantic: {
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    info: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
  },

  // Neutral gradients
  neutral: {
    light: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    medium: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
    dark: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
  },

  // Time-based gradients (for different contexts)
  contextual: {
    // Dawn/Morning
    dawn: 'linear-gradient(135deg, #FEF3C7 0%, #F59E0B 50%, #DC2626 100%)',
    
    // Day/Active
    day: 'linear-gradient(135deg, #DBEAFE 0%, #3B82F6 50%, #1D4ED8 100%)',
    
    // Dusk/Evening
    dusk: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #B45309 100%)',
    
    // Night/Calm
    night: 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%)'
  },

  // Special effect gradients
  effects: {
    // Glass morphism
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    
    // Shimmer effect
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
    
    // Glow effect
    glow: 'radial-gradient(circle at center, rgba(185, 18, 27, 0.3) 0%, transparent 70%)',
    
    // Shadow gradient
    shadow: 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%)'
  }
} as const;

// Gradient utilities for CSS classes
export const gradientUtilities = {
  // Background gradients
  'bg-gradient-brand-primary': `background: ${gradients.brand.primary}`,
  'bg-gradient-civic': `background: ${gradients.brand.civic}`,
  'bg-gradient-flag': `background: ${gradients.brand.flag}`,
  'bg-gradient-pulse': `background: ${gradients.brand.pulse}`,
  
  // Text gradients
  'text-gradient-brand': {
    background: gradients.brand.primary,
    '-webkit-background-clip': 'text',
    'background-clip': 'text',
    '-webkit-text-fill-color': 'transparent'
  },
  
  'text-gradient-civic': {
    background: gradients.brand.civic,
    '-webkit-background-clip': 'text',
    'background-clip': 'text',
    '-webkit-text-fill-color': 'transparent'
  },

  'text-gradient-patriotic': {
    background: gradients.cameroon.diagonal,
    '-webkit-background-clip': 'text',
    'background-clip': 'text',
    '-webkit-text-fill-color': 'transparent'
  }
} as const;

// Gradient overlays for images and backgrounds
export const gradientOverlays = {
  // Dark overlay for text readability
  darkOverlay: 'linear-gradient(180deg, rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.6) 100%)',
  
  // Brand overlay
  brandOverlay: 'linear-gradient(135deg, rgba(185, 18, 27, 0.8) 0%, rgba(31, 125, 44, 0.8) 100%)',
  
  // Civic overlay
  civicOverlay: 'linear-gradient(135deg, rgba(31, 125, 44, 0.9) 0%, rgba(245, 158, 11, 0.7) 100%)',
  
  // Emergency overlay
  emergencyOverlay: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(185, 18, 27, 0.9) 100%)'
} as const;

// CSS custom properties for dynamic gradients
export const gradientTokens = {
  '--gradient-brand-primary': gradients.brand.primary,
  '--gradient-civic': gradients.brand.civic,
  '--gradient-flag': gradients.brand.flag,
  '--gradient-pulse': gradients.brand.pulse,
  '--gradient-patriotic': gradients.cameroon.diagonal,
  '--gradient-success': gradients.semantic.success,
  '--gradient-warning': gradients.semantic.warning,
  '--gradient-error': gradients.semantic.error,
  '--gradient-info': gradients.semantic.info
} as const;

// Mesh gradients for modern backgrounds
export const meshGradients = {
  // Civic mesh
  civic: 'radial-gradient(at 40% 20%, #1F7D2C 0px, transparent 50%), radial-gradient(at 80% 0%, #F59E0B 0px, transparent 50%), radial-gradient(at 0% 50%, #B9121B 0px, transparent 50%)',
  
  // Patriotic mesh
  patriotic: 'radial-gradient(at 0% 0%, #007E33 0px, transparent 50%), radial-gradient(at 50% 0%, #C8102E 0px, transparent 50%), radial-gradient(at 100% 0%, #FFD700 0px, transparent 50%)',
  
  // Neutral mesh
  neutral: 'radial-gradient(at 40% 20%, #F3F4F6 0px, transparent 50%), radial-gradient(at 80% 0%, #E5E7EB 0px, transparent 50%), radial-gradient(at 0% 50%, #D1D5DB 0px, transparent 50%)'
} as const;

export type BrandGradient = keyof typeof gradients.brand;
export type CameroonGradient = keyof typeof gradients.cameroon;
export type SemanticGradient = keyof typeof gradients.semantic;
export type ContextualGradient = keyof typeof gradients.contextual;
export type EffectGradient = keyof typeof gradients.effects;
export type MeshGradient = keyof typeof meshGradients;