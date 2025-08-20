import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from './usePosts';

// Realtime sync for posts, interactions, and comments
export const useFeedRealtime = (limit = 20, offset = 0) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('public:realtime-feed');

    // Helper: update a single post in cache
    const updatePostInCache = (postId: string, updater: (p: Post) => Post) => {
      queryClient.setQueryData(['posts', limit, offset, user?.id], (old: Post[] | undefined) => {
        if (!old) return old;
        return old.map(p => (p.id === postId ? updater(p) : p));
      });
    };

    // Posts changes -> keep it simple and reliable: invalidate
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (_payload) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    });

    // Interactions -> adjust counts optimistically in cache
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_interactions' }, (payload: any) => {
      const interaction = payload.new as { post_id: string; interaction_type: string; user_id: string };
      if (!interaction?.post_id) return;

      updatePostInCache(interaction.post_id, (p) => {
        const updated: Post = { ...p };
        if (interaction.interaction_type === 'like') {
          updated.like_count = (p.like_count || 0) + 1;
          if (interaction.user_id === user?.id) updated.user_has_liked = true;
        } else if (interaction.interaction_type === 'share') {
          updated.share_count = (p.share_count || 0) + 1;
          if (interaction.user_id === user?.id) updated.user_has_shared = true;
        } else if (interaction.interaction_type === 'bookmark') {
          if (interaction.user_id === user?.id) updated.user_has_bookmarked = true;
        }
        return updated;
      });
    });

    channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_interactions' }, (payload: any) => {
      const interaction = payload.old as { post_id: string; interaction_type: string; user_id: string };
      if (!interaction?.post_id) return;

      updatePostInCache(interaction.post_id, (p) => {
        const updated: Post = { ...p };
        if (interaction.interaction_type === 'like') {
          updated.like_count = Math.max(0, (p.like_count || 0) - 1);
          if (interaction.user_id === user?.id) updated.user_has_liked = false;
        } else if (interaction.interaction_type === 'share') {
          updated.share_count = Math.max(0, (p.share_count || 0) - 1);
          if (interaction.user_id === user?.id) updated.user_has_shared = false;
        } else if (interaction.interaction_type === 'bookmark') {
          if (interaction.user_id === user?.id) updated.user_has_bookmarked = false;
        }
        return updated;
      });
    });

    // Comments -> keep counts fresh and invalidate detailed thread
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload: any) => {
      const c = payload.new as { post_id: string };
      if (!c?.post_id) return;
      updatePostInCache(c.post_id, (p) => ({ ...p, comment_count: (p.comment_count || 0) + 1 }));
      queryClient.invalidateQueries({ queryKey: ['comments', c.post_id] });
    });

    channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, (payload: any) => {
      const c = payload.old as { post_id: string };
      if (!c?.post_id) return;
      updatePostInCache(c.post_id, (p) => ({ ...p, comment_count: Math.max(0, (p.comment_count || 0) - 1) }));
      queryClient.invalidateQueries({ queryKey: ['comments', c.post_id] });
    });

    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comments' }, (payload: any) => {
      const c = (payload.new || payload.old) as { post_id: string };
      if (!c?.post_id) return;
      queryClient.invalidateQueries({ queryKey: ['comments', c.post_id] });
    });

    const sub = channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit, offset, queryClient, user?.id]);
};
