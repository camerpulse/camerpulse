import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Senator } from './useSenators';
import { SearchFilters } from '@/components/Senators/SenatorSearch';

export const useSenatorSearch = (filters: SearchFilters) => {
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.query]);

  const searchQuery = useQuery({
    queryKey: ['senators-search', debouncedQuery, filters],
    queryFn: async (): Promise<Senator[]> => {
      let query = supabase
        .from('senators')
        .select('*');

      // Text search - using actual Senator table columns
      if (debouncedQuery.trim()) {
        query = query.or(`name.ilike.%${debouncedQuery}%,region.ilike.%${debouncedQuery}%,political_party.ilike.%${debouncedQuery}%`);
      }

      // Region filter
      if (filters.region) {
        query = query.eq('region', filters.region);
      }

      // Party filter
      if (filters.party) {
        query = query.eq('political_party', filters.party);
      }

      // Status filter - simplified to work with actual schema
      if (filters.status === 'active') {
        query = query.eq('status', 'active');
      } else if (filters.status === 'inactive') {
        query = query.neq('status', 'active');
      }

      // Trust score filter
      if (filters.trustScoreMin > 0) {
        query = query.gte('trust_score', filters.trustScoreMin);
      }

      // Sorting
      switch (filters.sortBy) {
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'trust_score':
          query = query.order('trust_score', { ascending: false });
          break;
        case 'followers':
          query = query.order('follower_count', { ascending: false });
          break;
        case 'recent':
          query = query.order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('trust_score', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Transform data to ensure proper types
      return (data || []).map((senator: any) => ({
        ...senator,
        committee_memberships: Array.isArray(senator.committee_memberships) 
          ? senator.committee_memberships 
          : JSON.parse(senator.committee_memberships || '[]')
      })) as Senator[];
    },
    enabled: true, // Always enabled, will return all senators if no filters
  });

  // Calculate search statistics
  const searchStats = useMemo(() => {
    const results = searchQuery.data || [];
    
    return {
      totalResults: results.length,
      averageTrustScore: results.length > 0 
        ? Math.round(results.reduce((sum, senator) => sum + (senator.trust_score || 0), 0) / results.length)
        : 0,
      regionCounts: results.reduce((acc, senator) => {
        acc[senator.region] = (acc[senator.region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      partyCounts: results.reduce((acc, senator) => {
        const party = senator.political_party || 'Independent';
        acc[party] = (acc[party] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      statusCounts: {
        active: results.filter(s => s.status === 'active').length,
        claimed: results.filter(s => (s as any).profile_claimed === true).length,
        verified: results.filter(s => s.is_verified === true).length,
        inactive: results.filter(s => s.status !== 'active').length,
      }
    };
  }, [searchQuery.data]);

  return {
    senators: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    error: searchQuery.error,
    searchStats,
    refetch: searchQuery.refetch
  };
};