/**
 * CamerPulse Loading System
 * 
 * Loading spinners, skeleton loaders, and progress indicators.
 * Static implementations (no animations) for optimal performance.
 */

export const loadingVariants = {
  // Spinner base (static - no animation for performance)
  spinner: {
    base: [
      'inline-block rounded-full border-2 border-current',
      'border-r-transparent'
    ].join(' '),

    sizes: {
      xs: 'h-3 w-3 border',
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-2',
      xl: 'h-12 w-12 border-4'
    },

    colors: {
      primary: 'border-primary border-r-transparent',
      secondary: 'border-secondary border-r-transparent',
      accent: 'border-accent border-r-transparent',
      white: 'border-white border-r-transparent',
      muted: 'border-muted-foreground border-r-transparent'
    }
  },

  // Skeleton loader variants
  skeleton: {
    base: [
      'bg-muted rounded-md'
    ].join(' '),

    // Common skeleton shapes
    shapes: {
      text: 'h-4 w-full',
      'text-sm': 'h-3 w-3/4',
      'text-lg': 'h-6 w-full',
      title: 'h-8 w-2/3',
      avatar: 'h-12 w-12 rounded-full',
      'avatar-sm': 'h-8 w-8 rounded-full',
      'avatar-lg': 'h-16 w-16 rounded-full',
      button: 'h-10 w-24',
      'button-sm': 'h-8 w-20',
      'button-lg': 'h-12 w-32',
      card: 'h-32 w-full',
      image: 'aspect-video w-full',
      'image-square': 'aspect-square w-full'
    }
  },

  // Progress bar variants
  progress: {
    container: [
      'relative w-full overflow-hidden rounded-full bg-muted'
    ].join(' '),

    bar: [
      'h-full w-full flex-1 bg-primary transition-all'
    ].join(' '),

    sizes: {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    },

    colors: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      accent: 'bg-accent',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-destructive'
    }
  }
} as const;

// Skeleton component templates
export const skeletonTemplates = {
  // Card skeleton
  card: [
    'space-y-3 p-4 border rounded-lg'
  ].join(' '),

  // Profile skeleton
  profile: [
    'flex items-center space-x-4'
  ].join(' '),

  // List item skeleton
  listItem: [
    'flex items-center space-x-3 py-2'
  ].join(' '),

  // Article skeleton
  article: [
    'space-y-4'
  ].join(' '),

  // Feed post skeleton
  feedPost: [
    'space-y-3 p-4 border rounded-lg'
  ].join(' ')
} as const;

// Loading states for different components
export const loadingStates = {
  // Button loading state
  button: {
    base: [
      'relative disabled:opacity-70 cursor-wait'
    ].join(' '),

    overlay: [
      'absolute inset-0 flex items-center justify-center'
    ].join(' '),

    content: [
      'opacity-0'
    ].join(' ')
  },

  // Page loading state
  page: [
    'flex items-center justify-center min-h-[200px]'
  ].join(' '),

  // Section loading state
  section: [
    'space-y-4 p-6'
  ].join(' '),

  // Table loading state
  table: {
    container: 'space-y-2',
    row: 'grid grid-cols-4 gap-4 py-2',
    cell: 'h-4 bg-muted rounded'
  }
} as const;

// Civic-specific loading indicators
export const civicLoadingTypes = {
  // Voting process loading
  voting: {
    container: [
      'flex flex-col items-center justify-center p-8 text-center'
    ].join(' '),

    message: [
      'text-lg font-medium text-primary mt-4'
    ].join(' '),

    submessage: [
      'text-sm text-muted-foreground mt-2'
    ].join(' ')
  },

  // Government data loading
  government: {
    container: [
      'flex items-center gap-3 p-4 bg-secondary/5 rounded-lg border-l-4 border-secondary'
    ].join(' '),

    text: [
      'text-secondary font-medium'
    ].join(' ')
  },

  // Election results loading
  election: {
    container: [
      'space-y-4 p-6 bg-gradient-civic/5 rounded-lg'
    ].join(' '),

    title: [
      'h-6 bg-primary/20 rounded w-2/3'
    ].join(' '),

    bars: [
      'space-y-3'
    ].join(' '),

    bar: [
      'h-3 bg-muted rounded'
    ].join(' ')
  }
} as const;

// Data table loading skeleton
export const tableLoadingSkeleton = {
  header: [
    'grid grid-cols-4 gap-4 p-4 border-b'
  ].join(' '),

  headerCell: [
    'h-4 bg-muted rounded w-3/4'
  ].join(' '),

  row: [
    'grid grid-cols-4 gap-4 p-4 border-b'
  ].join(' '),

  cell: [
    'h-4 bg-muted rounded'
  ].join(' ')
} as const;

// Loading overlay for entire sections
export const loadingOverlay = {
  base: [
    'absolute inset-0 bg-background/80 backdrop-blur-sm',
    'flex items-center justify-center z-10'
  ].join(' '),

  content: [
    'flex flex-col items-center gap-2 text-center'
  ].join(' '),

  message: [
    'text-sm text-muted-foreground'
  ].join(' ')
} as const;

export type SpinnerSize = keyof typeof loadingVariants.spinner.sizes;
export type SpinnerColor = keyof typeof loadingVariants.spinner.colors;
export type SkeletonShape = keyof typeof loadingVariants.skeleton.shapes;
export type ProgressSize = keyof typeof loadingVariants.progress.sizes;
export type ProgressColor = keyof typeof loadingVariants.progress.colors;
export type SkeletonTemplate = keyof typeof skeletonTemplates;
export type CivicLoadingType = keyof typeof civicLoadingTypes;