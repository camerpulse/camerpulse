import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFollow = (targetUserId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);

  // Check if currently following
  const checkFollowStatus = async () => {
    if (!user || !targetUserId || user.id === targetUserId) {
      setChecking(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
      } else {
        setIsFollowing(!!data);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  // Get followers count
  const getFollowersCount = async () => {
    if (!targetUserId) return;

    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);

      if (error) {
        console.error('Error getting followers count:', error);
      } else {
        setFollowersCount(count || 0);
      }
    } catch (error) {
      console.error('Error getting followers count:', error);
    }
  };

  // Toggle follow status
  const toggleFollow = async () => {
    if (!user || !targetUserId || user.id === targetUserId) {
      toast.error('Cannot follow yourself');
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) {
          toast.error('Failed to unfollow');
          console.error('Error unfollowing:', error);
        } else {
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
          toast.success('Unfollowed successfully');
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) {
          toast.error('Failed to follow');
          console.error('Error following:', error);
        } else {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
          toast.success('Following successfully');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFollowStatus();
    getFollowersCount();
  }, [user, targetUserId]);

  return {
    isFollowing,
    loading,
    checking,
    followersCount,
    toggleFollow,
    refreshStatus: checkFollowStatus
  };
};