export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private sessionId: string = this.generateSessionId();

  constructor() {
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // This would be populated from auth context in a real implementation
    return undefined;
  }

  private formatMessage(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[entry.level];
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    return `${entry.timestamp} ${levelName}${contextStr}: ${entry.message}`;
  }

  private writeLog(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);

    // Console output with appropriate method
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data);
        break;
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    }

    // Store in local storage for debugging (limit to last 100 entries)
    this.storeLocalLog(entry);
  }

  private sendToLoggingService(entry: LogEntry): void {
    // In production, send to logging service like DataDog, CloudWatch, etc.
    // For now, just structure the data
    const logData = {
      ...entry,
      platform: 'CamerPulse',
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Example: send to external service
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logData)
    // });
  }

  private storeLocalLog(entry: LogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  debug(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
      this.writeLog(entry);
    }
  }

  info(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
      this.writeLog(entry);
    }
  }

  warn(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
      this.writeLog(entry);
    }
  }

  error(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, data);
      this.writeLog(entry);
    }
  }

  // Utility methods
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLocalLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  clearLocalLogs(): void {
    localStorage.removeItem('app_logs');
  }

  // Performance tracking
  timeStart(label: string): void {
    console.time(label);
    this.debug(`Timer started: ${label}`, 'Performance');
  }

  timeEnd(label: string): void {
    console.timeEnd(label);
    this.debug(`Timer ended: ${label}`, 'Performance');
  }

  // User action tracking
  trackAction(action: string, context?: string, data?: any): void {
    this.info(`User action: ${action}`, context || 'UserAction', data);
  }

  // API call tracking
  trackApiCall(method: string, url: string, duration?: number, status?: number): void {
    const message = `API ${method} ${url}`;
    const data = { duration, status };
    
    if (status && status >= 400) {
      this.error(message, 'API', data);
    } else {
      this.info(message, 'API', data);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Setup global error tracking
export const setupLogging = () => {
  // Track page views
  logger.info(`Page loaded: ${window.location.pathname}`, 'Navigation');

  // Track navigation
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    logger.info(`Navigation: ${window.location.pathname}`, 'Navigation');
  };

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(
      `Unhandled promise rejection: ${event.reason}`,
      'UnhandledRejection',
      { reason: event.reason }
    );
  });

  // Track uncaught errors
  window.addEventListener('error', (event) => {
    logger.error(
      `Uncaught error: ${event.message}`,
      'UncaughtError',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }
    );
  });
};
