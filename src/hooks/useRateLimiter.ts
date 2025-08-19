import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
  blockedUntil?: number;
}

export const useRateLimiter = (actionType: string, config: RateLimitConfig) => {
  const {
    maxAttempts,
    windowMs,
    blockDurationMs = windowMs * 2
  } = config;
  
  const { toast } = useToast();
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const storageKey = `rate_limit_${actionType}`;

  const getRateLimitData = useCallback((): RateLimitEntry => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : { attempts: 0, firstAttempt: 0, blocked: false };
    } catch {
      return { attempts: 0, firstAttempt: 0, blocked: false };
    }
  }, [storageKey]);

  const setRateLimitData = useCallback((data: RateLimitEntry) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store rate limit data:', error);
    }
  }, [storageKey]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const data = getRateLimitData();

    // Check if currently blocked
    if (data.blocked && data.blockedUntil && now < data.blockedUntil) {
      const timeLeft = Math.ceil((data.blockedUntil - now) / 1000);
      setIsBlocked(true);
      setRemainingTime(timeLeft);
      
      toast({
        title: "Rate Limited",
        description: `Too many attempts. Please wait ${timeLeft} seconds.`,
        variant: "destructive"
      });
      
      return false;
    }

    // Reset if window has passed
    if (data.blocked && data.blockedUntil && now >= data.blockedUntil) {
      setRateLimitData({ attempts: 0, firstAttempt: 0, blocked: false });
      setIsBlocked(false);
      setRemainingTime(0);
      return true;
    }

    // Reset if time window has passed
    if (now - data.firstAttempt > windowMs) {
      setRateLimitData({ attempts: 1, firstAttempt: now, blocked: false });
      return true;
    }

    // Check if limit exceeded
    if (data.attempts >= maxAttempts) {
      const blockedUntil = now + blockDurationMs;
      setRateLimitData({
        ...data,
        blocked: true,
        blockedUntil
      });
      
      setIsBlocked(true);
      setRemainingTime(Math.ceil(blockDurationMs / 1000));
      
      toast({
        title: "Rate Limited",
        description: `Too many attempts. Please wait ${Math.ceil(blockDurationMs / 1000)} seconds.`,
        variant: "destructive"
      });
      
      return false;
    }

    // Increment attempts
    setRateLimitData({
      ...data,
      attempts: data.attempts + 1,
      firstAttempt: data.firstAttempt || now
    });

    return true;
  }, [getRateLimitData, setRateLimitData, maxAttempts, windowMs, blockDurationMs, toast]);

  const resetRateLimit = useCallback(() => {
    setRateLimitData({ attempts: 0, firstAttempt: 0, blocked: false });
    setIsBlocked(false);
    setRemainingTime(0);
  }, [setRateLimitData]);

  const getRemainingAttempts = useCallback((): number => {
    const data = getRateLimitData();
    const now = Date.now();
    
    if (data.blocked || (now - data.firstAttempt > windowMs)) {
      return maxAttempts;
    }
    
    return Math.max(0, maxAttempts - data.attempts);
  }, [getRateLimitData, maxAttempts, windowMs]);

  // Update remaining time countdown
  useEffect(() => {
    if (!isBlocked || remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, remainingTime]);

  return {
    checkRateLimit,
    resetRateLimit,
    getRemainingAttempts,
    isBlocked,
    remainingTime
  };
};

// Pre-configured rate limiters for common actions
export const useLoginRateLimit = () => useRateLimiter('login', {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes
});

export const usePasswordResetRateLimit = () => useRateLimiter('password_reset', {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 2 * 60 * 60 * 1000 // 2 hours
});

export const useCommentRateLimit = () => useRateLimiter('comment', {
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000 // 5 minutes
});

export const useFileUploadRateLimit = () => useRateLimiter('file_upload', {
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
  blockDurationMs: 10 * 60 * 1000 // 10 minutes
});