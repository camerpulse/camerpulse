import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  sender?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  read_status?: {
    is_read: boolean;
    read_at?: string;
  };
}

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Get profiles for message senders
      const senderIds = [...new Set(data?.map(msg => msg.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', senderIds);

      const formattedMessages: Message[] = data?.map(msg => {
        const senderProfile = profiles?.find(p => p.user_id === msg.sender_id);
        return {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          message_type: msg.message_type,
          metadata: msg.media_url,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          sender: senderProfile ? {
            username: senderProfile.username,
            display_name: senderProfile.display_name,
            avatar_url: senderProfile.avatar_url
          } : undefined
        };
      }) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!user || !conversationId || !content.trim()) return false;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: '', // Will be set by trigger
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('mark_message_read', { p_message_id: messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || !conversationId) return;

    try {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id !== user.id && !msg.read_status?.is_read
      );

      for (const message of unreadMessages) {
        await markAsRead(message.id);
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!conversationId) return;

    // Set up realtime subscription for messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => fetchMessages()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_read_status_enhanced'
        },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  // Mark messages as read when they're viewed
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      markAllAsRead();
    }
  }, [messages.length, conversationId]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
    markAllAsRead,
    fetchMessages
  };
};