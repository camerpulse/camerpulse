import { useState, useCallback, useRef, useEffect } from 'react';

interface SafeStateOptions<T> {
  fallback?: T;
  validator?: (value: T) => boolean;
  onError?: (error: Error) => void;
}

export function useSafeState<T>(
  initialValue: T,
  options: SafeStateOptions<T> = {}
) {
  const { fallback, validator, onError } = options;
  const isMountedRef = useRef(true);
  
  const [state, setState] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((value: T | ((prev: T) => T)) => {
    if (!isMountedRef.current) {
      console.warn('Attempted to set state on unmounted component');
      return;
    }

    try {
      const newValue = typeof value === 'function' 
        ? (value as (prev: T) => T)(state) 
        : value;

      // Validate the new value if validator is provided
      if (validator && !validator(newValue)) {
        const validationError = new Error('State validation failed');
        setError(validationError);
        onError?.(validationError);
        
        // Use fallback if available
        if (fallback !== undefined) {
          setState(fallback);
        }
        return;
      }

      setState(newValue);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown state error');
      setError(error);
      onError?.(error);
      
      // Use fallback if available
      if (fallback !== undefined) {
        setState(fallback);
      }
    }
  }, [state, validator, fallback, onError]);

  return [state, setSafeState, error] as const;
}

export function useSafeAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await asyncFunction();
        
        if (!cancelled && isMountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled && isMountedRef.current) {
          const error = err instanceof Error ? err : new Error('Unknown async error');
          setError(error);
          console.error('useSafeAsync error:', error);
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}