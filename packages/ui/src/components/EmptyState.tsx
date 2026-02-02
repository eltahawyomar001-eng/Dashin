import React from 'react';
import { cn } from '../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl py-16 text-center',
          'glass-subtle',
          className
        )}
      >
        {icon && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full glass-strong">
            <div className="text-slate-400">{icon}</div>
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="mb-6 max-w-md text-sm text-slate-400">{description}</p>
        )}
        {action && <div>{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
