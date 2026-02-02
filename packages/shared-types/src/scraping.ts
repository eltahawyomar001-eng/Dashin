// Scraping Domain Types

export type DataSourceType = 'website' | 'api' | 'social_media' | 'database' | 'file';
export type DataSourceStatus = 'active' | 'inactive' | 'error' | 'pending';
export type ScrapingJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ScrapingFrequency = 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';

// Authentication configuration
export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

// Selector configuration for web scraping
export interface SelectorConfig {
  name: string;
  selector: string;
  type: 'text' | 'attribute' | 'html';
  attribute?: string;
  multiple?: boolean;
  required?: boolean;
}

// Pagination configuration
export interface PaginationConfig {
  enabled: boolean;
  type?: 'click' | 'url_pattern' | 'infinite_scroll';
  selector?: string;
  urlPattern?: string;
  maxPages?: number;
}

// Rate limiting configuration
export interface RateLimitConfig {
  requestsPerMinute: number;
  delayBetweenRequests: number; // milliseconds
  respectRobotsTxt: boolean;
}

// Scraping configuration
export interface ScrapingConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  auth?: AuthConfig;
  selectors: SelectorConfig[];
  pagination?: PaginationConfig;
  rateLimit: RateLimitConfig;
  javascriptEnabled: boolean;
  followRedirects: boolean;
  timeout: number; // milliseconds
  retryAttempts: number;
  validateSSL: boolean;
}

// Data source entity
export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: DataSourceType;
  status: DataSourceStatus;
  config: ScrapingConfig;
  frequency: ScrapingFrequency;
  lastScrapedAt?: string;
  nextScheduledAt?: string;
  totalRecords: number;
  errorCount: number;
  createdBy: string;
  agencyId?: string;
  createdAt: string;
  updatedAt: string;
}

// Scraping job entity
export interface ScrapingJob {
  id: string;
  dataSourceId: string;
  dataSourceName: string;
  status: ScrapingJobStatus;
  startedAt?: string;
  completedAt?: string;
  recordsScraped: number;
  recordsFailed: number;
  errorMessage?: string;
  progress: number; // 0-100
  currentPage?: number;
  totalPages?: number;
  retryCount: number;
  logs: JobLog[];
  createdAt: string;
  updatedAt: string;
}

// Job log entry
export interface JobLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

// Scraped data record
export interface ScrapedData {
  id: string;
  dataSourceId: string;
  jobId: string;
  data: Record<string, any>;
  rawHtml?: string;
  url: string;
  scrapedAt: string;
  validated: boolean;
  validationErrors?: string[];
}

// Data source creation payload
export interface CreateDataSourcePayload {
  name: string;
  description?: string;
  type: DataSourceType;
  config: ScrapingConfig;
  frequency: ScrapingFrequency;
  agencyId?: string;
}

// Data source update payload
export interface UpdateDataSourcePayload {
  name?: string;
  description?: string;
  status?: DataSourceStatus;
  config?: Partial<ScrapingConfig>;
  frequency?: ScrapingFrequency;
}

// Job statistics
export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

// Data validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
