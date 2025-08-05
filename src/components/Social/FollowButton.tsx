import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUsername,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Don't show follow button for self
  if (user?.id === targetUserId) return null;

  useEffect(() => {
    checkFollowStatus();
  }, [user, targetUserId]);

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
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
      className={`${className} ${isFollowing ? 'bg-primary text-primary-foreground' : ''}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? 'Suivi' : 'Suivre'}
    </Button>
  );
};