/**
 * CamerPulse Modal System
 * 
 * Modal, dialog, and overlay components for the platform.
 * Includes responsive behaviors and civic-specific modal types.
 */

export const modalVariants = {
  // Base overlay styles
  overlay: [
    'fixed inset-0 z-50 bg-black/80',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
  ].join(' '),

  // Base content styles
  content: {
    base: [
      'fixed left-[50%] top-[50%] z-50',
      'grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
      'gap-4 border bg-background p-6 shadow-lg duration-200',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
      'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
      'sm:rounded-lg'
    ].join(' '),

    // Size variants
    sizes: {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      '2xl': 'max-w-6xl',
      full: 'max-w-[95vw] max-h-[95vh]'
    },

    // Mobile responsive behavior
    mobile: [
      'max-[640px]:fixed max-[640px]:left-0 max-[640px]:top-0',
      'max-[640px]:translate-x-0 max-[640px]:translate-y-0',
      'max-[640px]:w-full max-[640px]:h-full',
      'max-[640px]:max-w-none max-[640px]:rounded-none',
      'max-[640px]:border-0'
    ].join(' ')
  },

  // Modal header
  header: [
    'flex flex-col space-y-1.5 text-center sm:text-left'
  ].join(' '),

  // Modal title
  title: [
    'text-lg font-semibold leading-none tracking-tight'
  ].join(' '),

  // Modal description
  description: [
    'text-sm text-muted-foreground'
  ].join(' '),

  // Modal footer
  footer: [
    'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'
  ].join(' '),

  // Close button
  close: [
    'absolute right-4 top-4 rounded-sm opacity-70',
    'ring-offset-background transition-opacity',
    'hover:opacity-100 focus:outline-none focus:ring-2',
    'focus:ring-ring focus:ring-offset-2',
    'disabled:pointer-events-none'
  ].join(' ')
} as const;

// Sheet/Drawer variants (slide-in modals)
export const sheetVariants = {
  overlay: modalVariants.overlay,

  content: {
    base: [
      'fixed z-50 gap-4 bg-background p-6 shadow-lg',
      'transition ease-in-out data-[state=open]:animate-in',
      'data-[state=closed]:animate-out data-[state=closed]:duration-300',
      'data-[state=open]:duration-500'
    ].join(' '),

    sides: {
      top: [
        'inset-x-0 top-0 border-b',
        'data-[state=closed]:slide-out-to-top',
        'data-[state=open]:slide-in-from-top'
      ].join(' '),

      bottom: [
        'inset-x-0 bottom-0 border-t',
        'data-[state=closed]:slide-out-to-bottom',
        'data-[state=open]:slide-in-from-bottom'
      ].join(' '),

      left: [
        'inset-y-0 left-0 h-full w-3/4 border-r',
        'data-[state=closed]:slide-out-to-left',
        'data-[state=open]:slide-in-from-left',
        'sm:max-w-sm'
      ].join(' '),

      right: [
        'inset-y-0 right-0 h-full w-3/4 border-l',
        'data-[state=closed]:slide-out-to-right',
        'data-[state=open]:slide-in-from-right',
        'sm:max-w-sm'
      ].join(' ')
    }
  }
} as const;

// Civic-specific modal types
export const civicModalTypes = {
  // Voting confirmation modal
  voting: {
    content: [
      modalVariants.content.base,
      'border-primary shadow-elegant'
    ].join(' '),
    
    header: [
      modalVariants.header,
      'border-b border-primary/20 pb-4'
    ].join(' '),

    title: [
      modalVariants.title,
      'text-primary flex items-center gap-2'
    ].join(' ')
  },

  // Government announcement modal
  announcement: {
    content: [
      modalVariants.content.base,
      'border-secondary shadow-green'
    ].join(' '),

    header: [
      modalVariants.header,
      'bg-gradient-civic text-white p-6 -m-6 mb-4 rounded-t-lg'
    ].join(' '),

    title: [
      modalVariants.title,
      'text-white'
    ].join(' ')
  },

  // Emergency alert modal
  emergency: {
    content: [
      modalVariants.content.base,
      'border-destructive shadow-red animate-pulse'
    ].join(' '),

    header: [
      modalVariants.header,
      'bg-destructive text-destructive-foreground p-6 -m-6 mb-4 rounded-t-lg'
    ].join(' '),

    title: [
      modalVariants.title,
      'text-destructive-foreground flex items-center gap-2 font-bold'
    ].join(' ')
  },

  // Profile verification modal
  verification: {
    content: [
      modalVariants.content.base,
      'border-blue-500 shadow-lg'
    ].join(' '),

    steps: [
      'space-y-6'
    ].join(' '),

    step: [
      'border rounded-lg p-4',
      'border-muted data-[completed]:border-green-500',
      'data-[current]:border-primary data-[current]:bg-primary/5'
    ].join(' ')
  }
} as const;

// Bottom sheet for mobile
export const bottomSheetVariants = {
  overlay: modalVariants.overlay,

  content: [
    'fixed inset-x-0 bottom-0 z-50',
    'mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:slide-out-to-bottom',
    'data-[state=open]:slide-in-from-bottom'
  ].join(' '),

  header: [
    'flex items-center justify-center p-4 border-b'
  ].join(' '),

  handle: [
    'h-1 w-12 rounded-full bg-muted-foreground/30'
  ].join(' ')
} as const;

// Toast notification variants
export const toastVariants = {
  viewport: [
    'fixed top-0 z-[100] flex max-h-screen w-full',
    'flex-col-reverse p-4 sm:bottom-0 sm:right-0',
    'sm:top-auto sm:flex-col md:max-w-[420px]'
  ].join(' '),

  base: [
    'group pointer-events-auto relative flex w-full items-center',
    'justify-between space-x-2 overflow-hidden rounded-md border p-4',
    'pr-6 shadow-lg transition-all',
    'data-[swipe=cancel]:translate-x-0',
    'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=move]:transition-none',
    'data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-80',
    'data-[state=closed]:slide-out-to-right-full'
  ].join(' '),

  variants: {
    default: 'border bg-background text-foreground',
    destructive: 'destructive border-destructive bg-destructive text-destructive-foreground',
    success: 'border-green-500 bg-green-50 text-green-900',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
    info: 'border-blue-500 bg-blue-50 text-blue-900'
  }
} as const;

export type ModalSize = keyof typeof modalVariants.content.sizes;
export type SheetSide = keyof typeof sheetVariants.content.sides;
export type CivicModalType = keyof typeof civicModalTypes;
export type ToastVariant = keyof typeof toastVariants.variants;