/**
 * Production-ready error tracking and performance monitoring
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface ErrorReport {
  error: Error;
  errorInfo?: any;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
  buildVersion?: string;
}

class ProductionMonitor {
  private performanceObserver?: PerformanceObserver;
  private errorQueue: ErrorReport[] = [];
  private metricsQueue: PerformanceMetric[] = [];
  private maxQueueSize = 100;

  constructor() {
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupPeriodicReporting();
  }

  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          });
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'resource', 'measure', 'paint'] 
      });
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  private setupErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError({
        error: new Error(event.message),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        error: new Error(`Unhandled Promise Rejection: ${event.reason}`),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });
  }

  private setupPeriodicReporting() {
    // Send metrics every 5 minutes
    setInterval(() => {
      this.flushMetrics();
    }, 5 * 60 * 1000);

    // Send errors immediately but batch them
    setInterval(() => {
      this.flushErrors();
    }, 30 * 1000);
  }

  recordMetric(metric: PerformanceMetric) {
    this.metricsQueue.push(metric);
    
    if (this.metricsQueue.length > this.maxQueueSize) {
      this.metricsQueue.shift(); // Remove oldest
    }
  }

  recordError(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport);
    
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest
    }

    // For critical errors, send immediately
    if (errorReport.error.message.includes('ChunkLoadError') || 
        errorReport.error.message.includes('SecurityError')) {
      this.flushErrors();
    }
  }

  private async flushMetrics() {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      // In production, send to your analytics service
      console.log('Performance metrics:', metrics);
      
      // Example: Send to analytics service
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ metrics })
      // });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
      // Re-queue the metrics for next attempt
      this.metricsQueue.unshift(...metrics);
    }
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to your error tracking service (Sentry, LogRocket, etc.)
      console.error('Error reports:', errors);
      
      // Example: Send to error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errors })
      // });
    } catch (error) {
      console.warn('Failed to send error reports:', error);
      // Re-queue the errors for next attempt
      this.errorQueue.unshift(...errors);
    }
  }

  // Core Web Vitals monitoring
  measureCoreWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric({
        name: 'LCP',
        value: lastEntry.startTime,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        this.recordMetric({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.recordMetric({
        name: 'CLS',
        value: clsValue,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Route change tracking
  trackRouteChange(from: string, to: string, duration: number) {
    this.recordMetric({
      name: 'route-change',
      value: duration,
      timestamp: Date.now(),
      url: `${from} -> ${to}`,
      userAgent: navigator.userAgent,
    });
  }

  // User interaction tracking
  trackUserInteraction(action: string, element: string, value?: number) {
    this.recordMetric({
      name: `interaction-${action}`,
      value: value || 1,
      timestamp: Date.now(),
      url: `${window.location.href}#${element}`,
      userAgent: navigator.userAgent,
    });
  }

  // API call tracking
  trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.recordMetric({
      name: `api-${method.toLowerCase()}-${status}`,
      value: duration,
      timestamp: Date.now(),
      url: endpoint,
      userAgent: navigator.userAgent,
    });
  }

  // Cleanup
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Global instance
export const productionMonitor = new ProductionMonitor();

// Initialize Core Web Vitals monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    productionMonitor.measureCoreWebVitals();
  });
}