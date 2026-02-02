'use client';

import { Button, Card, CardContent } from '@dashin/ui';
import { useQueryClient } from '@tanstack/react-query';

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description,
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorFallbackProps) {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Refetch all queries
    queryClient.refetchQueries();
    
    // Reset error state
    resetError?.();
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            <p className="text-gray-600">
              {description || error.message || 'An unexpected error occurred'}
            </p>
          </div>

          {/* Error Details (Development only) */}
          {showDetails && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-md overflow-auto max-h-48">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {error.stack || error.message}
                </pre>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetry}
              className="flex-1"
              variant="primary"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              variant="secondary"
            >
              Reload Page
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500">
            If this problem persists, please contact support
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact inline error display
export function InlineError({
  error,
  retry,
  className = '',
}: {
  error: Error | string;
  retry?: () => void;
  className?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-red-600 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-red-800">{errorMessage}</p>
      </div>
      {retry && (
        <Button
          onClick={retry}
          variant="ghost"
          size="sm"
          className="text-red-700 hover:text-red-900 hover:bg-red-100"
        >
          Retry
        </Button>
      )}
    </div>
  );
}

// Empty state with error context
export function EmptyStateError({
  title = 'No data available',
  description = 'Unable to load data at this time',
  retry,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{description}</p>
      {retry && (
        <Button onClick={retry} variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
}
