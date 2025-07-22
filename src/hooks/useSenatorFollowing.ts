import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SenatorFollower {
  id: string;
  user_id: string;
  senator_id: string;
  notification_preferences: {
    new_bills: boolean;
    ratings_change: boolean;
    activity_updates: boolean;
  };
  created_at: string;
}

export const useSenatorFollowing = (senatorId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is following senator
  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['senator-following', senatorId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase
        .from('senator_followers')
        .select('id')
        .eq('user_id', user.id)
        .eq('senator_id', senatorId)
        .maybeSingle();
        
      return !!data;
    },
    enabled: !!user && !!senatorId
  });

  // Get follower count
  const { data: followerCount } = useQuery({
    queryKey: ['senator-follower-count', senatorId],
    queryFn: async () => {
      const { count } = await supabase
        .from('senator_followers')
        .select('*', { count: 'exact', head: true })
        .eq('senator_id', senatorId);
        
      return count || 0;
    },
    enabled: !!senatorId
  });

  // Follow senator mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('senator_followers')
        .insert({
          user_id: user.id,
          senator_id: senatorId
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senator-following'] });
      queryClient.invalidateQueries({ queryKey: ['senator-follower-count'] });
      toast.success('Now following senator');
    },
    onError: (error) => {
      toast.error('Failed to follow senator');
      console.error('Follow error:', error);
    }
  });

  // Unfollow senator mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('senator_followers')
        .delete()
        .eq('user_id', user.id)
        .eq('senator_id', senatorId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senator-following'] });
      queryClient.invalidateQueries({ queryKey: ['senator-follower-count'] });
      toast.success('Unfollowed senator');
    },
    onError: (error) => {
      toast.error('Failed to unfollow senator');
      console.error('Unfollow error:', error);
    }
  });

  return {
    isFollowing,
    followerCount,
    isLoading,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowPending: followMutation.isPending,
    isUnfollowPending: unfollowMutation.isPending
  };
};

export const useSenatorNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's senator notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['senator-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('senator_notifications')
        .select(`
          *,
          senators!inner(name, profile_image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('senator_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senator-notifications'] });
    }
  });

  return {
    notifications,
    isLoading,
    markAsRead: markAsReadMutation.mutate
  };
};