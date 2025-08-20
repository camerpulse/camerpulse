/**
 * Production-Ready Logging System
 * Replaces all console.log statements with structured logging
 */

import { createComponentLogger } from './logger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ProductionLogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  component?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stack?: string;
  url?: string;
  userAgent?: string;
  buildVersion?: string;
}

/**
 * Production Logger Configuration
 */
interface ProductionLoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  enableLocalStorage: boolean;
  maxLocalEntries: number;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
}

/**
 * Default production configuration
 */
const PRODUCTION_CONFIG: ProductionLoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  enableLocalStorage: true,
  maxLocalEntries: 500,
  remoteEndpoint: '/api/logs',
  batchSize: 10,
  flushInterval: 30000 // 30 seconds
};

/**
 * Production Logger Class
 */
class ProductionLogger {
  private config: ProductionLoggerConfig;
  private logQueue: ProductionLogEntry[] = [];
  private localLogs: ProductionLogEntry[] = [];
  private sessionId: string;
  private buildVersion: string;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<ProductionLoggerConfig> = {}) {
    this.config = { ...PRODUCTION_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.buildVersion = process.env.REACT_APP_VERSION || 'unknown';
    
    if (this.config.enableRemoteLogging) {
      this.startFlushTimer();
    }
    
    this.setupUnloadHandler();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  private setupUnloadHandler(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushLogs(true);
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    component?: string,
    metadata?: Record<string, any>
  ): ProductionLogEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      component,
      sessionId: this.sessionId,
      metadata,
      stack: level === 'error' || level === 'fatal' ? new Error().stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      buildVersion: this.buildVersion
    };
  }

  private processLog(entry: ProductionLogEntry): void {
    // Console logging for development
    if (this.config.enableConsole) {
      const consoleMethod = entry.level === 'error' || entry.level === 'fatal' ? console.error : 
                           entry.level === 'warn' ? console.warn :
                           entry.level === 'info' ? console.info : console.debug;
      
      const prefix = `[${entry.level.toUpperCase()}]${entry.component ? ` [${entry.component}]` : ''}`;
      consoleMethod(prefix, entry.message, entry.metadata || '');
    }

    // Local storage for debugging
    if (this.config.enableLocalStorage) {
      this.localLogs.push(entry);
      if (this.localLogs.length > this.config.maxLocalEntries) {
        this.localLogs.shift();
      }
    }

    // Queue for remote logging
    if (this.config.enableRemoteLogging) {
      this.logQueue.push(entry);
      if (this.logQueue.length >= this.config.batchSize) {
        this.flushLogs();
      }
    }
  }

  private async flushLogs(immediate: boolean = false): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      if (this.config.remoteEndpoint) {
        const method = immediate ? 'sendBeacon' : 'fetch';
        
        if (method === 'sendBeacon' && 'navigator' in window && navigator.sendBeacon) {
          navigator.sendBeacon(
            this.config.remoteEndpoint,
            JSON.stringify({ logs: logsToSend })
          );
        } else {
          await fetch(this.config.remoteEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logs: logsToSend }),
            keepalive: immediate
          });
        }
      }
    } catch (error) {
      // If remote logging fails, add logs back to queue
      this.logQueue.unshift(...logsToSend);
      
      if (this.config.enableConsole) {
        console.error('Failed to send logs to remote endpoint:', error);
      }
    }
  }

  // Public logging methods
  debug(message: string, component?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      const entry = this.createLogEntry('debug', message, component, metadata);
      this.processLog(entry);
    }
  }

  info(message: string, component?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      const entry = this.createLogEntry('info', message, component, metadata);
      this.processLog(entry);
    }
  }

  warn(message: string, component?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      const entry = this.createLogEntry('warn', message, component, metadata);
      this.processLog(entry);
    }
  }

  error(message: string, component?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      const entry = this.createLogEntry('error', message, component, metadata);
      this.processLog(entry);
    }
  }

  fatal(message: string, component?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('fatal')) {
      const entry = this.createLogEntry('fatal', message, component, metadata);
      this.processLog(entry);
      // Immediately flush fatal errors
      this.flushLogs(true);
    }
  }

  // Utility methods
  getLogs(): ProductionLogEntry[] {
    return [...this.localLogs];
  }

  clearLogs(): void {
    this.localLogs = [];
    this.logQueue = [];
  }

  getQueueSize(): number {
    return this.logQueue.length;
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushLogs(true);
  }
}

// Global production logger instance
export const productionLogger = new ProductionLogger();

/**
 * Create component-specific logger
 */
export function createProductionLogger(componentName: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) => 
      productionLogger.debug(message, componentName, metadata),
    info: (message: string, metadata?: Record<string, any>) => 
      productionLogger.info(message, componentName, metadata),
    warn: (message: string, metadata?: Record<string, any>) => 
      productionLogger.warn(message, componentName, metadata),
    error: (message: string, metadata?: Record<string, any>) => 
      productionLogger.error(message, componentName, metadata),
    fatal: (message: string, metadata?: Record<string, any>) => 
      productionLogger.fatal(message, componentName, metadata)
  };
}

/**
 * Replace console methods in production
 */
export function replaceConsoleInProduction(): void {
  if (process.env.NODE_ENV === 'production') {
    const originalConsole = { ...console };
    
    console.log = (message: any, ...args: any[]) => {
      productionLogger.info(String(message), 'Console', { args });
    };
    
    console.info = (message: any, ...args: any[]) => {
      productionLogger.info(String(message), 'Console', { args });
    };
    
    console.warn = (message: any, ...args: any[]) => {
      productionLogger.warn(String(message), 'Console', { args });
    };
    
    console.error = (message: any, ...args: any[]) => {
      productionLogger.error(String(message), 'Console', { args });
    };
    
    console.debug = (message: any, ...args: any[]) => {
      productionLogger.debug(String(message), 'Console', { args });
    };

    // Keep original methods available for emergency debugging
    (window as any).__originalConsole = originalConsole;
  }
}

/**
 * Performance logging helpers
 */
export const performanceLogger = {
  startTimer: (name: string): (() => void) => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      productionLogger.info(`Performance: ${name}`, 'Performance', {
        duration: `${duration.toFixed(2)}ms`,
        operation: name
      });
    };
  },

  trackPageLoad: (pageName: string): void => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      productionLogger.info(`Page loaded: ${pageName}`, 'PageLoad', {
        page: pageName,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: navigation.loadEventEnd - navigation.fetchStart
      });
    }
  },

  trackUserInteraction: (action: string, element: string, metadata?: Record<string, any>): void => {
    productionLogger.info(`User interaction: ${action}`, 'UserInteraction', {
      action,
      element,
      timestamp: Date.now(),
      ...metadata
    });
  }
};

/**
 * Error boundary logging
 */
export const errorBoundaryLogger = {
  logError: (error: Error, errorInfo: React.ErrorInfo, componentStack?: string): void => {
    productionLogger.fatal('React Error Boundary caught error', 'ErrorBoundary', {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundaryStack: componentStack
    });
  },

  logRecovery: (componentName: string): void => {
    productionLogger.info('Error boundary recovered', 'ErrorBoundary', {
      component: componentName,
      recoveryTime: Date.now()
    });
  }
};

export default productionLogger;
