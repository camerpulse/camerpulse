import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, detectSecurityThreats, logSecurityEvent } from '@/utils/security';

interface SecurityEvent {
  id: string;
  action_type: string;
  severity: string;
  timestamp: string;
  details: any;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highRiskEvents: number;
  recentThreats: SecurityEvent[];
  riskScore: number;
}

export const useEnhancedSecurity = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    highRiskEvents: 0,
    recentThreats: [],
    riskScore: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Validate and sanitize input with threat detection
  const validateInput = async (input: string, context: string = 'general') => {
    const sanitized = sanitizeInput(input);
    const threats = detectSecurityThreats(input);
    
    if (threats.length > 0) {
      // Log security threat detection
      await logSecurityEvent(
        'threat_detected',
        'input_validation',
        undefined,
        {
          context,
          threats,
          original_input_length: input.length,
          sanitized_input_length: sanitized.length
        },
        'high'
      );
      
      return {
        isValid: false,
        sanitized,
        threats,
        reason: `Security threats detected: ${threats.join(', ')}`
      };
    }
    
    return {
      isValid: true,
      sanitized,
      threats: [],
      reason: 'Input validated successfully'
    };
  };

  // Monitor security events in real-time
  const fetchSecurityMetrics = async () => {
    setIsLoading(true);
    try {
      // Get recent security events from existing table
      const { data: events, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching security events:', error);
        return;
      }

      if (events) {
        const criticalEvents = events.filter(e => e.severity === 'critical').length;
        const highRiskEvents = events.filter(e => e.severity === 'high').length;
        const recentThreats = events.filter(e => 
          e.action_type.includes('threat') || 
          e.action_type.includes('attack') ||
          e.severity === 'critical'
        ).slice(0, 10) as SecurityEvent[];

        // Calculate risk score based on recent events
        const riskScore = Math.min(100, 
          (criticalEvents * 20) + 
          (highRiskEvents * 10) + 
          (events.length * 2)
        );

        setMetrics({
          totalEvents: events.length,
          criticalEvents,
          highRiskEvents,
          recentThreats,
          riskScore
        });
      }
    } catch (error) {
      console.error('Error in fetchSecurityMetrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Log security event with enhanced context
  const logEvent = async (
    eventType: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    try {
      // Get additional context
      const context = {
        ...details,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      };

      await supabase.from('security_audit_logs').insert({
        action_type: eventType,
        resource_type: resourceType,
        resource_id: resourceId,
        details: context,
        severity
      });

      // Refresh metrics after logging
      await fetchSecurityMetrics();
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  // Check for suspicious patterns
  const checkSuspiciousActivity = async (userId?: string) => {
    try {
      const timeWindow = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes
      
      const { data: recentEvents } = await supabase
        .from('security_audit_logs')
        .select('*')
        .gte('timestamp', timeWindow.toISOString())
        .eq('user_id', userId);

      if (recentEvents && recentEvents.length > 20) {
        await logEvent(
          'suspicious_activity_detected',
          'user_behavior',
          userId,
          {
            event_count: recentEvents.length,
            time_window: '15_minutes',
            pattern: 'high_frequency_events'
          },
          'high'
        );
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  };

  // Initialize security monitoring
  useEffect(() => {
    fetchSecurityMetrics();
    
    // Set up periodic refresh
    const interval = setInterval(fetchSecurityMetrics, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    isLoading,
    validateInput,
    logEvent,
    checkSuspiciousActivity,
    refreshMetrics: fetchSecurityMetrics
  };
};