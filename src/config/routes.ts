/**
 * Central Route Configuration for CamerPulse
 * Single source of truth for all application routes
 */

export const ROUTES = {
  // Core Platform
  HOME: '/',
  AUTH: '/auth',
  
  // Civic & Democracy
  CIVIC: {
    DASHBOARD: '/civic-dashboard',
    FEED: '/civic-feed',
    PETITIONS: '/petitions',
    POLLS: '/polls',
    EDUCATION: '/civic-education',
  },
  
  // Transparency & Accountability
  TRANSPARENCY: {
    CORRUPTION_INDEX: '/corruption-index',
    DEBT_TRACKER: '/debt-tracker',
    MEDIA_TRUST: '/media-trust',
    BILLIONAIRE_TRACKER: '/billionaire-tracker',
    SENTIMENT_ANALYSIS: '/sentiment-analysis',
  },
  
  // Entertainment & Arts
  ENTERTAINMENT: {
    ARTIST_ECOSYSTEM: '/artist-ecosystem',
    MUSIC: '/music',
  },
  
  // Political System
  POLITICAL: {
    POLITICIANS: '/politicians',
    SENATORS: '/senators',
    MPS: '/mps',
    MINISTERS: '/ministers',
    PARTIES: '/political-parties',
    PARTY_DETAIL: '/political-parties/:slug',
    DIRECTORY: '/political-directory',
  },
  
  // Directories & Institutions
  DIRECTORIES: {
    VILLAGES: '/villages',
    FONS: '/fons',
    SCHOOLS: '/schools',
    HOSPITALS: '/hospitals',
    PHARMACIES: '/pharmacies',
    COMPANIES: '/companies',
  },
  
  // Community & Services
  COMMUNITY: {
    JOBS: {
      BOARD: '/jobs',
      COMPANY_DASHBOARD: '/jobs/company',
      LEADERBOARD: '/jobs/leaderboard',
      DETAIL: '/jobs/:jobSlug-:id',
    },
    MARKETPLACE: {
      HOME: '/marketplace',
      VENDORS: '/marketplace/vendors',
      VENDOR_DETAIL: '/marketplace/vendors/:vendorSlug-:id',
      PRODUCT_DETAIL: '/marketplace/:productSlug-:id',
    },
    MUSIC: '/music',
  },
  
  // User & Profile
  USER: {
    PROFILE: '/profile/:id',
    MESSAGES: '/messages',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
  },
  
  // Admin & Management
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    VILLAGES: '/admin/villages',
    CONTENT: '/admin/content',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    MIGRATION: '/admin/migration',
  },
  
  // Utility & Support
  UTILITY: {
    SEARCH: '/search',
    HELP: '/help',
    CONTACT: '/contact',
    ABOUT: '/about',
    PERFORMANCE: '/performance',
    ANALYTICS: '/analytics',
  },
  
  // Legal
  LEGAL: {
    PRIVACY: '/privacy',
    TERMS: '/terms',
    COOKIES: '/cookies',
  },
  
  // Error Pages
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/403',
  },
} as const;

/**
 * Route builder (English-only)
 */
export const buildRoute = (route: string): string => {
  return route;
};

/**
 * Route patterns for regex matching
 */
export const ROUTE_PATTERNS = {
  ENTITY_DETAIL: /^\/[a-z-]+\/[a-z0-9-]+-[a-z0-9-]+$/i,
  PROFILE: /^\/profile\/[a-z0-9-]+$/i,
  ADMIN: /^\/admin/i,
  LANGUAGE_PREFIX: /^\/(?:en)\//i,
} as const;

/**
 * Protected route configuration
 */
export const ROUTE_PROTECTION = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.AUTH,
    ROUTES.CIVIC.FEED,
    ROUTES.POLITICAL.POLITICIANS,
    ROUTES.DIRECTORIES.VILLAGES,
    ROUTES.COMMUNITY.MARKETPLACE.HOME,
    ROUTES.UTILITY.ABOUT,
    ROUTES.UTILITY.CONTACT,
    ROUTES.LEGAL.PRIVACY,
    ROUTES.LEGAL.TERMS,
  ],
  AUTHENTICATED: [
    ROUTES.CIVIC.DASHBOARD,
    ROUTES.CIVIC.PETITIONS,
    ROUTES.CIVIC.POLLS,
    ROUTES.USER.MESSAGES,
    ROUTES.USER.NOTIFICATIONS,
    ROUTES.USER.SETTINGS,
    ROUTES.COMMUNITY.JOBS.COMPANY_DASHBOARD,
  ],
  ADMIN_ONLY: Object.values(ROUTES.ADMIN),
} as const;

/**
 * Get route metadata for SEO and navigation
 */
export const getRouteMetadata = (path: string) => {
  const routeMap = {
    [ROUTES.HOME]: {
      title: 'CamerPulse - Pan-African Civic Engagement Platform',
      description: 'Connect, engage, and make your voice heard across Africa. Track political promises, participate in polls, and build stronger communities.',
      breadcrumb: 'Home',
    },
    [ROUTES.CIVIC.DASHBOARD]: {
      title: 'Civic Dashboard - CamerPulse',
      description: 'Your personalized civic engagement dashboard. Track representatives, polls, and community activities.',
      breadcrumb: 'Civic Dashboard',
    },
    [ROUTES.POLITICAL.POLITICIANS]: {
      title: 'Politicians Directory - CamerPulse',
      description: 'Comprehensive directory of politicians, senators, MPs, and ministers in Cameroon.',
      breadcrumb: 'Politicians',
    },
    [ROUTES.DIRECTORIES.VILLAGES]: {
      title: 'Villages Directory - CamerPulse',
      description: 'Explore villages across Cameroon. Connect with communities and discover local initiatives.',
      breadcrumb: 'Villages',
    },
    [ROUTES.COMMUNITY.JOBS.BOARD]: {
      title: 'Jobs Board - CamerPulse',
      description: 'Find opportunities and connect with employers across Africa.',
      breadcrumb: 'Jobs',
    },
    [ROUTES.COMMUNITY.MARKETPLACE.HOME]: {
      title: 'Marketplace - CamerPulse',
      description: 'Discover local products and services from verified vendors across Cameroon.',
      breadcrumb: 'Marketplace',
    },
  } as const;

  return routeMap[path as keyof typeof routeMap] || {
    title: 'CamerPulse',
    description: 'Pan-African civic engagement platform',
    breadcrumb: path.split('/').pop() || 'Page',
  };
};