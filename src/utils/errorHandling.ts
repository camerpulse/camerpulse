/**
 * Global Error Handling Utilities
 * 
 * Centralized error handling system for CamerPulse platform.
 * Provides consistent error reporting, logging, and user feedback.
 */

import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  userId?: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Error severity levels with user-facing messages
 */
const ERROR_SEVERITY_CONFIG = {
  low: {
    showToast: false,
    logLevel: 'warn',
    message: 'Something went wrong. Please try again.'
  },
  medium: {
    showToast: true,
    logLevel: 'error',
    message: 'An error occurred. Please try again or contact support.'
  },
  high: {
    showToast: true,
    logLevel: 'error',
    message: 'A serious error occurred. Please refresh the page and try again.'
  },
  critical: {
    showToast: true,
    logLevel: 'error',
    message: 'A critical error occurred. Please contact support immediately.'
  }
} as const;

/**
 * Common error codes and their configurations
 */
export const ERROR_CODES = {
  // Network Errors
  NETWORK_ERROR: { severity: 'medium' as const, message: 'Network connection failed. Please check your internet connection.' },
  TIMEOUT_ERROR: { severity: 'medium' as const, message: 'Request timed out. Please try again.' },
  SERVER_ERROR: { severity: 'high' as const, message: 'Server error occurred. Please try again later.' },
  
  // Authentication Errors
  AUTH_FAILED: { severity: 'medium' as const, message: 'Authentication failed. Please sign in again.' },
  UNAUTHORIZED: { severity: 'medium' as const, message: 'You are not authorized to perform this action.' },
  SESSION_EXPIRED: { severity: 'medium' as const, message: 'Your session has expired. Please sign in again.' },
  
  // Validation Errors
  VALIDATION_ERROR: { severity: 'low' as const, message: 'Please check your input and try again.' },
  MISSING_FIELDS: { severity: 'low' as const, message: 'Please fill in all required fields.' },
  INVALID_FORMAT: { severity: 'low' as const, message: 'Invalid data format. Please check your input.' },
  
  // Business Logic Errors
  PERMISSION_DENIED: { severity: 'medium' as const, message: 'You do not have permission to perform this action.' },
  RESOURCE_NOT_FOUND: { severity: 'low' as const, message: 'The requested resource was not found.' },
  OPERATION_FAILED: { severity: 'medium' as const, message: 'Operation failed. Please try again.' },
  
  // Critical System Errors
  DATABASE_ERROR: { severity: 'critical' as const, message: 'Database error occurred. Please contact support.' },
  CONFIG_ERROR: { severity: 'critical' as const, message: 'Configuration error. Please contact support.' },
  UNKNOWN_ERROR: { severity: 'medium' as const, message: 'An unexpected error occurred. Please try again.' }
} as const;

/**
 * Global error handler class
 */
class GlobalErrorHandler {
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  /**
   * Handle and process application errors
   */
  handle(error: Error | AppError, context?: ErrorContext): void {
    const appError = this.normalizeError(error, context);
    
    // Add to error queue
    this.addToQueue(appError);
    
    // Log the error
    this.logError(appError);
    
    // Show user feedback if needed
    this.showUserFeedback(appError);
    
    // Report to external services if critical
    if (appError.severity === 'critical') {
      this.reportToExternalService(appError);
    }
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(error: Error | AppError, context?: ErrorContext): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    // Handle standard JavaScript errors
    const errorCode = this.determineErrorCode(error);
    const config = ERROR_CODES[errorCode] || ERROR_CODES.UNKNOWN_ERROR;

    return {
      code: errorCode,
      message: config.message,
      details: {
        originalMessage: error.message,
        stack: error.stack,
        context
      },
      severity: config.severity,
      timestamp: Date.now(),
      userId: context?.userId
    };
  }

  /**
   * Determine error code from JavaScript Error
   */
  private determineErrorCode(error: Error): keyof typeof ERROR_CODES {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('unauthorized') || message.includes('auth')) {
      return 'UNAUTHORIZED';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'RESOURCE_NOT_FOUND';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'SERVER_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Check if error is already an AppError
   */
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'code' in error && 'severity' in error;
  }

  /**
   * Add error to processing queue
   */
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Log error based on severity
   */
  private logError(error: AppError): void {
    const config = ERROR_SEVERITY_CONFIG[error.severity];
    const logMethod = config.logLevel as keyof Console;
    
    console[logMethod](`[${error.severity.toUpperCase()}] ${error.code}:`, {
      message: error.message,
      details: error.details,
      timestamp: new Date(error.timestamp).toISOString()
    });
  }

  /**
   * Show user feedback for errors
   */
  private showUserFeedback(error: AppError): void {
    const config = ERROR_SEVERITY_CONFIG[error.severity];
    
    if (config.showToast) {
      toast({
        title: 'Error',
        description: error.message,
        variant: error.severity === 'critical' ? 'destructive' : 'default'
      });
    }
  }

  /**
   * Report critical errors to external monitoring service
   */
  private reportToExternalService(error: AppError): void {
    // TODO: Integrate with external error reporting service (e.g., Sentry)
    console.error('CRITICAL ERROR - External reporting needed:', error);
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Global error handler instance
const globalErrorHandler = new GlobalErrorHandler();

/**
 * Setup global error handling for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handle(new Error(event.reason), {
      component: 'Global',
      action: 'unhandledRejection'
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    globalErrorHandler.handle(event.error || new Error(event.message), {
      component: 'Global',
      action: 'uncaughtError',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });
}

/**
 * Main error handling function for application use
 */
export function handleError(error: Error | AppError, context?: ErrorContext): void {
  globalErrorHandler.handle(error, context);
}

/**
 * Create a standardized AppError
 */
export function createError(
  code: keyof typeof ERROR_CODES,
  customMessage?: string,
  details?: any
): AppError {
  const config = ERROR_CODES[code];
  
  return {
    code,
    message: customMessage || config.message,
    details,
    severity: config.severity,
    timestamp: Date.now()
  };
}

/**
 * Async error wrapper for handling promise errors
 */
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error as Error, context);
    return null;
  }
}

/**
 * Error boundary hook for React components
 */
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: ErrorContext) => {
      handleError(error, context);
    },
    createError,
    withErrorHandling
  };
}

export { globalErrorHandler };