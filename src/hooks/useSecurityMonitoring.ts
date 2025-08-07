import { useState, useEffect, useCallback } from 'react';
import { logSecurityEvent } from '@/utils/security';

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivities: number;
  cspViolations: number;
  lastSecurityCheck: string;
}

/**
 * Security monitoring hook for real-time threat detection
 */
export function useSecurityMonitoring() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    suspiciousActivities: 0,
    cspViolations: 0,
    lastSecurityCheck: new Date().toISOString()
  });

  // Monitor for suspicious activity patterns
  const detectSuspiciousActivity = useCallback((activityType: string, details?: Record<string, any>) => {
    const now = new Date().toISOString();
    
    // Check for rapid repeated actions (potential bot activity)
    const recentEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
    const lastMinute = new Date(Date.now() - 60000).toISOString();
    const recentSimilarEvents = recentEvents.filter((event: any) => 
      event.action === activityType && event.timestamp > lastMinute
    );

    if (recentSimilarEvents.length > 10) {
      addAlert({
        type: 'warning',
        message: `Suspicious activity detected: ${activityType}`,
        details: { count: recentSimilarEvents.length, ...details }
      });

      logSecurityEvent(
        'suspicious_activity_detected',
        'user_behavior',
        undefined,
        { activityType, count: recentSimilarEvents.length, ...details },
        'medium'
      );
    }
  }, []);

  // Add security alert
  const addAlert = useCallback((alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Keep last 50 alerts
  }, []);

  // Monitor failed login attempts
  const reportFailedLogin = useCallback((details?: Record<string, any>) => {
    setMetrics(prev => ({
      ...prev,
      failedLoginAttempts: prev.failedLoginAttempts + 1
    }));

    const attempts = metrics.failedLoginAttempts + 1;
    if (attempts > 5) {
      addAlert({
        type: 'error',
        message: `Multiple failed login attempts detected (${attempts})`,
        details
      });
    }

    logSecurityEvent(
      'failed_login_attempt',
      'authentication',
      undefined,
      details,
      attempts > 5 ? 'high' : 'medium'
    );
  }, [metrics.failedLoginAttempts, addAlert]);

  // Monitor CSP violations
  const reportCSPViolation = useCallback((violation: any) => {
    setMetrics(prev => ({
      ...prev,
      cspViolations: prev.cspViolations + 1
    }));

    addAlert({
      type: 'critical',
      message: 'Content Security Policy violation detected',
      details: violation
    });

    logSecurityEvent(
      'csp_violation',
      'content_security',
      undefined,
      violation,
      'critical'
    );
  }, [addAlert]);

  // Check for browser security features
  const checkBrowserSecurity = useCallback(() => {
    const checks = {
      https: location.protocol === 'https:',
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
      webWorker: typeof Worker !== 'undefined'
    };

    const failedChecks = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([check]) => check);

    if (failedChecks.length > 0) {
      addAlert({
        type: 'warning',
        message: 'Browser security features missing',
        details: { failedChecks }
      });
    }

    setMetrics(prev => ({
      ...prev,
      lastSecurityCheck: new Date().toISOString()
    }));
  }, [addAlert]);

  // Cleanup old alerts
  const clearOldAlerts = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    setAlerts(prev => prev.filter(alert => alert.timestamp > oneDayAgo));
  }, []);

  // Setup security monitoring on mount
  useEffect(() => {
    checkBrowserSecurity();
    
    // Setup CSP violation listener
    const handleCSPViolation = (e: SecurityPolicyViolationEvent) => {
      reportCSPViolation({
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        documentURI: e.documentURI
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    // Cleanup old alerts every hour
    const cleanupInterval = setInterval(clearOldAlerts, 60 * 60 * 1000);

    // Security check every 5 minutes
    const securityCheckInterval = setInterval(checkBrowserSecurity, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
      clearInterval(cleanupInterval);
      clearInterval(securityCheckInterval);
    };
  }, [checkBrowserSecurity, clearOldAlerts, reportCSPViolation]);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      failedLoginAttempts: 0,
      suspiciousActivities: 0,
      cspViolations: 0,
      lastSecurityCheck: new Date().toISOString()
    });
  }, []);

  return {
    alerts,
    metrics,
    addAlert,
    clearAlerts,
    resetMetrics,
    reportFailedLogin,
    reportCSPViolation,
    detectSuspiciousActivity,
    checkBrowserSecurity
  };
}