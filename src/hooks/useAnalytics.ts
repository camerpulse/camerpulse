import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsEvent {
  village_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  // Generate session ID once per session
  const sessionId = useCallback(() => {
    let session = sessionStorage.getItem('analytics_session');
    if (!session) {
      session = crypto.randomUUID();
      sessionStorage.setItem('analytics_session', session);
    }
    return session;
  }, []);

  const trackEvent = useCallback(async ({
    village_id,
    event_type,
    event_data = {},
    session_id
  }: AnalyticsEvent) => {
    try {
      await supabase.from('village_analytics').insert({
        village_id,
        user_id: user?.id,
        event_type,
        event_data,
        session_id: session_id || sessionId(),
        user_agent: navigator.userAgent,
        // ip_address will be handled by RLS/triggers
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [user?.id, sessionId]);

  // Track page views automatically
  useEffect(() => {
    const path = window.location.pathname;
    trackEvent({
      event_type: 'page_view',
      event_data: { path, referrer: document.referrer }
    });
  }, [trackEvent]);

  const trackVillageView = useCallback((villageId: string, villageData?: any) => {
    trackEvent({
      village_id: villageId,
      event_type: 'village_view',
      event_data: { village_name: villageData?.name, region: villageData?.region }
    });
  }, [trackEvent]);

  const trackVillageInteraction = useCallback((villageId: string, interaction: string, data?: any) => {
    trackEvent({
      village_id: villageId,
      event_type: 'village_interaction',
      event_data: { interaction, ...data }
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, filters?: any, results?: number) => {
    trackEvent({
      event_type: 'search',
      event_data: { query, filters, results_count: results }
    });
  }, [trackEvent]);

  const trackMapInteraction = useCallback((action: string, data?: any) => {
    trackEvent({
      event_type: 'map_interaction',
      event_data: { action, ...data }
    });
  }, [trackEvent]);

  const trackChatMessage = useCallback((villageId: string, messageLength: number) => {
    trackEvent({
      village_id: villageId,
      event_type: 'chat_message',
      event_data: { message_length: messageLength }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackVillageView,
    trackVillageInteraction,
    trackSearch,
    trackMapInteraction,
    trackChatMessage
  };
};