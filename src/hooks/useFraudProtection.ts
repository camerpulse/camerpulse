import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoteValidationResult {
  canVote: boolean;
  reason?: string;
}

interface FraudProtectionHook {
  validateVote: (pollId: string, userId?: string, captchaToken?: string) => Promise<VoteValidationResult>;
  logVote: (pollId: string, optionIndex: number, userId?: string, region?: string) => Promise<void>;
  generateFingerprint: () => string;
  runBotDetection: (pollId: string) => Promise<boolean>;
  loading: boolean;
}

export const useFraudProtection = (): FraudProtectionHook => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateFingerprint = useCallback((): string => {
    // Generate a basic device fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }, []);

  const hashIP = useCallback(async (): Promise<string> => {
    try {
      // Get approximate IP info (privacy-friendly)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ip = data.ip;
      
      // Simple hash to protect privacy
      let hash = 0;
      for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString(36);
    } catch {
      // Fallback to browser-based hash
      return 'browser_' + Math.random().toString(36).substr(2, 9);
    }
  }, []);

  const validateVote = useCallback(async (pollId: string, userId?: string, captchaToken?: string): Promise<VoteValidationResult> => {
    try {
      setLoading(true);

      // Get fraud settings for this poll
      const { data: settings } = await supabase
        .from('poll_fraud_settings')
        .select('*')
        .eq('poll_id', pollId)
        .single();

      // Check CAPTCHA if enabled
      if (settings?.enable_captcha && !captchaToken) {
        return { 
          canVote: false, 
          reason: 'CAPTCHA verification required' 
        };
      }

      if (settings?.enable_captcha && captchaToken) {
        try {
          const tokenData = JSON.parse(atob(captchaToken));
          if (!tokenData.verified || Date.now() - tokenData.timestamp > 300000) { // 5 minutes
            return { 
              canVote: false, 
              reason: 'CAPTCHA token expired or invalid' 
            };
          }
        } catch {
          return { 
            canVote: false, 
            reason: 'Invalid CAPTCHA token' 
          };
        }
      }

      if (!settings || !settings.enable_rate_limiting) {
        return { canVote: true };
      }

      const hashedIp = await hashIP();
      const sessionId = sessionStorage.getItem('session_id') || 
        (() => {
          const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('session_id', id);
          return id;
        })();

      // Check IP-based rate limiting
      const { data: ipVotes } = await supabase
        .from('poll_vote_log')
        .select('id')
        .eq('poll_id', pollId)
        .eq('hashed_ip', hashedIp);

      if (ipVotes && ipVotes.length >= settings.max_votes_per_ip) {
        return { 
          canVote: false, 
          reason: `Maximum of ${settings.max_votes_per_ip} vote(s) per device allowed` 
        };
      }

      // Check session-based rate limiting
      const { data: sessionVotes } = await supabase
        .from('poll_vote_log')
        .select('id')
        .eq('poll_id', pollId)
        .eq('session_id', sessionId);

      if (sessionVotes && sessionVotes.length >= settings.max_votes_per_session) {
        return { 
          canVote: false, 
          reason: `Maximum of ${settings.max_votes_per_session} vote(s) per session allowed` 
        };
      }

      // Check user-based voting (if authenticated)
      if (userId) {
        const { data: userVotes } = await supabase
          .from('poll_vote_log')
          .select('id')
          .eq('poll_id', pollId)
          .eq('user_id', userId);

        if (userVotes && userVotes.length > 0) {
          return { 
            canVote: false, 
            reason: 'You have already voted in this poll' 
          };
        }
      }

      return { canVote: true };

    } catch (error) {
      console.error('Error validating vote:', error);
      // Allow vote on validation error to prevent blocking legitimate users
      return { canVote: true };
    } finally {
      setLoading(false);
    }
  }, [hashIP]);

  const logVote = useCallback(async (
    pollId: string, 
    optionIndex: number, 
    userId?: string, 
    region?: string
  ): Promise<void> => {
    try {
      const hashedIp = await hashIP();
      const deviceFingerprint = generateFingerprint();
      const sessionId = sessionStorage.getItem('session_id') || 'anonymous';

      await supabase
        .from('poll_vote_log')
        .insert({
          poll_id: pollId,
          user_id: userId,
          hashed_ip: hashedIp,
          device_fingerprint: deviceFingerprint,
          user_agent: navigator.userAgent,
          vote_option: optionIndex,
          region: region,
          session_id: sessionId
        });

      // Trigger fraud detection
      await supabase.rpc('detect_fraud_patterns', { p_poll_id: pollId });

    } catch (error) {
      console.error('Error logging vote:', error);
      // Don't block voting if logging fails
    }
  }, [hashIP, generateFingerprint]);

  const runBotDetection = useCallback(async (pollId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Enhanced bot detection algorithm
      const checks = [
        checkMouseMovement(),
        checkKeyboardPatterns(),
        checkBrowserFingerprint(),
        checkTimingPatterns(),
        checkDeviceCapabilities()
      ];
      
      const results = await Promise.all(checks);
      const suspiciousCount = results.filter(result => result).length;
      const isBot = suspiciousCount >= 3; // Threshold for bot detection
      
      // Log bot detection result
      const deviceFingerprint = generateFingerprint();
      await supabase.from('poll_bot_detection_logs').insert({
        poll_id: pollId,
        is_bot: isBot,
        confidence_score: (suspiciousCount / checks.length) * 100,
        detection_reasons: results.map((result, index) => 
          result ? [`Check ${index + 1} failed`] : []
        ).flat(),
        device_fingerprint: deviceFingerprint,
        user_agent: navigator.userAgent
      });
      
      return isBot;
    } catch (error) {
      console.error('Bot detection error:', error);
      return false; // Default to allowing vote on error
    } finally {
      setLoading(false);
    }
  }, [generateFingerprint]);

  // Bot detection helper functions
  const checkMouseMovement = (): boolean => {
    return !(window as any).mouseMovements || (window as any).mouseMovements.length < 5;
  };

  const checkKeyboardPatterns = (): boolean => {
    return !(window as any).keyboardEvents || (window as any).keyboardEvents.length < 3;
  };

  const checkBrowserFingerprint = (): boolean => {
    return !!(
      (window as any).webdriver ||
      (window as any).phantom ||
      (navigator as any).webdriver
    );
  };

  const checkTimingPatterns = (): boolean => {
    const pageLoadTime = performance.now();
    return pageLoadTime < 500; // Too fast interaction
  };

  const checkDeviceCapabilities = (): boolean => {
    return !(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.screen.width > 600
    );
  };

  return {
    validateVote,
    logVote,
    generateFingerprint,
    runBotDetection,
    loading
  };
};