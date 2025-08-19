import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

interface PaginationOptions {
  pageSize?: number;
  enableInfinite?: boolean;
}

interface FilterOptions {
  search?: string;
  region?: string;
  party?: string;
  role?: string;
  status?: string;
}

interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export function usePaginatedPoliticians(
  filters: FilterOptions = {},
  sort: SortOptions = { field: 'name', order: 'asc' },
  options: PaginationOptions = {}
) {
  const { pageSize = 20, enableInfinite = false } = options;

  const buildQuery = (page: number = 0) => {
    let query = supabase
      .from('politicians')
      .select(`
        id, name, slug, role_title, level_of_office, region, gender,
        profile_image_url, performance_score, transparency_rating,
        created_at, updated_at
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,role_title.ilike.%${filters.search}%`);
    }
    if (filters.region && filters.region !== 'all') {
      query = query.eq('region', filters.region);
    }
    if (filters.role && filters.role !== 'all') {
      query = query.ilike('level_of_office', `%${filters.role}%`);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.order === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    return query;
  };

  if (enableInfinite) {
    return useInfiniteQuery({
      queryKey: ['politicians-infinite', filters, sort, pageSize],
      queryFn: async ({ pageParam = 0 }) => {
        const { data, error, count } = await buildQuery(pageParam);
        if (error) throw error;
        
        return {
          data: data || [],
          count: count || 0,
          nextPage: (data?.length === pageSize) ? pageParam + 1 : undefined,
          hasMore: (pageParam + 1) * pageSize < (count || 0)
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 0,
    });
  }

  // Regular paginated query
  return useQuery({
    queryKey: ['politicians-paginated', filters, sort, pageSize],
    queryFn: async () => {
      const { data, error, count } = await buildQuery(0);
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });
}

export function usePaginatedParties(
  filters: FilterOptions = {},
  sort: SortOptions = { field: 'name', order: 'asc' },
  options: PaginationOptions = {}
) {
  const { pageSize = 20 } = options;

  return useQuery({
    queryKey: ['political-parties-paginated', filters, sort, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('political_parties')
        .select(`
          id, name, slug, acronym, logo_url, description,
          founded_year, ideology, president_name, headquarters,
          website_url, is_active, created_at
        `, { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,acronym.ilike.%${filters.search}%`);
      }
      
      query = query.eq('is_active', true);

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.order === 'asc' });

      // Apply pagination
      query = query.range(0, pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });
}

// Hook for getting paginated party members
export function usePaginatedPartyMembers(
  partyId: string,
  filters: FilterOptions = {},
  sort: SortOptions = { field: 'start_date', order: 'desc' },
  options: PaginationOptions = {}
) {
  const { pageSize = 20 } = options;

  return useQuery({
    queryKey: ['party-members-paginated', partyId, filters, sort, pageSize],
    queryFn: async () => {
      if (!partyId) return { data: [], count: 0, pageSize, totalPages: 0 };

      let query = supabase
        .from('party_affiliations')
        .select(`
          id, politician_id, start_date, end_date, is_current, position_in_party,
          politicians!inner(
            id, name, slug, role_title, region, gender,
            profile_image_url, performance_score
          )
        `, { count: 'exact' })
        .eq('party_id', partyId);

      // Apply filters
      if (filters.status === 'current') {
        query = query.eq('is_current', true);
      }
      if (filters.role && filters.role !== 'all') {
        query = query.ilike('politicians.role_title', `%${filters.role}%`);
      }
      if (filters.region && filters.region !== 'all') {
        query = query.eq('politicians.region', filters.region);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.order === 'asc' });

      // Apply pagination
      query = query.range(0, pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    enabled: !!partyId,
  });
}