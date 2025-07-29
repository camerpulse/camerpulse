import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationAnalytics {
  id: string;
  notification_id: string;
  user_id: string;
  event_type: string;
  event_timestamp: string;
  metadata: any;
  device_info: any;
  location_data: any;
}

export interface UserEngagementMetrics {
  id: string;
  user_id: string;
  date_tracked: string;
  total_notifications_received: number;
  notifications_opened: number;
  notifications_clicked: number;
  notifications_dismissed: number;
  avg_response_time_seconds: number;
  engagement_score: number;
  session_duration_minutes: number;
  actions_taken: number;
}

export interface NotificationPerformanceMetrics {
  id: string;
  notification_type: string;
  template_id?: string;
  date_tracked: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_dismissed: number;
  total_expired: number;
  avg_open_time_seconds: number;
  avg_click_time_seconds: number;
  conversion_rate: number;
  engagement_rate: number;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_name: string;
  event_category: string;
  event_data: any;
  timestamp: string;
  user_agent?: string;
  ip_address?: any;
  referrer?: string;
  page_url?: string;
}

export const useNotificationAnalytics = () => {
  const { user } = useAuth();
  const [userEngagement, setUserEngagement] = useState<UserEngagementMetrics[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<NotificationPerformanceMetrics[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Track notification event
  const trackNotificationEvent = async (
    notificationId: string,
    eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed' | 'expired',
    metadata: any = {},
    responseTimeSeconds?: number
  ) => {
    if (!user) return;

    try {
      // Insert analytics event
      const { error: analyticsError } = await supabase
        .from('notification_analytics')
        .insert({
          notification_id: notificationId,
          user_id: user.id,
          event_type: eventType,
          metadata,
          device_info: {
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        });

      if (analyticsError) throw analyticsError;

      // Update engagement metrics via function
      if (responseTimeSeconds !== undefined) {
        await supabase.rpc('update_user_engagement_metrics', {
          p_user_id: user.id,
          p_event_type: eventType,
          p_response_time_seconds: responseTimeSeconds
        });
      } else {
        await supabase.rpc('update_user_engagement_metrics', {
          p_user_id: user.id,
          p_event_type: eventType
        });
      }

      // Refresh engagement data
      await fetchUserEngagement();
    } catch (error) {
      console.error('Error tracking notification event:', error);
    }
  };

  // Track general analytics event
  const trackEvent = async (
    eventName: string,
    eventCategory: string,
    eventData: any = {}
  ) => {
    try {
      const sessionId = sessionStorage.getItem('analytics_session') || crypto.randomUUID();
      sessionStorage.setItem('analytics_session', sessionId);

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          session_id: sessionId,
          event_name: eventName,
          event_category: eventCategory,
          event_data: eventData,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          page_url: window.location.href
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  // Fetch user engagement metrics
  const fetchUserEngagement = async (days: number = 30) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_tracked', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date_tracked', { ascending: false });

      if (error) throw error;
      setUserEngagement(data || []);
    } catch (error) {
      console.error('Error fetching user engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch performance metrics
  const fetchPerformanceMetrics = async (days: number = 30) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_performance_metrics')
        .select('*')
        .gte('date_tracked', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date_tracked', { ascending: false });

      if (error) throw error;
      setPerformanceMetrics(data || []);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch realtime events
  const fetchRealtimeEvents = async (limit: number = 100) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setRealtimeEvents(data || []);
    } catch (error) {
      console.error('Error fetching realtime events:', error);
    }
  };

  // Get engagement overview
  const getEngagementOverview = () => {
    if (userEngagement.length === 0) return null;

    const totalReceived = userEngagement.reduce((sum, metric) => sum + metric.total_notifications_received, 0);
    const totalOpened = userEngagement.reduce((sum, metric) => sum + metric.notifications_opened, 0);
    const totalClicked = userEngagement.reduce((sum, metric) => sum + metric.notifications_clicked, 0);
    const totalDismissed = userEngagement.reduce((sum, metric) => sum + metric.notifications_dismissed, 0);

    return {
      totalReceived,
      totalOpened,
      totalClicked,
      totalDismissed,
      openRate: totalReceived > 0 ? (totalOpened / totalReceived) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      avgEngagementScore: userEngagement.reduce((sum, metric) => sum + metric.engagement_score, 0) / userEngagement.length
    };
  };

  // Get performance overview
  const getPerformanceOverview = () => {
    if (performanceMetrics.length === 0) return null;

    const totalSent = performanceMetrics.reduce((sum, metric) => sum + metric.total_sent, 0);
    const totalDelivered = performanceMetrics.reduce((sum, metric) => sum + metric.total_delivered, 0);
    const totalOpened = performanceMetrics.reduce((sum, metric) => sum + metric.total_opened, 0);
    const totalClicked = performanceMetrics.reduce((sum, metric) => sum + metric.total_clicked, 0);

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      avgEngagementRate: performanceMetrics.reduce((sum, metric) => sum + metric.engagement_rate, 0) / performanceMetrics.length
    };
  };

  useEffect(() => {
    if (user) {
      fetchUserEngagement();
      fetchPerformanceMetrics();
      fetchRealtimeEvents();
    }
  }, [user]);

  return {
    userEngagement,
    performanceMetrics,
    realtimeEvents,
    loading,
    trackNotificationEvent,
    trackEvent,
    fetchUserEngagement,
    fetchPerformanceMetrics,
    fetchRealtimeEvents,
    getEngagementOverview,
    getPerformanceOverview
  };
};