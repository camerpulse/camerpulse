import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Users, Star, MapPin, Briefcase, TrendingUp, UserPlus } from 'lucide-react';

interface RecommendedProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  profile_type: string;
  verification_status: string;
  civic_influence_score: number;
  location?: string;
  region?: string;
  profession?: string;
  is_verified: boolean;
  similarity_score?: number;
  recommendation_reason?: string;
}

interface ProfileRecommendationsProps {
  userId: string;
  profileType: string;
  region?: string;
  profession?: string;
  limit?: number;
}

export const ProfileRecommendations: React.FC<ProfileRecommendationsProps> = ({
  userId,
  profileType,
  region,
  profession,
  limit = 6
}) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, profileType, region, profession]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get users already being followed to exclude them
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const followingIds = following?.map(f => f.following_id) || [];
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          bio,
          avatar_url,
          profile_type,
          verification_status,
          civic_influence_score,
          location,
          region,
          profession,
          verified
        `)
        .neq('user_id', userId) // Exclude self
        .limit(limit * 2); // Get more to filter out followed users

      // Exclude already followed users
      if (followingIds.length > 0) {
        query = query.not('user_id', 'in', `(${followingIds.join(',')})`);
      }

      const { data: allProfiles, error } = await query;
      if (error) throw error;

      // Calculate recommendations with scoring
      const recommendations = (allProfiles || [])
        .map(profile => {
          let score = 0;
          let reasons: string[] = [];

          // Same profile type gets higher score
          if (profile.profile_type === profileType) {
            score += 30;
            reasons.push('Same profile type');
          }

          // Same region gets bonus
          if (region && profile.region === region) {
            score += 25;
            reasons.push('Same region');
          }

          // Same profession gets bonus
          if (profession && profile.profession === profession) {
            score += 20;
            reasons.push('Same profession');
          }

          // Verified profiles get bonus
          if (profile.verified) {
            score += 15;
            reasons.push('Verified profile');
          }

          // High civic influence gets bonus
          if (profile.civic_influence_score > 500) {
            score += 10;
            reasons.push('High influence score');
          }

          // Profile completeness (has bio, profession, etc.)
          let completeness = 0;
          if (profile.bio) completeness += 5;
          if (profile.profession) completeness += 5;
          if (profile.location) completeness += 5;
          if (profile.avatar_url) completeness += 5;
          score += completeness;

          return {
            ...profile,
            is_verified: profile.verified,
            similarity_score: score,
            recommendation_reason: reasons.join(', ') || 'Suggested for you'
          };
        })
        .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
        .slice(0, limit);

      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (profile: RecommendedProfile) => {
    navigate(profile.username ? `/profile/${profile.username}` : `/u/${profile.user_id}`);
  };

  const handleFollowClick = async (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: userId,
          following_id: profileId
        });

      if (error) throw error;

      // Remove from recommendations after following
      setRecommendations(prev => prev.filter(p => p.user_id !== profileId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const getProfileTypeDisplay = (type: string) => {
    const types: { [key: string]: { label: string; color: string } } = {
      normal_user: { label: 'Citizen', color: 'bg-blue-100 text-blue-800' },
      politician: { label: 'Politician', color: 'bg-purple-100 text-purple-800' },
      political_party: { label: 'Political Party', color: 'bg-red-100 text-red-800' },
      artist: { label: 'Artist', color: 'bg-pink-100 text-pink-800' },
      company: { label: 'Company', color: 'bg-green-100 text-green-800' },
      government_institution: { label: 'Government', color: 'bg-blue-100 text-blue-800' },
      journalist: { label: 'Journalist', color: 'bg-yellow-100 text-yellow-800' },
      activist: { label: 'Activist', color: 'bg-orange-100 text-orange-800' }
    };
    return types[type] || types.normal_user;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recommended Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recommended Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available at the moment</p>
            <p className="text-sm mt-2">Check back later for suggested profiles to follow</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Recommended Profiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((profile) => {
            const typeDisplay = getProfileTypeDisplay(profile.profile_type);
            
            return (
              <div
                key={profile.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleProfileClick(profile)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>
                      {profile.display_name?.[0] || profile.username[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {profile.display_name || profile.username}
                      </span>
                      {profile.is_verified && (
                        <Star className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      @{profile.username}
                    </p>

                    <Badge className={`text-xs mb-2 ${typeDisplay.color}`}>
                      {typeDisplay.label}
                    </Badge>

                    {profile.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.profession && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{profile.profession}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        <span>{profile.civic_influence_score}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {profile.recommendation_reason}
                    </p>

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => handleFollowClick(e, profile.user_id)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};