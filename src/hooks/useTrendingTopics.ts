import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingTopic {
  id: string;
  topic_name: string;
  mention_count: number;
  engagement_count: number;
  trending_score: number;
  category: string;
  time_window: string;
  created_at: string;
}

export const useTrendingTopics = (limit = 10) => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('trending_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setTrendingTopics(data || []);
    } catch (err) {
      console.error('Error fetching trending topics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, [limit]);

  return {
    trendingTopics,
    loading,
    error,
    refresh: fetchTrendingTopics
  };
};