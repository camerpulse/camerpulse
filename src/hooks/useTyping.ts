import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TypingUser {
  user_id: string;
  is_typing: boolean;
  last_activity: string;
}

export const useTyping = (conversationId: string | null) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Fetch current typing users
  const fetchTypingUsers = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('conversation_typing')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_typing', true)
        .gte('last_activity', new Date(Date.now() - 30000).toISOString()) // Last 30 seconds
        .neq('user_id', user?.id || ''); // Exclude current user

      if (error) throw error;
      setTypingUsers(data || []);
    } catch (error) {
      console.error('Error fetching typing users:', error);
    }
  };

  // Start typing indicator
  const startTyping = useCallback(async () => {
    if (!conversationId || !user?.id || isTypingRef.current) return;

    isTypingRef.current = true;
    
    try {
      await supabase
        .from('conversation_typing')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: true,
          last_activity: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }, [conversationId, user?.id]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!conversationId || !user?.id || !isTypingRef.current) return;

    isTypingRef.current = false;

    try {
      await supabase
        .from('conversation_typing')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }, [conversationId, user?.id]);

  // Handle typing with automatic timeout
  const handleTyping = useCallback(() => {
    if (!conversationId || !user?.id) return;

    // Start typing if not already
    if (!isTypingRef.current) {
      startTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [conversationId, user?.id, startTyping, stopTyping]);

  // Clean up typing indicator when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, [conversationId, stopTyping]);

  // Subscribe to real-time typing updates
  useEffect(() => {
    if (!conversationId) return;

    fetchTypingUsers();

    const channel = supabase
      .channel(`conversation-typing-${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_typing',
        filter: `conversation_id=eq.${conversationId}`
      }, () => {
        fetchTypingUsers();
      })
      .subscribe();

    // Cleanup old typing indicators periodically
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase.rpc('cleanup_old_typing_indicators');
        fetchTypingUsers();
      } catch (error) {
        console.error('Error cleaning up typing indicators:', error);
      }
    }, 30000); // Every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
    };
  }, [conversationId]);

  // Get formatted typing message
  const getTypingMessage = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return 'Someone is typing...';
    if (typingUsers.length === 2) return '2 people are typing...';
    return `${typingUsers.length} people are typing...`;
  };

  return {
    typingUsers,
    isTyping: typingUsers.length > 0,
    typingMessage: getTypingMessage(),
    handleTyping,
    startTyping,
    stopTyping
  };
};