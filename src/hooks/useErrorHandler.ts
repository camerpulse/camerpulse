import { useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    logToService = true
  } = options;

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Log to console
    if (logToConsole) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }

    // Show user-friendly toast
    if (showToast) {
      toast.error(
        errorMessage || 'An unexpected error occurred',
        {
          description: context || 'Please try again or contact support if the issue persists.'
        }
      );
    }

    // Log to external service (Sentry, LogRocket, etc.)
    if (logToService) {
      logErrorToService(error, context);
    }
  }, [showToast, logToConsole, logToService]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    errorContext?: string
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, errorContext);
      throw error; // Re-throw so calling code can handle it
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};

// Helper function to log errors to external service
const logErrorToService = (error: Error | string, context?: string) => {
  const errorData = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: null, // Would be populated from auth context
  };

  // In production, this would send to Sentry, LogRocket, etc.
  console.log('Error logged to service:', errorData);
  
  // Example: Send to Sentry
  // Sentry.captureException(error, { contexts: { custom: errorData } });
};

// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    logErrorToService(
      new Error(event.reason),
      'Unhandled Promise Rejection'
    );
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    logErrorToService(
      event.error || new Error(event.message),
      'Uncaught Error'
    );
  });
};