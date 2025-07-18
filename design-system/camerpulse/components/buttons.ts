/**
 * CamerPulse Button System
 * 
 * Comprehensive button variants and styles for the platform.
 * Includes primary, secondary, and semantic button types.
 */

export const buttonVariants = {
  // Base button styles
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'min-h-[44px] min-w-[44px]', // Touch-friendly sizing
  ].join(' '),

  // Size variants
  sizes: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
    icon: 'h-11 w-11'
  },

  // Color variants
  variants: {
    // Primary CamerPulse brand
    primary: [
      'bg-primary text-primary-foreground',
      'hover:bg-primary/90',
      'focus-visible:ring-primary',
      'active:bg-primary/95'
    ].join(' '),

    // Secondary (National Green)
    secondary: [
      'bg-secondary text-secondary-foreground',
      'hover:bg-secondary/90',
      'focus-visible:ring-secondary',
      'active:bg-secondary/95'
    ].join(' '),

    // Accent (Pulse Yellow)
    accent: [
      'bg-accent text-accent-foreground',
      'hover:bg-accent/90',
      'focus-visible:ring-accent',
      'active:bg-accent/95'
    ].join(' '),

    // Destructive (Error actions)
    destructive: [
      'bg-destructive text-destructive-foreground',
      'hover:bg-destructive/90',
      'focus-visible:ring-destructive',
      'active:bg-destructive/95'
    ].join(' '),

    // Outline variants
    outline: [
      'border border-input bg-background',
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:ring-ring',
      'active:bg-accent/95'
    ].join(' '),

    'outline-primary': [
      'border-2 border-primary text-primary bg-transparent',
      'hover:bg-primary hover:text-primary-foreground',
      'focus-visible:ring-primary',
      'active:bg-primary/95'
    ].join(' '),

    'outline-secondary': [
      'border-2 border-secondary text-secondary bg-transparent',
      'hover:bg-secondary hover:text-secondary-foreground',
      'focus-visible:ring-secondary',
      'active:bg-secondary/95'
    ].join(' '),

    // Ghost variants
    ghost: [
      'hover:bg-accent hover:text-accent-foreground',
      'focus-visible:ring-ring',
      'active:bg-accent/95'
    ].join(' '),

    'ghost-primary': [
      'text-primary hover:bg-primary/10',
      'focus-visible:ring-primary',
      'active:bg-primary/20'
    ].join(' '),

    'ghost-secondary': [
      'text-secondary hover:bg-secondary/10',
      'focus-visible:ring-secondary',
      'active:bg-secondary/20'
    ].join(' '),

    // Link variant
    link: [
      'text-primary underline-offset-4',
      'hover:underline',
      'focus-visible:ring-primary',
      'h-auto p-0 font-normal'
    ].join(' ')
  },

  // Semantic button variants
  semantic: {
    success: [
      'bg-green-600 text-white',
      'hover:bg-green-700',
      'focus-visible:ring-green-600',
      'active:bg-green-800'
    ].join(' '),

    warning: [
      'bg-yellow-600 text-white',
      'hover:bg-yellow-700',
      'focus-visible:ring-yellow-600',
      'active:bg-yellow-800'
    ].join(' '),

    info: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700',
      'focus-visible:ring-blue-600',
      'active:bg-blue-800'
    ].join(' ')
  },

  // Special CamerPulse variants
  civic: {
    // Civic engagement primary action
    'civic-primary': [
      'bg-gradient-civic text-white font-semibold',
      'hover:opacity-90',
      'focus-visible:ring-primary',
      'shadow-elegant'
    ].join(' '),

    // Patriotic action button
    patriotic: [
      'bg-gradient-flag text-white font-bold',
      'hover:opacity-90',
      'focus-visible:ring-primary',
      'shadow-glow'
    ].join(' '),

    // Vote/Poll action
    vote: [
      'bg-primary text-primary-foreground font-semibold',
      'hover:bg-primary/90',
      'focus-visible:ring-primary',
      'transform hover:scale-105 active:scale-95',
      'shadow-lg hover:shadow-xl'
    ].join(' '),

    // Emergency/Alert button
    alert: [
      'bg-destructive text-destructive-foreground font-bold',
      'hover:bg-destructive/90',
      'focus-visible:ring-destructive',
      'animate-pulse',
      'shadow-red'
    ].join(' ')
  }
} as const;

// Button icon configurations
export const buttonIcons = {
  // Icon positions
  positions: {
    left: 'mr-2',
    right: 'ml-2',
    only: ''
  },

  // Icon sizes by button size
  sizes: {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  }
} as const;

// Loading state configurations
export const buttonLoading = {
  // Spinner sizes
  spinnerSizes: {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  },

  // Loading state styles
  loading: [
    'relative',
    'disabled:opacity-70',
    'cursor-wait'
  ].join(' '),

  // Spinner positioning
  spinner: [
    'absolute inset-0',
    'flex items-center justify-center'
  ].join(' ')
} as const;

// Button group configurations
export const buttonGroups = {
  // Horizontal group
  horizontal: [
    'inline-flex rounded-lg shadow-sm',
    '[&>*:first-child]:rounded-r-none [&>*:first-child]:border-r-0',
    '[&>*:last-child]:rounded-l-none',
    '[&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child):not(:last-child)]:border-r-0'
  ].join(' '),

  // Vertical group
  vertical: [
    'inline-flex flex-col rounded-lg shadow-sm',
    '[&>*:first-child]:rounded-b-none [&>*:first-child]:border-b-0',
    '[&>*:last-child]:rounded-t-none',
    '[&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child):not(:last-child)]:border-b-0'
  ].join(' ')
} as const;

export type ButtonVariant = keyof typeof buttonVariants.variants;
export type ButtonSize = keyof typeof buttonVariants.sizes;
export type SemanticButtonVariant = keyof typeof buttonVariants.semantic;
export type CivicButtonVariant = keyof typeof buttonVariants.civic;
export type IconPosition = keyof typeof buttonIcons.positions;