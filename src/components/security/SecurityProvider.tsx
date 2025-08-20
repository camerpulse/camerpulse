import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { securityAudit } from '@/utils/securityAudit';
import { useRateLimit } from '@/hooks/useRateLimit';

interface SecurityContextType {
  logSecurityEvent: typeof securityAudit.logEvent;
  checkRateLimit: ReturnType<typeof useRateLimit>['checkRateLimit'];
  withRateLimit: ReturnType<typeof useRateLimit>['withRateLimit'];
  isRateLimitChecking: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const { checkRateLimit, withRateLimit, isChecking } = useRateLimit();

  useEffect(() => {
    // Log session changes for security auditing
    if (session && user) {
      securityAudit.logLogin(true, user.email);
    }

    // Set up security monitoring
    const handleUnload = () => {
      if (user) {
        securityAudit.logLogout();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user) {
        securityAudit.logEvent({
          actionType: 'session_inactive',
          resourceType: 'session',
          severity: 'low'
        });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, session]);

  const value: SecurityContextType = {
    logSecurityEvent: securityAudit.logEvent.bind(securityAudit),
    checkRateLimit,
    withRateLimit,
    isRateLimitChecking: isChecking
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};