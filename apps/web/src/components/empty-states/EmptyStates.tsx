/**
 * Empty State Components
 * Engaging empty states that guide users to action
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@dashin/ui';
import { SlideFromBottom } from '@/components/animations';
import {
  FolderOpen,
  Users,
  Database,
  PlayCircle,
  Bell,
  Search,
  Plus,
  Download,
  Link2,
  Inbox,
  Target,
  Zap,
} from 'lucide-react';

// Base empty state component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <SlideFromBottom>
      <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
        {icon && (
          <div className="mb-6 text-muted-foreground/50">
            {icon}
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>

        {(action || secondaryAction) && (
          <div className="flex gap-3 flex-wrap justify-center">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </SlideFromBottom>
  );
}

// Empty campaigns list
export function EmptyCampaigns() {
  return (
    <EmptyState
      icon={<Target className="h-24 w-24" />}
      title="No Campaigns Yet"
      description="Create your first campaign to start generating and managing leads. Campaigns help you organize your outreach efforts and track performance."
      action={
        <Link href="/dashboard/campaigns">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      }
    />
  );
}

// Empty leads list
export function EmptyLeads() {
  return (
    <EmptyState
      icon={<Users className="h-24 w-24" />}
      title="No Leads Yet"
      description="Start building your contact list by importing leads, adding them manually, or running a data scraping job."
      action={
        <Link href="/dashboard/leads">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Leads
          </Button>
        </Link>
      }
      secondaryAction={
        <Link href="/dashboard/sources">
          <Button variant="secondary">
            <Database className="h-4 w-4 mr-2" />
            Data Sources
          </Button>
        </Link>
      }
    />
  );
}

// Empty data sources list
export function EmptyDataSources() {
  return (
    <EmptyState
      icon={<Database className="h-24 w-24" />}
      title="No Data Sources Connected"
      description="Connect your first data source to start scraping and collecting lead information from websites, APIs, and databases."
      action={
        <Link href="/dashboard/sources">
          <Button>
            <Link2 className="h-4 w-4 mr-2" />
            Connect Data Source
          </Button>
        </Link>
      }
    />
  );
}

// Empty jobs list
export function EmptyJobs() {
  return (
    <EmptyState
      icon={<PlayCircle className="h-24 w-24" />}
      title="No Scraping Jobs"
      description="Create your first scraping job to automatically collect lead data from your connected data sources."
      action={
        <Link href="/dashboard/sources/jobs">
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </Link>
      }
      secondaryAction={
        <Link href="/dashboard/sources">
          <Button variant="secondary">
            <Database className="h-4 w-4 mr-2" />
            View Data Sources
          </Button>
        </Link>
      }
    />
  );
}

// Empty notifications list
export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="h-24 w-24" />}
      title="You&apos;re All Caught Up!"
      description="No new notifications. We&apos;ll notify you when there are updates about your campaigns, leads, or scraping jobs."
      className="min-h-[300px]"
    />
  );
}

// Empty search results
interface EmptySearchResultsProps {
  query: string;
  onClear?: () => void;
}

export function EmptySearchResults({ query, onClear }: EmptySearchResultsProps) {
  return (
    <EmptyState
      icon={<Search className="h-24 w-24" />}
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try different keywords or clear your search to see all items.`}
      action={
        onClear && (
          <Button onClick={onClear} variant="secondary">
            Clear Search
          </Button>
        )
      }
    />
  );
}

// Empty filtered results
interface EmptyFilteredResultsProps {
  onClearFilters?: () => void;
}

export function EmptyFilteredResults({ onClearFilters }: EmptyFilteredResultsProps) {
  return (
    <EmptyState
      icon={<Inbox className="h-24 w-24" />}
      title="No Matching Items"
      description="No items match your current filters. Try adjusting or clearing your filters to see more results."
      action={
        onClearFilters && (
          <Button onClick={onClearFilters} variant="secondary">
            Clear Filters
          </Button>
        )
      }
    />
  );
}

// Empty analytics/reports
export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={<Target className="h-24 w-24" />}
      title="No Data Available"
      description="Start creating campaigns and generating leads to see analytics and insights. Your performance metrics will appear here."
      action={
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      }
    />
  );
}

// Empty export/download history
export function EmptyExports() {
  return (
    <EmptyState
      icon={<Download className="h-24 w-24" />}
      title="No Exports Yet"
      description="Export your leads, campaigns, or reports to CSV, Excel, or PDF formats. Your export history will appear here."
      className="min-h-[300px]"
    />
  );
}

// Empty team/users
export function EmptyTeam() {
  return (
    <EmptyState
      icon={<Users className="h-24 w-24" />}
      title="No Team Members"
      description="Invite team members to collaborate on campaigns, share leads, and work together on outreach efforts."
      action={
        <Link href="/dashboard/settings">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </Link>
      }
    />
  );
}

// Empty tags/categories
export function EmptyTags() {
  return (
    <EmptyState
      icon={<FolderOpen className="h-24 w-24" />}
      title="No Tags Created"
      description="Create tags to organize and categorize your leads and campaigns. Tags help you filter and segment your data effectively."
      action={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      }
    />
  );
}

// Generic empty state with custom content
interface GenericEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function GenericEmptyState({
  icon = <Inbox className="h-24 w-24" />,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: GenericEmptyStateProps) {
  let action: ReactNode = null;

  if (actionLabel && actionHref) {
    action = (
      <Button onClick={() => window.location.href = actionHref}>
        <Plus className="h-4 w-4 mr-2" />
        {actionLabel}
      </Button>
    );
  } else if (actionLabel && onAction) {
    action = (
      <Button onClick={onAction}>
        <Plus className="h-4 w-4 mr-2" />
        {actionLabel}
      </Button>
    );
  }

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  );
}

// Empty state with illustration placeholder
// For future: can replace icon with custom illustrations/images
export function EmptyStateWithIllustration({
  illustrationSrc,
  title,
  description,
  action,
  secondaryAction,
}: {
  illustrationSrc: string;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <SlideFromBottom>
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-6">
          <img
            src={illustrationSrc}
            alt={title}
            className="h-48 w-auto opacity-80"
          />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>

        {(action || secondaryAction) && (
          <div className="flex gap-3 flex-wrap justify-center">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </SlideFromBottom>
  );
}
