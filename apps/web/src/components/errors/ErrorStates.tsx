/**
 * Error State Components
 * User-friendly error pages and inline error handlers
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@dashin/ui';
import { FadeIn, ScaleIn } from '@/components/animations';
import {
  AlertTriangle,
  XCircle,
  WifiOff,
  FileQuestion,
  Lock,
  ServerCrash,
  RefreshCw,
  Home,
  ArrowLeft,
  Info,
} from 'lucide-react';

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Base error component
interface ErrorDisplayProps {
  title: string;
  description: string;
  icon?: ReactNode;
  severity?: ErrorSeverity;
  actions?: ReactNode;
  className?: string;
}

export function ErrorDisplay({
  title,
  description,
  icon,
  severity = 'error',
  actions,
  className = '',
}: ErrorDisplayProps) {
  const severityStyles = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    critical: 'text-red-600',
  };

  const severityBg = {
    info: 'bg-blue-50 dark:bg-blue-950/20',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20',
    error: 'bg-red-50 dark:bg-red-950/20',
    critical: 'bg-red-100 dark:bg-red-950/40',
  };

  return (
    <ScaleIn>
      <div
        className={`rounded-lg border p-6 ${severityBg[severity]} ${className}`}
      >
        <div className="flex items-start gap-4">
          {icon && (
            <div className={`flex-shrink-0 ${severityStyles[severity]}`}>
              {icon}
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            {actions && <div className="mt-4 flex gap-2">{actions}</div>}
          </div>
        </div>
      </div>
    </ScaleIn>
  );
}

// 404 Not Found page
export function Error404() {
  return (
    <FadeIn className="flex items-center justify-center min-h-[600px]">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <FileQuestion className="h-24 w-24 text-muted-foreground/50" />
            <div className="absolute -top-2 -right-2">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

// 500 Server Error page
export function Error500() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <FadeIn className="flex items-center justify-center min-h-[600px]">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <ServerCrash className="h-24 w-24 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">500</h1>
          <h2 className="text-2xl font-semibold">Internal Server Error</h2>
          <p className="text-muted-foreground">
            Something went wrong on our end. We&apos;re working to fix it.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          If this persists, please contact support
        </div>
      </div>
    </FadeIn>
  );
}

// 403 Forbidden page
export function Error403() {
  return (
    <FadeIn className="flex items-center justify-center min-h-[600px]">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <Lock className="h-24 w-24 text-yellow-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">403</h1>
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this resource.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          If you believe this is an error, contact your administrator
        </div>
      </div>
    </FadeIn>
  );
}

// Network error
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      severity="error"
      icon={<WifiOff className="h-6 w-6" />}
      title="Network Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      actions={
        onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )
      }
    />
  );
}

// API error
interface ApiErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ApiError({
  message = 'Failed to load data. Please try again.',
  onRetry,
}: ApiErrorProps) {
  return (
    <ErrorDisplay
      severity="error"
      icon={<AlertTriangle className="h-6 w-6" />}
      title="Something Went Wrong"
      description={message}
      actions={
        onRetry && (
          <Button onClick={onRetry} size="sm" variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )
      }
    />
  );
}

// Form field error
interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export function FormFieldError({ error, className = '' }: FormFieldErrorProps) {
  if (!error) return null;

  return (
    <ScaleIn>
      <p className={`text-sm text-red-500 flex items-center gap-1 mt-1 ${className}`}>
        <XCircle className="h-3 w-3" />
        {error}
      </p>
    </ScaleIn>
  );
}

// Form error summary
interface FormErrorSummaryProps {
  errors: string[];
  className?: string;
}

export function FormErrorSummary({ errors, className = '' }: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <ErrorDisplay
      severity="error"
      icon={<XCircle className="h-5 w-5" />}
      title="Please fix the following errors:"
      description=""
      className={className}
      actions={
        <ul className="list-disc list-inside text-sm space-y-1">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      }
    />
  );
}

// Validation warning
export function ValidationWarning({ message }: { message: string }) {
  return (
    <ScaleIn>
      <div className="flex items-start gap-2 rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
        <p className="text-yellow-800 dark:text-yellow-200">{message}</p>
      </div>
    </ScaleIn>
  );
}

// Info message
export function InfoMessage({ message }: { message: string }) {
  return (
    <ScaleIn>
      <div className="flex items-start gap-2 rounded-md bg-blue-50 dark:bg-blue-950/20 p-3 text-sm">
        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
        <p className="text-blue-800 dark:text-blue-200">{message}</p>
      </div>
    </ScaleIn>
  );
}

// Error boundary fallback
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <FadeIn className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Oops! Something broke</h2>
          <p className="text-muted-foreground">
            An unexpected error occurred. Don&apos;t worry, we&apos;ve logged it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details
              </summary>
              <pre className="mt-2 rounded-md bg-muted p-4 text-xs overflow-auto">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={resetError}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

// Inline error with retry
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  severity?: ErrorSeverity;
}

export function InlineError({
  message,
  onRetry,
  severity = 'error',
}: InlineErrorProps) {
  return (
    <ErrorDisplay
      severity={severity}
      icon={<AlertTriangle className="h-5 w-5" />}
      title="Error"
      description={message}
      actions={
        onRetry && (
          <Button onClick={onRetry} size="sm" variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )
      }
    />
  );
}
