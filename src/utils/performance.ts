/**
 * Performance Monitoring & Analytics System
 * 
 * Comprehensive performance tracking for CamerPulse platform.
 * Includes Web Vitals, user interactions, and custom metrics.
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  id?: string;
  metadata?: Record<string, any>;
}

export interface UserInteractionMetric {
  type: 'click' | 'scroll' | 'navigation' | 'search' | 'form_submit';
  element?: string;
  page: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private interactions: UserInteractionMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.setupWebVitals();
    this.setupResourceMonitoring();
    this.setupUserInteractionTracking();
    this.setupMemoryMonitoring();
    this.setupNavigationTracking();
    
    this.isInitialized = true;
    console.log('Performance monitoring initialized');
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  private setupWebVitals(): void {
    // Largest Contentful Paint
    getLCP((metric) => {
      this.recordMetric({
        name: 'LCP',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id,
        metadata: { rating: this.getRating('LCP', metric.value) }
      });
    });

    // First Input Delay
    getFID((metric) => {
      this.recordMetric({
        name: 'FID',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id,
        metadata: { rating: this.getRating('FID', metric.value) }
      });
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.recordMetric({
        name: 'CLS',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id,
        metadata: { rating: this.getRating('CLS', metric.value) }
      });
    });

    // First Contentful Paint
    getFCP((metric) => {
      this.recordMetric({
        name: 'FCP',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id,
        metadata: { rating: this.getRating('FCP', metric.value) }
      });
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.recordMetric({
        name: 'TTFB',
        value: metric.value,
        timestamp: Date.now(),
        id: metric.id,
        metadata: { rating: this.getRating('TTFB', metric.value) }
      });
    });
  }

  /**
   * Setup resource loading monitoring
   */
  private setupResourceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          this.recordMetric({
            name: 'resource_load',
            value: resource.duration,
            timestamp: Date.now(),
            metadata: {
              name: resource.name,
              type: this.getResourceType(resource.name),
              size: resource.transferSize || 0,
              cached: resource.transferSize === 0 && resource.decodedBodySize > 0
            }
          });
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', resourceObserver);
  }

  /**
   * Setup user interaction tracking
   */
  private setupUserInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(target),
        page: window.location.pathname,
        timestamp: Date.now(),
        metadata: {
          tagName: target.tagName,
          className: target.className,
          id: target.id
        }
      });
    });

    // Scroll tracking (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordInteraction({
          type: 'scroll',
          page: window.location.pathname,
          timestamp: Date.now(),
          metadata: {
            scrollY: window.scrollY,
            scrollPercentage: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
          }
        });
      }, 100);
    });

    // Form submission tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.recordInteraction({
        type: 'form_submit',
        element: this.getElementSelector(form),
        page: window.location.pathname,
        timestamp: Date.now(),
        metadata: {
          formId: form.id,
          formClass: form.className
        }
      });
    });
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric({
          name: 'memory_usage',
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
          metadata: {
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
          }
        });
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Setup navigation tracking
   */
  private setupNavigationTracking(): void {
    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.recordInteraction({
        type: 'navigation',
        page: window.location.pathname,
        timestamp: Date.now(),
        metadata: {
          visibility: document.visibilityState,
          referrer: document.referrer
        }
      });
    });

    // Track page load complete
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordMetric({
          name: 'page_load',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          timestamp: Date.now(),
          metadata: {
            domComplete: navigation.domComplete - navigation.loadEventStart,
            domInteractive: navigation.domInteractive - navigation.loadEventStart,
            transferSize: navigation.transferSize,
            type: navigation.type
          }
        });
      }
    });
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics (last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log critical metrics
    if (metric.metadata?.rating === 'poor') {
      console.warn(`Poor performance detected: ${metric.name} = ${metric.value}`);
    }
  }

  /**
   * Record user interaction
   */
  recordInteraction(interaction: UserInteractionMetric): void {
    this.interactions.push(interaction);
    
    // Keep only recent interactions (last 500)
    if (this.interactions.length > 500) {
      this.interactions = this.interactions.slice(-500);
    }
  }

  /**
   * Get performance rating based on thresholds
   */
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  /**
   * Get CSS selector for element
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Get metrics summary
   */
  getMetrics(type?: string): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.name === type);
    }
    return [...this.metrics];
  }

  /**
   * Get interactions summary
   */
  getInteractions(type?: UserInteractionMetric['type']): UserInteractionMetric[] {
    if (type) {
      return this.interactions.filter(i => i.type === type);
    }
    return [...this.interactions];
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    webVitals: Record<string, { value: number; rating: string }>;
    pageLoad: number;
    memoryUsage: number;
    totalInteractions: number;
  } {
    const webVitals = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].reduce((acc, metric) => {
      const latest = this.metrics.filter(m => m.name === metric).pop();
      if (latest) {
        acc[metric] = {
          value: latest.value,
          rating: latest.metadata?.rating || 'unknown'
        };
      }
      return acc;
    }, {} as Record<string, { value: number; rating: string }>);

    const pageLoadMetric = this.metrics.filter(m => m.name === 'page_load').pop();
    const memoryMetric = this.metrics.filter(m => m.name === 'memory_usage').pop();

    return {
      webVitals,
      pageLoad: pageLoadMetric?.value || 0,
      memoryUsage: memoryMetric?.metadata?.percentage || 0,
      totalInteractions: this.interactions.length
    };
  }

  /**
   * Export data for analytics
   */
  exportData(): {
    metrics: PerformanceMetric[];
    interactions: UserInteractionMetric[];
    summary: ReturnType<typeof this.getSummary>;
  } {
    return {
      metrics: this.getMetrics(),
      interactions: this.getInteractions(),
      summary: this.getSummary()
    };
  }

  /**
   * Clear collected data
   */
  clear(): void {
    this.metrics = [];
    this.interactions = [];
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.clear();
    this.isInitialized = false;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    monitor: performanceMonitor,
    getMetrics: (type?: string) => performanceMonitor.getMetrics(type),
    getInteractions: (type?: UserInteractionMetric['type']) => performanceMonitor.getInteractions(type),
    getSummary: () => performanceMonitor.getSummary(),
    exportData: () => performanceMonitor.exportData(),
    recordCustomMetric: (name: string, value: number, metadata?: Record<string, any>) => {
      performanceMonitor.recordMetric({ name, value, timestamp: Date.now(), metadata });
    }
  };
}

/**
 * Performance measurement utilities
 */
export const performanceUtils = {
  /**
   * Measure function execution time
   */
  measure: <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    performanceMonitor.recordMetric({
      name: `custom_${name}`,
      value: duration,
      timestamp: Date.now(),
      metadata: { type: 'function_execution' }
    });
    
    return result;
  },

  /**
   * Measure async function execution time
   */
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    performanceMonitor.recordMetric({
      name: `custom_${name}`,
      value: duration,
      timestamp: Date.now(),
      metadata: { type: 'async_function_execution' }
    });
    
    return result;
  },

  /**
   * Mark performance milestone
   */
  mark: (name: string, metadata?: Record<string, any>) => {
    performance.mark(name);
    performanceMonitor.recordMetric({
      name: `mark_${name}`,
      value: performance.now(),
      timestamp: Date.now(),
      metadata: { type: 'performance_mark', ...metadata }
    });
  }
};

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}
