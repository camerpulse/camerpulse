import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  targetUsername,
  variant = 'outline',
  size = 'sm',
  showCount = false,
  className = ''
}) => {
  const { user } = useAuth();
  const { isFollowing, loading, checking, followersCount, toggleFollow } = useFollow(targetUserId);

  // Don't show follow button for self
  if (!user || user.id === targetUserId) return null;


  if (checking) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isFollowing ? 'secondary' : variant}
        size={size}
        onClick={toggleFollow}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Follow
          </>
        )}
      </Button>
      
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
        </span>
      )}
    </div>
  );
};