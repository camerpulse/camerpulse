import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLikePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Authentication required');

      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('pulse_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Like the post
        const { error } = await supabase
          .from('pulse_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onSuccess: (result, { postId, isLiked }) => {
      // Update the cache optimistically
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update like",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useSharePost = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      // For now, just copy to clipboard
      const postUrl = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(postUrl);
      return postUrl;
    },
    onSuccess: () => {
      toast({
        title: "Post shared!",
        description: "Link copied to clipboard",
      });
    },
    onError: () => {
      toast({
        title: "Failed to share",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    },
  });
};