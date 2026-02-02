import React from 'react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface ActivityItem {
  id: string;
  type: 'user' | 'campaign' | 'lead' | 'scrape' | 'system';
  title: string;
  description?: string;
  timestamp: Date | string;
  user?: {
    name: string;
    avatar?: string;
  };
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  showTimestamp?: boolean;
  onItemClick?: (item: ActivityItem) => void;
  emptyMessage?: string;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  maxItems,
  showTimestamp = true,
  onItemClick,
  emptyMessage = 'No recent activity',
  className,
}) => {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500/20 text-blue-400';
      case 'campaign':
        return 'bg-purple-500/20 text-purple-400';
      case 'lead':
        return 'bg-green-500/20 text-green-400';
      case 'scrape':
        return 'bg-amber-500/20 text-amber-400';
      case 'system':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (displayItems.length === 0) {
    return (
      <div className={cn('glass rounded-xl p-8 text-center', className)}>
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('glass rounded-xl divide-y divide-white/5', className)}>
      {displayItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className={cn(
            'w-full text-left p-4 transition-all',
            onItemClick && 'hover:bg-white/5 cursor-pointer',
            !onItemClick && 'cursor-default'
          )}
        >
          <div className="flex items-start gap-4">
            {/* Icon or Avatar */}
            <div className={cn(
              'flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center',
              getTypeColor(item.type)
            )}>
              {item.icon || (
                <div className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.user && (
                    <p className="mt-1 text-xs text-slate-500">
                      by {item.user.name}
                    </p>
                  )}
                </div>
                {showTimestamp && (
                  <span className="flex-shrink-0 text-xs text-slate-500">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export interface ActivitySectionProps {
  title: string;
  items: ActivityItem[];
  maxItems?: number;
  viewAllLink?: string;
  onViewAll?: () => void;
  className?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  title,
  items,
  maxItems = 5,
  viewAllLink,
  onViewAll,
  className,
}) => {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {(viewAllLink || onViewAll) && items.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            View All
          </button>
        )}
      </div>
      <ActivityFeed items={items} maxItems={maxItems} />
    </div>
  );
};
