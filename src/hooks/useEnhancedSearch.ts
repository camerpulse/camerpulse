import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from './useAnalytics';

interface SearchFilters {
  region?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: string;
}

interface SearchResult {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  total_ratings_count: number;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  diaspora_engagement_score: number;
  relevance_score: number;
}

interface TrendingSearch {
  search_query: string;
  search_count: number;
  trend_score: number;
}

interface SavedSearch {
  id: string;
  search_name: string;
  search_query: string;
  search_filters: SearchFilters;
  notification_enabled: boolean;
  last_result_count: number;
  created_at: string;
}

export const useEnhancedSearch = () => {
  const { user } = useAuth();
  const { trackSearch } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Enhanced search with full-text search and filters
  const search = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ) => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const offset = (page - 1) * limit;
      
      // Use the enhanced search function
      const { data, error } = await supabase.rpc('search_villages', {
        p_query: query.trim() || null,
        p_region: filters.region || null,
        p_tags: filters.tags || null,
        p_min_rating: filters.minRating || 0,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setResults(data || []);
      setTotalResults(data?.length || 0);

      // Track search analytics
      const searchDuration = Date.now() - startTime;
      trackSearch(query, filters, data?.length || 0);
      
      // Track in search analytics table
      if (user && query.trim()) {
        await supabase.from('search_analytics').insert({
          user_id: user.id,
          search_query: query,
          search_type: 'village_search',
          filters_applied: filters as any,
          results_count: data?.length || 0,
          search_duration_ms: searchDuration
        });

        // Update trending searches
        await supabase.rpc('update_trending_search', { p_query: query.trim() });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, trackSearch]);

  // Get trending searches
  const fetchTrendingSearches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trending_searches')
        .select('search_query, search_count, trend_score')
        .order('trend_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching trending searches:', error);
        return;
      }

      setTrendingSearches(data || []);
    } catch (error) {
      console.error('Error fetching trending searches:', error);
    }
  }, []);

  // Get saved searches for user
  const fetchSavedSearches = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved searches:', error);
        return;
      }

      setSavedSearches((data as SavedSearch[]) || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  }, [user]);

  // Save a search
  const saveSearch = useCallback(async (
    name: string,
    query: string,
    filters: SearchFilters,
    enableNotifications: boolean = false
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: user.id,
        search_name: name,
        search_query: query,
        search_filters: filters as any,
        notification_enabled: enableNotifications,
        last_result_count: results.length
      });

      if (error) {
        console.error('Error saving search:', error);
        return false;
      }

      await fetchSavedSearches();
      return true;
    } catch (error) {
      console.error('Error saving search:', error);
      return false;
    }
  }, [user, results.length, fetchSavedSearches]);

  // Delete saved search
  const deleteSavedSearch = useCallback(async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) {
        console.error('Error deleting saved search:', error);
        return false;
      }

      await fetchSavedSearches();
      return true;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return false;
    }
  }, [fetchSavedSearches]);

  // Get available tags
  const fetchAvailableTags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content_tags')
        .select('tag_name')
        .order('usage_count', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching tags:', error);
        return;
      }

      setAvailableTags(data?.map(tag => tag.tag_name) || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  // Track search result click
  const trackResultClick = useCallback(async (resultId: string, resultType: string = 'village') => {
    if (!user) return;

    try {
      await supabase.from('search_analytics').insert({
        user_id: user.id,
        search_query: '',
        search_type: 'result_click',
        clicked_result_id: resultId,
        clicked_result_type: resultType
      });
    } catch (error) {
      console.error('Error tracking result click:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchTrendingSearches();
    fetchAvailableTags();
    if (user) {
      fetchSavedSearches();
    }
  }, [user, fetchTrendingSearches, fetchAvailableTags, fetchSavedSearches]);

  return {
    search,
    loading,
    results,
    totalResults,
    trendingSearches,
    savedSearches,
    availableTags,
    saveSearch,
    deleteSavedSearch,
    trackResultClick,
    refreshTrending: fetchTrendingSearches,
    refreshSaved: fetchSavedSearches
  };
};