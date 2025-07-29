import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackEventProps {
  institutionId: string;
  institutionType: 'school' | 'hospital' | 'pharmacy' | 'village';
  metricType: 'profile_view' | 'click_through' | 'message_sent' | 'rating_given' | 'search_appearance';
  userId?: string;
  sessionId?: string;
  sourcePage?: string;
  metadata?: Record<string, any>;
}

export const useAnalyticsTracking = () => {
  // Generate session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  };

  const trackEvent = async ({
    institutionId,
    institutionType,
    metricType,
    userId,
    sourcePage,
    metadata = {}
  }: TrackEventProps) => {
    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase
        .from('institution_analytics')
        .insert({
          institution_id: institutionId,
          institution_type: institutionType,
          metric_type: metricType,
          user_id: userId,
          session_id: sessionId,
          source_page: sourcePage || window.location.pathname,
          metadata
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  };

  const trackProfileView = (institutionId: string, institutionType: string, userId?: string) => {
    trackEvent({
      institutionId,
      institutionType: institutionType as any,
      metricType: 'profile_view',
      userId,
      metadata: {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    });
  };

  const trackClickThrough = (institutionId: string, institutionType: string, userId?: string) => {
    trackEvent({
      institutionId,
      institutionType: institutionType as any,
      metricType: 'click_through',
      userId,
      metadata: {
        timestamp: new Date().toISOString(),
        referrer: document.referrer
      }
    });
  };

  const trackMessageSent = (institutionId: string, institutionType: string, userId?: string) => {
    trackEvent({
      institutionId,
      institutionType: institutionType as any,
      metricType: 'message_sent',
      userId,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackRatingGiven = (institutionId: string, institutionType: string, rating: number, userId?: string) => {
    trackEvent({
      institutionId,
      institutionType: institutionType as any,
      metricType: 'rating_given',
      userId,
      metadata: {
        rating,
        timestamp: new Date().toISOString()
      }
    });
  };

  const trackSearchAppearance = (institutionId: string, institutionType: string, searchQuery?: string) => {
    trackEvent({
      institutionId,
      institutionType: institutionType as any,
      metricType: 'search_appearance',
      metadata: {
        search_query: searchQuery,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    trackEvent,
    trackProfileView,
    trackClickThrough,
    trackMessageSent,
    trackRatingGiven,
    trackSearchAppearance
  };
};