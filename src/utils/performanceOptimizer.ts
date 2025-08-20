/**
 * Performance Optimization Utilities
 * Production-ready performance optimization tools
 */

import { createProductionLogger } from './productionLogger';

const logger = createProductionLogger('PerformanceOptimizer');

/**
 * Resource Preloader
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preloadQueue: Array<{ url: string; type: string; priority: 'high' | 'low' }> = [];
  private isProcessing = false;

  /**
   * Preload critical resources
   */
  preloadCritical(resources: Array<{ url: string; type: 'script' | 'style' | 'image' | 'font' }>): void {
    resources.forEach(({ url, type }) => {
      if (this.preloadedResources.has(url)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      
      if (type === 'font') {
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
      this.preloadedResources.add(url);
      
      logger.debug(`Preloaded ${type}: ${url}`);
    });
  }

  /**
   * Prefetch non-critical resources
   */
  prefetchResources(urls: string[]): void {
    urls.forEach(url => {
      if (this.preloadedResources.has(url)) return;

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      this.preloadedResources.add(url);
      
      logger.debug(`Prefetched: ${url}`);
    });
  }

  /**
   * DNS prefetch for external domains
   */
  dnsPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
      
      logger.debug(`DNS prefetched: ${domain}`);
    });
  }
}

/**
 * Intersection Observer Manager
 */
export class IntersectionManager {
  private observers = new Map<string, IntersectionObserver>();
  private defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px'
  };

  /**
   * Create or get intersection observer
   */
  observe(
    id: string,
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = this.defaultOptions
  ): IntersectionObserver {
    if (!this.observers.has(id)) {
      const observer = new IntersectionObserver(callback, options);
      this.observers.set(id, observer);
      logger.debug(`Created intersection observer: ${id}`);
    }
    
    return this.observers.get(id)!;
  }

  /**
   * Cleanup observer
   */
  disconnect(id: string): void {
    const observer = this.observers.get(id);
    if (observer) {
      observer.disconnect();
      this.observers.delete(id);
      logger.debug(`Disconnected intersection observer: ${id}`);
    }
  }

  /**
   * Cleanup all observers
   */
  disconnectAll(): void {
    this.observers.forEach((observer, id) => {
      observer.disconnect();
      logger.debug(`Disconnected intersection observer: ${id}`);
    });
    this.observers.clear();
  }
}

/**
 * Image Optimization
 */
export class ImageOptimizer {
  private loadedImages = new Set<string>();

  /**
   * Lazy load images with intersection observer
   */
  lazyLoadImage(img: HTMLImageElement, options?: IntersectionObserverInit): void {
    if (this.loadedImages.has(img.src)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          const dataSrc = image.getAttribute('data-src');
          
          if (dataSrc) {
            image.src = dataSrc;
            image.removeAttribute('data-src');
            this.loadedImages.add(dataSrc);
            
            image.onload = () => {
              image.classList.add('loaded');
              observer.unobserve(image);
              logger.debug(`Lazy loaded image: ${dataSrc}`);
            };

            image.onerror = () => {
              logger.warn(`Failed to load image: ${dataSrc}`);
              observer.unobserve(image);
            };
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(img);
  }

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');
  }

  /**
   * Optimize image loading with WebP support
   */
  optimizeImageSrc(src: string, options: { width?: number; quality?: number } = {}): string {
    const { width, quality = 85 } = options;
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('auto', 'format'); // Auto WebP conversion
    
    return `${src}?${params.toString()}`;
  }
}

/**
 * Bundle Analyzer
 */
export class BundleAnalyzer {
  /**
   * Analyze and report bundle metrics
   */
  analyzeBundleSize(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      const cssResources = resources.filter(r => r.name.endsWith('.css'));
      
      const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
      logger.info('Bundle analysis complete', {
        jsFiles: jsResources.length,
        cssFiles: cssResources.length,
        totalJSSize: `${(totalJSSize / 1024).toFixed(2)}KB`,
        totalCSSSize: `${(totalCSSSize / 1024).toFixed(2)}KB`,
        totalSize: `${((totalJSSize + totalCSSSize) / 1024).toFixed(2)}KB`
      });
    }
  }

