import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiscussionMessage {
  id: string;
  discussion_id: string;
  user_id: string;
  parent_message_id: string | null;
  content: string;
  message_type: string;
  attachments: any;
  reactions: any;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
}

export const useRealTimeDiscussions = (villageId: string, discussionId?: string) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connectWebSocket = () => {
    if (!villageId) return;

    const wsUrl = `wss://wsiorhtiovwcajiarydw.functions.supabase.co/village-chat-websocket?village_id=${villageId}&user_id=${Math.random().toString(36)}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to village chat');
      setIsConnected(true);
      
      // Request recent messages
      wsRef.current?.send(JSON.stringify({
        type: 'get_recent_messages'
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from village chat');
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (villageId) connectWebSocket();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'welcome':
        console.log('Welcome message received');
        break;
      case 'new_message':
        setMessages(prev => [data.message, ...prev]);
        break;
      case 'user_typing':
        if (data.typing) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
        break;
      case 'recent_messages':
        setMessages(data.messages || []);
        setLoading(false);
        break;
      case 'error':
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
        break;
    }
  };

  const sendMessage = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection Error",
        description: "Not connected to chat. Please try again.",
        variant: "destructive",
      });
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      content: content.trim()
    }));
  };

  const sendTypingStart = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing_start'
      }));
    }
  };

  const sendTypingStop = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing_stop'
      }));
    }
  };

  const fetchDiscussionMessages = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('village_discussion_messages')
        .select('*')
        .eq('discussion_id', discussionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching discussion messages:', error);
      toast({
        title: "Error",
        description: "Failed to load discussion messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const postDiscussionMessage = async (discussionId: string, content: string, parentMessageId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to post messages",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('village_discussion_messages')
        .insert([{
          discussion_id: discussionId,
          user_id: user.id,
          content: content.trim(),
          parent_message_id: parentMessageId || null,
        }]);

      if (error) throw error;

      // Refresh messages
      await fetchDiscussionMessages(discussionId);
      return true;
    } catch (error) {
      console.error('Error posting message:', error);
      toast({
        title: "Error",
        description: "Failed to post message",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (villageId && !discussionId) {
      connectWebSocket();
    } else if (discussionId) {
      fetchDiscussionMessages(discussionId);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [villageId, discussionId]);

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    isConnected,
    loading,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    postDiscussionMessage,
    refetch: discussionId ? () => fetchDiscussionMessages(discussionId) : () => {},
  };
};