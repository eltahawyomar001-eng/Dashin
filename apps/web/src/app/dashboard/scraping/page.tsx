'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Input, Badge, Modal, Spinner } from '@dashin/ui';
import {
  Search,
  Plus,
  Play,
  Pause,
  Trash2,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  XCircle,
  RotateCw,
} from 'lucide-react';
import { Can } from '@dashin/rbac';
import {
  useScrapingJobs,
  useScrapingStats,
  useControlScrapingJob,
  useDeleteScrapingJob,
  useRetryScrapingJob,
} from '../../../hooks/useDataSources';

export default function ScrapingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  // Real data from Supabase via React Query
  const { data: jobsData, isLoading, isError, error } = useScrapingJobs({}, 5000);
  const { data: stats } = useScrapingStats();
  const controlJob = useControlScrapingJob();
  const deleteJob = useDeleteScrapingJob();
  const retryJob = useRetryScrapingJob();

  const jobs = jobsData?.data ?? [];
  const filteredJobs = jobs.filter(
    (job: any) =>
      (job.data_sources?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader className="h-4 w-4 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-slate-400" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-amber-400" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'info' | 'success' | 'danger' | 'default' | 'warning'> = {
      running: 'info',
      completed: 'success',
      failed: 'danger',
      pending: 'default',
      paused: 'warning',
      cancelled: 'default',
    };
    return variants[status] ?? 'default';
  };

  const handleStart = (id: string) => controlJob.mutate({ id, action: 'start' });
  const handlePause = (id: string) => controlJob.mutate({ id, action: 'pause' });
  const handleResume = (id: string) => controlJob.mutate({ id, action: 'resume' });
  const handleCancel = (id: string) => controlJob.mutate({ id, action: 'cancel' });
  const handleRetry = (id: string) => retryJob.mutate(id);
  const confirmDelete = () => {
    if (deleteJobId) {
      deleteJob.mutate(deleteJobId);
      setDeleteJobId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Search className="h-6 w-6 md:h-8 md:w-8 text-primary-400" />
            Web Scraping
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Automated data collection from web sources
          </p>
        </div>
        <Can permission="scrape:create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Scraping Job
          </Button>
        </Can>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.totalJobs ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Running</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.runningJobs ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.completedJobs ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Records Found</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {(stats?.totalRecords ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-accent-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search scraping jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {isError && (
        <Card variant="glass">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Failed to load jobs</h3>
            <p className="text-slate-400">{(error as Error)?.message ?? 'Unknown error'}</p>
          </CardContent>
        </Card>
      )}

      {/* Scraping Jobs List */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {filteredJobs.map((job: any) => (
            <Card key={job.id} variant="glass">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(job.status)}
                      <h3 className="text-lg font-semibold text-white">
                        {job.data_sources?.name ?? `Job ${job.id.slice(0, 8)}`}
                      </h3>
                      <Badge variant={getStatusBadge(job.status)}>{job.status}</Badge>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-medium">{job.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {job.error_message && (
                      <div className="mb-3 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
                        <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{job.error_message}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Records:</span>
                        <span className="text-white font-medium">
                          {(job.records_processed ?? 0).toLocaleString()}
                        </span>
                      </div>
                      {job.started_at && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Started:</span>
                          <span className="text-white font-medium">
                            {new Date(job.started_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Can permission="scrape:create">
                      {job.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => handleStart(job.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'running' && (
                        <Button variant="ghost" size="sm" onClick={() => handlePause(job.id)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'paused' && (
                        <Button variant="ghost" size="sm" onClick={() => handleResume(job.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'running' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-400 hover:text-amber-300"
                          onClick={() => handleCancel(job.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === 'failed' && (
                        <Button variant="ghost" size="sm" onClick={() => handleRetry(job.id)}>
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                    </Can>
                    <Can permission="scrape:create">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => setDeleteJobId(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Can>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredJobs.length === 0 && (
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No scraping jobs found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first scraping job to get started'}
            </p>
            <Can permission="scrape:create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Scraping Job
              </Button>
            </Can>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {deleteJobId && (
        <Modal
          isOpen={!!deleteJobId}
          onClose={() => setDeleteJobId(null)}
          title="Delete Scraping Job"
        >
          <div className="space-y-4">
            <p className="text-slate-300">
              Are you sure you want to delete this scraping job? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteJobId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete Job
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