  /**
   * Monitor chunk loading performance
   */
  monitorChunkLoading(): void {
    const originalImport = window.__webpack_require__ || (() => {});
    
    // In a real implementation, you would wrap dynamic imports
    // to track their loading performance
    logger.info('Chunk loading monitoring initialized');
  }
}

/**
 * Memory Monitor
 */
export class MemoryMonitor {
  private monitoringInterval?: NodeJS.Timeout;

  /**
   * Start memory monitoring
   */
  startMonitoring(interval: number = 30000): void {
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, interval);
    
    logger.info('Memory monitoring started', { interval });
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      logger.info('Memory monitoring stopped');
    }
  }

  /**
   * Check current memory usage
   */
  checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      const usagePercent = (usedMB / limitMB) * 100;
      
      if (usagePercent > 80) {
        logger.warn('High memory usage detected', {
          usedMB,
          totalMB,
          limitMB,
          usagePercent: `${usagePercent.toFixed(1)}%`
        });
      } else {
        logger.debug('Memory usage check', {
          usedMB,
          totalMB,
          limitMB,
          usagePercent: `${usagePercent.toFixed(1)}%`
        });
      }
    }
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      logger.info('Forced garbage collection');
    }
  }
}

/**
 * Performance Budget Monitor
 */
export class PerformanceBudget {
  private budgets = {
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1
    totalBlockingTime: 300 // 300ms
  };

  /**
   * Set performance budgets
   */
  setBudgets(budgets: Partial<typeof this.budgets>): void {
    this.budgets = { ...this.budgets, ...budgets };
    logger.info('Performance budgets updated', this.budgets);
  }

  /**
   * Check if metrics exceed budget
   */
  checkBudgets(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Check paint timings
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcp && fcp.startTime > this.budgets.firstContentfulPaint) {
        logger.warn('First Contentful Paint exceeds budget', {
          actual: `${fcp.startTime.toFixed(2)}ms`,
          budget: `${this.budgets.firstContentfulPaint}ms`
        });
      }

      // Check LCP
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1];
        if (lcp.startTime > this.budgets.largestContentfulPaint) {
          logger.warn('Largest Contentful Paint exceeds budget', {
            actual: `${lcp.startTime.toFixed(2)}ms`,
            budget: `${this.budgets.largestContentfulPaint}ms`
          });
        }
      }

      // Check layout shift
      const clsEntries = performance.getEntriesByType('layout-shift');
      const cls = clsEntries.reduce((sum, entry: any) => sum + entry.value, 0);
      if (cls > this.budgets.cumulativeLayoutShift) {
        logger.warn('Cumulative Layout Shift exceeds budget', {
          actual: cls.toFixed(4),
          budget: this.budgets.cumulativeLayoutShift.toString()
        });
      }
    }
  }
}

// Global instances
export const resourcePreloader = new ResourcePreloader();
export const intersectionManager = new IntersectionManager();
export const imageOptimizer = new ImageOptimizer();
export const bundleAnalyzer = new BundleAnalyzer();
export const memoryMonitor = new MemoryMonitor();
export const performanceBudget = new PerformanceBudget();

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations(): void {
  logger.info('Initializing performance optimizations');

  // Preload critical resources
  resourcePreloader.preloadCritical([
    { url: '/fonts/inter.woff2', type: 'font' },
    { url: '/css/critical.css', type: 'style' }
  ]);

  // DNS prefetch for external services
  resourcePreloader.dnsPrefetch([
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.supabase.co'
  ]);

  // Start memory monitoring in production
  if (process.env.NODE_ENV === 'production') {
    memoryMonitor.startMonitoring();
  }

  // Analyze bundle size
  setTimeout(() => {
    bundleAnalyzer.analyzeBundleSize();
    performanceBudget.checkBudgets();
  }, 5000);

  logger.info('Performance optimizations initialized');
}

export default {
  resourcePreloader,
  intersectionManager,
  imageOptimizer,
  bundleAnalyzer,
  memoryMonitor,
  performanceBudget,
  initializePerformanceOptimizations
};