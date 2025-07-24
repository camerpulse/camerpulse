import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  user_id: string;
  last_activity: string;
}

export const useTypingIndicator = (conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const setTypingStatus = useCallback(async (typing: boolean) => {
    try {
      const { error } = await supabase.rpc('set_typing_indicator', {
        p_conversation_id: conversationId,
        p_is_typing: typing
      });

      if (error) throw error;
      setIsTyping(typing);
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }, [conversationId]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
    }, 3000);
  }, [isTyping, setTypingStatus]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTypingStatus(false);
  }, [setTypingStatus]);

  useEffect(() => {
    // Load initial typing indicators
    const loadTypingUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_typing')
          .select('user_id, last_activity')
          .eq('conversation_id', conversationId);

        if (error) throw error;
        setTypingUsers(data || []);
      } catch (error) {
        console.error('Error loading typing users:', error);
      }
    };

    loadTypingUsers();

    // Subscribe to typing changes
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_typing',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const typingUser = payload.new as TypingUser;
            setTypingUsers(prev => {
              const filtered = prev.filter(user => user.user_id !== typingUser.user_id);
              return [...filtered, typingUser];
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedUser = payload.old as TypingUser;
            setTypingUsers(prev => prev.filter(user => user.user_id !== deletedUser.user_id));
          }
        }
      )
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTypingStatus(false);
      supabase.removeChannel(channel);
    };
  }, [conversationId, setTypingStatus]);

  return {
    typingUsers,
    isTyping,
    handleTyping,
    stopTyping
  };
};