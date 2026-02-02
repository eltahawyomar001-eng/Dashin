/**
 * Analytics and Reporting Type Definitions
 * 
 * Comprehensive types for analytics dashboards, metrics tracking,
 * data visualization, and reporting functionality.
 */

/**
 * Time range options for analytics queries
 */
export type TimeRange = 
  | '7d'    // Last 7 days
  | '30d'   // Last 30 days
  | '90d'   // Last 90 days
  | '6m'    // Last 6 months
  | '1y'    // Last year
  | 'custom'; // Custom date range

/**
 * Metric comparison periods
 */
export type ComparisonPeriod = 'previous_period' | 'previous_year' | 'none';

/**
 * Chart types available for visualization
 */
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'funnel';

/**
 * Time series granularity
 */
export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Base metric data point
 */
export interface MetricData {
  label: string;
  value: number;
  change?: number; // Percentage change from comparison period
  changeDirection?: 'up' | 'down' | 'neutral';
  trend?: number[]; // Sparkline data points
  target?: number; // Target/goal value
  unit?: string; // Unit of measurement (%, $, leads, etc.)
}

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  timestamp: string; // ISO 8601 format
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

/**
 * Time series dataset
 */
export interface TimeSeriesData {
  id: string;
  name: string;
  color?: string;
  data: TimeSeriesPoint[];
  unit?: string;
}

/**
 * Chart data structure
 */
export interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  datasets: TimeSeriesData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

/**
 * Pie/Donut chart segment
 */
export interface PieChartSegment {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

/**
 * Funnel stage data
 */
export interface FunnelStage {
  name: string;
  value: number;
  percentage: number; // Percentage of previous stage
  dropoff: number; // Number dropped from previous stage
  conversionRate: number; // Cumulative conversion from first stage
}

/**
 * Campaign performance metrics
 */
export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  startDate: string;
  endDate?: string;
  
  // Lead metrics
  totalLeads: number;
  qualifiedLeads: number;
  rejectedLeads: number;
  assignedLeads: number;
  convertedLeads: number;
  
  // Conversion rates
  qualificationRate: number; // qualified / total
  conversionRate: number; // converted / qualified
  assignmentRate: number; // assigned / qualified
  
  // Quality metrics
  averageQualificationScore: number;
  highPriorityLeads: number;
  
  // Time metrics
  averageTimeToQualify?: number; // Hours
  averageTimeToConvert?: number; // Days
  
  // Source breakdown
  leadsBySource: Record<string, number>;
  
  // Trends
  dailyLeads: TimeSeriesPoint[];
  dailyQualifications: TimeSeriesPoint[];
}

/**
 * Lead analytics data
 */
export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  rejectedLeads: number;
  assignedLeads: number;
  convertedLeads: number;
  
  // Score distribution
  scoreDistribution: {
    score1: number;
    score2: number;
    score3: number;
    score4: number;
    score5: number;
  };
  
  // Priority distribution
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  
  // Qualification criteria analysis
  criteriaAnalysis: {
    companySize: Record<string, number>;
    industry: Record<string, number>;
    location: Record<string, number>;
    budget: Record<string, number>;
    authority: Record<string, number>;
    need: Record<string, number>;
    timing: Record<string, number>;
  };
  
  // Funnel data
  qualificationFunnel: FunnelStage[];
  
  // Time series
  leadsTrend: TimeSeriesPoint[];
  qualificationTrend: TimeSeriesPoint[];
}

/**
 * Scraping analytics data
 */
export interface ScrapingAnalytics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  runningJobs: number;
  queuedJobs: number;
  
  // Performance metrics
  averageDuration: number; // Seconds
  successRate: number; // Percentage
  totalDataPoints: number;
  
  // Source breakdown
  jobsBySource: Record<string, number>;
  
  // Time series
  jobsOverTime: TimeSeriesPoint[];
  successRateOverTime: TimeSeriesPoint[];
  dataPointsOverTime: TimeSeriesPoint[];
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'map';
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number; // Grid columns (1-12)
    height: number; // Grid rows
  };
  dataSource: string; // API endpoint or data key
  refreshInterval?: number; // Seconds
  filters?: Record<string, any>;
}

