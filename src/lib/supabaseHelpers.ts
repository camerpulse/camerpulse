import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Enhanced error handling for Supabase operations
export const handleSupabaseError = (error: any, context: string): SupabaseError => {
  logger.error(`Supabase error in ${context}`, 'SupabaseAPI', error);
  
  return {
    message: error.message || 'Database operation failed',
    details: error.details,
    hint: error.hint,
    code: error.code
  };
};

// Generic query builder with error handling and logging
export const createQuery = <T = any>(tableName: string) => {
  return {
    select: (columns = '*') => {
      return supabase
        .from(tableName)
        .select(columns);
    },

    selectWithPagination: async (
      columns = '*',
      page = 1,
      pageSize = 20,
      orderBy?: { column: string; ascending?: boolean }
    ) => {
      try {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;

        let query = supabase
          .from(tableName)
          .select(columns, { count: 'exact' })
          .range(start, end);

        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          data: data as T[],
          count: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize)
        };
      } catch (error) {
        throw handleSupabaseError(error, `select with pagination from ${tableName}`);
      }
    },

    insert: async (data: Partial<T> | Partial<T>[]) => {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .insert(data)
          .select();

        if (error) throw error;

        logger.info(`Inserted data into ${tableName}`, 'SupabaseAPI', {
          count: Array.isArray(data) ? data.length : 1
        });

        return result;
      } catch (error) {
        throw handleSupabaseError(error, `insert into ${tableName}`);
      }
    },

    update: async (id: string, data: Partial<T>) => {
      try {
        const { data: result, error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', id)
          .select();

        if (error) throw error;

        logger.info(`Updated data in ${tableName}`, 'SupabaseAPI', { id });

        return result;
      } catch (error) {
        throw handleSupabaseError(error, `update in ${tableName}`);
      }
    },

    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;

        logger.info(`Deleted data from ${tableName}`, 'SupabaseAPI', { id });

        return true;
      } catch (error) {
        throw handleSupabaseError(error, `delete from ${tableName}`);
      }
    },

    search: async (
      searchTerm: string,
      searchColumns: string[],
      options?: {
        limit?: number;
        orderBy?: { column: string; ascending?: boolean };
        filters?: Record<string, any>;
      }
    ) => {
      try {
        let query = supabase.from(tableName).select('*');

        // Add search conditions
        if (searchTerm && searchColumns.length > 0) {
          const searchConditions = searchColumns
            .map(col => `${col}.ilike.%${searchTerm}%`)
            .join(',');
          query = query.or(searchConditions);
        }

        // Add filters
        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              query = query.eq(key, value);
            }
          });
        }

        // Add ordering
        if (options?.orderBy) {
          query = query.order(options.orderBy.column, { 
            ascending: options.orderBy.ascending ?? true 
          });
        }

        // Add limit
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data as T[];
      } catch (error) {
        throw handleSupabaseError(error, `search in ${tableName}`);
      }
    }
  };
};

// Performance monitoring for database operations
export const withPerformanceMonitoring = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T => {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      logger.info(`Database operation completed: ${operationName}`, 'Performance', {
        duration: `${duration}ms`,
        args: args.length
      });
      
      // Log slow queries (> 2 seconds)
      if (duration > 2000) {
        logger.warn(`Slow database operation: ${operationName}`, 'Performance', {
          duration: `${duration}ms`,
          args
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Database operation failed: ${operationName}`, 'Performance', {
        duration: `${duration}ms`,
        error
      });
      throw error;
    }
  }) as T;
};

// Connection health check
export const checkDatabaseHealth = async (): Promise<{
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    const { error } = await supabase
      .from('villages')
      .select('id')
      .limit(1)
      .single();
    
    const responseTime = Date.now() - startTime;
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is OK
      throw error;
    }
    
    return {
      isHealthy: true,
      responseTime
    };
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Batch operations for better performance
export const batchOperations = {
  insert: async <T>(tableName: string, records: Partial<T>[], batchSize = 100) => {
    const results = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(batch)
          .select();
          
        if (error) throw error;
        
        results.push(...(data || []));
        
        logger.info(`Batch inserted ${batch.length} records into ${tableName}`, 'BatchOperations');
      } catch (error) {
        logger.error(`Batch insert failed for ${tableName}`, 'BatchOperations', error);
        throw error;
      }
    }
    
    return results;
  }
};