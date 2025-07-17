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
      const { data } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          enable_all_notifications: data.enable_all_notifications ?? true,
          enable_message_popups: data.enable_message_popups ?? true,
          enable_push_notifications: data.enable_push_notifications ?? false,
          muted_conversations: data.muted_conversations ?? [],
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
        });
      }
    };

    loadSettings();
  }, [user]);

  // Load unread message count
  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      const { data } = await supabase
        .from('message_read_status')
        .select('message_id')
        .eq('user_id', user.id)
        .eq('is_read', false);

      setUnreadCount(data?.length || 0);
    };

    loadUnreadCount();
  }, [user]);

  // Load recent notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          conversations!inner(
            title,
            is_group,
            conversation_participants!inner(
              user_id,
              profiles(display_name, email)
            )
          ),
          message_read_status(is_read)
        `)
        .neq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const formattedNotifications: MessageNotification[] = data.map((msg: any) => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          sender_name: msg.conversations.conversation_participants[0]?.profiles?.display_name || 
                      msg.conversations.conversation_participants[0]?.profiles?.email || 
                      'Unknown User',
          message_snippet: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
          created_at: msg.created_at,
          is_read: msg.message_read_status?.[0]?.is_read ?? false,
          conversation_title: msg.conversations.title,
          is_group: msg.conversations.is_group,
        }));

        setNotifications(formattedNotifications);
      }
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
      .select('display_name, email')
      .eq('id', message.sender_id)
      .single();

    const senderName = senderData?.display_name || senderData?.email || 'Unknown User';
    const snippet = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');

    toast({
      title: `New message from ${senderName}`,
      description: snippet,
      action: (
        <button
          onClick={() => window.location.href = '/messenger'}
          className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90"
        >
          Open Messenger
        </button>
      ),
    });
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    await supabase
      .from('user_notification_settings')
      .upsert({
        user_id: user.id,
        ...updatedSettings,
      });
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    await supabase
      .from('message_read_status')
      .upsert({
        user_id: user.id,
        message_id: messageId,
        is_read: true,
      });

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

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    if (unreadIds.length > 0) {
      const updates = unreadIds.map(id => ({
        user_id: user.id,
        message_id: id,
        is_read: true,
      }));

      await supabase
        .from('message_read_status')
        .upsert(updates);

      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    }
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