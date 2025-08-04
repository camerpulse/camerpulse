import { useRef, useEffect, useState, useCallback } from 'react';

interface IntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
}

export const useIntersectionObserver = (
  options: IntersectionObserverOptions = {}
): [
  (node: Element | null) => void, 
  boolean
] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: Element | null) => {
    if (observer.current) {
      observer.current.disconnect();
    }

    if (node) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        },
        {
          threshold: options.threshold || 0,
          rootMargin: options.rootMargin || '0px',
          root: options.root || null,
        }
      );

      observer.current.observe(node);
    }
  }, [options.threshold, options.rootMargin, options.root]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return [ref, isIntersecting];
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): T => {
  const throttleRef = useRef<boolean>(false);

  return useCallback((...args: Parameters<T>) => {
    if (!throttleRef.current) {
      func(...args);
      throttleRef.current = true;
      setTimeout(() => {
        throttleRef.current = false;
      }, delay);
    }
  }, [func, delay]) as T;
};

export const useImagePreloader = (imageSrcs: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    imageSrcs.forEach(src => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
      };
      img.src = src;
    });
  }, [imageSrcs]);

  return loadedImages;
};