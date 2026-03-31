'use client';

import { Clock, AlertCircle } from 'lucide-react';
import {
  PageHeader,
  Container,
  ScrapingQueue,
  Spinner,
} from '@dashin/ui';
import {
  useScrapingJobs,
  useRetryScrapingJob,
  useControlScrapingJob,
} from '../../../../hooks/useDataSources';

export default function ScrapingJobsPage() {
  // Real data from Supabase, polling every 5 seconds for live updates
  const { data: jobsData, isLoading, isError, error } = useScrapingJobs({}, 5000);
  const retryMutation = useRetryScrapingJob();
  const controlMutation = useControlScrapingJob();

  const jobs = jobsData?.data ?? [];

  // Map DB rows to the ScrapingQueue expected shape
  const mappedJobs = jobs.map((job: any) => ({
    id: job.id,
    dataSourceId: job.data_source_id,
    dataSourceName: job.data_sources?.name ?? `Source ${job.data_source_id?.slice(0, 8)}`,
    status: job.status,
    startedAt: job.started_at,
    completedAt: job.completed_at,
    recordsScraped: job.records_processed ?? 0,
    recordsFailed: job.records_rejected ?? 0,
    progress: job.progress ?? 0,
    currentPage: undefined,
    totalPages: undefined,
    retryCount: job.error_count ?? 0,
    errorMessage: job.error_message,
    logs: [],
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  }));

  const runningCount = mappedJobs.filter((j: any) => j.status === 'running').length;
  const pendingCount = mappedJobs.filter((j: any) => j.status === 'pending').length;
  const completedCount = mappedJobs.filter((j: any) => j.status === 'completed').length;
  const failedCount = mappedJobs.filter((j: any) => j.status === 'failed').length;

  const handleRetry = (job: any) => {
    retryMutation.mutate(job.id);
  };

  const handleCancel = (job: any) => {
    controlMutation.mutate({ id: job.id, action: 'cancel' });
  };

  const handleViewDetails = (_job: any) => {
    // TODO: Navigate to job detail page
  };

  const handleViewData = (_job: any) => {
    // TODO: Navigate to scraped data view
  };

  return (
    <Container>
      <PageHeader
        title="Scraping Jobs"
        description="Monitor and manage your web scraping jobs"
      />

      {/* Stats Summary */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-slate-400">Running</p>
          </div>
          <p className="text-2xl font-semibold text-white">{runningCount}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-slate-400" />
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <p className="text-2xl font-semibold text-white">{pendingCount}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary-400" />
            <p className="text-sm text-slate-400">Completed</p>
          </div>
          <p className="text-2xl font-semibold text-white">{completedCount}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-red-400" />
            <p className="text-sm text-slate-400">Failed</p>
          </div>
          <p className="text-2xl font-semibold text-white">{failedCount}</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="glass-panel p-8 rounded-xl text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load scraping jobs</h3>
          <p className="text-slate-400">{(error as Error)?.message ?? 'Unknown error'}</p>
        </div>
      )}

      {/* Jobs Queue */}
      {!isLoading && !isError && (
        <ScrapingQueue
          jobs={mappedJobs as any}
          onRetry={handleRetry}
          onCancel={handleCancel}
          onViewDetails={handleViewDetails}
          onViewData={handleViewData}
        />
      )}
    </Container>
  );
}
