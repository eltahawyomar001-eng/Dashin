'use client';

import React from 'react';
import { Globe, Database, Share2, FileText, Server, PlayCircle, StopCircle, AlertCircle, Clock } from 'lucide-react';
import type { DataSource, DataSourceType, DataSourceStatus } from '@dashin/shared-types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const SOURCE_TYPE_ICONS: Record<DataSourceType, React.ReactNode> = {
  website: <Globe className="h-5 w-5" />,
  api: <Server className="h-5 w-5" />,
  social_media: <Share2 className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  file: <FileText className="h-5 w-5" />,
};

const SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  website: 'Website',
  api: 'API',
  social_media: 'Social Media',
  database: 'Database',
  file: 'File',
};

const STATUS_VARIANTS: Record<DataSourceStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'default',
  error: 'danger',
  pending: 'warning',
};

export interface DataSourceCardProps {
  dataSource: DataSource;
  onEdit?: (dataSource: DataSource) => void;
  onDelete?: (dataSource: DataSource) => void;
  onRun?: (dataSource: DataSource) => void;
  onToggleStatus?: (dataSource: DataSource) => void;
}

export function DataSourceCard({ 
  dataSource, 
  onEdit, 
  onDelete, 
  onRun,
  onToggleStatus 
}: DataSourceCardProps) {
  return (
    <Card className="hover:shadow-glass-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Icon and Info */}
          <div className="flex gap-4 flex-1 min-w-0">
            <div className={cn(
              'flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl',
              dataSource.status === 'active' ? 'bg-primary-500/10 text-primary-400' :
              dataSource.status === 'error' ? 'bg-red-500/10 text-red-400' :
              'bg-slate-500/10 text-slate-400'
            )}>
              {SOURCE_TYPE_ICONS[dataSource.type]}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white truncate">
                  {dataSource.name}
                </h3>
                <Badge variant={STATUS_VARIANTS[dataSource.status]} size="sm">
                  {dataSource.status}
                </Badge>
              </div>
              
              {dataSource.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                  {dataSource.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-300">Type:</span>
                  <span>{SOURCE_TYPE_LABELS[dataSource.type]}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-300">Records:</span>
                  <span>{dataSource.totalRecords.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-300">Frequency:</span>
                  <span className="capitalize">{dataSource.frequency}</span>
                </div>
                
                {dataSource.errorCount > 0 && (
                  <div className="flex items-center gap-1 text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>{dataSource.errorCount} errors</span>
                  </div>
                )}
              </div>
              
              {/* Last scraped / Next scheduled */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs">
                {dataSource.lastScrapedAt && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Last: {formatDistanceToNow(new Date(dataSource.lastScrapedAt), { addSuffix: true })}</span>
                  </div>
                )}
                
                {dataSource.nextScheduledAt && dataSource.status === 'active' && (
                  <div className="flex items-center gap-1 text-primary-400">
                    <Clock className="h-3 w-3" />
                    <span>Next: {formatDistanceToNow(new Date(dataSource.nextScheduledAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-2">
            {onRun && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onRun(dataSource)}
                disabled={dataSource.status !== 'active'}
              >
                <PlayCircle className="h-4 w-4" />
              </Button>
            )}
            
            {onToggleStatus && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onToggleStatus(dataSource)}
              >
                {dataSource.status === 'active' ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(dataSource)}
              >
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(dataSource)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout for multiple data source cards
export interface DataSourceListProps {
  dataSources: DataSource[];
  onEdit?: (dataSource: DataSource) => void;
  onDelete?: (dataSource: DataSource) => void;
  onRun?: (dataSource: DataSource) => void;
  onToggleStatus?: (dataSource: DataSource) => void;
  emptyMessage?: string;
}

export function DataSourceList({
  dataSources,
  onEdit,
  onDelete,
  onRun,
  onToggleStatus,
  emptyMessage = 'No data sources found. Create one to get started.',
}: DataSourceListProps) {
  if (dataSources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Database className="h-16 w-16 text-slate-600 mb-4" />
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {dataSources.map((dataSource) => (
        <DataSourceCard
          key={dataSource.id}
          dataSource={dataSource}
          onEdit={onEdit}
          onDelete={onDelete}
          onRun={onRun}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
