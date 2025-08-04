/**
 * Security headers and Content Security Policy configuration
 * Helps prevent XSS, clickjacking, and other web vulnerabilities
 */

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    "'unsafe-eval'", // Required for Vite dev mode
    "https://www.gstatic.com",
    "https://www.google.com"
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'", // Required for styled components
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'", 
    "data:", 
    "blob:",
    "https:",
    "*.supabase.co"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "wss:",
    "https://wsiorhtiovwcajiarydw.supabase.co",
    "https://api.openai.com"
  ],
  'media-src': ["'self'", "blob:", "data:"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'", "blob:"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'upgrade-insecure-requests': []
};

/**
 * Generate CSP header value from directives
 */
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

/**
 * Apply security headers to a response (for use in edge functions)
 */
export const applySecurityHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  return {
    ...headers,
    ...SECURITY_HEADERS,
    'Content-Security-Policy': generateCSPHeader()
  };
};