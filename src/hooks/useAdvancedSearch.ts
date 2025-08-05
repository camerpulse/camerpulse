import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createQuery, withPerformanceMonitoring } from '@/lib/supabaseHelpers';
import { logger } from '@/utils/logger';

export interface SearchResult {
  id: string;
  type: 'village' | 'politician' | 'petition' | 'poll' | 'article' | 'company' | 'job';
  title: string;
  description: string;
  excerpt: string;
  url: string;
  score: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  types?: string[];
  regions?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  verified?: boolean;
  sortBy?: 'relevance' | 'date' | 'popularity' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchSuggestion {
  query: string;
  type: 'recent' | 'popular' | 'suggested';
  count?: number;
}

const useAdvancedSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [isSearching, setIsSearching] = useState(false);

  // Search function with comprehensive indexing
  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    page = 1,
    pageSize = 20
  ) => {
    if (!searchQuery.trim()) return { results: [], total: 0, page, pageSize };

    setIsSearching(true);
    
    try {
      const results: SearchResult[] = [];
      let totalResults = 0;

      // Search villages
      if (!searchFilters.types || searchFilters.types.includes('village')) {
        const villageQuery = createQuery('villages');
        const { data: villages } = await villageQuery.search(
          searchQuery,
          ['village_name', 'region', 'division', 'subdivision'],
          {
            limit: Math.ceil(pageSize / 4),
            filters: {
              ...(searchFilters.regions?.length && { region: searchFilters.regions[0] }),
              ...(searchFilters.verified !== undefined && { is_verified: searchFilters.verified })
            }
          }
        );

        villages?.forEach((village: any) => {
          results.push({
            id: village.id,
            type: 'village',
            title: village.village_name,
            description: `${village.division}, ${village.region}`,
            excerpt: `Population: ${village.population_estimate || 'N/A'} | Rating: ${village.overall_rating}/10`,
            url: `/villages/${village.village_name.toLowerCase().replace(/\s+/g, '-')}`,
            score: village.overall_rating / 10,
            metadata: {
              region: village.region,
              verified: village.is_verified,
              population: village.population_estimate
            },
            created_at: village.created_at,
            updated_at: village.updated_at
          });
        });
      }

      // Search politicians
      if (!searchFilters.types || searchFilters.types.includes('politician')) {
        const politicianQuery = createQuery('politicians');
        const { data: politicians } = await politicianQuery.search(
          searchQuery,
          ['full_name', 'position', 'party', 'constituency'],
          {
            limit: Math.ceil(pageSize / 4)
          }
        );

        politicians?.forEach((politician: any) => {
          results.push({
            id: politician.id,
            type: 'politician',
            title: politician.full_name,
            description: `${politician.position} - ${politician.party}`,
            excerpt: politician.constituency || 'No constituency specified',
            url: `/politicians/${politician.full_name.toLowerCase().replace(/\s+/g, '-')}-${politician.id}`,
            score: 0.8, // Default score for politicians
            metadata: {
              position: politician.position,
              party: politician.party,
              constituency: politician.constituency
            },
            created_at: politician.created_at,
            updated_at: politician.updated_at
          });
        });
      }

      // Search jobs
      if (!searchFilters.types || searchFilters.types.includes('job')) {
        const jobQuery = createQuery('jobs');
        const { data: jobs } = await jobQuery.search(
          searchQuery,
          ['title', 'company_name', 'description', 'location'],
          {
            limit: Math.ceil(pageSize / 4),
            filters: {
              status: 'open'
            }
          }
        );

        jobs?.forEach((job: any) => {
          results.push({
            id: job.id,
            type: 'job',
            title: job.title,
            description: `${job.company_name} - ${job.location}`,
            excerpt: job.description?.substring(0, 150) + '...' || '',
            url: `/jobs/${job.slug}-${job.id}`,
            score: 0.7,
            metadata: {
              company: job.company_name,
              location: job.location,
              type: job.job_type,
              salary: job.salary_range
            },
            created_at: job.created_at,
            updated_at: job.updated_at
          });
        });
      }

      // Search companies
      if (!searchFilters.types || searchFilters.types.includes('company')) {
        const companyQuery = createQuery('companies');
        const { data: companies } = await companyQuery.search(
          searchQuery,
          ['company_name', 'description', 'industry', 'location'],
          {
            limit: Math.ceil(pageSize / 4)
          }
        );

        companies?.forEach((company: any) => {
          results.push({
            id: company.id,
            type: 'company',
            title: company.company_name,
            description: `${company.industry} - ${company.location}`,
            excerpt: company.description?.substring(0, 150) + '...' || '',
            url: `/companies/${company.slug}-${company.id}`,
            score: 0.6,
            metadata: {
              industry: company.industry,
              location: company.location,
              size: company.employee_count
            },
            created_at: company.created_at,
            updated_at: company.updated_at
          });
        });
      }

      // Sort results
      results.sort((a, b) => {
        switch (searchFilters.sortBy) {
          case 'date':
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return searchFilters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          case 'alphabetical':
            return searchFilters.sortOrder === 'desc' 
              ? b.title.localeCompare(a.title)
              : a.title.localeCompare(b.title);
          case 'popularity':
          case 'relevance':
          default:
            return searchFilters.sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
        }
      });

      totalResults = results.length;

      // Paginate results
      const start = (page - 1) * pageSize;
      const paginatedResults = results.slice(start, start + pageSize);

      logger.info('Search completed', 'useAdvancedSearch', {
        query: searchQuery,
        totalResults,
        page,
        pageSize
      });

      return {
        results: paginatedResults,
        total: totalResults,
        page,
        pageSize,
        totalPages: Math.ceil(totalResults / pageSize)
      };
    } catch (error) {
      logger.error('Search failed', 'useAdvancedSearch', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Main search query
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['advanced-search', query, filters],
    queryFn: withPerformanceMonitoring(
      () => performSearch(query, filters),
      'advanced_search'
    ),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true
  });

  // Search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', query.substring(0, 3)],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      // Mock suggestions - in real implementation, this would come from a suggestions table
      const mockSuggestions: SearchSuggestion[] = [
        { query: `${query} in Centre`, type: 'suggested' },
        { query: `${query} verified`, type: 'suggested' },
        { query: query, type: 'recent', count: 145 }
      ];
      
      return mockSuggestions;
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Auto-complete
  const autoComplete = useCallback(async (partialQuery: string) => {
    if (partialQuery.length < 2) return [];
    
    try {
      // This would typically query a dedicated search index
      const completions = [
        `${partialQuery} villages`,
        `${partialQuery} politicians`,
        `${partialQuery} jobs`
      ].filter(completion => 
        completion.toLowerCase().includes(partialQuery.toLowerCase())
      );
      
      return completions;
    } catch (error) {
      logger.error('Auto-complete failed', 'useAdvancedSearch', error);
      return [];
    }
  }, []);

  // Update search query
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  }, []);

  // Search statistics
  const searchStats = useMemo(() => {
    if (!searchResults) return null;
    
    const typeStats = searchResults.results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: searchResults.total,
      byType: typeStats,
      hasResults: searchResults.results.length > 0
    };
  }, [searchResults]);

  return {
    query,
    filters,
    searchResults: searchResults?.results || [],
    pagination: searchResults ? {
      page: searchResults.page,
      pageSize: searchResults.pageSize,
      total: searchResults.total,
      totalPages: searchResults.totalPages
    } : null,
    suggestions: suggestions || [],
    searchStats,
    isLoading: isLoading || isSearching,
    error,
    updateQuery,
    updateFilters,
    clearSearch,
    autoComplete,
    refetch
  };
};

export default useAdvancedSearch;