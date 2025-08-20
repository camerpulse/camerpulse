import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Post } from './usePosts';

type InteractionType = 'like' | 'dislike' | 'share' | 'bookmark' | 'report';

export const useTogglePostInteraction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, interactionType }: { postId: string, interactionType: InteractionType }) => {
      if (!user) throw new Error('Authentication required');

      // Check if interaction already exists
      const { data: existingInteraction, error: checkError } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('interaction_type', interactionType)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingInteraction) {
        // Remove interaction
        const { error: deleteError } = await supabase
          .from('post_interactions')
          .delete()
          .eq('id', existingInteraction.id);

        if (deleteError) throw deleteError;
        return { action: 'removed', interactionType };
      } else {
        // Add interaction
        const { error: insertError } = await supabase
          .from('post_interactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            interaction_type: interactionType,
          });

        if (insertError) throw insertError;
        return { action: 'added', interactionType };
      }
    },
    onMutate: async ({ postId, interactionType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts', 20, 0, user?.id]) as Post[] | undefined;

      // Optimistically update
      if (previousPosts) {
        const updatedPosts = previousPosts.map(post => {
          if (post.id === postId) {
            const updatedPost = { ...post };
            
            switch (interactionType) {
              case 'like':
                if (post.user_has_liked) {
                  updatedPost.like_count = Math.max(0, (post.like_count || 0) - 1);
                  updatedPost.user_has_liked = false;
                } else {
                  updatedPost.like_count = (post.like_count || 0) + 1;
                  updatedPost.user_has_liked = true;
                }
                break;
              case 'share':
                if (post.user_has_shared) {
                  updatedPost.share_count = Math.max(0, (post.share_count || 0) - 1);
                  updatedPost.user_has_shared = false;
                } else {
                  updatedPost.share_count = (post.share_count || 0) + 1;
                  updatedPost.user_has_shared = true;
                }
                break;
              case 'bookmark':
                updatedPost.user_has_bookmarked = !post.user_has_bookmarked;
                break;
            }
            
            return updatedPost;
          }
          return post;
        });

        queryClient.setQueryData(['posts', 20, 0, user?.id], updatedPosts);
      }

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Revert the optimistic update
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', 20, 0, user?.id], context.previousPosts);
      }

      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
    onSuccess: (result, { interactionType }) => {
      const actionText = result.action === 'added' ? 'added' : 'removed';
      const interactionText = interactionType === 'like' ? 'like' : 
                             interactionType === 'share' ? 'share' : 
                             interactionType === 'bookmark' ? 'bookmark' : interactionType;

      toast({
        title: `${actionText === 'added' ? 'Added' : 'Removed'} ${interactionText}`,
        description: `You ${actionText} a ${interactionText} on this post.`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is correct
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useSharePost = () => {
  const toggleInteraction = useTogglePostInteraction();
  
  return useMutation({
    mutationFn: async ({ postId, post }: { postId: string, post: Post }) => {
      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${post.profiles?.display_name || 'CamerPulse User'}'s Post`,
            text: post.content.slice(0, 120) + (post.content.length > 120 ? '...' : ''),
            url: `${window.location.origin}/feed?post=${postId}`,
          });
          
          // Track the share interaction
          await toggleInteraction.mutateAsync({ postId, interactionType: 'share' });
          return { method: 'native' };
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            throw error;
          }
          // User cancelled, don't track interaction
          return { method: 'cancelled' };
        }
      }

      // Fallback to clipboard
      const shareUrl = `${window.location.origin}/feed?post=${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // Track the share interaction
      await toggleInteraction.mutateAsync({ postId, interactionType: 'share' });
      return { method: 'clipboard' };
    },
    onSuccess: (result) => {
      if (result.method === 'clipboard') {
        toast({
          title: "Link copied!",
          description: "Post link has been copied to your clipboard.",
        });
      } else if (result.method === 'native') {
        toast({
          title: "Post shared!",
          description: "Thanks for sharing this civic content.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Could not share this post",
        variant: "destructive",
      });
    },
  });
};