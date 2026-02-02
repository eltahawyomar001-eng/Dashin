import { z } from 'zod';

// ============================================================================
// Campaign Validation Schemas
// ============================================================================

export const campaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  targetCompanies: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Must target at least 1 company')
    .max(10000, 'Cannot exceed 10,000 companies'),
  
  targetLeads: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Must target at least 1 lead')
    .max(50000, 'Cannot exceed 50,000 leads'),
  
  startDate: z
    .string()
    .datetime('Invalid date format')
    .or(z.date().transform(d => d.toISOString())),
  
  endDate: z
    .string()
    .datetime('Invalid date format')
    .or(z.date().transform(d => d.toISOString()))
    .optional(),
  
  clientId: z
    .string()
    .min(1, 'Client is required')
    .optional(),
}).refine(
  (data) => {
    if (data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type CampaignFormData = z.infer<typeof campaignSchema>;

// ============================================================================
// Lead Validation Schemas
// ============================================================================

export const leadContactSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  linkedin: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional()
    .or(z.literal('')),
});

export const leadCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name too long'),
  
  industry: z
    .string()
    .min(1, 'Industry is required')
    .max(100, 'Industry name too long'),
  
  size: z
    .string()
    .min(1, 'Company size is required'),
  
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location too long'),
  
  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  
  revenue: z
    .string()
    .optional(),
});

export const leadSchema = z.object({
  campaignId: z
    .string()
    .min(1, 'Campaign is required'),
  
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .trim(),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .trim(),
  
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(200, 'Job title too long'),
  
  contact: leadContactSchema,
  company: leadCompanySchema,
  
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// ============================================================================
// Lead Qualification Schema
// ============================================================================

export const qualificationCriterionSchema = z.object({
  criterion: z.string().min(1, 'Criterion name is required'),
  met: z.boolean(),
  notes: z.string().optional(),
});

export const leadQualificationSchema = z.object({
  score: z
    .number()
    .int('Score must be a whole number')
    .min(1, 'Minimum score is 1')
    .max(5, 'Maximum score is 5'),
  
  priority: z
    .enum(['low', 'medium', 'high', 'urgent']),
  
  qualificationCriteria: z
    .array(qualificationCriterionSchema)
    .min(1, 'At least one criterion is required'),
  
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  
  rejectionReason: z
    .string()
    .max(500, 'Rejection reason too long')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.score <= 2 && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required for low scores (1-2)',
    path: ['rejectionReason'],
  }
);

export type LeadQualificationFormData = z.infer<typeof leadQualificationSchema>;

// ============================================================================
// Data Source Validation Schemas
// ============================================================================

export const scrapingConfigSchema = z.object({
  url: z
    .string()
    .url('Invalid URL')
    .min(1, 'URL is required'),
  
  selectors: z
    .object({
      name: z.string().optional(),
      title: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
  
  pagination: z
    .object({
      enabled: z.boolean(),
      selector: z.string().optional(),
      maxPages: z.number().int().min(1).max(100).optional(),
    })
    .optional(),
  
  authentication: z
    .object({
      type: z.enum(['none', 'basic', 'bearer', 'oauth']),
      credentials: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  
  rateLimit: z
    .object({
      requestsPerMinute: z.number().int().min(1).max(60).optional(),
      delayBetweenRequests: z.number().int().min(0).max(10000).optional(),
    })
    .optional(),
});

export const dataSourceSchema = z.object({
  name: z
    .string()
    .min(1, 'Data source name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  type: z
    .enum(['web_scraping', 'api', 'csv_import', 'database'])
    .refine((val) => val !== undefined, 'Data source type is required'),
  
  config: scrapingConfigSchema,
  
  frequency: z
    .enum(['manual', 'hourly', 'daily', 'weekly', 'monthly'])
    .default('manual'),
  
  active: z
    .boolean()
    .default(true),
});

export type DataSourceFormData = z.infer<typeof dataSourceSchema>;

// ============================================================================
// Scraping Job Schema
// ============================================================================

export const scrapingJobSchema = z.object({
  dataSourceId: z
    .string()
    .min(1, 'Data source is required'),
  
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  
  config: scrapingConfigSchema.partial().optional(),
  
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type ScrapingJobFormData = z.infer<typeof scrapingJobSchema>;

// ============================================================================
// User Validation Schema
// ============================================================================

export const userSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .trim(),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .trim(),
  
  role: z
    .enum(['super_admin', 'agency_admin', 'researcher', 'client']),
  
  agencyId: z
    .string()
    .optional(),
  
  clientId: z
    .string()
    .optional(),
}).refine(
  (data) => {
    if (data.role === 'client' && !data.clientId) {
      return false;
    }
    return true;
  },
  {
    message: 'Client ID is required for client role',
    path: ['clientId'],
  }
).refine(
  (data) => {
    if ((data.role === 'agency_admin' || data.role === 'researcher') && !data.agencyId) {
      return false;
    }
    return true;
  },
  {
    message: 'Agency ID is required for agency roles',
    path: ['agencyId'],
  }
);

export type UserFormData = z.infer<typeof userSchema>;

// ============================================================================
// Report Validation Schema
// ============================================================================

export const reportSchema = z.object({
  name: z
    .string()
    .min(1, 'Report name is required')
    .max(100, 'Report name too long')
    .trim(),
  
  type: z
    .enum(['campaign_summary', 'lead_analytics', 'source_performance', 'custom']),
  
  filters: z
    .object({
      campaignIds: z.array(z.string()).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
      status: z.array(z.string()).optional(),
    })
    .optional(),
  
  schedule: z
    .object({
      enabled: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      recipients: z.array(z.string().email()).optional(),
    })
    .optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;

// ============================================================================
// Common Validation Helpers
// ============================================================================

export const emailValidation = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const urlValidation = z
  .string()
  .url('Invalid URL')
  .min(1, 'URL is required');

export const phoneValidation = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
  .optional();

// Export all schemas for use in forms
export const validationSchemas = {
  campaign: campaignSchema,
  lead: leadSchema,
  leadQualification: leadQualificationSchema,
  dataSource: dataSourceSchema,
  scrapingJob: scrapingJobSchema,
  user: userSchema,
  report: reportSchema,
};
