import { supabase } from '@/integrations/supabase/client';
import { AuthService } from './auth';

/**
 * Centralized API utilities for CamerPulse
 * Consolidates common database operations and patterns
 */
export class APIService {
  /**
   * Generic function to fetch data with consistent error handling
   */
  static async fetchData<T>(
    tableName: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    } = {}
  ): Promise<T> {
    const {
      select = '*',
      filters = {},
      orderBy,
      limit,
      single = false
    } = options;

    let query = supabase.from(tableName).select(select);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    // Execute query
    const { data, error } = single ? await query.single() : await query;

    if (error) throw error;
    return data as T;
  }

  /**
   * Generic function to insert data
   */
  static async insertData<T>(
    tableName: string,
    data: any,
    options: { select?: string; single?: boolean } = {}
  ): Promise<T> {
    const { select = '*', single = true } = options;

    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select(select);

    if (error) throw error;
    return single ? result[0] : result;
  }

  /**
   * Generic function to update data
   */
  static async updateData<T>(
    tableName: string,
    data: any,
    filters: Record<string, any>,
    options: { select?: string; single?: boolean } = {}
  ): Promise<T> {
    const { select = '*', single = true } = options;

    let query = supabase.from(tableName).update(data);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: result, error } = await query.select(select);

    if (error) throw error;
    return single ? result[0] : result;
  }

  /**
   * Generic function to upsert data with user authentication
   */
  static async upsertUserData<T>(
    tableName: string,
    data: any,
    options: { select?: string; requireAuth?: boolean } = {}
  ): Promise<T> {
    const { select = '*', requireAuth = true } = options;

    if (requireAuth) {
      const user = await AuthService.requireAuth();
      data.user_id = user.id;
    }

    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(data)
      .select(select)
      .single();

    if (error) throw error;
    return result as T;
  }

  /**
   * Generic function to delete data
   */
  static async deleteData(
    tableName: string,
    filters: Record<string, any>
  ): Promise<void> {
    let query = supabase.from(tableName).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;
    if (error) throw error;
  }

  /**
   * Check if user owns a record
   */
  static async checkUserOwnership(
    tableName: string,
    recordId: string,
    userIdColumn = 'user_id'
  ): Promise<boolean> {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) return false;

    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', recordId)
      .eq(userIdColumn, userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  /**
   * Generic follow/unfollow functionality
   */
  static async toggleFollow(
    tableName: string,
    entityId: string,
    entityIdColumn: string
  ): Promise<boolean> {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) throw new Error('You must be logged in to follow');

    // Check if already following
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq(entityIdColumn, entityId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      // Unfollow
      await this.deleteData(tableName, {
        [entityIdColumn]: entityId,
        user_id: userId
      });
      return false;
    } else {
      // Follow
      await this.insertData(tableName, {
        [entityIdColumn]: entityId,
        user_id: userId
      });
      return true;
    }
  }

  /**
   * Increment view count for any entity
   */
  static async incrementViewCount(
    tableName: string,
    entityId: string
  ): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', {
      table_name: tableName,
      entity_id: entityId
    });

    if (error) {
      console.warn('Failed to increment view count:', error);
      // Don't throw error for view counts as it's not critical
    }
  }
}

/**
 * Common query patterns for rating systems
 */
export class RatingService {
  /**
   * Submit or update a rating
   */
  static async submitRating<T>(
    tableName: string,
    rating: {
      entity_id: string;
      overall_rating: number;
      [key: string]: any;
    }
  ): Promise<T> {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) throw new Error('You must be logged in to rate');

    return APIService.upsertUserData(tableName, {
      ...rating,
      user_id: userId
    });
  }

  /**
   * Get user's rating for an entity
   */
  static async getUserRating<T>(
    tableName: string,
    entityId: string,
    entityIdColumn: string
  ): Promise<T | null> {
    const userId = await AuthService.getCurrentUserId();
    if (!userId) return null;

    return APIService.fetchData(tableName, {
      filters: {
        [entityIdColumn]: entityId,
        user_id: userId
      },
      single: true
    }).catch(() => null);
  }

  /**
   * Get all ratings for an entity
   */
  static async getEntityRatings<T>(
    tableName: string,
    entityId: string,
    entityIdColumn: string
  ): Promise<T[]> {
    return APIService.fetchData(tableName, {
      filters: { [entityIdColumn]: entityId },
      orderBy: { column: 'created_at', ascending: false }
    });
  }
}