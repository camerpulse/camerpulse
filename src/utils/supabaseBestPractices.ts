import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Best Practices Utility for Supabase Queries
 * Implements recommended patterns for data fetching, error handling, and type safety
 */

export interface QueryResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface QueryOptions {
  showErrorToast?: boolean;
  errorMessage?: string;
  successMessage?: string;
  showSuccessToast?: boolean;
}

/**
 * Safe single row query - uses maybeSingle() instead of single()
 */
export async function safeSingleQuery<T>(
  query: any,
  options: QueryOptions = {}
): Promise<QueryResult<T>> {
  const { showErrorToast = true, errorMessage = 'Failed to fetch data' } = options;
  
  try {
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Database error:', error);
      if (showErrorToast) {
        // Note: toast should be called from component level
        console.warn('Error occurred:', errorMessage);
      }
      return { data: null, error: error.message, loading: false };
    }
    
    return { data: data || null, error: null, loading: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Query error:', err);
    
    if (showErrorToast) {
      console.warn('Query failed:', errorMsg);
    }
    
    return { data: null, error: errorMsg, loading: false };
  }
}

/**
 * Safe multiple rows query with better error handling
 */
export async function safeMultiQuery<T>(
  query: any,
  options: QueryOptions = {}
): Promise<QueryResult<T[]>> {
  const { showErrorToast = true, errorMessage = 'Failed to fetch data' } = options;
  
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      if (showErrorToast) {
        console.warn('Error occurred:', errorMessage);
      }
      return { data: [], error: error.message, loading: false };
    }
    
    return { data: data || [], error: null, loading: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Query error:', err);
    
    if (showErrorToast) {
      console.warn('Query failed:', errorMsg);
    }
    
    return { data: [], error: errorMsg, loading: false };
  }
}

/**
 * Profile query helper - handles user not found gracefully
 */
export async function fetchUserProfile(userId: string) {
  return safeSingleQuery(
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId),
    {
      errorMessage: 'Failed to load user profile',
      showErrorToast: false // Let component handle this
    }
  );
}

/**
 * User role check helper - handles missing roles gracefully  
 */
export async function fetchUserRole(userId: string) {
  return safeSingleQuery(
    supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true),
    {
      errorMessage: 'Failed to check user permissions',
      showErrorToast: false
    }
  );
}

/**
 * Configuration query helper
 */
export async function fetchConfig(configKey: string) {
  return safeSingleQuery(
    supabase
      .from('app_config')
      .select('config_value')
      .eq('config_key', configKey),
    {
      errorMessage: `Failed to load ${configKey} configuration`,
      showErrorToast: false
    }
  );
}

/**
 * Generic entity fetcher by ID
 */
export async function fetchEntityById<T>(
  tableName: string, 
  id: string,
  selectFields = '*'
) {
  return safeSingleQuery<T>(
    supabase
      .from(tableName)
      .select(selectFields)
      .eq('id', id),
    {
      errorMessage: `Failed to load ${tableName} data`,
      showErrorToast: false
    }
  );
}

/**
 * Safe insert/update operations
 */
export async function safeUpsert<T>(
  tableName: string,
  data: any,
  options: QueryOptions & { onConflict?: string } = {}
) {
  const { showErrorToast = true, successMessage, showSuccessToast = false } = options;
  
  try {
    const query = supabase.from(tableName).upsert(data);
    
    if (options.onConflict) {
      query.onConflict(options.onConflict);
    }
    
    const { data: result, error } = await query.select();
    
    if (error) {
      console.error(`Upsert error for ${tableName}:`, error);
      if (showErrorToast) {
        console.warn(`Failed to save ${tableName}:`, error.message);
      }
      return { data: null, error: error.message, loading: false };
    }
    
    if (showSuccessToast && successMessage) {
      console.log('Success:', successMessage);
    }
    
    return { data: result, error: null, loading: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Upsert error for ${tableName}:`, err);
    
    if (showErrorToast) {
      console.warn(`Failed to save ${tableName}:`, errorMsg);
    }
    
    return { data: null, error: errorMsg, loading: false };
  }
}

/**
 * React hook for safe queries with toast integration
 */
export function useSafeQuery<T>() {
  const { toast } = useToast();
  
  const safeQuery = async (
    queryFn: () => Promise<QueryResult<T>>,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> => {
    const result = await queryFn();
    
    if (result.error && options.showErrorToast) {
      toast({
        title: "Error",
        description: options.errorMessage || result.error,
        variant: "destructive",
      });
    }
    
    if (result.data && options.showSuccessToast && options.successMessage) {
      toast({
        title: "Success",
        description: options.successMessage,
      });
    }
    
    return result;
  };
  
  return { safeQuery };
}

export default {
  safeSingleQuery,
  safeMultiQuery,
  fetchUserProfile,
  fetchUserRole,
  fetchConfig,
  fetchEntityById,
  safeUpsert,
  useSafeQuery
};