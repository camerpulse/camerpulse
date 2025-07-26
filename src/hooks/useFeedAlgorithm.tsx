import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FeedItem {
  id: string;
  content_type: string;
  content_id: string;
  score: number;
  content: any;
  region?: string;
  created_at: string;
}

interface UserPreferences {
  civic_content_weight: number;
  entertainment_weight: number;
  job_content_weight: number;
  artist_content_weight: number;
  local_content_preference: number;
  political_engagement_level: string;
  preferred_regions: string[];
  blocked_topics: string[];
}

interface FeedResponse {
  feed: FeedItem[];
  total_count: number;
  user_preferences: UserPreferences;
  civic_events_active: boolean;
}

export const useFeedAlgorithm = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [civicEventsActive, setCivicEventsActive] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);

  const generateFeed = useCallback(async (reset = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const offset = reset ? 0 : currentOffset;
      
      const { data, error } = await supabase.functions.invoke('generate-personalized-feed', {
        body: {
          limit: 20,
          offset,
          session_id: sessionId
        }
      });

      if (error) throw error;

      const feedResponse: FeedResponse = data;
      
      if (reset) {
        setFeedItems(feedResponse.feed);
        setCurrentOffset(20);
      } else {
        setFeedItems(prev => [...prev, ...feedResponse.feed]);
        setCurrentOffset(prev => prev + 20);
      }

      setUserPreferences(feedResponse.user_preferences);
      setCivicEventsActive(feedResponse.civic_events_active);
      setHasNextPage(feedResponse.feed.length === 20); // Has more if we got a full page

    } catch (error: any) {
      console.error('Error generating feed:', error);
      setError(error.message || 'Failed to generate feed');
      toast.error('Failed to load feed content');
    } finally {
      setLoading(false);
    }
  }, [user, currentOffset, sessionId]);

  const trackInteraction = useCallback(async (
    contentId: string,
    contentType: string,
    interactionType: string,
    dwellTimeSeconds = 0,
    metadata = {}
  ) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('track-feed-interaction', {
        body: {
          content_id: contentId,
          content_type: contentType,
          interaction_type: interactionType,
          dwell_time_seconds: dwellTimeSeconds,
          metadata
        }
      });
    } catch (error: any) {
      console.error('Error tracking interaction:', error);
      // Don't show error to user for tracking failures
    }
  }, [user]);

  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-feed-preferences', {
        body: preferences
      });

      if (error) throw error;

      setUserPreferences(data.preferences);
      toast.success('Feed preferences updated successfully');
      
      // Refresh feed with new preferences
      await generateFeed(true);

    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError(error.message || 'Failed to update preferences');
      toast.error('Failed to update feed preferences');
    } finally {
      setLoading(false);
    }
  }, [user, generateFeed]);

  const refreshFeed = useCallback(() => {
    generateFeed(true);
  }, [generateFeed]);

  const loadMoreItems = useCallback(() => {
    if (!loading && hasNextPage) {
      generateFeed(false);
    }
  }, [loading, hasNextPage, generateFeed]);

  // Auto-generate feed on mount and user change
  useEffect(() => {
    if (user) {
      generateFeed(true);
    }
  }, [user]);

  return {
    feedItems,
    userPreferences,
    loading,
    error,
    hasNextPage,
    civicEventsActive,
    sessionId,
    
    // Actions
    generateFeed,
    trackInteraction,
    updatePreferences,
    refreshFeed,
    loadMoreItems,
    
    // Utils
    clearError: () => setError(null)
  };
};