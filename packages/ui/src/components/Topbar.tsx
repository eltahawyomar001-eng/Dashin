import React from 'react';
import { cn } from '../lib/utils';

export interface TopbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Topbar = React.forwardRef<HTMLElement, TopbarProps>(
  ({ children, className }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'glass-strong fixed right-0 top-0 z-30 h-16',
          'border-b border-white/10',
          'flex items-center justify-between px-6',
          'ml-64', // Account for sidebar width
          'transition-all duration-300',
          className
        )}
        style={{ width: 'calc(100% - 16rem)' }}
      >
        {children}
      </header>
    );
  }
);

Topbar.displayName = 'Topbar';

export interface TopbarSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const TopbarSection = React.forwardRef<HTMLDivElement, TopbarSectionProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-4', className)}
      >
        {children}
      </div>
    );
  }
);

TopbarSection.displayName = 'TopbarSection';
