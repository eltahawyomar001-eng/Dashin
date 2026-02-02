/**
 * Loading State Components
 * Progressive loading states for each page/feature
 */

'use client';

import {
  SkeletonCampaignCard,
  SkeletonLeadCard,
  SkeletonDataSourceCard,
  SkeletonJobCard,
  SkeletonAnalyticsCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonDashboard,
  SkeletonPage,
  SkeletonTitle,
  SkeletonText,
  SkeletonButton,
} from '@/components/skeletons';
import { FadeIn } from '@/components/animations';

// Campaign list loading
export function CampaignListLoading({ count = 6 }: { count?: number }) {
  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonTitle />
            <SkeletonText width={60} />
          </div>
          <SkeletonButton />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCampaignCard key={i} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// Lead list loading
export function LeadListLoading({ count = 8 }: { count?: number }) {
  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonTitle />
          <div className="flex gap-2">
            <SkeletonButton variant="outline" />
            <SkeletonButton />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonLeadCard key={i} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// Data source list loading
export function DataSourceListLoading({ count = 6 }: { count?: number }) {
  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonTitle />
          <SkeletonButton />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonDataSourceCard key={i} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// Job list loading
export function JobListLoading({ count = 5 }: { count?: number }) {
  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonTitle />
          <div className="flex gap-2">
            <SkeletonButton variant="outline" />
            <SkeletonButton />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonJobCard key={i} />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// Analytics dashboard loading
export function AnalyticsDashboardLoading() {
  return (
    <FadeIn>
      <SkeletonDashboard />
    </FadeIn>
  );
}

// Campaign analytics loading
export function CampaignAnalyticsLoading() {
  return (
    <FadeIn>
      <div className="space-y-6">
        <SkeletonTitle />
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonChart height={400} />
          <SkeletonChart height={400} />
        </div>
        <SkeletonTable rows={10} columns={5} />
      </div>
    </FadeIn>
  );
}

// Lead analytics loading
export function LeadAnalyticsLoading() {
  return (
    <FadeIn>
      <div className="space-y-6">
        <SkeletonTitle />
        <div className="grid gap-4 md:grid-cols-4">
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
        </div>
        <SkeletonChart height={350} />
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonChart height={300} />
          <SkeletonChart height={300} />
        </div>
      </div>
    </FadeIn>
  );
}

// Report loading
export function ReportLoading() {
  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonTitle />
          <div className="flex gap-2">
            <SkeletonButton variant="outline" />
            <SkeletonButton />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
          <SkeletonAnalyticsCard />
        </div>
        <SkeletonChart height={400} />
        <SkeletonTable rows={15} columns={6} />
      </div>
    </FadeIn>
  );
}

// Settings page loading
export function SettingsLoading() {
  return (
    <FadeIn>
      <SkeletonPage />
    </FadeIn>
  );
}

// Generic table loading
export function TableLoading({
  rows = 10,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <FadeIn>
      <SkeletonTable rows={rows} columns={columns} />
    </FadeIn>
  );
}

// Generic card grid loading
export function CardGridLoading({
  count = 6,
  columns = 3,
}: {
  count?: number;
  columns?: number;
}) {
  const gridClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <FadeIn>
      <div className={`grid gap-4 ${gridClasses[columns as keyof typeof gridClasses] || 'md:grid-cols-3'}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCampaignCard key={i} />
        ))}
      </div>
    </FadeIn>
  );
}
