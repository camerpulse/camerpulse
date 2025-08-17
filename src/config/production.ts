/**
 * Production Deployment Configuration for CamerPulse
 * 
 * This file contains all the necessary configuration for deploying
 * CamerPulse to production environments.
 */

export const PRODUCTION_CONFIG = {
  // App Information
  APP_NAME: 'CamerPulse',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Pan-African Civic Engagement Platform',
  
  // Performance Configuration
  PERFORMANCE: {
    // Core Web Vitals targets
    LARGEST_CONTENTFUL_PAINT_TARGET: 2500, // ms
    FIRST_INPUT_DELAY_TARGET: 100, // ms
    CUMULATIVE_LAYOUT_SHIFT_TARGET: 0.1,
    
    // Bundle size targets
    MAX_BUNDLE_SIZE: 500, // KB
    MAX_CHUNK_SIZE: 200, // KB
    
    // Cache configuration
    CACHE_MAX_AGE: 31536000, // 1 year for static assets
    API_CACHE_MAX_AGE: 300, // 5 minutes for API responses
  },
  
  // SEO Configuration
  SEO: {
    DEFAULT_TITLE: 'CamerPulse - Pan-African Civic Engagement Platform',
    DEFAULT_DESCRIPTION: 'Connect, engage, and make your voice heard across Africa. Track political promises, participate in polls, and build stronger communities.',
    DEFAULT_KEYWORDS: 'civic engagement, politics, voting, democracy, africa, cameroon, community',
    DEFAULT_OG_IMAGE: '/og-image.jpg',
    TWITTER_SITE: '@camerpulse',
    SITE_URL: 'https://camerpulse.com',
  },
  
  // Security Configuration
  SECURITY: {
    CONTENT_SECURITY_POLICY: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'connect-src': ["'self'", 'https://api.camerpulse.com', 'wss://realtime.supabase.co'],
      'frame-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
    },
    
    // HTTP Security Headers
    HEADERS: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  
  // Analytics Configuration
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GA_ID || '',
    HOTJAR_ID: process.env.REACT_APP_HOTJAR_ID || '',
    SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN || '',
    
    // Custom analytics endpoints
    PAGEVIEW_ENDPOINT: '/api/analytics/pageview',
    EVENT_ENDPOINT: '/api/analytics/event',
    PERFORMANCE_ENDPOINT: '/api/analytics/performance',
  },
  
  // Error Monitoring
  ERROR_MONITORING: {
    SENTRY_ENVIRONMENT: process.env.NODE_ENV || 'development',
    SENTRY_SAMPLE_RATE: 1.0,
    SENTRY_TRACES_SAMPLE_RATE: 0.1,
    
    // Custom error endpoints
    ERROR_REPORT_ENDPOINT: '/api/errors',
    BUG_REPORT_EMAIL: 'support@camerpulse.com',
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_PWA: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_REAL_TIME_UPDATES: true,
    ENABLE_ADVANCED_ANALYTICS: true,
    ENABLE_A_B_TESTING: false,
  },
  
  // API Configuration
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'https://api.camerpulse.com',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // Rate limiting
    RATE_LIMIT_REQUESTS: 100,
    RATE_LIMIT_WINDOW: 60000, // 1 minute
  },
  
  // CDN Configuration
  CDN: {
    STATIC_ASSETS_URL: process.env.REACT_APP_CDN_URL || '',
    IMAGE_OPTIMIZATION_URL: process.env.REACT_APP_IMAGE_CDN_URL || '',
    
    // Image formats and sizes
    SUPPORTED_IMAGE_FORMATS: ['webp', 'avif', 'jpeg', 'png'],
    IMAGE_SIZES: [320, 640, 768, 1024, 1280, 1920],
  },
  
  // Build Configuration
  BUILD: {
    // Webpack optimizations
    ENABLE_SOURCE_MAPS: process.env.NODE_ENV === 'development',
    ENABLE_BUNDLE_ANALYZER: process.env.ANALYZE === 'true',
    ENABLE_COMPRESSION: true,
    
    // Output configuration
    OUTPUT_PATH: 'dist',
    PUBLIC_PATH: '/',
    ASSET_PATH: '/assets/',
  },
};

/**
 * Vite Production Configuration
 */
export const VITE_PRODUCTION_CONFIG = {
  build: {
    // Output configuration
    outDir: PRODUCTION_CONFIG.BUILD.OUTPUT_PATH,
    assetsDir: 'assets',
    
    // Performance optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // Bundle configuration
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-button', '@radix-ui/react-card'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    
    // Size limits
    chunkSizeWarningLimit: PRODUCTION_CONFIG.PERFORMANCE.MAX_CHUNK_SIZE * 1024,
    
    // Source maps
    sourcemap: PRODUCTION_CONFIG.BUILD.ENABLE_SOURCE_MAPS,
  },
  
  // Preview server for production builds
  preview: {
    port: 3000,
    host: true,
    headers: PRODUCTION_CONFIG.SECURITY.HEADERS,
  },
};

/**
 * PWA Configuration
 */
export const PWA_CONFIG = {
  registerType: 'autoUpdate',
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
    
    // Cache configuration
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.camerpulse\.com\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: PRODUCTION_CONFIG.PERFORMANCE.API_CACHE_MAX_AGE,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: PRODUCTION_CONFIG.PERFORMANCE.CACHE_MAX_AGE,
          },
        },
      },
    ],
  },
  
  // Manifest configuration
  manifest: {
    name: PRODUCTION_CONFIG.APP_NAME,
    short_name: 'CamerPulse',
    description: PRODUCTION_CONFIG.APP_DESCRIPTION,
    theme_color: '#2563eb',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

/**
 * Environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return {
        ...PRODUCTION_CONFIG,
        API: {
          ...PRODUCTION_CONFIG.API,
          BASE_URL: 'https://api.camerpulse.com',
        },
        SEO: {
          ...PRODUCTION_CONFIG.SEO,
          SITE_URL: 'https://camerpulse.com',
        },
      };
    
    case 'staging':
      return {
        ...PRODUCTION_CONFIG,
        API: {
          ...PRODUCTION_CONFIG.API,
          BASE_URL: 'https://staging-api.camerpulse.com',
        },
        SEO: {
          ...PRODUCTION_CONFIG.SEO,
          SITE_URL: 'https://staging.camerpulse.com',
        },
      };
    
    default:
      return {
        ...PRODUCTION_CONFIG,
        API: {
          ...PRODUCTION_CONFIG.API,
          BASE_URL: 'http://localhost:3001',
        },
        SEO: {
          ...PRODUCTION_CONFIG.SEO,
          SITE_URL: 'http://localhost:3000',
        },
      };
  }
};