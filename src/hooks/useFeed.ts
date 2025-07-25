import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeedItem {
  id: string;
  item_type: string;
  title?: string | null;
  content: string;
  tags?: string[] | null;
  priority: string | null;
  category: string | null;
  created_at: string;
  author_id: string | null;
  engagement_score?: number;
  metadata?: any;
  // Engagement data from joined table
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
}

export const useFeed = (limit = 20) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('feed_items')
        .select(`
          *,
          engagement:feed_engagement!inner(
            likes_count:engagement_type.count(),
            views_count:engagement_type.count()
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Process the data to flatten engagement metrics
      const processedItems = data?.map(item => ({
        ...item,
        likes_count: 0,
        comments_count: 0, 
        shares_count: 0,
        views_count: 0,
        // Add default engagement for demo
        engagement_score: Math.random() * 100
      })) || [];

      setFeedItems(processedItems);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  };

  const createFeedItem = async (itemData: {
    item_type: string;
    title?: string;
    content: string;
    tags?: string[];
    priority?: string;
    category: string;
    metadata?: any;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feed_items')
        .insert([{
          ...itemData,
          author_id: userData.user?.id,
          priority: itemData.priority || 'medium'
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setFeedItems(prev => [data as FeedItem, ...prev]);
      
      return { success: true, data };
    } catch (err) {
      console.error('Error creating feed item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create post' 
      };
    }
  };

  const engageWithItem = async (itemId: string, engagementType: 'like' | 'view' | 'share' | 'comment') => {
    try {
      const { error } = await supabase
        .from('feed_engagement')
        .insert({
          item_id: itemId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          engagement_type: engagementType
        });

      if (error) throw error;

      // Update local engagement count
      setFeedItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { 
                ...item, 
                [`${engagementType}s_count`]: (item[`${engagementType}s_count` as keyof FeedItem] as number || 0) + 1 
              }
            : item
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error engaging with item:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to engage' 
      };
    }
  };

  useEffect(() => {
    fetchFeedItems();
  }, [limit]);

  return {
    feedItems,
    loading,
    error,
    refresh: fetchFeedItems,
    createFeedItem,
    engageWithItem
  };
};