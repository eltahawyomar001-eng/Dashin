/**
 * Campaign API Hooks
 * 
 * React Query hooks for campaign CRUD operations with optimistic updates,
 * caching, and error handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@dashin/ui';
import { get, post, patch, del, buildQueryString } from '../lib/api-client';
import type {
  Campaign,
  CampaignListParams,
  CampaignsListResponse,
  CampaignApiResponse,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '@dashin/shared-types';

// Query Keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params: CampaignListParams) => [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

/**
 * Fetch campaigns list with filters
 */
export function useCampaigns(params: CampaignListParams = {}) {
  const queryString = buildQueryString(params as Record<string, unknown>);
  
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: async () => {
      const response = await get<CampaignsListResponse>(`/campaigns${queryString}`);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch single campaign by ID
 */
export function useCampaign(id: string, enabled = true) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: async () => {
      const response = await get<CampaignApiResponse>(`/campaigns/${id}`);
      return response.campaign;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCampaignPayload) => {
      const response = await post<CampaignApiResponse, CreateCampaignPayload>('/campaigns', data);
      return response.campaign;
    },
    onSuccess: (campaign) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Campaign created',
        message: `${campaign.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to create campaign',
        message: error.message,
      });
    },
  });
}

/**
 * Update existing campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCampaignPayload }) => {
      const response = await patch<CampaignApiResponse, UpdateCampaignPayload>(
        `/campaigns/${id}`,
        data
      );
      return response.campaign;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: campaignKeys.detail(id) });

      // Snapshot previous value
      const previousCampaign = queryClient.getQueryData<Campaign>(campaignKeys.detail(id));

      // Optimistically update
      if (previousCampaign) {
        queryClient.setQueryData<Campaign>(campaignKeys.detail(id), {
          ...previousCampaign,
          ...data,
        });
      }

      return { previousCampaign };
    },
    onSuccess: (campaign) => {
      // Update cache with server response
      queryClient.setQueryData(campaignKeys.detail(campaign.id), campaign);
      
      // Invalidate lists to show updates
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Campaign updated',
        message: `${campaign.name} has been updated successfully.`,
      });
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousCampaign) {
        queryClient.setQueryData(campaignKeys.detail(id), context.previousCampaign);
      }
      
      showToast({
        type: 'error',
        title: 'Failed to update campaign',
        message: error.message,
      });
    },
  });
}

/**
 * Delete campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await del(`/campaigns/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Campaign deleted',
        message: 'Campaign has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to delete campaign',
        message: error.message,
      });
    },
  });
}

/**
 * Update campaign status (launch, pause, complete)
 */
export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Campaign['status'] }) => {
      const response = await patch<CampaignApiResponse, { status: Campaign['status'] }>(
        `/campaigns/${id}/status`,
        { status }
      );
      return response.campaign;
    },
    onSuccess: (campaign) => {
      // Update cache
      queryClient.setQueryData(campaignKeys.detail(campaign.id), campaign);
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      
      const statusText = campaign.status === 'active' ? 'launched' : campaign.status;
      showToast({
        type: 'success',
        title: `Campaign ${statusText}`,
        message: `${campaign.name} is now ${statusText}.`,
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
