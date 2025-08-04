/**
 * FollowButton Component
 * 
 * Unified follow/unfollow button that integrates with CamerPulse Design System
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { ComponentSize, ComponentVariant } from './types';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showCount?: boolean;
  followersCount?: number;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUsername,
  variant = 'outline',
  size = 'sm',
  className = '',
  showCount = false,
  followersCount = 0
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentFollowersCount, setCurrentFollowersCount] = useState(followersCount);

  // Don't show follow button for self
  if (user?.id === targetUserId) return null;

  useEffect(() => {
    checkFollowStatus();
  }, [user, targetUserId]);

  useEffect(() => {
    setCurrentFollowersCount(followersCount);
  }, [followersCount]);

  const checkFollowStatus = async () => {
    if (!user) {
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

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour suivre d'autres utilisateurs",
        variant: "destructive"
      });
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

        if (error) throw error;

        setIsFollowing(false);
        if (showCount) {
          setCurrentFollowersCount(prev => Math.max(0, prev - 1));
        }
        
        toast({
          title: "Désabonné",
          description: targetUsername 
            ? `Vous ne suivez plus @${targetUsername}` 
            : "Vous ne suivez plus cet utilisateur"
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        if (showCount) {
          setCurrentFollowersCount(prev => prev + 1);
        }
        
        toast({
          title: "Abonné",
          description: targetUsername 
            ? `Vous suivez maintenant @${targetUsername}` 
            : "Vous suivez maintenant cet utilisateur"
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de suivi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {showCount && <span className="ml-2">{currentFollowersCount}</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
      className={`transition-all duration-200 ${className} ${
        isFollowing ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? 'Suivi' : 'Suivre'}
      {showCount && (
        <span className="ml-2 px-2 py-1 bg-muted rounded-full text-xs">
          {currentFollowersCount}
        </span>
      )}
    </Button>
  );
};