/**
 * CamerPulse Form System
 * 
 * Comprehensive form components including inputs, selects, toggles, and validation.
 * Optimized for civic engagement and government data collection.
 */

export const formVariants = {
  // Input field styles
  input: {
    base: [
      'flex h-11 w-full rounded-md border border-input',
      'bg-background px-3 py-2 text-sm',
      'ring-offset-background file:border-0 file:bg-transparent',
      'file:text-sm file:font-medium placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'min-h-[44px]' // Touch-friendly minimum height
    ].join(' '),

    sizes: {
      sm: 'h-9 px-2 text-sm',
      md: 'h-11 px-3 text-base',
      lg: 'h-12 px-4 text-lg'
    },

    states: {
      default: 'border-input focus-visible:ring-ring',
      error: 'border-destructive focus-visible:ring-destructive',
      success: 'border-green-500 focus-visible:ring-green-500',
      warning: 'border-yellow-500 focus-visible:ring-yellow-500'
    }
  },

  // Textarea styles
  textarea: {
    base: [
      'flex min-h-[80px] w-full rounded-md border border-input',
      'bg-background px-3 py-2 text-sm ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'resize-none'
    ].join(' '),

    sizes: {
      sm: 'min-h-[60px] px-2 py-2 text-sm',
      md: 'min-h-[80px] px-3 py-2 text-base',
      lg: 'min-h-[120px] px-4 py-3 text-lg'
    }
  },

  // Select dropdown styles
  select: {
    trigger: [
      'flex h-11 w-full items-center justify-between',
      'rounded-md border border-input bg-background px-3 py-2',
      'text-sm ring-offset-background placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'min-h-[44px]'
    ].join(' '),

    content: [
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden',
      'rounded-md border bg-popover text-popover-foreground shadow-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
    ].join(' '),

    item: [
      'relative flex w-full cursor-default select-none items-center',
      'rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
    ].join(' ')
  },

  // Label styles
  label: {
    base: [
      'text-sm font-medium leading-none',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
    ].join(' '),

    required: [
      'after:content-["*"] after:ml-0.5 after:text-destructive'
    ].join(' ')
  },

  // Form group and field wrapper
  field: {
    base: 'space-y-2',
    group: 'space-y-4',
    row: 'grid grid-cols-1 gap-4 sm:grid-cols-2'
  }
} as const;

// Toggle and switch components
export const toggleVariants = {
  // Switch component
  switch: {
    base: [
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center',
      'rounded-full border-2 border-transparent transition-colors',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input'
    ].join(' '),

    thumb: [
      'pointer-events-none block h-5 w-5 rounded-full bg-background',
      'shadow-lg ring-0 transition-transform',
      'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
    ].join(' ')
  },

  // Checkbox component
  checkbox: {
    base: [
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary',
      'ring-offset-background focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'
    ].join(' ')
  },

  // Radio button component
  radio: {
    base: [
      'aspect-square h-4 w-4 rounded-full border border-primary',
      'text-primary ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50'
    ].join(' '),

    indicator: [
      'flex items-center justify-center',
      'after:content-[""] after:block after:h-2 after:w-2',
      'after:rounded-full after:bg-primary'
    ].join(' ')
  }
} as const;

// Validation and error handling
export const validationStyles = {
  // Error message styles
  error: [
    'text-sm font-medium text-destructive'
  ].join(' '),

  // Success message styles
  success: [
    'text-sm font-medium text-green-600'
  ].join(' '),

  // Helper text styles
  helper: [
    'text-sm text-muted-foreground'
  ].join(' '),

  // Field with error state
  fieldError: [
    'border-destructive focus-visible:ring-destructive'
  ].join(' '),

  // Field with success state
  fieldSuccess: [
    'border-green-500 focus-visible:ring-green-500'
  ].join(' ')
} as const;

// Civic-specific form components
export const civicFormComponents = {
  // Government ID input
  governmentId: {
    base: [
      'font-mono text-center tracking-wider',
      'uppercase placeholder:normal-case placeholder:tracking-normal'
    ].join(' ')
  },

  // Region/location selector
  regionSelector: {
    base: 'w-full',
    // Cameroon regions for civic forms
    regions: [
      'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
      'North', 'Northwest', 'South', 'Southwest', 'West'
    ]
  },

  // Political party selector
  partySelector: {
    major: ['CPDM', 'SDF', 'UNDP', 'UPC'],
    other: 'Other'
  },

  // Civic engagement preferences
  engagementPreferences: [
    'Local Politics', 'National Politics', 'Environmental Issues',
    'Education', 'Healthcare', 'Infrastructure', 'Economic Development',
    'Human Rights', 'Youth Development', 'Women Empowerment'
  ]
} as const;

// Form layouts and patterns
export const formLayouts = {
  // Single column (mobile-first)
  singleColumn: 'space-y-6',

  // Two column for wider screens
  twoColumn: 'grid grid-cols-1 gap-6 lg:grid-cols-2',

  // Inline forms
  inline: 'flex flex-wrap items-end gap-4',

  // Stepped forms
  stepped: {
    container: 'space-y-8',
    step: 'space-y-6',
    navigation: 'flex justify-between pt-6 border-t'
  }
} as const;

export type InputSize = keyof typeof formVariants.input.sizes;
export type InputState = keyof typeof formVariants.input.states;
export type TextareaSize = keyof typeof formVariants.textarea.sizes;
export type FormLayout = keyof typeof formLayouts;
export type CivicRegion = typeof civicFormComponents.regionSelector.regions[number];
export type PoliticalParty = typeof civicFormComponents.partySelector.major[number];
export type EngagementPreference = typeof civicFormComponents.engagementPreferences[number];