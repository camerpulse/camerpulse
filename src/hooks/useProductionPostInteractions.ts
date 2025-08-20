import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useProductionLikePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) {
        throw new Error('You must be logged in to like posts');
      }

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('pulse_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { liked: false };
      } else {
        // Add like
        const { error } = await supabase
          .from('pulse_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
        return { liked: true };
      }
    },
    onSuccess: (data, variables) => {
      // Update the feed cache optimistically
      queryClient.setQueryData(['production-feed', user?.id], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) => {
              if (item.original_id === variables.postId && item.type === 'pulse_post') {
                return {
                  ...item,
                  engagement: {
                    ...item.engagement,
                    likes: data.liked 
                      ? item.engagement.likes + 1 
                      : Math.max(0, item.engagement.likes - 1),
                    user_has_liked: data.liked,
                  },
                };
              }
              return item;
            }),
          })),
        };
      });

      // Show success message
      toast({
        title: data.liked ? "Post liked!" : "Like removed",
        description: data.liked 
          ? "You liked this post" 
          : "You unliked this post",
      });
    },
    onError: (error) => {
      console.error('Like error:', error);
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Failed to update like status",
        variant: "destructive",
      });
    },
  });
};

export const useProductionSharePost = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: string) => {
      // For now, just copy to clipboard
      const url = `${window.location.origin}/post/${itemId.split('-')[1]}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on CamerPulse',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      
      return { shared: true };
    },
    onSuccess: () => {
      toast({
        title: "Shared successfully!",
        description: "Post link copied to clipboard",
      });
    },
    onError: (error) => {
      console.error('Share error:', error);
      toast({
        title: "Share failed",
        description: "Unable to share this post",
        variant: "destructive",
      });
    },
  });
};