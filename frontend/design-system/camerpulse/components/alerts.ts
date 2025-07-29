/**
 * CamerPulse Alert System
 * 
 * Alert and notification components for various semantic states.
 * Includes civic-specific alert types for government communications.
 */

export const alertVariants = {
  // Base alert styles
  base: [
    'relative w-full rounded-lg border px-4 py-3',
    'text-sm [&>svg+div]:translate-y-[-3px]',
    '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
    '[&>svg~*]:pl-7'
  ].join(' '),

  // Semantic variants
  variants: {
    // Default informational
    default: [
      'bg-background text-foreground',
      'border-border'
    ].join(' '),

    // Success states
    success: [
      'border-green-200 bg-green-50 text-green-800',
      'dark:border-green-800 dark:bg-green-950 dark:text-green-400',
      '[&>svg]:text-green-600 dark:[&>svg]:text-green-400'
    ].join(' '),

    // Warning states
    warning: [
      'border-yellow-200 bg-yellow-50 text-yellow-800',
      'dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400',
      '[&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400'
    ].join(' '),

    // Error/destructive states
    destructive: [
      'border-red-200 bg-red-50 text-red-800',
      'dark:border-red-800 dark:bg-red-950 dark:text-red-400',
      '[&>svg]:text-red-600 dark:[&>svg]:text-red-400'
    ].join(' '),

    // Info states
    info: [
      'border-blue-200 bg-blue-50 text-blue-800',
      'dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
      '[&>svg]:text-blue-600 dark:[&>svg]:text-blue-400'
    ].join(' ')
  },

  // CamerPulse civic-specific variants
  civic: {
    // Government announcements
    government: [
      'border-primary bg-primary/5 text-primary-foreground',
      'shadow-elegant',
      '[&>svg]:text-primary'
    ].join(' '),

    // Civic engagement calls
    engagement: [
      'border-secondary bg-secondary/5 text-secondary-foreground',
      'shadow-green',
      '[&>svg]:text-secondary'
    ].join(' '),

    // Emergency alerts
    emergency: [
      'border-destructive bg-destructive/5 text-destructive',
      'shadow-red animate-pulse',
      '[&>svg]:text-destructive',
      'font-semibold'
    ].join(' '),

    // Election updates
    election: [
      'border-accent bg-accent/5 text-accent-foreground',
      'shadow-yellow',
      '[&>svg]:text-accent'
    ].join(' '),

    // National updates
    national: [
      'bg-gradient-civic text-white border-transparent',
      'shadow-glow',
      '[&>svg]:text-white'
    ].join(' ')
  },

  // Alert sizes
  sizes: {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  }
} as const;

// Alert title and description styles
export const alertContent = {
  title: [
    'mb-1 font-medium leading-none tracking-tight'
  ].join(' '),

  description: [
    'text-sm [&_p]:leading-relaxed'
  ].join(' ')
} as const;

// Toast notification variants (for real-time alerts)
export const toastVariants = {
  // Base toast styles
  base: [
    'group pointer-events-auto relative flex w-full items-center',
    'justify-between space-x-2 overflow-hidden rounded-md border p-4',
    'shadow-lg transition-all',
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=move]:transition-none',
    'data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-80',
    'data-[state=closed]:slide-out-to-right-full'
  ].join(' '),

  variants: {
    default: [
      'border bg-background text-foreground'
    ].join(' '),

    destructive: [
      'destructive border-destructive bg-destructive text-destructive-foreground'
    ].join(' '),

    success: [
      'border-green-200 bg-green-50 text-green-800'
    ].join(' '),

    warning: [
      'border-yellow-200 bg-yellow-50 text-yellow-800'
    ].join(' '),

    info: [
      'border-blue-200 bg-blue-50 text-blue-800'
    ].join(' ')
  }
} as const;

// Banner alert variants (for site-wide announcements)
export const bannerVariants = {
  base: [
    'relative w-full px-4 py-2 text-center text-sm font-medium',
    'flex items-center justify-center gap-2'
  ].join(' '),

  variants: {
    // Site maintenance
    maintenance: [
      'bg-yellow-100 text-yellow-800 border-b border-yellow-200'
    ].join(' '),

    // Election period
    election: [
      'bg-gradient-civic text-white'
    ].join(' '),

    // National holiday
    holiday: [
      'bg-gradient-flag text-white'
    ].join(' '),

    // Emergency alert
    emergency: [
      'bg-destructive text-destructive-foreground animate-pulse'
    ].join(' ')
  }
} as const;

// Alert action buttons
export const alertActions = {
  primary: [
    'inline-flex h-8 shrink-0 items-center justify-center',
    'rounded-md border border-transparent bg-primary px-3',
    'text-xs font-medium text-primary-foreground',
    'hover:bg-primary/80',
    'focus:outline-none focus:ring-2 focus:ring-primary'
  ].join(' '),

  secondary: [
    'inline-flex h-8 shrink-0 items-center justify-center',
    'rounded-md border border-border bg-transparent px-3',
    'text-xs font-medium',
    'hover:bg-secondary/80',
    'focus:outline-none focus:ring-2 focus:ring-secondary'
  ].join(' '),

  dismiss: [
    'inline-flex h-8 w-8 shrink-0 items-center justify-center',
    'rounded-md border border-transparent',
    'hover:bg-secondary/20',
    'focus:outline-none focus:ring-2 focus:ring-secondary'
  ].join(' ')
} as const;

export type AlertVariant = keyof typeof alertVariants.variants;
export type CivicAlertVariant = keyof typeof alertVariants.civic;
export type AlertSize = keyof typeof alertVariants.sizes;
export type ToastVariant = keyof typeof toastVariants.variants;
export type BannerVariant = keyof typeof bannerVariants.variants;