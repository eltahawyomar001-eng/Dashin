'use client';

import React from 'react';
import { Clock, CheckCircle, XCircle, Loader, StopCircle, RotateCw, Eye, Download } from 'lucide-react';
import type { ScrapingJob, ScrapingJobStatus } from '@dashin/shared-types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Progress } from './Progress';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG: Record<ScrapingJobStatus, {
  icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'danger';
  label: string;
}> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    variant: 'default',
    label: 'Pending',
  },
  running: {
    icon: <Loader className="h-4 w-4 animate-spin" />,
    variant: 'warning',
    label: 'Running',
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'success',
    label: 'Completed',
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    variant: 'danger',
    label: 'Failed',
  },
  cancelled: {
    icon: <StopCircle className="h-4 w-4" />,
    variant: 'default',
    label: 'Cancelled',
  },
};

export interface ScrapingQueueItemProps {
  job: ScrapingJob;
  onRetry?: (job: ScrapingJob) => void;
  onCancel?: (job: ScrapingJob) => void;
  onViewDetails?: (job: ScrapingJob) => void;
  onViewData?: (job: ScrapingJob) => void;
}

export function ScrapingQueueItem({
  job,
  onRetry,
  onCancel,
  onViewDetails,
  onViewData,
}: ScrapingQueueItemProps) {
  const statusConfig = STATUS_CONFIG[job.status];

  return (
    <div className="glass-panel p-4 rounded-xl">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-white truncate">{job.dataSourceName}</h4>
            <Badge variant={statusConfig.variant} size="sm">
              <span className="flex items-center gap-1">
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <div>
              <span className="font-medium text-slate-300">Records:</span>{' '}
              <span className="text-primary-400">{job.recordsScraped.toLocaleString()}</span>
              {job.recordsFailed > 0 && (
                <span className="text-red-400"> ({job.recordsFailed} failed)</span>
              )}
            </div>
            
            {job.currentPage && job.totalPages && (
              <div>
                <span className="font-medium text-slate-300">Pages:</span>{' '}
                {job.currentPage} / {job.totalPages}
              </div>
            )}
            
            {job.retryCount > 0 && (
              <div className="text-amber-400">
                <span className="font-medium">Retries:</span> {job.retryCount}
              </div>
            )}
            
            {job.startedAt && (
              <div>
                <span className="font-medium text-slate-300">Started:</span>{' '}
                {formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onViewDetails(job)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          {job.status === 'completed' && onViewData && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onViewData(job)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {job.status === 'failed' && onRetry && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onRetry(job)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          
          {job.status === 'running' && onCancel && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onCancel(job)}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Progress bar for running jobs */}
      {job.status === 'running' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>
      )}
      
      {/* Error message for failed jobs */}
      {job.status === 'failed' && job.errorMessage && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{job.errorMessage}</span>
        </div>
      )}
    </div>
  );
}

export interface ScrapingQueueProps {
  jobs: ScrapingJob[];
  onRetry?: (job: ScrapingJob) => void;
  onCancel?: (job: ScrapingJob) => void;
  onViewDetails?: (job: ScrapingJob) => void;
  onViewData?: (job: ScrapingJob) => void;
  emptyMessage?: string;
}

export function ScrapingQueue({
  jobs,
  onRetry,
  onCancel,
  onViewDetails,
  onViewData,
  emptyMessage = 'No scraping jobs found.',
}: ScrapingQueueProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-16 w-16 text-slate-600 mb-4" />
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  // Group jobs by status
  const groupedJobs = jobs.reduce((acc, job) => {
    if (!acc[job.status]) {
      acc[job.status] = [];
    }
    acc[job.status].push(job);
    return acc;
  }, {} as Record<ScrapingJobStatus, ScrapingJob[]>);

  const statusOrder: ScrapingJobStatus[] = ['running', 'pending', 'failed', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      {statusOrder.map((status) => {
        const statusJobs = groupedJobs[status];
        if (!statusJobs || statusJobs.length === 0) return null;

        return (
          <div key={status}>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              {STATUS_CONFIG[status]?.label || status} ({statusJobs.length})
            </h3>
            <div className="space-y-3">
              {statusJobs.map((job: ScrapingJob) => (
                <ScrapingQueueItem
                  key={job.id}
                  job={job}
                  onRetry={onRetry}
                  onCancel={onCancel}
                  onViewDetails={onViewDetails}
                  onViewData={onViewData}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
