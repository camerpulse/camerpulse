import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type FeedAlgorithm = 'chronological' | 'recommended' | 'following' | 'trending';

export interface FeedAlgorithmConfig {
  type: FeedAlgorithm;
  name: string;
  description: string;
  icon: string;
}

export const FEED_ALGORITHMS: FeedAlgorithmConfig[] = [
  {
    type: 'recommended',
    name: 'For You',
    description: 'Personalized content based on your interests and activity',
    icon: '🎯'
  },
  {
    type: 'following',
    name: 'Following',
    description: 'Posts from people and organizations you follow',
    icon: '👥'
  },
  {
    type: 'trending',
    name: 'Trending',
    description: 'Most popular content in your region and interests',
    icon: '📈'
  },
  {
    type: 'chronological',
    name: 'Latest',
    description: 'Most recent posts in chronological order',
    icon: '⏰'
  }
];

export const usePersonalizedFeedScore = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personalized-feed-score', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's interaction patterns
      const { data: interactions } = await supabase
        .from('pulse_post_likes')
        .select(`
          post_id,
          pulse_posts (
            hashtags,
            user_id,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .limit(100);

      // Get user's following list
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      // Get user's bookmarks
      const { data: bookmarks } = await supabase
        .from('pulse_post_bookmarks')
        .select(`
          post_id,
          pulse_posts (
            hashtags,
            user_id
          )
        `)
        .eq('user_id', user.id);

      // Calculate interest scores
      const interestScores: Record<string, number> = {};
      const authorScores: Record<string, number> = {};

      // Score based on likes
      interactions?.forEach(interaction => {
        if (interaction.pulse_posts) {
          // Score hashtags
          interaction.pulse_posts.hashtags?.forEach((tag: string) => {
            interestScores[tag] = (interestScores[tag] || 0) + 1;
          });
          
          // Score authors
          if (interaction.pulse_posts.user_id) {
            authorScores[interaction.pulse_posts.user_id] = 
              (authorScores[interaction.pulse_posts.user_id] || 0) + 2;
          }
        }
      });

      // Score based on bookmarks (higher weight)
      bookmarks?.forEach(bookmark => {
        if (bookmark.pulse_posts) {
          bookmark.pulse_posts.hashtags?.forEach((tag: string) => {
            interestScores[tag] = (interestScores[tag] || 0) + 3;
          });
          
          if (bookmark.pulse_posts.user_id) {
            authorScores[bookmark.pulse_posts.user_id] = 
              (authorScores[bookmark.pulse_posts.user_id] || 0) + 5;
          }
        }
      });

      // Score followed users highly
      following?.forEach(follow => {
        authorScores[follow.following_id] = 
          (authorScores[follow.following_id] || 0) + 10;
      });

      return {
        interestScores,
        authorScores,
        followingIds: following?.map(f => f.following_id) || []
      };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const calculatePostScore = (
  post: any,
  userPreferences: {
    interestScores: Record<string, number>;
    authorScores: Record<string, number>;
    followingIds: string[];
  }
) => {
  let score = 0;
  
  // Base recency score (newer posts get higher scores)
  const ageInHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - ageInHours * 2); // Decays over time
  score += recencyScore * 0.3;

  // Author score
  if (post.user_id && userPreferences.authorScores[post.user_id]) {
    score += userPreferences.authorScores[post.user_id] * 5;
  }

  // Following bonus
  if (post.user_id && userPreferences.followingIds.includes(post.user_id)) {
    score += 50;
  }

  // Hashtag interest score
  if (post.hashtags && Array.isArray(post.hashtags)) {
    post.hashtags.forEach((tag: string) => {
      if (userPreferences.interestScores[tag]) {
        score += userPreferences.interestScores[tag] * 3;
      }
    });
  }

  // Engagement score
  const engagementScore = (post.likes_count || 0) * 2 + 
                         (post.comments_count || 0) * 3 + 
                         (post.shares_count || 0) * 4;
  score += Math.min(engagementScore, 100) * 0.4; // Cap engagement influence

  // Location relevance (if user has location data)
  if (post.location && userPreferences.authorScores) {
    // Basic location matching could be implemented here
    score += 10;
  }

  return Math.round(score);
};

export const useTrendingTopics = (limit: number = 10) => {
  return useQuery({
    queryKey: ['trending-topics', limit],
    queryFn: async () => {
      // Get trending hashtags from recent posts
      const { data: posts } = await supabase
        .from('pulse_posts')
        .select('hashtags, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const hashtagCounts: Record<string, number> = {};
      
      posts?.forEach(post => {
        if (post.hashtags && Array.isArray(post.hashtags)) {
          post.hashtags.forEach((tag: string) => {
            if (tag && typeof tag === 'string') {
              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            }
          });
        }
      });

      return Object.entries(hashtagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};