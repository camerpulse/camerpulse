import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from './auth';

/**
 * Centralized query patterns for CamerPulse
 * Provides reusable query functions for common data patterns
 */
export class QueryService {
  /**
   * Get all entities with political party data
   */
  static createEntityQuery<T>(
    tableName: string,
    orderBy: { column: string; ascending?: boolean } = { column: 'average_rating', ascending: false }
  ) {
    return async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *, 
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `)
        .order(orderBy.column, { ascending: orderBy.ascending });

      if (error) throw error;
      return data as T[];
    };
  }

  /**
   * Get single entity with political party data
   */
  static createSingleEntityQuery<T>(tableName: string) {
    return async (id: string): Promise<T> => {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *, 
          political_parties!political_party_id (
            id, name, acronym, logo_url, party_president, official_website
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as T;
    };
  }

  /**
   * Get ratings for an entity
   */
  static createRatingsQuery<T>(tableName: string, entityIdColumn: string) {
    return async (entityId: string): Promise<T[]> => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(entityIdColumn, entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as T[];
    };
  }

  /**
   * Get user's rating for an entity
   */
  static createUserRatingQuery<T>(tableName: string, entityIdColumn: string) {
    return async (entityId: string): Promise<T | null> => {
      const user = await AuthService.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(entityIdColumn, entityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as T | null;
    };
  }

  /**
   * Check if user is following an entity
   */
  static createFollowingQuery(tableName: string, entityIdColumn: string) {
    return async (entityId: string): Promise<boolean> => {
      const user = await AuthService.getCurrentUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq(entityIdColumn, entityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    };
  }
}

/**
 * Centralized mutation patterns for CamerPulse
 * Provides reusable mutation functions for common operations
 */
export class MutationService {
  /**
   * Create rating mutation
   */
  static createRatingMutation<TRating, TResult>(
    tableName: string,
    queryClient: QueryClient,
    entityIdColumn: string,
    entityName: string
  ) {
    return {
      mutationFn: async (rating: TRating & { [key: string]: any }): Promise<TResult> => {
        const user = await AuthService.requireAuth(`You must be logged in to rate a ${entityName}`);

        const { data, error } = await supabase
          .from(tableName)
          .upsert({
            ...rating,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data as TResult;
      },
      onSuccess: (data: any) => {
        const entityId = data[entityIdColumn];
        queryClient.invalidateQueries({ queryKey: [`${tableName}`, entityId] });
        queryClient.invalidateQueries({ queryKey: [`user-${tableName}`, entityId] });
        queryClient.invalidateQueries({ queryKey: [entityName, entityId] });
        queryClient.invalidateQueries({ queryKey: [entityName + 's'] });
      }
    };
  }

  /**
   * Create follow/unfollow mutations
   */
  static createFollowMutations(
    tableName: string,
    entityIdColumn: string,
    entityName: string,
    queryClient: QueryClient
  ) {
    const followMutation = {
      mutationFn: async (entityId: string): Promise<void> => {
        const user = await AuthService.requireAuth(`You must be logged in to follow a ${entityName}`);

        const { error } = await supabase
          .from(tableName)
          .insert({
            [entityIdColumn]: entityId,
            user_id: user.id,
          });

        if (error) throw error;
      },
      onSuccess: (_: any, entityId: string) => {
        queryClient.invalidateQueries({ queryKey: [`${tableName}`, entityId] });
      }
    };

    const unfollowMutation = {
      mutationFn: async (entityId: string): Promise<void> => {
        const user = await AuthService.requireAuth(`You must be logged in to unfollow a ${entityName}`);

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(entityIdColumn, entityId)
          .eq('user_id', user.id);

        if (error) throw error;
      },
      onSuccess: (_: any, entityId: string) => {
        queryClient.invalidateQueries({ queryKey: [`${tableName}`, entityId] });
      }
    };

    return { followMutation, unfollowMutation };
  }
}

/**
 * Cache management utilities
 */
export class CacheService {
  /**
   * Standard cache invalidation patterns
   */
  static invalidateEntityQueries(
    queryClient: QueryClient,
    entityType: string,
    entityId: string
  ) {
    // Invalidate single entity
    queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
    // Invalidate entity list
    queryClient.invalidateQueries({ queryKey: [entityType + 's'] });
    // Invalidate ratings
    queryClient.invalidateQueries({ queryKey: [`${entityType}-ratings`, entityId] });
    // Invalidate user rating
    queryClient.invalidateQueries({ queryKey: [`user-${entityType}-rating`, entityId] });
    // Invalidate following status
    queryClient.invalidateQueries({ queryKey: [`${entityType}-following`, entityId] });
  }

  /**
   * Prefetch related data
   */
  static async prefetchEntityData(
    queryClient: QueryClient,
    entityType: string,
    entityId: string,
    queries: {
      entity?: () => Promise<any>;
      ratings?: () => Promise<any>;
      userRating?: () => Promise<any>;
    }
  ) {
    const promises = [];

    if (queries.entity) {
      promises.push(
        queryClient.prefetchQuery({
          queryKey: [entityType, entityId],
          queryFn: queries.entity,
        })
      );
    }

    if (queries.ratings) {
      promises.push(
        queryClient.prefetchQuery({
          queryKey: [`${entityType}-ratings`, entityId],
          queryFn: queries.ratings,
        })
      );
    }

    if (queries.userRating) {
      promises.push(
        queryClient.prefetchQuery({
          queryKey: [`user-${entityType}-rating`, entityId],
          queryFn: queries.userRating,
        })
      );
    }

    await Promise.all(promises);
  }
}