import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuery, withPerformanceMonitoring } from '@/lib/supabaseHelpers';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

export interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  population_estimate: number | null;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  peace_security_score: number;
  economic_activity_score: number;
  governance_score: number;
  social_spirit_score: number;
  diaspora_engagement_score: number;
  civic_participation_score: number;
  achievements_score: number;
  total_ratings_count: number;
  created_at: string;
  updated_at: string;
}

export interface VillageFilters {
  region?: string;
  division?: string;
  minRating?: number;
  maxRating?: number;
  isVerified?: boolean;
  minPopulation?: number;
  maxPopulation?: number;
}

const villageQuery = createQuery<Village>('villages');

// Enhanced villages hook with optimized queries
export const useVillages = (filters?: VillageFilters) => {
  return useQuery({
    queryKey: ['villages', filters],
    queryFn: withPerformanceMonitoring(
      async () => {
        try {
          let query = villageQuery.select('*');

          // Apply filters
          if (filters?.region) {
            query = query.eq('region', filters.region);
          }
          if (filters?.division) {
            query = query.eq('division', filters.division);
          }
          if (filters?.isVerified !== undefined) {
            query = query.eq('is_verified', filters.isVerified);
          }
          if (filters?.minRating) {
            query = query.gte('overall_rating', filters.minRating);
          }
          if (filters?.maxRating) {
            query = query.lte('overall_rating', filters.maxRating);
          }
          if (filters?.minPopulation) {
            query = query.gte('population_estimate', filters.minPopulation);
          }
          if (filters?.maxPopulation) {
            query = query.lte('population_estimate', filters.maxPopulation);
          }

          const { data, error } = await query.order('overall_rating', { ascending: false });
          
          if (error) throw error;
          return data || [];
        } catch (error) {
          logger.error('Failed to fetch villages', 'useVillages', error);
          throw error;
        }
      },
      'fetch_villages'
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Paginated villages with search
export const useVillagesPaginated = (
  page = 1,
  pageSize = 20,
  searchTerm = '',
  filters?: VillageFilters
) => {
  return useQuery({
    queryKey: ['villages-paginated', page, pageSize, searchTerm, filters],
    queryFn: withPerformanceMonitoring(
      async () => {
        if (searchTerm) {
          // Use search functionality
          return await villageQuery.search(
            searchTerm,
            ['village_name', 'region', 'division'],
            {
              limit: pageSize,
              orderBy: { column: 'overall_rating', ascending: false },
              filters
            }
          );
        } else {
          // Use pagination
          return await villageQuery.selectWithPagination(
            '*',
            page,
            pageSize,
            { column: 'overall_rating', ascending: false }
          );
        }
      },
      'fetch_villages_paginated'
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
    keepPreviousData: true, // Keep previous page data while loading new page
  });
};

// Top villages by criteria
export const useTopVillages = (criteria: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['top-villages', criteria, limit],
    queryFn: withPerformanceMonitoring(
      async () => {
        let orderColumn: string;
        
        switch (criteria) {
          case 'developed':
            orderColumn = 'infrastructure_score';
            break;
          case 'chiefs':
            orderColumn = 'governance_score';
            break;
          case 'diaspora':
            orderColumn = 'diaspora_engagement_score';
            break;
          case 'education':
            orderColumn = 'education_score';
            break;
          case 'clean':
            orderColumn = 'health_score';
            break;
          case 'popular':
            orderColumn = 'view_count';
            break;
          default:
            orderColumn = 'overall_rating';
        }

        const { data, error } = await villageQuery
          .select('*')
          .order(orderColumn, { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      },
      'fetch_top_villages'
    ),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Village statistics
export const useVillageStats = () => {
  return useQuery({
    queryKey: ['village-stats'],
    queryFn: withPerformanceMonitoring(
      async () => {
        try {
          // Get villages count and aggregated data in one query
          const { data: villageData, error } = await villageQuery
            .select('population_estimate, sons_daughters_count, is_verified')
            .limit(1000); // Reasonable limit for stats calculation

          if (error) throw error;

          const totalVillages = villageData?.length || 0;
          const verifiedVillages = villageData?.filter(v => v.is_verified).length || 0;
          const totalPopulation = villageData?.reduce((sum, v) => sum + (v.population_estimate || 0), 0) || 0;
          const totalVillagers = villageData?.reduce((sum, v) => sum + (v.sons_daughters_count || 0), 0) || 0;

          return {
            total_villages: totalVillages,
            verified_villages: verifiedVillages,
            total_population: totalPopulation,
            total_villagers: totalVillagers,
            verification_rate: totalVillages > 0 ? (verifiedVillages / totalVillages) * 100 : 0
          };
        } catch (error) {
          logger.error('Failed to fetch village stats', 'useVillageStats', error);
          throw error;
        }
      },
      'fetch_village_stats'
    ),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Village mutations
export const useVillageMutations = () => {
  const queryClient = useQueryClient();

  const updateVillage = useMutation({
    mutationFn: withPerformanceMonitoring(
      async ({ id, data }: { id: string; data: Partial<Village> }) => {
        return await villageQuery.update(id, data);
      },
      'update_village'
    ),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['villages'] });
      queryClient.invalidateQueries({ queryKey: ['village', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['village-stats'] });
      
      toast.success('Village updated successfully');
      logger.info('Village updated', 'useVillageMutations', { id: variables.id });
    },
    onError: (error) => {
      logger.error('Failed to update village', 'useVillageMutations', error);
    }
  });

  const incrementViewCount = useMutation({
    mutationFn: withPerformanceMonitoring(
      async (villageId: string) => {
        // Optimistic update - increment view count
        const { data, error } = await villageQuery
          .select('view_count')
          .eq('id', villageId)
          .single();
        
        if (error) throw error;
        
        return await villageQuery.update(villageId, {
          view_count: (data?.view_count || 0) + 1
        });
      },
      'increment_village_view_count'
    ),
    onSuccess: (data, villageId) => {
      // Update specific village in cache
      queryClient.setQueryData(['village', villageId], (oldData: Village | undefined) => {
        if (oldData) {
          return { ...oldData, view_count: oldData.view_count + 1 };
        }
        return oldData;
      });
    }
  });

  return {
    updateVillage,
    incrementViewCount
  };
};