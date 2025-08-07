import { CSP_DIRECTIVES, SECURITY_HEADERS } from '@/utils/security';

/**
 * Content Security Policy configuration for production security
 */
export const cspConfig = {
  directives: {
    ...CSP_DIRECTIVES,
    // Enhanced directives for better security
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://api.supabase.co",
    'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src': "'self' https://fonts.gstatic.com",
    'img-src': "'self' data: blob: https: *.supabase.co *.unsplash.com",
    'connect-src': "'self' wss: https: *.supabase.co",
    'media-src': "'self' blob: *.supabase.co",
    'worker-src': "'self' blob:",
    'child-src': "'self' blob:",
    'frame-ancestors': "'none'",
    'upgrade-insecure-requests': '',
  },
  reportUri: '/api/csp-report'
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(cspConfig.directives)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
}

/**
 * Apply security headers to the HTML document
 */
export function applySecurityHeaders() {
  // Set CSP via meta tag for client-side enforcement
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = generateCSPHeader();
  document.head.appendChild(cspMeta);

  // Additional security meta tags
  const securityMetas = [
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
    { name: 'permissions-policy', content: 'camera=(), microphone=(), geolocation=()' },
    { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
    { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
    { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
  ];

  securityMetas.forEach(meta => {
    const metaTag = document.createElement('meta');
    Object.entries(meta).forEach(([key, value]) => {
      metaTag.setAttribute(key, value);
    });
    document.head.appendChild(metaTag);
  });
}

/**
 * CSP violation reporter
 */
export function setupCSPReporting() {
  document.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      disposition: e.disposition
    });

    // Report to analytics or monitoring service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'csp_violation', {
        custom_parameters: {
          blocked_uri: e.blockedURI,
          violated_directive: e.violatedDirective
        }
      });
    }
  });
}

/**
 * Initialize security configuration
 */
export function initializeSecurity() {
  // Apply security headers
  applySecurityHeaders();
  
  // Setup CSP reporting
  setupCSPReporting();
  
  // Setup feature policy restrictions
  setupFeaturePolicy();
  
  console.log('🛡️ Security configuration applied');
}

/**
 * Feature Policy configuration
 */
function setupFeaturePolicy() {
  // Disable potentially dangerous features
  const featurePolicyMeta = document.createElement('meta');
  featurePolicyMeta.httpEquiv = 'Permissions-Policy';
  featurePolicyMeta.content = [
    'camera=()',
    'microphone=()', 
    'geolocation=()',
    'accelerometer=()',
    'gyroscope=()',
    'magnetometer=()',
    'payment=()',
    'usb=()'
  ].join(', ');
  
  document.head.appendChild(featurePolicyMeta);
}