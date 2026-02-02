'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import type { ScrapingJob } from '@dashin/shared-types';
import {
  PageHeader,
  Container,
  ScrapingQueue,
  useToast,
} from '@dashin/ui';

// Mock data for demonstration
const MOCK_JOBS: ScrapingJob[] = [
  {
    id: '1',
    dataSourceId: '1',
    dataSourceName: 'LinkedIn Company Profiles',
    status: 'running',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    recordsScraped: 342,
    recordsFailed: 5,
    progress: 67,
    currentPage: 34,
    totalPages: 50,
    retryCount: 0,
    logs: [],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    dataSourceId: '2',
    dataSourceName: 'Industry News API',
    status: 'completed',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    recordsScraped: 128,
    recordsFailed: 0,
    progress: 100,
    retryCount: 0,
    logs: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    dataSourceId: '3',
    dataSourceName: 'Competitor Pricing Pages',
    status: 'failed',
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    recordsScraped: 12,
    recordsFailed: 8,
    progress: 45,
    retryCount: 2,
    errorMessage: 'Failed to parse pricing data: selector not found',
    logs: [],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    dataSourceId: '1',
    dataSourceName: 'LinkedIn Company Profiles',
    status: 'pending',
    recordsScraped: 0,
    recordsFailed: 0,
    progress: 0,
    retryCount: 0,
    logs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ScrapingJobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<ScrapingJob[]>(MOCK_JOBS);

  const handleRetry = (job: ScrapingJob) => {
    setJobs(jobs.map((j) =>
      j.id === job.id ? { ...j, status: 'pending' as const, retryCount: j.retryCount + 1 } : j
    ));
    showToast({
      type: 'success',
      title: 'Job Queued',
      message: `${job.dataSourceName} will retry shortly`,
    });
  };

  const handleCancel = (job: ScrapingJob) => {
    setJobs(jobs.map((j) =>
      j.id === job.id ? { ...j, status: 'cancelled' as const } : j
    ));
    showToast({
      type: 'info',
      title: 'Job Cancelled',
      message: `${job.dataSourceName} scraping cancelled`,
    });
  };

  const handleViewDetails = (job: ScrapingJob) => {
    showToast({
      type: 'info',
      title: 'View Details',
      message: `Viewing details for ${job.dataSourceName} (not yet implemented)`,
    });
  };

  const handleViewData = (job: ScrapingJob) => {
    showToast({
      type: 'info',
      title: 'View Data',
      message: `Viewing data for ${job.dataSourceName} (not yet implemented)`,
    });
  };

  return (
    <Container>
      <PageHeader
        title="Scraping Jobs"
        description="Monitor and manage your web scraping jobs"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-slate-400">Running</p>
          </div>
          <p className="text-2xl font-semibold text-white">
            {jobs.filter((j) => j.status === 'running').length}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-slate-400" />
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <p className="text-2xl font-semibold text-white">
            {jobs.filter((j) => j.status === 'pending').length}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary-400" />
            <p className="text-sm text-slate-400">Completed</p>
          </div>
          <p className="text-2xl font-semibold text-white">
            {jobs.filter((j) => j.status === 'completed').length}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-red-400" />
            <p className="text-sm text-slate-400">Failed</p>
          </div>
          <p className="text-2xl font-semibold text-white">
            {jobs.filter((j) => j.status === 'failed').length}
          </p>
        </div>
      </div>

      <ScrapingQueue
        jobs={jobs}
        onRetry={handleRetry}
        onCancel={handleCancel}
        onViewDetails={handleViewDetails}
        onViewData={handleViewData}
      />
    </Container>
  );
}
