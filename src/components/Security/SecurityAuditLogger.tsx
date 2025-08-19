import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logSecurityEvent } from '@/utils/security';

interface SecurityEvent {
  event_type: string;
  event_description: string;
  user_id?: string;
  metadata: any;
  created_at: string;
}

/**
 * Security audit logger component that monitors and logs security events
 */
export const SecurityAuditLogger: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    // Log user session start
    if (user) {
      logSecurityEvent(
        'user_session_start',
        'authentication',
        user.id,
        { 
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent 
        },
        'low'
      );
    }

    // Setup security monitoring
    const monitorSecurityEvents = () => {
      // Monitor for suspicious DOM modifications
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                // Check for suspicious script injections
                if (element.tagName === 'SCRIPT' || 
                    element.innerHTML.includes('<script') ||
                    element.innerHTML.includes('javascript:')) {
                  logSecurityEvent(
                    'suspicious_dom_modification',
                    'dom_security',
                    user?.id,
                    { 
                      tagName: element.tagName,
                      innerHTML: element.innerHTML.substring(0, 200),
                      timestamp: new Date().toISOString()
                    },
                    'high'
                  );
                }
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    };

    const cleanup = monitorSecurityEvents();

    // Cleanup on unmount
    return () => {
      cleanup();
      
      // Log session end
      if (user) {
        logSecurityEvent(
          'user_session_end',
          'authentication',
          user.id,
          { timestamp: new Date().toISOString() },
          'low'
        );
      }
    };
  }, [user]);

  // Monitor for failed authentication attempts
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      logSecurityEvent(
        'authentication_failure',
        'authentication',
        undefined,
        { 
          error: event.detail.error,
          timestamp: new Date().toISOString()
        },
        'medium'
      );
    };

    // Listen for auth errors
    window.addEventListener('auth-error', handleAuthError as EventListener);

    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, []);

  // Component doesn't render anything visible
  return null;
};

/**
 * Hook to dispatch auth error events for monitoring
 */
export const useSecurityEventDispatcher = () => {
  const dispatchAuthError = (error: string) => {
    const event = new CustomEvent('auth-error', { detail: { error } });
    window.dispatchEvent(event);
  };

  const dispatchSecurityEvent = (type: string, details: any) => {
    const event = new CustomEvent('security-event', { detail: { type, details } });
    window.dispatchEvent(event);
  };

  return { dispatchAuthError, dispatchSecurityEvent };
};