/**
 * CamerPulse Badge System
 * 
 * Badge and chip components for status indicators, labels, and tags.
 * Includes civic-specific badges for roles, verification, and government positions.
 */

export const badgeVariants = {
  // Base badge styles
  base: [
    'inline-flex items-center rounded-full border px-2.5 py-0.5',
    'text-xs font-semibold transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  ].join(' '),

  // Standard variants
  variants: {
    default: [
      'border-transparent bg-primary text-primary-foreground',
      'hover:bg-primary/80'
    ].join(' '),

    secondary: [
      'border-transparent bg-secondary text-secondary-foreground',
      'hover:bg-secondary/80'
    ].join(' '),

    destructive: [
      'border-transparent bg-destructive text-destructive-foreground',
      'hover:bg-destructive/80'
    ].join(' '),

    outline: [
      'text-foreground border-border',
      'hover:bg-accent hover:text-accent-foreground'
    ].join(' '),

    success: [
      'border-transparent bg-green-500 text-white',
      'hover:bg-green-600'
    ].join(' '),

    warning: [
      'border-transparent bg-yellow-500 text-white',
      'hover:bg-yellow-600'
    ].join(' '),

    info: [
      'border-transparent bg-blue-500 text-white',
      'hover:bg-blue-600'
    ].join(' ')
  },

  // Size variants
  sizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  },

  // Civic-specific badge variants
  civic: {
    // Government positions
    minister: [
      'border-transparent bg-gradient-civic text-white',
      'font-bold shadow-elegant'
    ].join(' '),

    deputy: [
      'border-transparent bg-secondary text-secondary-foreground',
      'font-semibold shadow-green'
    ].join(' '),

    mayor: [
      'border-transparent bg-primary text-primary-foreground',
      'font-semibold shadow-red'
    ].join(' '),

    councilor: [
      'border-transparent bg-accent text-accent-foreground',
      'font-medium shadow-yellow'
    ].join(' '),

    // Verification badges
    verified: [
      'border-transparent bg-blue-500 text-white',
      'font-semibold',
      'flex items-center gap-1'
    ].join(' '),

    'government-verified': [
      'border-transparent bg-gradient-flag text-white',
      'font-bold shadow-glow',
      'flex items-center gap-1'
    ].join(' '),

    // Status badges
    active: [
      'border-transparent bg-green-100 text-green-800',
      'border-green-200'
    ].join(' '),

    inactive: [
      'border-transparent bg-gray-100 text-gray-800',
      'border-gray-200'
    ].join(' '),

    pending: [
      'border-transparent bg-yellow-100 text-yellow-800',
      'border-yellow-200'
    ].join(' '),

    suspended: [
      'border-transparent bg-red-100 text-red-800',
      'border-red-200'
    ].join(' '),

    // Party affiliations
    'party-cpdm': [
      'border-transparent bg-green-600 text-white',
      'font-medium'
    ].join(' '),

    'party-sdf': [
      'border-transparent bg-blue-600 text-white',
      'font-medium'
    ].join(' '),

    'party-other': [
      'border-transparent bg-gray-600 text-white',
      'font-medium'
    ].join(' '),

    // Engagement levels
    'high-engagement': [
      'border-transparent bg-green-500 text-white',
      'animate-pulse'
    ].join(' '),

    'medium-engagement': [
      'border-transparent bg-yellow-500 text-white'
    ].join(' '),

    'low-engagement': [
      'border-transparent bg-gray-500 text-white'
    ].join(' ')
  },

  // Company/Organization badges
  organization: {
    'public-sector': [
      'border-transparent bg-primary text-primary-foreground',
      'font-semibold'
    ].join(' '),

    'private-sector': [
      'border-transparent bg-blue-600 text-white',
      'font-medium'
    ].join(' '),

    ngo: [
      'border-transparent bg-green-600 text-white',
      'font-medium'
    ].join(' '),

    'international-org': [
      'border-transparent bg-purple-600 text-white',
      'font-medium'
    ].join(' ')
  }
} as const;

// Chip variants (for tags and categories)
export const chipVariants = {
  base: [
    'inline-flex items-center gap-1 rounded-md px-2 py-1',
    'text-xs font-medium transition-colors',
    'cursor-pointer hover:opacity-80'
  ].join(' '),

  variants: {
    default: [
      'bg-muted text-muted-foreground',
      'hover:bg-muted/80'
    ].join(' '),

    primary: [
      'bg-primary/10 text-primary',
      'hover:bg-primary/20'
    ].join(' '),

    secondary: [
      'bg-secondary/10 text-secondary',
      'hover:bg-secondary/20'
    ].join(' '),

    accent: [
      'bg-accent/10 text-accent-foreground',
      'hover:bg-accent/20'
    ].join(' ')
  },

  // Removable chips (with close button)
  removable: [
    'group flex items-center gap-1',
    '[&>.remove-button]:opacity-0 [&>.remove-button]:group-hover:opacity-100',
    '[&>.remove-button]:transition-opacity'
  ].join(' ')
} as const;

// Notification badges (for counts and indicators)
export const notificationBadge = {
  base: [
    'absolute -top-1 -right-1',
    'flex h-5 w-5 items-center justify-center',
    'rounded-full bg-destructive text-destructive-foreground',
    'text-xs font-bold'
  ].join(' '),

  sizes: {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm'
  },

  // Dot indicator (no count)
  dot: [
    'h-2 w-2 rounded-full bg-destructive',
    'border-2 border-background'
  ].join(' ')
} as const;

// Badge groups and collections
export const badgeGroup = {
  horizontal: [
    'flex flex-wrap items-center gap-1'
  ].join(' '),

  vertical: [
    'flex flex-col items-start gap-1'
  ].join(' ')
} as const;

// Icon configurations for badges
export const badgeIcons = {
  sizes: {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  },

  positions: {
    left: 'mr-1',
    right: 'ml-1'
  }
} as const;

export type BadgeVariant = keyof typeof badgeVariants.variants;
export type BadgeSize = keyof typeof badgeVariants.sizes;
export type CivicBadge = keyof typeof badgeVariants.civic;
export type OrganizationBadge = keyof typeof badgeVariants.organization;
export type ChipVariant = keyof typeof chipVariants.variants;
export type NotificationBadgeSize = keyof typeof notificationBadge.sizes;