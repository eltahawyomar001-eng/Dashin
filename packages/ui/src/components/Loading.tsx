import React from 'react';
import { cn } from '../lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className }, ref) => {
    const sizes = {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-3',
      xl: 'h-12 w-12 border-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block animate-spin rounded-full border-primary-500 border-t-transparent',
          sizes[size],
          className
        )}
        role="status"
        aria-label="Loading"
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular' }, ref) => {
    const variants = {
      text: 'h-4 w-full',
      rectangular: 'h-32 w-full',
      circular: 'h-12 w-12 rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-shimmer glass-subtle rounded',
          'bg-gradient-to-r from-transparent via-white/5 to-transparent',
          'bg-[length:200%_100%]',
          variants[variant],
          className
        )}
        role="status"
        aria-label="Loading"
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ message = 'Loading...', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center py-12', className)}
      >
        <Spinner size="lg" className="mb-4" />
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';
