import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_emoji: string;
  created_at: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: string[];
  hasUserReacted: boolean;
}

export const useMessageReactions = (messageId: string) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [reactionSummary, setReactionSummary] = useState<ReactionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch reactions for a message
  const fetchReactions = async () => {
    if (!messageId) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setReactions(data || []);
      
      // Create reaction summary
      const summary = createReactionSummary(data || []);
      setReactionSummary(summary);
    } catch (error: any) {
      console.error('Error fetching reactions:', error);
    }
  };

  // Create reaction summary from raw reactions
  const createReactionSummary = (rawReactions: MessageReaction[]): ReactionSummary[] => {
    const emojiMap = new Map<string, { count: number; users: string[]; hasUserReacted: boolean }>();

    rawReactions.forEach(reaction => {
      const existing = emojiMap.get(reaction.reaction_emoji) || { 
        count: 0, 
        users: [], 
        hasUserReacted: false 
      };
      
      existing.count++;
      existing.users.push(reaction.user_id);
      if (reaction.user_id === user?.id) {
        existing.hasUserReacted = true;
      }
      
      emojiMap.set(reaction.reaction_emoji, existing);
    });

    return Array.from(emojiMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      users: data.users,
      hasUserReacted: data.hasUserReacted
    }));
  };

  // Add or remove reaction
  const toggleReaction = async (emoji: string) => {
    if (!user?.id || !messageId) return;

    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.reaction_emoji === emoji
    );

    setLoading(true);
    try {
      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_emoji: emoji
          });

        if (error) throw error;
      }

      // Refresh reactions
      await fetchReactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update reaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time reaction updates
  useEffect(() => {
    if (!messageId) return;

    fetchReactions();

    const channel = supabase
      .channel(`message-reactions-${messageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
        filter: `message_id=eq.${messageId}`
      }, () => {
        fetchReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  return {
    reactions,
    reactionSummary,
    loading,
    toggleReaction
  };
};