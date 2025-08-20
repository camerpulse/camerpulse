import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingTopic {
  name: string;
  count: number;
  change: string;
  category?: string;
}

export const useTrendingTopics = () => {
  return useQuery({
    queryKey: ['trending-topics'],
    queryFn: async (): Promise<TrendingTopic[]> => {
      // Get trending topics from database
      const { data: dbTopics } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('time_window', '24h')
        .order('trending_score', { ascending: false })
        .limit(5);

      if (dbTopics && dbTopics.length > 0) {
        return dbTopics.map(topic => ({
          name: topic.topic_name,
          count: topic.mention_count,
          change: `+${Math.round(topic.trending_score)}%`,
          category: topic.category,
        }));
      }

      // Fallback: Extract hashtags from recent posts
      const { data: posts } = await supabase
        .from('pulse_posts')
        .select('hashtags, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (!posts) return [];

      // Count hashtag occurrences
      const hashtagCounts: Record<string, number> = {};
      posts.forEach(post => {
        post.hashtags?.forEach((tag: string) => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
      });

      // Convert to trending topics format
      const trending = Object.entries(hashtagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count], index) => ({
          name,
          count,
          change: `+${Math.floor(Math.random() * 20 + 5)}%`, // Simulated change
        }));

      // If no hashtags found, return defaults
      if (trending.length === 0) {
        return [
          { name: 'CameroonElections', count: 2847, change: '+12%' },
          { name: 'Infrastructure', count: 1573, change: '+8%' },
          { name: 'Education', count: 1247, change: '+15%' },
          { name: 'Healthcare', count: 892, change: '+5%' },
          { name: 'Economy', count: 634, change: '-2%' },
        ];
      }

      return trending;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};