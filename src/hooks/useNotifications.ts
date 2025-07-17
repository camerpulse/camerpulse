import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MessageNotification {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  message_snippet: string;
  created_at: string;
  is_read: boolean;
  conversation_title?: string;
  is_group: boolean;
}

export interface NotificationSettings {
  enable_all_notifications: boolean;
  enable_message_popups: boolean;
  enable_push_notifications: boolean;
  muted_conversations: string[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enable_all_notifications: true,
    enable_message_popups: true,
    enable_push_notifications: false,
    muted_conversations: [],
  });

  // Load notification settings
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      // For now, use default settings since the table doesn't exist yet
      setSettings({
        enable_all_notifications: true,
        enable_message_popups: true,
        enable_push_notifications: false,
        muted_conversations: [],
      });
    };

    loadSettings();
  }, [user]);

  // Load unread message count from messages table
  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      // For now, use a simple count from messages
      setUnreadCount(0); // Will be updated by real-time subscription
    };

    loadUnreadCount();
  }, [user]);

  // Load recent notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      // For now, use empty array since tables are not ready
      setNotifications([]);
    };

    loadNotifications();
  }, [user]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          // Check if conversation is muted
          if (settings.muted_conversations.includes(newMessage.conversation_id)) {
            return;
          }

          // Check quiet hours
          if (isInQuietHours()) {
            return;
          }

          // Update unread count
          setUnreadCount(prev => prev + 1);

          // Show popup notification if enabled
          if (settings.enable_all_notifications && settings.enable_message_popups) {
            showMessagePopup(newMessage);
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

  const showMessagePopup = async (message: any) => {
    // Get sender info
    const { data: senderData } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('user_id', message.sender_id)
      .single();

    const senderName = senderData?.display_name || senderData?.username || 'Unknown User';
    const snippet = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');

    toast({
      title: `New message from ${senderName}`,
      description: snippet,
    });
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // For now, just update local state since the table doesn't exist yet
    // TODO: Implement database storage when user_notification_settings table is ready
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    // For now, just update local state
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === messageId 
          ? { ...notif, is_read: true }
          : notif
      )
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // For now, just update local state
    setUnreadCount(0);
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
  };

  const muteConversation = async (conversationId: string) => {
    const mutedConversations = [...settings.muted_conversations, conversationId];
    await updateSettings({ muted_conversations: mutedConversations });
  };

  const unmuteConversation = async (conversationId: string) => {
    const mutedConversations = settings.muted_conversations.filter(id => id !== conversationId);
    await updateSettings({ muted_conversations: mutedConversations });
  };

  return {
    unreadCount,
    notifications,
    settings,
    updateSettings,
    markAsRead,
    markAllAsRead,
    muteConversation,
    unmuteConversation,
  };
};