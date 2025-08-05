import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// Enhanced QueryClient configuration with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Enable background refetching
      refetchOnReconnect: true,
      // Network error handling
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        if (error?.message?.includes('network') && failureCount < 1) {
          return true;
        }
        return false;
      },
      // Global error handling for mutations
      onError: (error: any, variables, context) => {
        logger.error('Mutation failed', 'QueryClient', {
          error: error.message,
          variables,
          context
        });
        
        // Show user-friendly error message
        toast.error('Action failed', {
          description: error.message || 'Please try again or contact support if the issue persists.'
        });
      },
      // Global success handling for mutations
      onSuccess: (data, variables, context) => {
        logger.info('Mutation succeeded', 'QueryClient', {
          variables,
          context
        });
      }
    }
  }
});

// Query invalidation helpers
export const invalidateQueries = {
  // Civic data
  villages: () => queryClient.invalidateQueries({ queryKey: ['villages'] }),
  petitions: () => queryClient.invalidateQueries({ queryKey: ['petitions'] }),
  polls: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
  
  // Politicians and parties
  politicians: () => queryClient.invalidateQueries({ queryKey: ['politicians'] }),
  parties: () => queryClient.invalidateQueries({ queryKey: ['political-parties'] }),
  
  // User data
  profile: (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  },
  
  // Admin data
  adminStats: () => queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
  systemHealth: () => queryClient.invalidateQueries({ queryKey: ['system-health'] }),
  
  // Clear all cached data
  all: () => queryClient.clear()
};

// Prefetch helpers for common data
export const prefetchData = {
  villages: async () => {
    await queryClient.prefetchQuery({
      queryKey: ['villages'],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('villages')
          .select('*')
          .order('overall_rating', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
  
  politicians: async () => {
    await queryClient.prefetchQuery({
      queryKey: ['politicians'],
      queryFn: async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('politicians')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data;
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  }
};

// Background sync for critical data
export const backgroundSync = {
  start: () => {
    // Sync villages data every 30 minutes
    setInterval(async () => {
      try {
        await queryClient.refetchQueries({ 
          queryKey: ['villages'],
          type: 'active'
        });
        logger.info('Background sync completed for villages', 'BackgroundSync');
      } catch (error) {
        logger.error('Background sync failed for villages', 'BackgroundSync', error);
      }
    }, 30 * 60 * 1000);

    // Sync user profile every 10 minutes if user is active
    setInterval(async () => {
      try {
        await queryClient.refetchQueries({ 
          queryKey: ['profile'],
          type: 'active'
        });
        logger.debug('Background sync completed for profile', 'BackgroundSync');
      } catch (error) {
        logger.error('Background sync failed for profile', 'BackgroundSync', error);
      }
    }, 10 * 60 * 1000);
  }
};

// Performance monitoring
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === 'queryAdded') {
    logger.debug('Query added to cache', 'QueryCache', {
      queryKey: event.query.queryKey
    });
  }
  
  if (event?.type === 'queryRemoved') {
    logger.debug('Query removed from cache', 'QueryCache', {
      queryKey: event.query.queryKey
    });
  }
});

// Memory cleanup
export const cleanupQueries = () => {
  // Remove queries that haven't been used in the last hour
  queryClient.getQueryCache().getAll().forEach(query => {
    const lastUpdated = query.state.dataUpdatedAt;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    if (lastUpdated < oneHourAgo && query.getObserversCount() === 0) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
  
  logger.info('Query cache cleanup completed', 'QueryClient');
};
