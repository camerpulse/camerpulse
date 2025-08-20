import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Enhanced post interactions with bookmarking, full like system, and more
export const useBookmarkPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('Authentication required');

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('pulse_post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'unbookmarked' };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('pulse_post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
        return { action: 'bookmarked' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['production-feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: result.action === 'bookmarked' ? "Post bookmarked!" : "Bookmark removed",
        description: result.action === 'bookmarked' 
          ? "Added to your saved posts" 
          : "Removed from your saved posts",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to toggle bookmark",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useFollowUser = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('Authentication required');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        return { action: 'unfollowed' };
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error) throw error;
        return { action: 'followed' };
      }
    },
    onSuccess: (result, { targetUserId }) => {
      queryClient.invalidateQueries({ queryKey: ['suggested-follows'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', targetUserId] });
      toast({
        title: result.action === 'followed' ? "Following!" : "Unfollowed",
        description: result.action === 'followed' 
          ? "You'll see their posts in your feed" 
          : "You won't see their posts in your feed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update follow status",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const usePulsePost = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isPulsed }: { postId: string; isPulsed: boolean }) => {
      if (!user) throw new Error('Authentication required');

      if (isPulsed) {
        // Remove pulse (repost)
        const { error } = await supabase
          .from('pulse_post_reposts')
          .delete()
          .eq('original_post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'unpulsed' };
      } else {
        // Add pulse (repost)
        const { error } = await supabase
          .from('pulse_post_reposts')
          .insert({
            original_post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;
        return { action: 'pulsed' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['production-feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: result.action === 'pulsed' ? "Pulsed!" : "Pulse removed",
        description: result.action === 'pulsed' 
          ? "Shared to your timeline" 
          : "Removed from your timeline",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to pulse post",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};

export const useReportPost = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, reason, description }: { 
      postId: string; 
      reason: string; 
      description?: string;
    }) => {
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason,
          description,
        });

      if (error) throw error;
      return { reported: true };
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review this report.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
};