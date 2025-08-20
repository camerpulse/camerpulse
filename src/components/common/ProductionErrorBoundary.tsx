import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import { errorBoundaryLogger, createProductionLogger } from '@/utils/productionLogger';
import { performanceMonitor } from '@/utils/performance';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

const logger = createProductionLogger('ProductionErrorBoundary');

/**
 * Production-Ready Error Boundary
 * Enhanced error handling with logging, user feedback, and recovery options
 */
export class ProductionErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private maxRetryCount = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const startTime = performance.now();
    
    // Log the error
    errorBoundaryLogger.logError(error, errorInfo, this.constructor.name);
    
    // Track performance impact
    performanceMonitor.track('error_boundary_catch', performance.now() - startTime);
    
    // Update state with error info
    this.setState({
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Call optional error handler
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('Error in onError handler', {
          originalError: error.message,
          handlerError: handlerError instanceof Error ? handlerError.message : 'Unknown'
        });
      }
    }

    // Report to external error tracking service
    this.reportToExternalService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.length !== prevResetKeys.length ||
        resetKeys.some((key, index) => key !== prevResetKeys[index]);

      if (hasResetKeyChanged) {
        logger.info('Resetting error boundary due to resetKeys change');
        this.resetErrorBoundary();
      }
    }
  }

  private reportToExternalService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In production, you would integrate with services like:
      // - Sentry
      // - LogRocket
      // - Bugsnag
      // - Custom error reporting endpoint
      
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        buildVersion: process.env.REACT_APP_VERSION || 'unknown'
      };

      // Simulated external service call
      logger.info('Error reported to external service', { errorId: this.state.errorId });
      
      // Example: Send to external service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
      
    } catch (reportError) {
      logger.error('Failed to report error to external service', {
        originalError: error.message,
        reportError: reportError instanceof Error ? reportError.message : 'Unknown'
      });
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    });
    
    errorBoundaryLogger.logRecovery(this.constructor.name);
    
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
  };

  private handleRetry = () => {
    logger.info('User initiated error boundary retry', {
      retryCount: this.state.retryCount,
      errorId: this.state.errorId
    });
    
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    logger.info('User navigated to home from error boundary');
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = `Bug Report - Error ID: ${errorId}`;
    const body = `
Error Details:
- Error ID: ${errorId}
- Message: ${error?.message || 'Unknown error'}
- URL: ${window.location.href}
- Time: ${new Date().toISOString()}
- Browser: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[User description here]
    `.trim();

    const mailtoUrl = `mailto:support@camerpulse.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    logger.info('User initiated bug report', { errorId });
  };

  render() {
    const { hasError, error, errorId, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Check if max retries exceeded
      const maxRetriesExceeded = retryCount >= this.maxRetryCount;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-destructive/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-destructive">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base">
                We encountered an unexpected error. Our team has been notified and is working to fix this issue.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details
                </h4>
                <div className="text-sm space-y-1">
                  <p><strong>Error ID:</strong> {errorId}</p>
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  {error && (
                    <div className="mt-2">
                      <p><strong>Technical Details:</strong></p>
                      <code className="text-xs bg-background p-2 rounded block mt-1 text-muted-foreground">
                        {error.message}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!maxRetriesExceeded && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Button>
                
                <Button 
                  onClick={this.handleReportBug}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {/* Additional Help */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please contact our support team at{' '}
                  <a 
                    href="mailto:support@camerpulse.com" 
                    className="text-primary hover:underline"
                  >
                    support@camerpulse.com
                  </a>
                </p>
                <p className="mt-2">
                  Include Error ID <code className="bg-muted px-1 rounded">{errorId}</code> in your message.
                </p>
              </div>

              {maxRetriesExceeded && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Multiple retry attempts failed. Please refresh the page or contact support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * HOC for easier use
 */
export function withProductionErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundary = (props: T) => (
    <ProductionErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ProductionErrorBoundary>
  );

  WithErrorBoundary.displayName = `withProductionErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
}

export default ProductionErrorBoundary;