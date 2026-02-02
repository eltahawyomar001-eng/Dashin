/**
 * Skeleton Loading Components
 * Content-aware loading states with shimmer effects
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@dashin/ui';

// Base skeleton with shimmer effect
interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ className, animate = true, style }: SkeletonProps) {
  const baseClasses = 'bg-muted rounded';
  
  if (!animate) {
    return <div className={cn(baseClasses, className)} style={style} />;
  }

  return (
    <motion.div
      className={cn(baseClasses, 'relative overflow-hidden', className)}
      style={style}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />
    </motion.div>
  );
}

// Text skeleton (single line)
interface SkeletonTextProps {
  className?: string;
  width?: string | number;
}

export function SkeletonText({ className, width = '100%' }: SkeletonTextProps) {
  return (
    <Skeleton
      className={cn('h-4', className)}
      style={{ width: typeof width === 'number' ? `${width}%` : width }}
    />
  );
}

// Title skeleton
export function SkeletonTitle({ className }: { className?: string }) {
  return <Skeleton className={cn('h-8 w-3/4', className)} />;
}

// Heading skeleton
export function SkeletonHeading({ className }: { className?: string }) {
  return <Skeleton className={cn('h-6 w-2/3', className)} />;
}

// Avatar skeleton
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />;
}

// Badge skeleton
export function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn('h-5 w-16 rounded-full', className)} />;
}

// Button skeleton
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function SkeletonButton({
  size = 'md',
  variant = 'default',
  className,
}: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  const variantClasses = {
    default: '',
    outline: 'border border-border',
    ghost: 'bg-transparent',
  };

  return (
    <Skeleton
      className={cn(
        'rounded-md',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      <div className="space-y-2">
        <SkeletonTitle />
        <SkeletonText width={80} />
      </div>
      <div className="space-y-2">
        <SkeletonText />
        <SkeletonText width={90} />
        <SkeletonText width={70} />
      </div>
      <div className="flex gap-2">
        <SkeletonBadge />
        <SkeletonBadge />
      </div>
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b p-4">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonText key={i} />
      ))}
    </div>
  );
}

// Table skeleton
export function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center gap-4 border-b bg-muted/50 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonText key={i} width={80} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  );
}

// Campaign card skeleton
export function SkeletonCampaignCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <SkeletonTitle />
          <SkeletonText width={60} />
        </div>
        <SkeletonBadge />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <SkeletonText width={50} />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <SkeletonText width={50} />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <SkeletonText width={50} />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <SkeletonText width={40} />
        <div className="flex gap-2">
          <SkeletonButton size="sm" variant="outline" />
          <SkeletonButton size="sm" />
        </div>
      </div>
    </div>
  );
}

// Lead card skeleton
export function SkeletonLeadCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <SkeletonHeading />
            <SkeletonBadge />
          </div>
          <SkeletonText width={70} />
          <SkeletonText width={50} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SkeletonBadge />
        <SkeletonBadge />
        <SkeletonBadge />
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <SkeletonText width={30} />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
}

// Data source card skeleton
export function SkeletonDataSourceCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="space-y-2">
            <SkeletonHeading />
            <SkeletonText width={40} />
          </div>
        </div>
        <SkeletonBadge />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <SkeletonText width={50} />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-1">
          <SkeletonText width={50} />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <SkeletonButton size="sm" variant="outline" className="flex-1" />
        <SkeletonButton size="sm" variant="outline" className="flex-1" />
      </div>
    </div>
  );
}

// Job card skeleton
export function SkeletonJobCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <SkeletonHeading />
          <SkeletonText width={50} />
        </div>
        <SkeletonBadge />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SkeletonText width={30} />
          <SkeletonText width={20} />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <SkeletonText width={60} />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-1">
          <SkeletonText width={60} />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-1">
          <SkeletonText width={60} />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

// Analytics card skeleton
export function SkeletonAnalyticsCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonText width={40} />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-12 w-32" />
      <div className="flex items-center gap-2">
        <SkeletonBadge />
        <SkeletonText width={30} />
      </div>
    </div>
  );
}

// Chart skeleton
export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <SkeletonHeading />
        <Skeleton className="w-full" style={{ height }} />
      </div>
    </div>
  );
}

// List skeleton (generic)
export function SkeletonList({
  count = 5,
  itemHeight = 72,
  className,
}: {
  count?: number;
  itemHeight?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="w-full" style={{ height: itemHeight }} />
      ))}
    </div>
  );
}

// Page skeleton (full page loading)
export function SkeletonPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonTitle />
        <SkeletonText width={60} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <SkeletonButton />
        <SkeletonButton variant="outline" />
      </div>

      {/* Content */}
      <div className="grid gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

// Dashboard skeleton
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonAnalyticsCard />
        <SkeletonAnalyticsCard />
        <SkeletonAnalyticsCard />
        <SkeletonAnalyticsCard />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Table */}
      <SkeletonTable />
    </div>
  );
}
