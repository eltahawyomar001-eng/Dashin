/**
 * Loading Wrapper Components
 * Smart loading wrappers with progressive states
 */

'use client';

import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/animations';
import { AnimatedSpinner, Pulse } from '@/components/animations';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  type?: 'spinner' | 'skeleton' | 'pulse';
  text?: string;
  className?: string;
}

/**
 * Progressive loading wrapper
 * Shows skeleton/spinner while loading, then fades to content
 */
export function LoadingWrapper({
  isLoading,
  children,
  skeleton,
  type = 'skeleton',
  text,
  className,
}: LoadingWrapperProps) {
  if (isLoading) {
    if (skeleton) {
      return <div className={className}>{skeleton}</div>;
    }

    if (type === 'spinner') {
      return (
        <div className={`flex items-center justify-center min-h-[200px] ${className || ''}`}>
          <div className="flex flex-col items-center gap-4">
            <AnimatedSpinner size={48} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        </div>
      );
    }

    if (type === 'pulse') {
      return (
        <div className={`flex items-center justify-center min-h-[200px] ${className || ''}`}>
          <div className="flex flex-col items-center gap-4">
            <Pulse>
              <div className="h-12 w-12 rounded-full bg-primary" />
            </Pulse>
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </div>
        </div>
      );
    }
  }

  return (
    <AnimatePresence mode="wait">
      <FadeIn key="content" className={className}>
        {children}
      </FadeIn>
    </AnimatePresence>
  );
}

/**
 * Inline loading spinner
 * Small spinner for buttons, inline elements
 */
export function InlineLoader({ size = 'sm', className }: { size?: 'sm' | 'md'; className?: string }) {
  const sizeMap = {
    sm: 16,
    md: 24,
  };

  return (
    <AnimatedSpinner
      size={sizeMap[size]}
      className={className}
    />
  );
}

/**
 * Button loading state
 * Replaces button content with spinner
 */
interface LoadingButtonProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
}

export function LoadingButton({
  isLoading,
  children,
  loadingText = 'Loading...',
  className,
}: LoadingButtonProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className || ''}`}>
      {isLoading ? (
        <>
          <InlineLoader size="sm" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </span>
  );
}

/**
 * Overlay loader
 * Full-screen loading overlay
 */
interface OverlayLoaderProps {
  isLoading: boolean;
  text?: string;
  backdrop?: boolean;
}

export function OverlayLoader({
  isLoading,
  text = 'Loading...',
  backdrop = true,
}: OverlayLoaderProps) {
  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <FadeIn
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          backdrop ? 'bg-background/80 backdrop-blur-sm' : ''
        }`}
      >
        <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-lg">
          <AnimatedSpinner size={48} />
          <p className="text-sm font-medium">{text}</p>
        </div>
      </FadeIn>
    </AnimatePresence>
  );
}

/**
 * Suspense fallback
 * For use with React Suspense
 */
export function SuspenseFallback({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <AnimatedSpinner size={48} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}

/**
 * Progressive loading with multiple states
 * Shows immediate feedback, then skeleton, then content
 */
interface ProgressiveLoadingProps {
  isLoading: boolean;
  isEmpty?: boolean;
  error?: Error | null;
  children: ReactNode;
  skeleton: ReactNode;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  immediate?: boolean; // Show spinner immediately before skeleton
}

export function ProgressiveLoading({
  isLoading,
  isEmpty = false,
  error = null,
  children,
  skeleton,
  emptyState,
  errorState,
  immediate = false,
}: ProgressiveLoadingProps) {
  // Error state
  if (error && errorState) {
    return <div>{errorState}</div>;
  }

  // Loading state
  if (isLoading) {
    if (immediate) {
      // Show spinner briefly, then skeleton
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-4">
            <InlineLoader size="md" />
          </div>
          {skeleton}
        </div>
      );
    }
    return <div>{skeleton}</div>;
  }

  // Empty state
  if (isEmpty && emptyState) {
    return <FadeIn>{emptyState}</FadeIn>;
  }

  // Content
  return <FadeIn>{children}</FadeIn>;
}
