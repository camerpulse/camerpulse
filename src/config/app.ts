/**
 * CamerPulse Configuration
 * Centralized configuration management for the entire application
 */

export const APP_CONFIG = {
  // Application metadata
  name: 'CamerPulse',
  version: '2.0.0',
  description: 'Cameroonian Civic Engagement Platform',
  
  // API endpoints
  api: {
    base: '/api',
    auth: '/api/auth',
    politicians: '/api/politicians',
    villages: '/api/villages',
    petitions: '/api/petitions',
    companies: '/api/companies',
  },
  
  // Feature flags
  features: {
    messaging: true,
    ratings: true,
    following: true,
    petitions: true,
    villages: true,
    companies: true,
    analytics: true,
    aiIntegration: true,
    darkMode: true,
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // File upload limits
  upload: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxDocumentSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword'],
  },
  
  // Cache settings
  cache: {
    queryStaleTime: 5 * 60 * 1000, // 5 minutes
    queryGcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Rating system
  ratings: {
    minRating: 1,
    maxRating: 5,
    categories: {
      overall: 'Overall Performance',
      transparency: 'Transparency',
      civic_engagement: 'Civic Engagement',
      crisis_response: 'Crisis Response',
      promise_delivery: 'Promise Delivery',
      performance: 'Performance',
      legislative_activity: 'Legislative Activity',
    },
  },
  
  // Search settings
  search: {
    minQueryLength: 3,
    debounceMs: 300,
    maxSuggestions: 10,
  },
  
  // Notification settings
  notifications: {
    position: 'top-right' as const,
    duration: 5000,
  },
  
  // Security settings
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // External integrations
  integrations: {
    maps: {
      provider: 'mapbox',
      defaultZoom: 10,
      defaultCenter: { lat: 3.848, lng: 11.502 }, // Cameroon center
    },
    analytics: {
      enabled: true,
      trackPageViews: true,
      trackUserActions: true,
    },
  },
  
  // UI settings
  ui: {
    theme: {
      defaultMode: 'light' as const,
      allowToggle: true,
    },
    animations: {
      enabled: true,
      duration: 300,
    },
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },
  
  // Data validation
  validation: {
    phone: {
      pattern: /^\+?[\d\s\-\(\)]+$/,
      minLength: 9,
      maxLength: 15,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    name: {
      minLength: 2,
      maxLength: 100,
    },
    message: {
      minLength: 10,
      maxLength: 2000,
    },
    comment: {
      minLength: 5,
      maxLength: 500,
    },
  },
} as const;

export type AppConfig = typeof APP_CONFIG;

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Debugging
  debug: {
    enabled: import.meta.env.DEV,
    logLevel: import.meta.env.DEV ? 'debug' : 'error',
    showQueryDevtools: import.meta.env.DEV,
  },
} as const;

/**
 * Route configuration
 */
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  politicians: {
    mps: '/mps',
    mpDetail: (id: string) => `/mps/${id}`,
    ministers: '/ministers',
    ministerDetail: (id: string) => `/ministers/${id}`,
    senators: '/senators',
    senatorDetail: (id: string) => `/senators/${id}`,
  },
  villages: {
    list: '/villages',
    detail: (id: string) => `/villages/${id}`,
    create: '/villages/create',
  },
  petitions: {
    list: '/petitions',
    detail: (id: string) => `/petitions/${id}`,
    create: '/petitions/create',
  },
  companies: {
    list: '/companies',
    detail: (id: string) => `/companies/${id}`,
    create: '/companies/create',
  },
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    content: '/admin/content',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
  },
  user: {
    profile: '/profile',
    settings: '/settings',
    notifications: '/notifications',
  },
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
} as const;

/**
 * Query keys for React Query
 */
export const QUERY_KEYS = {
  auth: ['auth'],
  user: ['user'],
  mps: ['mps'],
  mp: (id: string) => ['mp', id],
  mpRatings: (id: string) => ['mp-ratings', id],
  mpFollowing: (id: string) => ['mp-following', id],
  ministers: ['ministers'],
  minister: (id: string) => ['minister', id],
  ministerRatings: (id: string) => ['minister-ratings', id],
  ministerFollowing: (id: string) => ['minister-following', id],
  senators: ['senators'],
  senator: (id: string) => ['senator', id],
  senatorRatings: (id: string) => ['senator-ratings', id],
  senatorFollowing: (id: string) => ['senator-following', id],
  villages: ['villages'],
  village: (id: string) => ['village', id],
  petitions: ['petitions'],
  petition: (id: string) => ['petition', id],
  companies: ['companies'],
  company: (id: string) => ['company', id],
  notifications: ['notifications'],
  analytics: ['analytics'],
} as const;