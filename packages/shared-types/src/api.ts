/**
 * API Client Configuration
 * 
 * Centralized API client with type-safe request/response handling,
 * error handling, and authentication token management.
 */

import type {
  Campaign,
  Lead,
  DataSource,
  ScrapingJob,
  User,
} from './index';

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// API Error Response
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API Query Parameters
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

// Campaign API
export interface CampaignListParams extends QueryParams {
  status?: Campaign['status'];
  dateFrom?: string;
  dateTo?: string;
}

export interface CampaignApiResponse {
  campaign: Campaign;
}

export interface CampaignsListResponse extends PaginatedResponse<Campaign> {}

// Lead API
export interface LeadListParams extends QueryParams {
  campaignId?: string;
  status?: Lead['status'];
  priority?: Lead['priority'];
  minScore?: number;
  maxScore?: number;
  source?: string;
}

export interface QualifyLeadPayload {
  leadId: string;
  score: number;
  priority: Lead['priority'];
  qualificationCriteria: Array<{
    criterion: string;
    met: boolean;
    notes?: string;
  }>;
  notes?: string;
}

export interface AssignLeadPayload {
  leadId: string;
  assignedTo: string;
  notes?: string;
}

export interface UpdateLeadStatusPayload {
  leadId: string;
  status: Lead['status'];
  notes?: string;
}

export interface BulkLeadOperation {
  leadIds: string[];
  operation: 'qualify' | 'assign' | 'update_status' | 'delete';
  payload: unknown;
}

export interface LeadApiResponse {
  lead: Lead;
}

export interface LeadsListResponse extends PaginatedResponse<Lead> {}

// Data Source API
export interface DataSourceListParams extends QueryParams {
  type?: DataSource['type'];
  status?: DataSource['status'];
}

export interface DataSourceApiResponse {
  dataSource: DataSource;
}

export interface DataSourcesListResponse extends PaginatedResponse<DataSource> {}

// Scraping Job API
export interface ScrapingJobListParams extends QueryParams {
  dataSourceId?: string;
  status?: ScrapingJob['status'];
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateScrapingJobPayload {
  dataSourceId: string;
  priority?: 'low' | 'normal' | 'high';
  config?: Record<string, unknown>;
}

export interface UpdateScrapingJobPayload {
  status?: ScrapingJob['status'];
  notes?: string;
}

export interface ScrapingJobApiResponse {
  job: ScrapingJob;
}

export interface ScrapingJobsListResponse extends PaginatedResponse<ScrapingJob> {}

// Analytics API
export interface AnalyticsParams {
  timeRange: '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface CampaignAnalyticsResponse {
  metrics: {
    totalLeads: number;
    qualifiedLeads: number;
    qualificationRate: number;
    conversionRate: number;
    avgScore: number;
  };
  trends: Array<{
    date: string;
    leads: number;
    qualified: number;
    converted: number;
  }>;
  sourceBreakdown: Array<{
    source: string;
    count: number;
    qualificationRate: number;
  }>;
}

export interface LeadAnalyticsResponse {
  metrics: {
    total: number;
    qualified: number;
    assigned: number;
    converted: number;
    rejected: number;
  };
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  scoreDistribution: Array<{
    score: number;
    count: number;
  }>;
  criteriaAnalysis: Array<{
    criterion: string;
    matchCount: number;
    mismatchCount: number;
  }>;
}

export interface OverviewAnalyticsResponse {
  campaigns: {
    total: number;
    active: number;
    completed: number;
  };
  leads: {
    total: number;
    qualified: number;
    qualificationRate: number;
  };
  sources: {
    total: number;
    active: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'campaign' | 'lead' | 'source';
    action: string;
    timestamp: string;
    user: string;
  }>;
}

// User API
export interface UserListParams extends QueryParams {
  role?: User['role'];
  agencyId?: string;
  status?: 'active' | 'inactive';
}

export interface CreateUserPayload {
  email: string;
  name: string;
  role: User['role'];
  agencyId?: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  status?: 'active' | 'inactive';
}

export interface UserApiResponse {
  user: User;
}

export interface UsersListResponse extends PaginatedResponse<User> {}

// Report API
export interface ReportGenerationPayload {
  templateId: string;
  timeRange: AnalyticsParams['timeRange'];
  startDate?: string;
  endDate?: string;
  campaignIds?: string[];
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
}

export interface ReportSchedulingPayload {
  name: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  timeRange: AnalyticsParams['timeRange'];
}

export interface ReportDownloadResponse {
  reportId: string;
  downloadUrl: string;
  expiresAt: string;
}

// WebSocket Events
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export interface JobProgressEvent {
  jobId: string;
  progress: number;
  status: ScrapingJob['status'];
  recordsProcessed: number;
  errors: number;
}

export interface CampaignUpdateEvent {
  campaignId: string;
  metrics: {
    totalLeads: number;
    qualifiedLeads: number;
  };
}

export interface LeadUpdateEvent {
  leadId: string;
  status: Lead['status'];
  assignedTo?: string;
  updatedAt: string;
}

export interface NotificationEvent {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

// API Response Wrapper (standardized format)
export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// Batch Operation Response
export interface BatchOperationResponse {
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}
