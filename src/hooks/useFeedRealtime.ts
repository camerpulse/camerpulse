import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from './usePosts';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PostInteraction {
  post_id: string;
  interaction_type: 'like' | 'share' | 'bookmark' | 'report';
  user_id: string;
}

interface Comment {
  post_id: string;
}

// Production-ready realtime sync for posts, interactions, and comments
export const useFeedRealtime = (limit = 20, offset = 0) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;
    
    // Create unique channel
    const channelName = `feed-realtime-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase.channel(channelName);
    channelRef.current = channel;

    // Helper: safely update post in cache with debouncing
    const updatePostInCache = (postId: string, updater: (p: Post) => Post) => {
      if (!mountedRef.current) return;
      
      const queryKey = ['posts', limit, offset, user?.id];
      queryClient.setQueryData(queryKey, (old: Post[] | undefined) => {
        if (!old) return old;
        return old.map(p => (p.id === postId ? updater(p) : p));
      });
    };

    // Posts changes -> invalidate to ensure consistency
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        if (!mountedRef.current) return;
        
        try {
          // Invalidate posts to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        } catch (error) {
          console.warn('[Realtime] Error handling post changes:', error);
        }
      }
    );

    // Interactions -> optimistic updates with type safety
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'post_interactions' },
      (payload) => {
        if (!mountedRef.current) return;
        
        try {
          const interaction = payload.new as PostInteraction;
          if (!interaction?.post_id) return;

          updatePostInCache(interaction.post_id, (p) => {
            const updated: Post = { ...p };
            
            switch (interaction.interaction_type) {
              case 'like':
                updated.like_count = (p.like_count || 0) + 1;
                if (interaction.user_id === user?.id) updated.user_has_liked = true;
                break;
              case 'share':
                updated.share_count = (p.share_count || 0) + 1;
                if (interaction.user_id === user?.id) updated.user_has_shared = true;
                break;
              case 'bookmark':
                if (interaction.user_id === user?.id) updated.user_has_bookmarked = true;
                break;
            }
            
            return updated;
          });
        } catch (error) {
          console.warn('[Realtime] Error handling interaction insert:', error);
        }
      }
    );

    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'post_interactions' },
      (payload) => {
        if (!mountedRef.current) return;
        
        try {
          const interaction = payload.old as PostInteraction;
          if (!interaction?.post_id) return;

          updatePostInCache(interaction.post_id, (p) => {
            const updated: Post = { ...p };
            
            switch (interaction.interaction_type) {
              case 'like':
                updated.like_count = Math.max(0, (p.like_count || 0) - 1);
                if (interaction.user_id === user?.id) updated.user_has_liked = false;
                break;
              case 'share':
                updated.share_count = Math.max(0, (p.share_count || 0) - 1);
                if (interaction.user_id === user?.id) updated.user_has_shared = false;
                break;
              case 'bookmark':
                if (interaction.user_id === user?.id) updated.user_has_bookmarked = false;
                break;
            }
            
            return updated;
          });
        } catch (error) {
          console.warn('[Realtime] Error handling interaction delete:', error);
        }
      }
    );

    // Comments -> update counts and invalidate comment threads
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'comments' },
      (payload) => {
        if (!mountedRef.current) return;
        
        try {
          const comment = payload.new as Comment;
          if (!comment?.post_id) return;
          
          updatePostInCache(comment.post_id, (p) => ({ 
            ...p, 
            comment_count: (p.comment_count || 0) + 1 
          }));
          
          queryClient.invalidateQueries({ queryKey: ['comments', comment.post_id] });
        } catch (error) {
          console.warn('[Realtime] Error handling comment insert:', error);
        }
      }
    );

    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'comments' },
      (payload) => {
        if (!mountedRef.current) return;
        
        try {
          const comment = payload.old as Comment;
          if (!comment?.post_id) return;
          
          updatePostInCache(comment.post_id, (p) => ({ 
            ...p, 
            comment_count: Math.max(0, (p.comment_count || 0) - 1) 
          }));
          
          queryClient.invalidateQueries({ queryKey: ['comments', comment.post_id] });
        } catch (error) {
          console.warn('[Realtime] Error handling comment delete:', error);
        }
      }
    );

    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'comments' },
      (payload) => {
        if (!mountedRef.current) return;
        
        try {
          const comment = (payload.new || payload.old) as Comment;
          if (!comment?.post_id) return;
          
          queryClient.invalidateQueries({ queryKey: ['comments', comment.post_id] });
        } catch (error) {
          console.warn('[Realtime] Error handling comment update:', error);
        }
      }
    );

    // Subscribe with error handling
    const subscription = channel.subscribe((status) => {
      if (!mountedRef.current) return;
      
      if (status === 'SUBSCRIBED') {
        console.info('[Realtime] Feed realtime connected');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Realtime] Feed realtime connection error');
      } else if (status === 'TIMED_OUT') {
        console.warn('[Realtime] Feed realtime connection timed out');
      }
    });

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [limit, offset, queryClient, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
};
