import { supabase } from '@/integrations/supabase/client';

interface SecurityEventData {
  actionType: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

class SecurityAudit {
  private static instance: SecurityAudit;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): SecurityAudit {
    if (!SecurityAudit.instance) {
      SecurityAudit.instance = new SecurityAudit();
    }
    return SecurityAudit.instance;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private async getCurrentUserIP(): Promise<string | null> {
    try {
      // In a real application, you might want to use a service to get the real IP
      return 'unknown';
    } catch {
      return null;
    }
  }

  private getUserAgent(): string {
    return typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown';
  }

  public async logEvent(data: SecurityEventData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData = {
        user_id: user?.id || null,
        action_type: data.actionType,
        resource_type: data.resourceType,
        resource_id: data.resourceId || null,
        details: data.details || {},
        severity: data.severity || 'info',
        ip_address: data.ipAddress || await this.getCurrentUserIP(),
        user_agent: data.userAgent || this.getUserAgent(),
        session_id: data.sessionId || this.sessionId,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('security_audit_logs')
        .insert([eventData]);

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Security audit logging error:', error);
    }
  }

  // Convenience methods for common security events
  public async logLogin(success: boolean, email?: string): Promise<void> {
    await this.logEvent({
      actionType: success ? 'login_success' : 'login_failed',
      resourceType: 'authentication',
      details: { email, timestamp: new Date().toISOString() },
      severity: success ? 'low' : 'medium'
    });
  }

  public async logLogout(): Promise<void> {
    await this.logEvent({
      actionType: 'logout',
      resourceType: 'authentication',
      severity: 'low'
    });
  }

  public async logPermissionDenied(resource: string, action: string): Promise<void> {
    await this.logEvent({
      actionType: 'permission_denied',
      resourceType: resource,
      details: { attempted_action: action },
      severity: 'medium'
    });
  }

  public async logRateLimitExceeded(identifier: string, action: string): Promise<void> {
    await this.logEvent({
      actionType: 'rate_limit_exceeded',
      resourceType: 'rate_limiting',
      details: { identifier, action },
      severity: 'high'
    });
  }

  public async logSuspiciousActivity(details: Record<string, any>): Promise<void> {
    await this.logEvent({
      actionType: 'suspicious_activity',
      resourceType: 'security',
      details,
      severity: 'critical'
    });
  }

  public async logDataAccess(resource: string, resourceId?: string): Promise<void> {
    await this.logEvent({
      actionType: 'data_access',
      resourceType: resource,
      resourceId,
      severity: 'low'
    });
  }

  public async logConfigurationChange(resource: string, changes: Record<string, any>): Promise<void> {
    await this.logEvent({
      actionType: 'configuration_change',
      resourceType: resource,
      details: { changes },
      severity: 'medium'
    });
  }
}

// Export singleton instance
export const securityAudit = SecurityAudit.getInstance();