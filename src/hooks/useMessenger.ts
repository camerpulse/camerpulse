import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  title: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  icon_url?: string;
  description?: string;
  participants?: ConversationParticipant[];
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  is_admin: boolean;
  is_muted: boolean;
  user_email?: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  message_type: string;
  media_url?: string;
  reply_to_id?: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  deleted_at?: string;
  sender_email?: string;
  read_status?: MessageReadStatus[];
}

export interface MessageReadStatus {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export const useMessenger = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            *,
            user_email:user_id
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Calculate unread counts for each conversation
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithUnread);
      
      // Calculate total unread
      const total = conversationsWithUnread.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      setUnreadCount(total);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          read_status:message_read_status(*)
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await markConversationAsRead(conversationId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string, messageType: string = 'text', mediaUrl?: string) => {
    if (!user?.id || !content.trim()) return;

    try {
      // Get receiver for 1-on-1 chats
      const conversation = conversations.find(c => c.id === conversationId);
      const receiver = conversation?.participants?.find(p => p.user_id !== user.id);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          receiver_id: receiver?.user_id || user.id,
          conversation_id: conversationId,
          message_type: messageType,
          media_url: mediaUrl,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately
      setMessages(prev => [...prev, data]);
      
      // Refresh conversations to update last message time
      fetchConversations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  };

  // Create a new conversation
  const createConversation = async (participantIds: string[], title?: string, isGroup: boolean = false) => {
    if (!user?.id) return null;

    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: title || (isGroup ? 'New Group' : 'Direct Message'),
          is_group: isGroup,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants (including creator)
      const participants = [user.id, ...participantIds].map((userId, index) => ({
        conversation_id: conversation.id,
        user_id: userId,
        is_admin: index === 0 // Creator is admin
      }));

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) throw partError;

      fetchConversations();
      return conversation;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    if (!user?.id) return;

    try {
      // Get unread messages in this conversation
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      if (!unreadMessages?.length) return;

      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      if (updateError) throw updateError;

      // Add read status records
      const readStatuses = unreadMessages.map(msg => ({
        message_id: msg.id,
        user_id: user.id
      }));

      await supabase
        .from('message_read_status')
        .insert(readStatuses);

      // Update local state
      setMessages(prev => prev.map(msg => ({
        ...msg,
        is_read: msg.sender_id === user.id ? msg.is_read : true
      })));

      fetchConversations();
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  };

  // Block/unblock user
  const toggleBlockUser = async (userId: string, block: boolean) => {
    if (!user?.id) return;

    try {
      if (block) {
        const { error } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: user.id,
            blocked_id: userId
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', userId);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `User ${block ? 'blocked' : 'unblocked'} successfully`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${block ? 'block' : 'unblock'} user`,
        variant: "destructive"
      });
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (activeConversation?.id === newMessage.conversation_id) {
          setMessages(prev => [...prev, newMessage]);
        }
        fetchConversations(); // Update conversation list
      })
      .subscribe();

    // Subscribe to conversation changes
    const conversationSubscription = supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      conversationSubscription.unsubscribe();
    };
  }, [user?.id, conversations.map(c => c.id).join(','), activeConversation?.id]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    unreadCount,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markConversationAsRead,
    toggleBlockUser
  };
};