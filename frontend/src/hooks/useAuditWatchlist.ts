import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuditWatchlist {
  id: string;
  audit_id: string;
  user_id: string;
  notification_preferences?: {
    email: boolean;
    in_app: boolean;
    sms: boolean;
  };
  created_at: string;
}

export interface AuditNotification {
  id: string;
  audit_id: string;
  notification_type: 'status_change' | 'new_comment' | 'document_update' | 'investigation_update';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  expires_at: string;
  metadata: any;
}

export const useAuditWatchlist = () => {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<AuditWatchlist[]>([]);
  const [notifications, setNotifications] = useState<AuditNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's watchlist
  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('audit_watchlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to load your watchlist.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's notifications - placeholder for now since table doesn't exist
  const fetchNotifications = async () => {
    try {
      // TODO: Implement when audit_notifications table is created
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Add audit to watchlist
  const addToWatchlist = async (
    auditId: string, 
    preferences = { email: true, in_app: true, sms: false }
  ): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('audit_watchlists')
        .insert({
          audit_id: auditId,
          user_id: user.user.id
        });

      if (error) throw error;

      toast({
        title: "Added to Watchlist",
        description: "You will receive notifications about updates to this audit."
      });

      // Refresh watchlist
      await fetchWatchlist();
      return true;
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Already Watching",
          description: "This audit is already in your watchlist.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add audit to watchlist.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  // Remove audit from watchlist
  const removeFromWatchlist = async (auditId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_watchlists')
        .delete()
        .eq('audit_id', auditId);

      if (error) throw error;

      toast({
        title: "Removed from Watchlist",
        description: "You will no longer receive notifications about this audit."
      });

      // Refresh watchlist
      await fetchWatchlist();
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove audit from watchlist.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update notification preferences - placeholder since preferences not implemented yet
  const updateNotificationPreferences = async (
    auditId: string,
    preferences: { email: boolean; in_app: boolean; sms: boolean }
  ): Promise<boolean> => {
    try {
      // TODO: Implement when notification_preferences column is added
      toast({
        title: "Feature Coming Soon",
        description: "Notification preferences will be available soon."
      });
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Mark notification as read - placeholder
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      // TODO: Implement when audit_notifications table is created
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read - placeholder
  const markAllAsRead = async (): Promise<boolean> => {
    try {
      // TODO: Implement when audit_notifications table is created
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: "All Notifications Read", 
        description: "All notifications have been marked as read."
      });
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if audit is in watchlist
  const isWatching = (auditId: string): boolean => {
    return watchlist.some(item => item.audit_id === auditId);
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Setup real-time subscriptions
  useEffect(() => {
    fetchWatchlist();
    fetchNotifications();

    // Subscribe to watchlist changes
    const watchlistChannel = supabase
      .channel('audit_watchlists_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'audit_watchlists' },
        () => fetchWatchlist()
      )
      .subscribe();

    // TODO: Subscribe to notification changes when table is created
    const notificationsChannel = null;

    return () => {
      supabase.removeChannel(watchlistChannel);
      if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel);
      }
    };
  }, []);

  return {
    watchlist,
    notifications,
    isLoading,
    unreadCount,
    addToWatchlist,
    removeFromWatchlist,
    updateNotificationPreferences,
    markAsRead,
    markAllAsRead,
    isWatching,
    refetchWatchlist: fetchWatchlist,
    refetchNotifications: fetchNotifications
  };
};