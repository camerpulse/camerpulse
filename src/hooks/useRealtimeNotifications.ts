import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export interface RealtimeNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  read: boolean;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('realtime_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      logger.error('Failed to load notifications', 'useRealtimeNotifications', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('realtime_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logger.error('Failed to mark notification as read', 'useRealtimeNotifications', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('realtime_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      logger.error('Failed to mark all notifications as read', 'useRealtimeNotifications', error);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('realtime_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        if (notification && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        
        return newNotifications;
      });
    } catch (error) {
      logger.error('Failed to delete notification', 'useRealtimeNotifications', error);
    }
  }, []);

  // Show notification toast
  const showNotificationToast = useCallback((notification: RealtimeNotification) => {
    const toastOptions = {
      description: notification.message,
      action: notification.action_url ? {
        label: 'View',
        onClick: () => window.location.href = notification.action_url!
      } : undefined,
    };

    switch (notification.priority) {
      case 'urgent':
        toast.error(notification.title, toastOptions);
        break;
      case 'high':
        toast.warning(notification.title, toastOptions);
        break;
      case 'medium':
        toast.info(notification.title, toastOptions);
        break;
      default:
        toast(notification.title, toastOptions);
    }
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as RealtimeNotification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          showNotificationToast(newNotification);
          
          logger.info('New realtime notification received', 'useRealtimeNotifications', {
            type: newNotification.notification_type,
            priority: newNotification.priority
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as RealtimeNotification;
          
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        logger.info(`Notification subscription status: ${status}`, 'useRealtimeNotifications');
      });

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [user, loadNotifications, showNotificationToast]);

  // Browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      logger.info(`Browser notification permission: ${permission}`, 'useRealtimeNotifications');
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Show browser notification
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        // Show browser notifications when tab is not visible
        notifications
          .filter(n => !n.read)
          .slice(0, 3) // Limit to 3 notifications
          .forEach(notification => {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: notification.id,
              requireInteraction: notification.priority === 'urgent'
            });
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    refresh: loadNotifications
  };
};