/**
 * Analytics API Hooks
 * 
 * React Query hooks for fetching analytics data with time range filtering,
 * automatic refetch intervals, and cache management.
 */

import { useQuery } from '@tanstack/react-query';
import { get, buildQueryString } from '../lib/api-client';
import type {
  AnalyticsParams,
  CampaignAnalyticsResponse,
  LeadAnalyticsResponse,
  OverviewAnalyticsResponse,
} from '@dashin/shared-types';

// Query Keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (params: AnalyticsParams) => [...analyticsKeys.all, 'overview', params] as const,
  campaigns: (params: AnalyticsParams) => [...analyticsKeys.all, 'campaigns', params] as const,
  leads: (params: AnalyticsParams) => [...analyticsKeys.all, 'leads', params] as const,
};

/**
 * Fetch overview analytics (dashboard summary)
 */
export function useOverviewAnalytics(params: Partial<AnalyticsParams> = {}, refetchInterval?: number) {
  const fullParams: AnalyticsParams = {
    timeRange: '30d',
    ...params,
  };
  const queryString = buildQueryString(fullParams as unknown as Record<string, unknown>);
  
  return useQuery({
    queryKey: analyticsKeys.overview(fullParams),
    queryFn: async () => {
      const response = await get<OverviewAnalyticsResponse>(`/analytics/overview${queryString}`);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: refetchInterval || false, // Optional auto-refetch
  });
}

/**
 * Fetch campaign analytics with metrics and trends
 */
export function useCampaignAnalytics(params: Partial<AnalyticsParams> = {}, refetchInterval?: number) {
  const fullParams: AnalyticsParams = {
    timeRange: '30d',
    ...params,
  };
  const queryString = buildQueryString(fullParams as unknown as Record<string, unknown>);
  
  return useQuery({
    queryKey: analyticsKeys.campaigns(fullParams),
    queryFn: async () => {
      const response = await get<CampaignAnalyticsResponse>(`/analytics/campaigns${queryString}`);
      return response;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: refetchInterval || false,
  });
}

/**
 * Fetch lead analytics with funnel and distribution data
 */
export function useLeadAnalytics(params: Partial<AnalyticsParams> = {}, refetchInterval?: number) {
  const fullParams: AnalyticsParams = {
    timeRange: '30d',
    ...params,
  };
  const queryString = buildQueryString(fullParams as unknown as Record<string, unknown>);
  
  return useQuery({
    queryKey: analyticsKeys.leads(fullParams),
    queryFn: async () => {
      const response = await get<LeadAnalyticsResponse>(`/analytics/leads${queryString}`);
      return response;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: refetchInterval || false,
  });
}
