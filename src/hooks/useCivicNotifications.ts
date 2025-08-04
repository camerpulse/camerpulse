/**
 * Advanced Civic Notifications Hook
 * 
 * Manages all civic notification types with real-time updates and intelligence
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { CivicNotification } from '@/components/camerpulse/CivicNotificationCenter';

export interface CivicNotificationSettings {
  enable_all_notifications: boolean;
  enable_message_popups: boolean;
  enable_push_notifications: boolean;
  enable_civic_alerts: boolean;
  enable_poll_notifications: boolean;
  enable_election_updates: boolean;
  enable_intelligence_alerts: boolean;
  muted_conversations: string[];
  muted_regions: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  priority_filter: 'all' | 'warning_and_critical' | 'critical_only';
}

export const useCivicNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);
  const [settings, setSettings] = useState<CivicNotificationSettings>({
    enable_all_notifications: true,
    enable_message_popups: true,
    enable_push_notifications: false,
    enable_civic_alerts: true,
    enable_poll_notifications: true,
    enable_election_updates: true,
    enable_intelligence_alerts: true,
    muted_conversations: [],
    muted_regions: [],
    priority_filter: 'all'
  });

  // Mock civic notifications for demonstration
  useEffect(() => {
    if (!user) return;

    // Load mock notifications
    const mockNotifications: CivicNotification[] = [
      {
        id: '1',
        type: 'civic_alert',
        title: 'Security Alert - Douala',
        content: 'Heightened security measures in effect in downtown Douala. Citizens advised to avoid large gatherings.',
        priority: 'critical',
        region: 'Littoral',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_read: false,
        metadata: { alert_type: 'security', government_source: true }
      },
      {
        id: '2',
        type: 'poll',
        title: 'New Poll: Infrastructure Priority',
        content: 'Vote on the next infrastructure project for your region',
        sender_name: 'CamerPulse Team',
        priority: 'info',
        region: 'Northwest',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_read: false,
        action_url: '/polls/latest',
        metadata: { poll_question: 'What infrastructure project should be prioritized?' }
      },
      {
        id: '3',
        type: 'intelligence',
        title: 'Political Sentiment Shift Detected',
        content: 'Significant positive sentiment increase detected in Yaoundé region regarding education policy.',
        priority: 'warning',
        region: 'Centre',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_read: false,
        metadata: { threat_level: 'Low', confidence: 0.89 }
      },
      {
        id: '4',
        type: 'follow',
        title: 'New Follower',
        content: 'Minister Paul Atanga Nji started following you',
        sender_name: 'Minister Paul Atanga Nji',
        priority: 'info',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      {
        id: '5',
        type: 'election',
        title: 'Election Update',
        content: 'Municipal election dates announced for Q2 2024. Registration opens next month.',
        priority: 'warning',
        region: 'National',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        is_read: false,
        action_url: '/elections'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
  }, [user]);

  // Real-time subscription for various notification types
  useEffect(() => {
    if (!user) return;

    // Subscribe to civic alerts
    const civicAlertsChannel = supabase
      .channel('civic-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'civic_alerts',
        },
        (payload) => {
          if (!settings.enable_civic_alerts) return;
          
          const alert = payload.new as any;
          const notification: CivicNotification = {
            id: alert.id,
            type: 'civic_alert',
            title: alert.title,
            content: alert.content,
            priority: alert.priority || 'warning',
            region: alert.region,
            created_at: alert.created_at,
            is_read: false,
            metadata: alert.metadata
          };
          
          addNotification(notification);
        }
      )
      .subscribe();

    // Subscribe to polls
    const pollsChannel = supabase
      .channel('poll-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'polls',
        },
        (payload) => {
          if (!settings.enable_poll_notifications) return;
          
          const poll = payload.new as any;
          const notification: CivicNotification = {
            id: `poll-${poll.id}`,
            type: 'poll',
            title: 'New Poll Available',
            content: poll.title,
            priority: 'info',
            created_at: poll.created_at,
            is_read: false,
            action_url: `/polls/${poll.id}`,
            metadata: { poll_question: poll.title }
          };
          
          addNotification(notification);
        }
      )
      .subscribe();

    // Subscribe to intelligence alerts
    const intelligenceChannel = supabase
      .channel('intelligence-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'intelligence_alerts',
        },
        (payload) => {
          if (!settings.enable_intelligence_alerts) return;
          
          const alert = payload.new as any;
          const notification: CivicNotification = {
            id: `intel-${alert.id}`,
            type: 'intelligence',
            title: alert.title,
            content: alert.description,
            priority: alert.severity === 'high' ? 'critical' : 'warning',
            region: alert.region,
            created_at: alert.created_at,
            is_read: false,
            metadata: alert.metadata
          };
          
          addNotification(notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(civicAlertsChannel);
      supabase.removeChannel(pollsChannel);
      supabase.removeChannel(intelligenceChannel);
    };
  }, [user, settings]);

  const addNotification = (notification: CivicNotification) => {
    // Check if region is muted
    if (notification.region && settings.muted_regions.includes(notification.region)) {
      return;
    }

    // Check priority filter
    if (settings.priority_filter === 'warning_and_critical' && notification.priority === 'info') {
      return;
    }
    if (settings.priority_filter === 'critical_only' && notification.priority !== 'critical') {
      return;
    }

    // Check quiet hours
    if (isInQuietHours()) {
      return;
    }

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only 50 notifications
    setUnreadCount(prev => prev + 1);

    // Show popup notification if enabled
    if (settings.enable_all_notifications && settings.enable_message_popups) {
      showNotificationPopup(notification);
    }

    // Browser push notification if enabled
    if (settings.enable_push_notifications && 'Notification' in window) {
      showBrowserNotification(notification);
    }
  };

  const isInQuietHours = (): boolean => {
    if (!settings.quiet_hours_start || !settings.quiet_hours_end) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const showNotificationPopup = (notification: CivicNotification) => {
    const priorityEmoji = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast({
      title: `${priorityEmoji[notification.priority]} ${notification.title}`,
      description: notification.content,
      variant: notification.priority === 'critical' ? 'destructive' : 'default'
    });
  };

  const showBrowserNotification = (notification: CivicNotification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const updateSettings = async (newSettings: Partial<CivicNotificationSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // TODO: Save to database when user_notification_settings table is created
    // For now, settings are stored in local state only
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      )
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    setUnreadCount(0);
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
  };

  const dismissNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
    });
  };

  const filterByType = (type: string) => {
    return notifications.filter(notif => notif.type === type);
  };

  const filterByRegion = (region: string) => {
    return notifications.filter(notif => notif.region === region);
  };

  const sendBroadcastAlert = async (alert: {
    title: string;
    content: string;
    priority: 'info' | 'warning' | 'critical';
    regions?: string[];
    target_users?: 'all' | 'region' | 'specific';
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-civic-alert', {
        body: {
          ...alert,
          sender_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Civic Alert Sent",
        description: `Alert broadcast to ${alert.target_users} users successfully.`
      });

      return data;
    } catch (error) {
      console.error('Error sending broadcast alert:', error);
      toast({
        title: "Error",
        description: "Failed to send civic alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ enable_push_notifications: true });
      }
    }
  };

  return {
    unreadCount,
    notifications,
    settings,
    updateSettings,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    filterByType,
    filterByRegion,
    sendBroadcastAlert,
    requestNotificationPermission
  };
};