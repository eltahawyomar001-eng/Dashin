import React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', className }, ref) => {
    const variants = {
      default: 'bg-slate-700/50 text-slate-300',
      primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
      success: 'bg-green-500/20 text-green-300 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      danger: 'bg-red-500/20 text-red-300 border-red-500/30',
      info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium',
          'glass-subtle',
          variants[variant],
          sizes[size],
          className
        )}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusPillProps {
  status:
    | 'active'
    | 'inactive'
    | 'pending'
    | 'completed'
    | 'failed'
    | 'draft'
    | 'approved'
    | 'rejected'
    | 'processing';
  className?: string;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ status, className }, ref) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'success' as const },
      inactive: { label: 'Inactive', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'warning' as const },
      completed: { label: 'Completed', variant: 'success' as const },
      failed: { label: 'Failed', variant: 'danger' as const },
      draft: { label: 'Draft', variant: 'default' as const },
      approved: { label: 'Approved', variant: 'success' as const },
      rejected: { label: 'Rejected', variant: 'danger' as const },
      processing: { label: 'Processing', variant: 'info' as const },
    };

    const config = statusConfig[status];

    return (
      <Badge ref={ref} variant={config.variant} size="sm" className={className}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        {config.label}
      </Badge>
    );
  }
);

StatusPill.displayName = 'StatusPill';
