import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  participants: {
    user_id: string;
    joined_at: string;
    role: string;
    profile?: {
      username: string;
      display_name: string;
      avatar_url?: string;
    };
  }[];
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner (
            user_id,
            joined_at,
            role,
            profiles (
              username,
              display_name,
              avatar_url
            )
          ),
          messages (
            id,
            content,
            sender_id,
            created_at
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const formattedConversations: Conversation[] = data?.map(conv => ({
        id: conv.id,
        type: conv.is_group ? 'group' : 'direct',
        name: conv.title,
        description: conv.description,
        created_by: conv.created_by,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message_at: conv.last_message_at,
        participants: conv.conversation_participants.map((p: any) => ({
          user_id: p.user_id,
          joined_at: p.joined_at,
          role: p.role,
          profile: p.profiles
        })),
        last_message: conv.messages?.[0] ? {
          id: conv.messages[0].id,
          content: conv.messages[0].content,
          sender_id: conv.messages[0].sender_id,
          created_at: conv.messages[0].created_at
        } : undefined
      })) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!user) return null;

    try {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: type === 'group',
          title: name,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants including creator
      const allParticipants = [user.id, ...participantIds.filter(id => id !== user.id)];
      const participantInserts = allParticipants.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts);

      if (participantError) throw participantError;

      await fetchConversations();
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  const startDirectMessage = async (targetUserId: string) => {
    if (!user) return null;

    try {
      // Check if direct conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner (user_id)
        `)
        .eq('is_group', false)
        .eq('conversation_participants.user_id', user.id);

      // Find conversation where both users are participants
      const existingConv = existing?.find(conv => 
        conv.conversation_participants.some(p => p.user_id === targetUserId) &&
        conv.conversation_participants.length === 2
      );

      if (existingConv) {
        return existingConv.id;
      }

      // Create new direct conversation
      return await createConversation([targetUserId], 'direct');
    } catch (error) {
      console.error('Error starting direct message:', error);
      toast.error('Failed to start conversation');
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();

    // Set up realtime subscription
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants'
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    startDirectMessage
  };
};