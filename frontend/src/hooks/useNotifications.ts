import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 
  | 'copyright_violation' | 'stream_milestone' | 'viral_spike' | 'award_nomination'
  | 'tip_received' | 'fan_comment' | 'chart_appearance' | 'platform_sync_error';

export type NotificationPriority = 'low' | 'moderate' | 'critical';

export interface PulseNotification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data: any;
  action_url?: string;
  icon?: string;
  is_read: boolean;
  is_dismissed: boolean;
  expires_at?: string;
  geo_targeted: boolean;
  target_regions?: string[];
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

export interface NotificationSettings {
  enable_all_notifications: boolean;
  enable_message_popups: boolean;
  enable_push_notifications: boolean;
  enable_civic_alerts: boolean;
  enable_poll_notifications: boolean;
  enable_election_updates: boolean;
  enable_intelligence_alerts: boolean;
  enable_email_digest?: boolean;
  email_digest_frequency?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  snooze_until?: string;
  geo_filter_enabled?: boolean;
  preferred_regions?: string[];
  muted_conversations: string[];
  muted_regions: string[];
  muted_categories?: string[];
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<PulseNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enable_all_notifications: true,
    enable_message_popups: true,
    enable_push_notifications: false,
    enable_civic_alerts: true,
    enable_poll_notifications: true,
    enable_election_updates: true,
    enable_intelligence_alerts: true,
    enable_email_digest: false,
    email_digest_frequency: 'weekly',
    quiet_hours_start: undefined,
    quiet_hours_end: undefined,
    snooze_until: undefined,
    geo_filter_enabled: true,
    preferred_regions: [],
    muted_conversations: [],
    muted_regions: [],
    muted_categories: [],
  });

  // Load notification settings
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadSettings();
  }, [user]);

  // Load unread notification count
  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('user_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
  }, [user]);

  // Load recent notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (data) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [user]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as PulseNotification;
          
          // Check if this notification type is muted
          if (settings.muted_categories?.includes(newNotification.notification_type)) {
            return;
          }

          // Check quiet hours
          if (isInQuietHours()) {
            return;
          }

          // Check snooze
          if (isInSnooze()) {
            return;
          }

          // Update state
          setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
          setUnreadCount(prev => prev + 1);

          // Show popup notification if enabled
          if (shouldShowPopup(newNotification)) {
            showNotificationPopup(newNotification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as PulseNotification;
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
          
          // Update unread count if notification was marked as read
          if (updatedNotification.is_read && !payload.old?.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, settings]);

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

  const isInSnooze = (): boolean => {
    if (!settings.snooze_until) return false;
    return new Date(settings.snooze_until) > new Date();
  };

  const shouldShowPopup = (notification: PulseNotification): boolean => {
    const typeSettings = {
      'copyright_violation': settings.enable_all_notifications,
      'stream_milestone': settings.enable_all_notifications,
      'viral_spike': settings.enable_all_notifications,
      'award_nomination': settings.enable_all_notifications,
      'tip_received': settings.enable_all_notifications,
      'fan_comment': settings.enable_message_popups,
      'chart_appearance': settings.enable_all_notifications,
      'platform_sync_error': settings.enable_all_notifications,
    };

    return typeSettings[notification.notification_type] || false;
  };

  const showNotificationPopup = (notification: PulseNotification) => {
    const priorityEmojis = {
      critical: '🚨',
      moderate: '📢',
      low: 'ℹ️'
    };

    toast({
      title: `${priorityEmojis[notification.priority]} ${notification.title}`,
      description: notification.message,
      duration: notification.priority === 'critical' ? 10000 : 5000,
    });
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
        });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_notifications')
        .update({ 
          is_dismissed: true, 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const snoozeNotifications = async (duration: '1h' | '1d' | '1w') => {
    const durations = {
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
    };
    
    const snoozeUntil = new Date(Date.now() + durations[duration]).toISOString();
    await updateSettings({ snooze_until: snoozeUntil });
  };

  const muteCategory = async (category: string) => {
    const mutedCategories = [...(settings.muted_categories || []), category];
    await updateSettings({ muted_categories: mutedCategories });
  };

  const unmuteCategory = async (category: string) => {
    const mutedCategories = (settings.muted_categories || []).filter(cat => cat !== category);
    await updateSettings({ muted_categories: mutedCategories });
  };

  return {
    unreadCount,
    notifications,
    settings,
    updateSettings,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    snoozeNotifications,
    muteCategory,
    unmuteCategory,
    isInQuietHours,
    isInSnooze,
  };
};