/**
 * Dashboard layout
 */
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Report configuration
 */
export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  type: 'campaign' | 'lead' | 'scraping' | 'custom';
  
  // Time range
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  
  // Filters
  filters: {
    campaignIds?: string[];
    leadStatuses?: string[];
    sources?: string[];
    priorities?: string[];
    agencies?: string[];
    clients?: string[];
  };
  
  // Metrics to include
  metrics: string[];
  
  // Charts to include
  charts: string[];
  
  // Grouping
  groupBy?: 'campaign' | 'source' | 'priority' | 'status' | 'date';
  
  // Export settings
  exportFormat: 'pdf' | 'csv' | 'xlsx' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
}

/**
 * Scheduled report
 */
export interface ScheduledReport {
  id: string;
  reportConfig: ReportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
  };
  recipients: string[]; // Email addresses
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Report generation status
 */
export interface ReportGenerationStatus {
  id: string;
  reportConfigId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string;
  fileUrl?: string;
  error?: string;
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  granularity?: TimeGranularity;
  comparisonPeriod?: ComparisonPeriod;
  filters?: {
    campaignIds?: string[];
    leadStatuses?: string[];
    sources?: string[];
    priorities?: string[];
  };
}

/**
 * Key Performance Indicator (KPI) definition
 */
export interface KPI {
  id: string;
  name: string;
  description: string;
  category: 'campaign' | 'lead' | 'scraping' | 'business';
  value: number;
  previousValue?: number;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  target?: number;
  unit: string;
  format: 'number' | 'percentage' | 'currency' | 'duration';
  isGoodDirectionUp: boolean; // Whether increase is positive
  trend?: number[]; // Last 7-30 data points for sparkline
  updatedAt: string;
}

/**
 * Aggregated analytics overview
 */
export interface AnalyticsOverview {
  timeRange: TimeRange;
  startDate: string;
  endDate: string;
  
  // Key metrics
  kpis: KPI[];
  
  // Campaign summary
  campaigns: {
    total: number;
    active: number;
    completed: number;
    totalLeads: number;
    qualifiedLeads: number;
    conversionRate: number;
  };
  
  // Lead summary
  leads: {
    total: number;
    new: number;
    qualified: number;
    assigned: number;
    converted: number;
    averageScore: number;
  };
  
  // Scraping summary
  scraping: {
    totalJobs: number;
    completedJobs: number;
    successRate: number;
    totalDataPoints: number;
  };
  
  // Trends
  leadsTrend: TimeSeriesData;
  qualificationsTrend: TimeSeriesData;
  conversionsTrend: TimeSeriesData;
}

/**
 * Export data format
 */
export interface ExportData {
  fileName: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  data: any[];
  metadata?: {
    generatedAt: string;
    generatedBy: string;
    filters?: Record<string, any>;
    totalRecords: number;
  };
}

/**
 * Payloads for analytics operations
 */
export interface CreateDashboardPayload {
  name: string;
  description?: string;
  isDefault?: boolean;
  widgets: Omit<DashboardWidget, 'id'>[];
}

export interface UpdateDashboardPayload {
  name?: string;
  description?: string;
  isDefault?: boolean;
  widgets?: DashboardWidget[];
}

export interface CreateReportPayload {
  name: string;
  description?: string;
  type: ReportConfig['type'];
  timeRange: TimeRange;
  startDate?: string;
  endDate?: string;
  filters?: ReportConfig['filters'];
  metrics: string[];
  charts?: string[];
  groupBy?: ReportConfig['groupBy'];
  exportFormat: ReportConfig['exportFormat'];
  includeCharts?: boolean;
  includeRawData?: boolean;
}

export interface ScheduleReportPayload {
  reportConfigId: string;
  frequency: ScheduledReport['schedule']['frequency'];
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
}

export interface GenerateReportPayload {
  reportConfigId: string;
  timeRange?: TimeRange;
  startDate?: string;
  endDate?: string;
  exportFormat?: 'pdf' | 'csv' | 'xlsx' | 'json';
}
