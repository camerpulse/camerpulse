import React from 'react';
import { Star } from 'lucide-react';
import type { UnifiedProfile } from '@/hooks/useUnifiedProfile';

interface ProfileStatsProps {
  profile: UnifiedProfile;
  formatNumber: (num: number) => string;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  profile,
  formatNumber
}) => {
  return (
    <div className="flex items-center gap-6 mt-4 pt-4 border-t">
      <div className="text-center">
        <div className="font-bold text-lg">{formatNumber(profile.posts_count || 0)}</div>
        <div className="text-sm text-muted-foreground">Posts</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{formatNumber(profile.followers_count || 0)}</div>
        <div className="text-sm text-muted-foreground">Followers</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{formatNumber(profile.following_count || 0)}</div>
        <div className="text-sm text-muted-foreground">Following</div>
      </div>
      {profile.civic_influence_score && (
        <div className="text-center">
          <div className="font-bold text-lg flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            {profile.civic_influence_score}
          </div>
          <div className="text-sm text-muted-foreground">Civic Score</div>
        </div>
      )}
      {profile.profile_completion_score && (
        <div className="text-center">
          <div className="font-bold text-lg">{profile.profile_completion_score}%</div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      )}
    </div>
  );
};