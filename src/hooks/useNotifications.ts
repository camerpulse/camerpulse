import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationHookReturn {
  sendNotification: (params: {
    type: 'bid_update' | 'deadline_reminder' | 'award_notification' | 'tender_update';
    userId: string;
    title: string;
    message: string;
    tenderId?: string;
    bidId?: string;
    data?: any;
  }) => Promise<void>;
  unreadCount: number;
  notifications: any[];
  markAsRead: (id: string) => Promise<void>;
  loading: boolean;
}

export const useNotifications = (): NotificationHookReturn => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n: any) => !n.is_read && !n.read).length);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as any;
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendNotification = async (params: {
    type: 'bid_update' | 'deadline_reminder' | 'award_notification' | 'tender_update';
    userId: string;
    title: string;
    message: string;
    tenderId?: string;
    bidId?: string;
    data?: any;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-bid-notifications', {
        body: params
      });

      if (error) throw error;

      console.log('Notification sent successfully:', data);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    sendNotification,
    unreadCount,
    notifications,
    markAsRead,
    loading
  };
};