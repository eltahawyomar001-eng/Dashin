/**
 * Lead API Hooks
 * 
 * React Query hooks for lead management including qualification, assignment,
 * bulk operations, and status updates with optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@dashin/ui';
import { get, post, patch, del, buildQueryString } from '../lib/api-client';
import type {
  Lead,
  LeadQualification,
  LeadListParams,
  LeadsListResponse,
  LeadApiResponse,
  CreateLeadPayload,
  QualifyLeadPayload,
  AssignLeadPayload,
  UpdateLeadStatusPayload,
  BulkLeadOperation,
  BatchOperationResponse,
} from '@dashin/shared-types';

// Query Keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

/**
 * Fetch leads list with filters and pagination
 */
export function useLeads(params: LeadListParams = {}) {
  const queryString = buildQueryString(params as Record<string, unknown>);
  
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: async () => {
      const response = await get<LeadsListResponse>(`/leads${queryString}`);
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Fetch single lead by ID
 */
export function useLead(id: string, enabled = true) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: async () => {
      const response = await get<LeadApiResponse>(`/leads/${id}`);
      return response.lead;
    },
    enabled: enabled && !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Create new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateLeadPayload) => {
      const response = await post<LeadApiResponse, CreateLeadPayload>('/leads', data);
      return response.lead;
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Lead created',
        message: `${lead.firstName} ${lead.lastName} has been added successfully.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to create lead',
        message: error.message,
      });
    },
  });
}

/**
 * Qualify lead with score and priority
 */
export function useQualifyLead() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QualifyLeadPayload }) => {
      const response = await patch<LeadApiResponse, QualifyLeadPayload>(
        `/leads/${id}/qualify`,
        data
      );
      return response.lead;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: leadKeys.detail(id) });
      const previousLead = queryClient.getQueryData<Lead>(leadKeys.detail(id));

      if (previousLead) {
        queryClient.setQueryData<Lead>(leadKeys.detail(id), {
          ...previousLead,
          qualification: {
            ...previousLead.qualification,
            score: data.score,
            criteria: data.qualificationCriteria,
            notes: data.notes,
            qualifiedBy: 'current-user',
            qualifiedAt: new Date().toISOString(),
          } as LeadQualification,
          priority: data.priority,
          status: 'qualified',
        });
      }

      return { previousLead };
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadKeys.detail(lead.id), lead);
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      const score = lead.qualification?.score || 0;
      showToast({
        type: 'success',
        title: 'Lead qualified',
        message: `${lead.firstName} ${lead.lastName} has been qualified with score ${score}.`,
      });
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousLead) {
        queryClient.setQueryData(leadKeys.detail(id), context.previousLead);
      }
      
      showToast({
        type: 'error',
        title: 'Failed to qualify lead',
        message: error.message,
      });
    },
  });
}

/**
 * Assign lead to user
 */
export function useAssignLead() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssignLeadPayload }) => {
      const response = await patch<LeadApiResponse, AssignLeadPayload>(
        `/leads/${id}/assign`,
        data
      );
      return response.lead;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: leadKeys.detail(id) });
      const previousLead = queryClient.getQueryData<Lead>(leadKeys.detail(id));

      if (previousLead) {
        queryClient.setQueryData<Lead>(leadKeys.detail(id), {
          ...previousLead,
          assignedTo: data.assignedTo,
          status: 'assigned',
        });
      }

      return { previousLead };
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadKeys.detail(lead.id), lead);
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Lead assigned',
        message: `${lead.firstName} ${lead.lastName} has been assigned successfully.`,
      });
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousLead) {
        queryClient.setQueryData(leadKeys.detail(id), context.previousLead);
      }
      
      showToast({
        type: 'error',
        title: 'Failed to assign lead',
        message: error.message,
      });
    },
  });
}

/**
 * Update lead status
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadStatusPayload }) => {
      const response = await patch<LeadApiResponse, UpdateLeadStatusPayload>(
        `/leads/${id}/status`,
        data
      );
      return response.lead;
    },
    onSuccess: (lead) => {
      queryClient.setQueryData(leadKeys.detail(lead.id), lead);
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Status updated',
        message: `Lead status changed to ${lead.status}.`,
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

/**
 * Delete lead
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await del(`/leads/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: leadKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      showToast({
        type: 'success',
        title: 'Lead deleted',
        message: 'Lead has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Failed to delete lead',
        message: error.message,
      });
    },
  });
}

/**
 * Bulk operations on leads (qualify, assign, reject, delete)
 */
export function useBulkLeadOperation() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (operation: BulkLeadOperation) => {
      const response = await post<BatchOperationResponse, BulkLeadOperation>(
        '/leads/bulk',
        operation
      );
      return response;
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      
      // Invalidate individual lead caches
      variables.leadIds.forEach(id => {
        queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
      });
      
      const operationText = variables.operation === 'update_status' ? 'updated' : 'deleted';
      
      showToast({
        type: result.failed > 0 ? 'warning' : 'success',
        title: 'Bulk operation completed',
        message: `${result.success} leads ${operationText}${result.failed > 0 ? `, ${result.failed} failed` : ''}.`,
      });
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        title: 'Bulk operation failed',
        message: error.message,
      });
    },
  });
}
