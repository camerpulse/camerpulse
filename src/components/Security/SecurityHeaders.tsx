import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { createProductionLogger } from '@/utils/productionLogger';

const logger = createProductionLogger('SecurityHeaders');

/**
 * Security Headers Component
 * Implements comprehensive security headers for production deployment
 */
export const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    logger.info('Security headers initialized');
    
    // Track CSP violations if they occur
    document.addEventListener('securitypolicyviolation', (event) => {
      logger.error('Content Security Policy violation detected', {
        blockedURI: event.blockedURI,
        directive: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        documentURI: event.documentURI,
        referrer: event.referrer,
        statusCode: event.statusCode
      });
    });

    return () => {
      document.removeEventListener('securitypolicyviolation', () => {});
    };
  }, []);

  return (
    <Helmet>
      {/* Content Security Policy - Enhanced for production */}
      <meta 
        httpEquiv="Content-Security-Policy" 
        content={[
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.supabase.co https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.gpteng.co",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https: *.supabase.co *.unsplash.com *.googleusercontent.com *.gravatar.com",
          "connect-src 'self' wss: https: *.supabase.co https://api.supabase.co https://www.google-analytics.com",
          "media-src 'self' blob: *.supabase.co",
          "object-src 'none'",
          "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
          "worker-src 'self' blob:",
          "child-src 'self' blob:",
          "form-action 'self'",
          "base-uri 'self'",
          "manifest-src 'self'",
          "upgrade-insecure-requests"
        ].join('; ')}
      />
      
      {/* X-Content-Type-Options */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      
      {/* X-Frame-Options */}
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      
      {/* X-XSS-Protection */}
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Referrer Policy */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Permissions Policy */}
      <meta 
        name="permissions-policy" 
        content={[
          "geolocation=(self)",
          "microphone=()",
          "camera=()",
          "payment=(self)",
          "usb=()",
          "magnetometer=()",
          "accelerometer=()",
          "gyroscope=()",
          "speaker=(self)",
          "vibrate=()",
          "fullscreen=(self)",
          "sync-xhr=()"
        ].join(', ')}
      />
      
      {/* Strict Transport Security (would be set by server in production) */}
      <meta 
        httpEquiv="Strict-Transport-Security" 
        content="max-age=31536000; includeSubDomains; preload" 
      />
      
      {/* Cross-Origin Policies */}
      <meta name="cross-origin-opener-policy" content="same-origin" />
      <meta name="cross-origin-embedder-policy" content="credentialless" />
      <meta name="cross-origin-resource-policy" content="cross-origin" />
      
      {/* Additional Security Headers */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* DNS Prefetch Control */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
      
      {/* Cache Control */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
    </Helmet>
  );
};

/**
 * Additional security utilities
 */
export const SecurityUtils = {
  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput: (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Generate secure random token
   */
  generateSecureToken: (length: number = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Check if running in secure context
   */
  isSecureContext: (): boolean => {
    return window.isSecureContext || location.protocol === 'https:';
  },

  /**
   * Validate URL to prevent open redirects
   */
  isValidRedirectUrl: (url: string, allowedDomains: string[] = ['camerpulse.com']): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const hostname = urlObj.hostname;
      
      // Allow relative URLs
      if (url.startsWith('/') && !url.startsWith('//')) {
        return true;
      }
      
      // Check against allowed domains
      return allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  },

  /**
   * Content Security Policy reporter
   */
  setupCSPReporting: (): void => {
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        blockedURI: event.blockedURI,
        directive: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        documentURI: event.documentURI,
        referrer: event.referrer,
        statusCode: event.statusCode,
        timestamp: Date.now()
      };

      logger.error('CSP Violation', violation);
      
      // Send to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/csp-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(violation),
        }).catch(() => {
          // Silently fail - don't log CSP reporting failures
        });
      }
    });
  }
};

export default SecurityHeaders;