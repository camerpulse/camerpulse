import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationAnalyticsEvent {
  event_type: 'notification_viewed' | 'notification_clicked' | 'notification_dismissed' | 'preference_updated';
  notification_id?: string;
  notification_type?: string;
  user_agent?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  engagement_time_ms?: number;
  metadata?: Record<string, any>;
}

export const useNotificationAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = useCallback(async (event: NotificationAnalyticsEvent) => {
    if (!user) return;

    try {
      // Detect device type
      const userAgent = navigator.userAgent.toLowerCase();
      const deviceType = userAgent.includes('mobile') ? 'mobile' : 
                        userAgent.includes('tablet') ? 'tablet' : 'desktop';

      await supabase.functions.invoke('notification-analytics', {
        body: {
          user_id: user.id,
          event_type: event.event_type,
          notification_id: event.notification_id,
          notification_type: event.notification_type,
          device_type: event.device_type || deviceType,
          user_agent: event.user_agent || navigator.userAgent,
          engagement_time_ms: event.engagement_time_ms,
          metadata: {
            ...event.metadata,
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
          }
        }
      });
    } catch (error) {
      console.error('Failed to track notification analytics:', error);
    }
  }, [user]);

  const trackNotificationView = useCallback((notificationId: string, notificationType: string) => {
    trackEvent({
      event_type: 'notification_viewed',
      notification_id: notificationId,
      notification_type: notificationType
    });
  }, [trackEvent]);

  const trackNotificationClick = useCallback((notificationId: string, notificationType: string, actionUrl?: string) => {
    trackEvent({
      event_type: 'notification_clicked',
      notification_id: notificationId,
      notification_type: notificationType,
      metadata: { action_url: actionUrl }
    });
  }, [trackEvent]);

  const trackNotificationDismiss = useCallback((notificationId: string, notificationType: string) => {
    trackEvent({
      event_type: 'notification_dismissed',
      notification_id: notificationId,
      notification_type: notificationType
    });
  }, [trackEvent]);

  const trackPreferenceUpdate = useCallback((preferenceType: string, newValue: any) => {
    trackEvent({
      event_type: 'preference_updated',
      metadata: { preference_type: preferenceType, new_value: newValue }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackNotificationView,
    trackNotificationClick,
    trackNotificationDismiss,
    trackPreferenceUpdate
  };
};