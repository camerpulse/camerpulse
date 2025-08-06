import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock console methods
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle string errors with default options', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError('Test error message');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Test error message');
    expect(toast.error).toHaveBeenCalledWith(
      'Test error message',
      { description: 'Please try again or contact support if the issue persists.' }
    );
  });

  it('should handle Error objects', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error object');
    
    act(() => {
      result.current.handleError(testError, 'Test context');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error in Test context:', testError);
    expect(toast.error).toHaveBeenCalledWith(
      'Test error object',
      { description: 'Test context' }
    );
  });

  it('should respect showToast option', () => {
    const { result } = renderHook(() => useErrorHandler({ showToast: false }));
    
    act(() => {
      result.current.handleError('Test error');
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should respect logToConsole option', () => {
    const { result } = renderHook(() => useErrorHandler({ logToConsole: false }));
    
    act(() => {
      result.current.handleError('Test error');
    });

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('should handle async errors and re-throw', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const asyncError = new Error('Async error');
    const failingAsyncFn = async () => {
      throw asyncError;
    };

    await expect(
      result.current.handleAsyncError(failingAsyncFn, 'Async context')
    ).rejects.toThrow('Async error');

    expect(consoleSpy).toHaveBeenCalledWith('Error in Async context:', asyncError);
    expect(toast.error).toHaveBeenCalledWith(
      'Async error',
      { description: 'Async context' }
    );
  });

  it('should return result from successful async function', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const successfulAsyncFn = async () => 'success result';

    const asyncResult = await result.current.handleAsyncError(successfulAsyncFn);

    expect(asyncResult).toBe('success result');
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should log to service when enabled', () => {
    const { result } = renderHook(() => useErrorHandler({ logToService: true }));
    
    act(() => {
      result.current.handleError('Service error', 'Service context');
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Error logged to service:',
      expect.objectContaining({
        message: 'Service error',
        context: 'Service context',
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String),
      })
    );
  });
});