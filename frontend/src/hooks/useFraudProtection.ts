import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logSecurityEvent, sanitizeInput, detectSecurityThreats } from '@/utils/security';

interface VoteValidationResult {
  canVote: boolean;
  reason?: string;
  riskScore?: number;
  requiresCaptcha?: boolean;
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
      // Enhanced privacy-friendly IP hashing
      const clientInfo = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().toDateString() // Changes daily for privacy
      ].join('|');
      
      // Use Web Crypto API for secure hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(clientInfo);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      
      return hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16);
    } catch {
      // Fallback to browser-based hash
      return 'browser_' + Math.random().toString(36).substr(2, 9);
    }
  }, []);

  const validateVote = useCallback(async (pollId: string, userId?: string, captchaToken?: string): Promise<VoteValidationResult> => {
    try {
      setLoading(true);

      // Enhanced input validation
      const sanitizedPollId = sanitizeInput(pollId);
      const threats = detectSecurityThreats(pollId);
      
      if (threats.length > 0) {
        await logSecurityEvent(
          'poll_id_security_threat',
          'poll_vote',
          pollId,
          { threats },
          'high'
        );
        return { 
          canVote: false, 
          reason: 'Invalid poll identifier detected',
          riskScore: 100
        };
      }

      // Get fraud settings for this poll
      const { data: settings } = await supabase
        .from('poll_fraud_settings')
        .select('*')
        .eq('poll_id', sanitizedPollId)
        .single();

      // Calculate risk score
      const deviceFingerprint = generateFingerprint();
      const hashedIp = await hashIP();
      const riskScore = await calculateRiskScore(pollId, deviceFingerprint, hashedIp, userId);

      // Enhanced CAPTCHA logic based on risk score
      const requiresCaptcha = settings?.enable_captcha || riskScore >= 50;
      
      if (requiresCaptcha && !captchaToken) {
        await logSecurityEvent(
          'captcha_required',
          'poll_vote',
          pollId,
          { risk_score: riskScore, user_id: userId },
          riskScore >= 80 ? 'high' : 'medium'
        );
        
        return { 
          canVote: false, 
          reason: 'Security verification required',
          riskScore,
          requiresCaptcha: true
        };
      }

      if (requiresCaptcha && captchaToken) {
        try {
          const tokenData = JSON.parse(atob(captchaToken));
          if (!tokenData.verified || Date.now() - tokenData.timestamp > 300000) { // 5 minutes
            return { 
              canVote: false, 
              reason: 'CAPTCHA token expired or invalid',
              riskScore
            };
          }
        } catch {
          return { 
            canVote: false, 
            reason: 'Invalid CAPTCHA token',
            riskScore
          };
        }
      }

      // Block high-risk votes immediately
      if (riskScore >= 80) {
        await logSecurityEvent(
          'high_risk_vote_blocked',
          'poll_vote',
          pollId,
          { risk_score: riskScore, user_id: userId, device_fingerprint: deviceFingerprint },
          'critical'
        );
        
        return { 
          canVote: false, 
          reason: 'Vote blocked due to security concerns',
          riskScore
        };
      }

      if (!settings || !settings.enable_rate_limiting) {
        return { canVote: true, riskScore };
      }

      const sessionId = sessionStorage.getItem('session_id') || 
        (() => {
          const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('session_id', id);
          return id;
        })();

      // Enhanced rate limiting with time windows
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Check IP-based rate limiting within time window
      const { data: ipVotes } = await supabase
        .from('poll_vote_log')
        .select('id, created_at')
        .eq('poll_id', pollId)
        .eq('hashed_ip', hashedIp)
        .gte('created_at', oneHourAgo.toISOString());

      if (ipVotes && ipVotes.length >= settings.max_votes_per_ip) {
        await logSecurityEvent(
          'ip_rate_limit_exceeded',
          'poll_vote',
          pollId,
          { 
            ip_hash: hashedIp, 
            vote_count: ipVotes.length,
            limit: settings.max_votes_per_ip 
          },
          'medium'
        );
        
        return { 
          canVote: false, 
          reason: `Maximum of ${settings.max_votes_per_ip} vote(s) per device per hour`,
          riskScore
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
          reason: `Maximum of ${settings.max_votes_per_session} vote(s) per session allowed`,
          riskScore
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
            reason: 'You have already voted in this poll',
            riskScore
          };
        }
      }

      // Log successful validation
      await logSecurityEvent(
        'vote_validation_success',
        'poll_vote',
        pollId,
        { risk_score: riskScore, user_id: userId },
        'low'
      );

      return { canVote: true, riskScore };

    } catch (error) {
      console.error('Error validating vote:', error);
      
      await logSecurityEvent(
        'vote_validation_error',
        'system',
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'medium'
      );
      
      // Allow vote on validation error to prevent blocking legitimate users
      return { canVote: true };
    } finally {
      setLoading(false);
    }
  }, [hashIP]);

  // Enhanced risk score calculation
  const calculateRiskScore = async (
    pollId: string,
    deviceFingerprint: string,
    hashedIp: string,
    userId?: string
  ): Promise<number> => {
    let riskScore = 0;

    try {
      // Check for rapid voting patterns (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: recentVotes } = await supabase
        .from('poll_vote_log')
        .select('*')
        .eq('poll_id', pollId)
        .gte('created_at', oneHourAgo.toISOString());

      if (recentVotes) {
        // Device fingerprint reuse
        const sameDeviceVotes = recentVotes.filter(v => v.device_fingerprint === deviceFingerprint);
        if (sameDeviceVotes.length > 2) riskScore += 40;
        else if (sameDeviceVotes.length > 0) riskScore += 15;

        // IP address reuse
        const sameIpVotes = recentVotes.filter(v => v.hashed_ip === hashedIp);
        if (sameIpVotes.length > 3) riskScore += 35;
        else if (sameIpVotes.length > 1) riskScore += 20;

        // Rapid sequential voting detection
        const sortedVotes = recentVotes
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        for (let i = 1; i < sortedVotes.length; i++) {
          const timeDiff = new Date(sortedVotes[i].created_at).getTime() - 
                          new Date(sortedVotes[i-1].created_at).getTime();
          
          if (timeDiff < 5000) riskScore += 30; // Less than 5 seconds
          else if (timeDiff < 30000) riskScore += 15; // Less than 30 seconds
        }

        // Volume-based risk
        if (recentVotes.length > 20) riskScore += 25;
        else if (recentVotes.length > 10) riskScore += 15;
      }

      // Device characteristics
      if (!deviceFingerprint || deviceFingerprint === 'unknown') riskScore += 20;
      if (!hashedIp || hashedIp === 'unknown') riskScore += 15;

      return Math.min(100, riskScore);
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 30; // Default moderate risk
    }
  };

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