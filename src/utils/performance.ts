/**
 * Performance Optimization Utilities
 * 
 * Core utilities for improving application performance
 */

import React from 'react';
import { createComponentLogger } from './logger';

const performanceLogger = createComponentLogger('Performance');

/**
 * Debounce function for optimizing frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function for limiting execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Performance measurement decorator
 */
export function measurePerformance(operationName: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = method?.apply(this, args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          performanceLogger.info(`${operationName} completed`, 'Performance', {
            duration: `${duration.toFixed(2)}ms`,
            operation: operationName
          });
        });
      }
      
      const duration = performance.now() - start;
      performanceLogger.info(`${operationName} completed`, 'Performance', {
        duration: `${duration.toFixed(2)}ms`,
        operation: operationName
      });
      
      return result;
    } as T;
    
    return descriptor;
  };
}

/**
 * Lazy load components with error boundary
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  function Component(props: any) {
    const FallbackComponent = fallback || function LoadingComponent() { 
      return React.createElement('div', null, 'Loading...'); 
    };
    return React.createElement(
      React.Suspense,
      { fallback: React.createElement(FallbackComponent) },
      React.createElement(LazyComponent, props)
    );
  }

  return Component;
}

/**
 * Optimized batch updater for state changes
 */
export class BatchUpdater<T> {
  private updates: Partial<T>[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private callback: (updates: Partial<T>[]) => void;

  constructor(callback: (updates: Partial<T>[]) => void, delay = 50) {
    this.callback = callback;
  }

  add(update: Partial<T>) {
    this.updates.push(update);
    
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, 50);
  }

  flush() {
    if (this.updates.length > 0) {
      this.callback([...this.updates]);
      this.updates = [];
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

/**
 * Memory usage monitor
 */
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    performanceLogger.info('Memory usage', 'Performance', {
      usedJSHeapSize: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      totalJSHeapSize: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      jsHeapSizeLimit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
}

/**
 * Virtual scrolling helper for large lists
 */
export function useVirtualScroll(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  );
  
  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex,
    offsetY: startIndex * itemHeight
  };
}