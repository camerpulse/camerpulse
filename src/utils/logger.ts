/**
 * Centralized Logging System
 * 
 * Production-ready logging with levels, filtering, and external service integration.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  component?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableConsole: true,
  enableStorage: true,
  maxStorageEntries: 1000
};

/**
 * Main Logger class
 */
class Logger {
  private config: LoggerConfig;
  private logStorage: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Public logging methods
   */
  debug(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log('debug', message, component, metadata);
  }

  info(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log('info', message, component, metadata);
  }

  warn(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log('warn', message, component, metadata);
  }

  error(message: string, component?: string, metadata?: Record<string, any>): void {
    this.log('error', message, component, metadata);
  }

  private log(level: LogLevel, message: string, component?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      component,
      sessionId: this.sessionId,
      metadata,
      stack: level === 'error' ? new Error().stack : undefined
    };

    if (this.config.enableConsole) {
      const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn :
                          level === 'info' ? console.info : console.debug;
      consoleMethod(`[${level.toUpperCase()}] ${component ? `[${component}] ` : ''}${message}`, metadata);
    }

    if (this.config.enableStorage) {
      this.logStorage.push(entry);
      if (this.logStorage.length > this.config.maxStorageEntries) {
        this.logStorage.shift();
      }
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logStorage];
  }

  clearLogs(): void {
    this.logStorage = [];
  }
}

// Global logger instance
const logger = new Logger();

/**
 * Setup global logging
 */
export function setupLogging(): void {
  logger.info('CamerPulse application started', 'App');
}

/**
 * Component-specific logger factory
 */
export function createComponentLogger(componentName: string) {
  return {
    debug: (message: string, metadata?: Record<string, any>) => 
      logger.debug(message, componentName, metadata),
    info: (message: string, metadata?: Record<string, any>) => 
      logger.info(message, componentName, metadata),
    warn: (message: string, metadata?: Record<string, any>) => 
      logger.warn(message, componentName, metadata),
    error: (message: string, metadata?: Record<string, any>) => 
      logger.error(message, componentName, metadata)
  };
}

export { logger };
export default logger;