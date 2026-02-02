/**
 * Data Sources & Scraping Jobs API Hooks
 * 
 * React Query hooks for managing data sources and scraping jobs with
 * real-time status updates, job control, and polling support.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@dashin/ui';
import { get, post, patch, del, buildQueryString } from '../lib/api-client';
import type {
  DataSource,
  DataSourceListParams,
  DataSourcesListResponse,
  DataSourceApiResponse,
  CreateDataSourcePayload,
  UpdateDataSourcePayload,
  ScrapingJobListParams,
  ScrapingJobsListResponse,
  ScrapingJobApiResponse,
  CreateScrapingJobPayload,
  UpdateScrapingJobPayload,
} from '@dashin/shared-types';

// Query Keys
export const dataSourceKeys = {
  all: ['dataSources'] as const,
  lists: () => [...dataSourceKeys.all, 'list'] as const,
  list: (params: DataSourceListParams) => [...dataSourceKeys.lists(), params] as const,
  details: () => [...dataSourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...dataSourceKeys.details(), id] as const,
};

export const scrapingJobKeys = {
  all: ['scrapingJobs'] as const,
  lists: () => [...scrapingJobKeys.all, 'list'] as const,
  list: (params: ScrapingJobListParams) => [...scrapingJobKeys.lists(), params] as const,
  details: () => [...scrapingJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...scrapingJobKeys.details(), id] as const,
};

/**
 * Fetch data sources list with filters
 */
export function useDataSources(params: DataSourceListParams = {}) {
  const queryString = buildQueryString(params as unknown as Record<string, unknown>);
  
  return useQuery({
    queryKey: dataSourceKeys.list(params),
    queryFn: async () => {
      const response = await get<DataSourcesListResponse>(`/data-sources${queryString}`);
      return response;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Fetch single data source by ID
 */
export function useDataSource(id: string, enabled = true) {
  return useQuery({
    queryKey: dataSourceKeys.detail(id),
    queryFn: async () => {
      const response = await get<DataSourceApiResponse>(`/data-sources/${id}`);
      return response.dataSource;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create new data source
 */
export function useCreateDataSource() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDataSourcePayload) => {
      const response = await post<DataSourceApiResponse, CreateDataSourcePayload>(
        '/data-sources',
        data
      );
      return response.dataSource;
    },
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

/**
 * Update existing data source
 */
export function useUpdateDataSource() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDataSourcePayload }) => {
      const response = await patch<DataSourceApiResponse, UpdateDataSourcePayload>(
        `/data-sources/${id}`,
        data
      );
      return response.dataSource;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: dataSourceKeys.detail(id) });
      const previousSource = queryClient.getQueryData<DataSource>(dataSourceKeys.detail(id));

      if (previousSource) {
        queryClient.setQueryData<DataSource>(dataSourceKeys.detail(id), {
          ...previousSource,
          ...data,
          config: {
            ...previousSource.config,
            ...data.config,
          },
        } as DataSource);
      }

      return { previousSource };
    },
    onSuccess: (dataSource) => {
      queryClient.setQueryData(dataSourceKeys.detail(dataSource.id), dataSource);
      queryClient.invalidateQueries({ queryKey: dataSourceKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Data source updated',
        message: `${dataSource.name} has been updated successfully.`,
      });
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousSource) {
        queryClient.setQueryData(dataSourceKeys.detail(id), context.previousSource);
      }
      
      showToast({
        type: 'error',
        title: 'Failed to update data source',
        message: error.message,
      });
    },
  });
}

/**
 * Delete data source
 */
export function useDeleteDataSource() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await del(`/data-sources/${id}`);
      return id;
    },
    onSuccess: (id) => {
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

/**
 * Fetch scraping jobs list with filters and optional polling
 */
export function useScrapingJobs(params: ScrapingJobListParams = {}, pollingInterval?: number) {
  const queryString = buildQueryString(params as unknown as Record<string, unknown>);
  
  return useQuery({
    queryKey: scrapingJobKeys.list(params),
    queryFn: async () => {
      const response = await get<ScrapingJobsListResponse>(`/scraping-jobs${queryString}`);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds (short for real-time feel)
    refetchInterval: pollingInterval || false, // Enable polling if specified
  });
}

/**
 * Fetch single scraping job by ID with optional polling
 */
export function useScrapingJob(id: string, enabled = true, pollingInterval?: number) {
  return useQuery({
    queryKey: scrapingJobKeys.detail(id),
    queryFn: async () => {
      const response = await get<ScrapingJobApiResponse>(`/scraping-jobs/${id}`);
      return response.job;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: pollingInterval || false, // Poll for status updates
  });
}

/**
 * Create and start new scraping job
 */
export function useCreateScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateScrapingJobPayload) => {
      const response = await post<ScrapingJobApiResponse, CreateScrapingJobPayload>(
        '/scraping-jobs',
        data
      );
      return response.job;
    },
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Scraping job created',
        message: `Job #${job.id.slice(0, 8)} has been started.`,
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

/**
 * Update scraping job status or configuration
 */
export function useUpdateScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateScrapingJobPayload }) => {
      const response = await patch<ScrapingJobApiResponse, UpdateScrapingJobPayload>(
        `/scraping-jobs/${id}`,
        data
      );
      return response.job;
    },
    onSuccess: (job) => {
      queryClient.setQueryData(scrapingJobKeys.detail(job.id), job);
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Job updated',
        message: `Job status updated to ${job.status}.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to update job',
        message: error.message,
      });
    },
  });
}

/**
 * Cancel running scraping job
 */
export function useCancelScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await post<ScrapingJobApiResponse, { action: string }>(
        `/scraping-jobs/${id}/cancel`,
        { action: 'cancel' }
      );
      return response.job;
    },
    onSuccess: (job) => {
      queryClient.setQueryData(scrapingJobKeys.detail(job.id), job);
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Job cancelled',
        message: 'Scraping job has been cancelled.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to cancel job',
        message: error.message,
      });
    },
  });
}

/**
 * Retry failed scraping job
 */
export function useRetryScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await post<ScrapingJobApiResponse, { action: string }>(
        `/scraping-jobs/${id}/retry`,
        { action: 'retry' }
      );
      return response.job;
    },
    onSuccess: (job) => {
      queryClient.setQueryData(scrapingJobKeys.detail(job.id), job);
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Job restarted',
        message: 'Scraping job has been restarted.',
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

/**
 * Delete scraping job and its data
 */
export function useDeleteScrapingJob() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await del(`/scraping-jobs/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: scrapingJobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: scrapingJobKeys.lists() });
      
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
