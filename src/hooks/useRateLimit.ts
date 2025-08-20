import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityAudit } from '@/utils/securityAudit';

interface RateLimitOptions {
  action: string;
  identifier?: string;
  identifierType?: 'user_id' | 'ip_address' | 'api_key';
  limitPerHour?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: Date;
  blocked?: boolean;
}

export const useRateLimit = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = useCallback(async (options: RateLimitOptions): Promise<RateLimitResult> => {
    setIsChecking(true);
    
    try {
      const {
        action,
        identifier,
        identifierType = 'user_id',
        limitPerHour = 100
      } = options;

      // Get current user if no identifier provided
      let finalIdentifier = identifier;
      if (!finalIdentifier && identifierType === 'user_id') {
        const { data: { user } } = await supabase.auth.getUser();
        finalIdentifier = user?.id || 'anonymous';
      }

      if (!finalIdentifier) {
        return { allowed: false, blocked: true };
      }

      // Call the rate limit check function
      const { data, error } = await supabase.rpc('check_rate_limit_enhanced', {
        _identifier_type: identifierType,
        _identifier_value: finalIdentifier,
        _action_type: action,
        _limit_per_hour: limitPerHour
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return { allowed: true }; // Fail open for availability
      }

      const allowed = data === true;

      if (!allowed) {
        // Log rate limit exceeded event
        await securityAudit.logRateLimitExceeded(finalIdentifier, action);
      }

      return {
        allowed,
        blocked: !allowed,
        remainingRequests: allowed ? undefined : 0,
        resetTime: allowed ? undefined : new Date(Date.now() + 60 * 60 * 1000) // Next hour
      };

    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true }; // Fail open
    } finally {
      setIsChecking(false);
    }
  }, []);

  const withRateLimit = useCallback(async <T>(
    fn: () => Promise<T>,
    options: RateLimitOptions
  ): Promise<T | null> => {
    const rateLimitResult = await checkRateLimit(options);
    
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded for action: ${options.action}`);
    }

    return await fn();
  }, [checkRateLimit]);

  return {
    checkRateLimit,
    withRateLimit,
    isChecking
  };
};