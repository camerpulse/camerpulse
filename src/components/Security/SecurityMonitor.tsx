import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  type: 'xss_attempt' | 'rate_limit' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface SecurityMonitorProps {
  enabled?: boolean;
  showAlerts?: boolean;
  logToConsole?: boolean;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({
  enabled = true,
  showAlerts = true,
  logToConsole = true
}) => {
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [currentThreatLevel, setCurrentThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
    if (!enabled) return;

    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    setSecurityEvents(prev => [...prev.slice(-9), fullEvent]); // Keep last 10 events

    // Log to console for debugging
    if (logToConsole) {
      console.warn('[SECURITY EVENT]', fullEvent);
    }

    // Update threat level
    if (event.severity === 'critical' || event.severity === 'high') {
      setCurrentThreatLevel(event.severity);
    }

    // Show toast notification for critical events
    if (showAlerts && event.severity === 'critical') {
      toast({
        title: "Security Alert",
        description: event.message,
        variant: "destructive"
      });
    }
  };

  // Monitor for XSS attempts
  useEffect(() => {
    if (!enabled) return;

    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        if (typeof value === 'string') {
          // Check for suspicious patterns
          const xssPatterns = [
            /<script[^>]*>/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe[^>]*>/i,
            /eval\s*\(/i,
            /document\.cookie/i
          ];

          for (const pattern of xssPatterns) {
            if (pattern.test(value)) {
              logSecurityEvent({
                type: 'xss_attempt',
                severity: 'high',
                message: 'Potential XSS attempt detected in innerHTML',
                metadata: { pattern: pattern.source, value: value.substring(0, 100) }
              });
              break;
            }
          }
        }
        
        originalInnerHTML?.set?.call(this, value);
      },
      get: originalInnerHTML?.get
    });

    return () => {
      // Restore original property descriptor
      if (originalInnerHTML) {
        Object.defineProperty(Element.prototype, 'innerHTML', originalInnerHTML);
      }
    };
  }, [enabled]);

  // Monitor for suspicious navigation
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check for rapid page navigation (potential attack)
      const now = Date.now();
      const lastNavigation = sessionStorage.getItem('last_navigation');
      
      if (lastNavigation && now - parseInt(lastNavigation) < 100) {
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          message: 'Rapid page navigation detected',
          metadata: { interval: now - parseInt(lastNavigation) }
        });
      }
      
      sessionStorage.setItem('last_navigation', now.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  // Monitor for CSP violations
  useEffect(() => {
    if (!enabled) return;

    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      logSecurityEvent({
        type: 'policy_violation',
        severity: 'high',
        message: `CSP violation: ${event.violatedDirective}`,
        metadata: {
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy
        }
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);
    return () => document.removeEventListener('securitypolicyviolation', handleCSPViolation);
  }, [enabled]);

  // Auto-reset threat level after no events
  useEffect(() => {
    const timer = setTimeout(() => {
      if (securityEvents.length === 0 || 
          Math.max(...securityEvents.map(e => e.timestamp)) < Date.now() - 60000) {
        setCurrentThreatLevel('low');
      }
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, [securityEvents]);

  // Expose logSecurityEvent globally for other components
  useEffect(() => {
    (window as any).logSecurityEvent = logSecurityEvent;
    return () => {
      delete (window as any).logSecurityEvent;
    };
  }, []);

  if (!enabled || !showAlerts) return null;

  const getThreatIcon = () => {
    switch (currentThreatLevel) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getThreatColor = () => {
    switch (currentThreatLevel) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  if (currentThreatLevel === 'low' && securityEvents.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className={`${getThreatColor()} shadow-lg`}>
        <div className="flex items-center gap-2">
          {getThreatIcon()}
          <AlertDescription className="text-sm">
            {currentThreatLevel === 'low' 
              ? 'Security monitoring active'
              : `Security alert: ${currentThreatLevel} threat level detected`
            }
            {securityEvents.length > 0 && (
              <div className="mt-1 text-xs opacity-75">
                {securityEvents.length} event(s) in the last hour
              </div>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

// Hook for accessing security monitoring from other components
export const useSecurityMonitor = () => {
  const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
    if ((window as any).logSecurityEvent) {
      (window as any).logSecurityEvent(event);
    }
  };

  return { logSecurityEvent };
};