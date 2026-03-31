/**
 * Data Sources & Scraping Jobs Hooks
 *
 * React Query hooks backed by direct Supabase calls.
 * Replaces the previous version that called non-existent REST endpoints.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@dashin/ui';
import {
  fetchDataSources,
  fetchDataSource,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  toggleDataSourceStatus,
  fetchScrapingJobs,
  fetchScrapingJob,
  createScrapingJob,
  controlScrapingJob,
  retryScrapingJob,
  deleteScrapingJob,
  fetchScrapingStats,
  type DataSourceFilters,
  type ScrapingJobFilters,
} from '../lib/supabase-scraping';
import type { Database } from '@dashin/supabase';

type DataSourceInsert = Database['public']['Tables']['data_sources']['Insert'];
type DataSourceUpdate = Database['public']['Tables']['data_sources']['Update'];
type ScrapingJobInsert = Database['public']['Tables']['scraping_jobs']['Insert'];

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dataSourceKeys = {
  all: ['dataSources'] as const,
  lists: () => [...dataSourceKeys.all, 'list'] as const,
  list: (params: DataSourceFilters) => [...dataSourceKeys.lists(), params] as const,
  details: () => [...dataSourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...dataSourceKeys.details(), id] as const,
};

export const scrapingJobKeys = {
  all: ['scrapingJobs'] as const,
  lists: () => [...scrapingJobKeys.all, 'list'] as const,
  list: (params: ScrapingJobFilters) => [...scrapingJobKeys.lists(), params] as const,
  details: () => [...scrapingJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...scrapingJobKeys.details(), id] as const,
  stats: () => [...scrapingJobKeys.all, 'stats'] as const,
};

// ============================================================================
// DATA SOURCE HOOKS
// ============================================================================

/** Fetch data sources list with filters */
export function useDataSources(params: DataSourceFilters = {}) {
  return useQuery({
    queryKey: dataSourceKeys.list(params),
    queryFn: () => fetchDataSources(params),
    staleTime: 3 * 60 * 1000,
  });
}

/** Fetch single data source by ID */
export function useDataSource(id: string, enabled = true) {
  return useQuery({
    queryKey: dataSourceKeys.detail(id),
    queryFn: () => fetchDataSource(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/** Create new data source */
export function useCreateDataSource() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: DataSourceInsert) => createDataSource(data),
    onSuccess: (dataSource) => {
      queryClient.invalidateQueries({ queryKey: dataSourceKeys.lists() });
      showToast({
        type: 'success',
        title: 'Data source created',
        message: `${dataSource.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to create data source',
        message: error.message,
      });
    },
  });
}

/** Update existing data source */
export function useUpdateDataSource() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DataSourceUpdate }) =>
      updateDataSource(id, data),
    onSuccess: (dataSource) => {
      queryClient.setQueryData(dataSourceKeys.detail(dataSource.id), dataSource);
      queryClient.invalidateQueries({ queryKey: dataSourceKeys.lists() });
      showToast({
        type: 'success',
        title: 'Data source updated',
        message: `${dataSource.name} has been updated.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to update data source',
        message: error.message,
      });
    },
  });
}

/** Delete data source */
export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteDataSource(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: dataSourceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dataSourceKeys.lists() });
      showToast({
        type: 'success',
        title: 'Data source deleted',
        message: 'Data source has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to delete data source',
        message: error.message,
      });
    },
  });
}

/** Toggle data source active/inactive */
export function useToggleDataSourceStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) =>
      toggleDataSourceStatus(id, currentStatus as any),
    onSuccess: (dataSource) => {
      queryClient.setQueryData(dataSourceKeys.detail(dataSource.id), dataSource);
      queryClient.invalidateQueries({ queryKey: dataSourceKeys.lists() });
      showToast({
        type: 'success',
        title: 'Status updated',
        message: `${dataSource.name} is now ${dataSource.status}.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to update status',
        message: error.message,
      });
    },
  });
}

// ============================================================================
// SCRAPING JOB HOOKS
// ============================================================================

/** Fetch scraping jobs with optional polling for running jobs */
export function useScrapingJobs(params: ScrapingJobFilters = {}, pollingInterval?: number) {
  return useQuery({
    queryKey: scrapingJobKeys.list(params),
    queryFn: () => fetchScrapingJobs(params),
    staleTime: 30 * 1000,
    refetchInterval: pollingInterval || false,
  });
}

/** Fetch single scraping job with optional polling */
export function useScrapingJob(id: string, enabled = true, pollingInterval?: number) {
  return useQuery({
    queryKey: scrapingJobKeys.detail(id),
    queryFn: () => fetchScrapingJob(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
    refetchInterval: pollingInterval || false,
  });
}

/** Fetch aggregated scraping stats */
export function useScrapingStats() {
  return useQuery({
    queryKey: scrapingJobKeys.stats(),
    queryFn: fetchScrapingStats,
    staleTime: 60 * 1000,
  });
}

/** Create and queue a new scraping job */
export function useCreateScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (data: ScrapingJobInsert) => createScrapingJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.stats() });
      showToast({
        type: 'success',
        title: 'Scraping job created',
        message: 'Job queued successfully.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to create job',
        message: error.message,
      });
    },
  });
}

/** Control a scraping job (start / pause / resume / cancel) */
export function useControlScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'pause' | 'resume' | 'cancel' }) =>
      controlScrapingJob(id, action),
    onSuccess: (job, { action }) => {
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.stats() });
      if (job?.id) {
        queryClient.setQueryData(scrapingJobKeys.detail(job.id), job);
      }
      const labels: Record<string, string> = {
        start: 'started',
        pause: 'paused',
        resume: 'resumed',
        cancel: 'cancelled',
      };
      showToast({
        type: 'success',
        title: `Job ${labels[action]}`,
        message: `Scraping job has been ${labels[action]}.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Job control failed',
        message: error.message,
      });
    },
  });
}

/** Retry a failed scraping job */
export function useRetryScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => retryScrapingJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.stats() });
      showToast({
        type: 'success',
        title: 'Job restarted',
        message: 'Scraping job has been queued for retry.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to retry job',
        message: error.message,
      });
    },
  });
}

/** Delete a scraping job */
export function useDeleteScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteScrapingJob(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: scrapingJobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.stats() });
      showToast({
        type: 'success',
        title: 'Job deleted',
        message: 'Scraping job has been deleted.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to delete job',
        message: error.message,
      });
    },
  });
}
