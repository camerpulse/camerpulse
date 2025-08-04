import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export interface UnifiedNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  recipient_id: string;
  sender_id?: string;
  created_at: string;
  read_at?: string;
  updated_at: string;
  source_module: string;
  category: string;
  priority: number;
  delivery_channels: string[];
  language: string;
  region_specific?: string[];
  user_type_specific?: string[];
  action_url?: string;
  requires_action: boolean;
  expires_at?: string;
  interaction_count: number;
  last_interaction_at?: string;
  is_active: boolean;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  civic_alerts: boolean;
  political_updates: boolean;
  village_updates: boolean;
  petition_updates: boolean;
  job_notifications: boolean;
  marketplace_updates: boolean;
  community_messages: boolean;
  admin_notices: boolean;
  security_alerts: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  digest_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  region_notifications: string[];
  language_preference: string;
  priority_threshold: number;
  auto_mark_read_after_days: number;
}

export interface SendNotificationPayload {
  type: string;
  title: string;
  body: string;
  recipient_id?: string;
  recipients?: string[];
  sender_id?: string;
  data?: Record<string, any>;
  source_module: string;
  category?: string;
  priority?: number;
  delivery_channels?: string[];
  action_url?: string;
  requires_action?: boolean;
  expires_at?: string;
  template_key?: string;
  template_variables?: Record<string, any>;
  target_criteria?: Record<string, any>;
  batch_name?: string;
  region_specific?: string[];
  user_type_specific?: string[];
  language?: string;
}

export const useUnifiedNotifications = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (limit: number = 50) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('unified_notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read_at).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('unified_notifications')
        .update({ 
          read_at: new Date().toISOString(),
          interaction_count: 1,
          last_interaction_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('unified_notifications')
        .update({ 
          read_at: new Date().toISOString(),
          last_interaction_at: new Date().toISOString()
        })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .upsert({ 
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        throw error;
      }

      setPreferences(data);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      throw error;
    }
  }, [user]);

  // Send notification (admin/system use)
  const sendNotification = useCallback(async (payload: SendNotificationPayload) => {
    try {
      const { data, error } = await supabase.functions.invoke('unified-notification-service', {
        body: {
          ...payload,
          language: payload.language || language,
          sender_id: payload.sender_id || user?.id,
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        throw error;
      }

      console.log('Notification sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, [user, language]);

  // Send notification using template
  const sendTemplateNotification = useCallback(async (
    templateKey: string,
    variables: Record<string, any>,
    recipientId?: string,
    recipients?: string[],
    targetCriteria?: Record<string, any>
  ) => {
    return sendNotification({
      type: 'template_based',
      title: '', // Will be filled by template
      body: '', // Will be filled by template
      source_module: 'system',
      template_key: templateKey,
      template_variables: variables,
      recipient_id: recipientId,
      recipients,
      target_criteria: targetCriteria,
    });
  }, [sendNotification]);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Get notifications by source module
  const getNotificationsByModule = useCallback((module: string) => {
    return notifications.filter(n => n.source_module === module);
  }, [notifications]);

  // Get high priority notifications
  const getHighPriorityNotifications = useCallback(() => {
    return notifications.filter(n => n.priority <= 2 && !n.read_at);
  }, [notifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchPreferences();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('unified-user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unified_notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New unified notification received:', payload);
          const newNotification = payload.new as UnifiedNotification;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for high priority notifications
          if (newNotification.priority <= 2) {
            toast(newNotification.title, {
              description: newNotification.body,
              duration: 5000,
              action: newNotification.action_url ? {
                label: 'View',
                onClick: () => window.location.href = newNotification.action_url!
              } : undefined,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'unified_notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Unified notification updated:', payload);
          const updatedNotification = payload.new as UnifiedNotification;
          
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );

          // Update unread count if read status changed
          if (payload.old.read_at !== updatedNotification.read_at) {
            setUnreadCount(prev => 
              updatedNotification.read_at ? Math.max(0, prev - 1) : prev + 1
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, fetchPreferences]);

  return {
    notifications,
    preferences,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    sendNotification,
    sendTemplateNotification,
    getNotificationsByCategory,
    getNotificationsByModule,
    getHighPriorityNotifications,
    fetchNotifications,
    fetchPreferences,
  };
};