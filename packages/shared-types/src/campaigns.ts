// Campaign & Lead Management Types

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type LeadStatus = 'new' | 'qualified' | 'rejected' | 'assigned' | 'contacted' | 'converted';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type QualificationScore = 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = excellent

// Campaign entity
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  targetCompanies: number;
  targetLeads: number;
  qualifiedLeads: number;
  assignedLeads: number;
  rejectedLeads: number;
  startDate: string;
  endDate?: string;
  agencyId?: string;
  clientId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Lead source information
export interface LeadSource {
  type: 'manual' | 'scraping' | 'import' | 'api';
  dataSourceId?: string;
  dataSourceName?: string;
  scrapingJobId?: string;
  importBatchId?: string;
}

// Lead contact information
export interface LeadContact {
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

// Lead company information
export interface LeadCompany {
  name: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  revenue?: string;
}

// Lead qualification criteria
export interface QualificationCriteria {
  companySize?: 'match' | 'too_small' | 'too_large';
  industry?: 'match' | 'mismatch';
  location?: 'match' | 'mismatch';
  budget?: 'sufficient' | 'insufficient' | 'unknown';
  authority?: 'decision_maker' | 'influencer' | 'gatekeeper' | 'unknown';
  need?: 'immediate' | 'future' | 'none';
  timing?: 'now' | 'quarter' | 'year' | 'unknown';
}

// Lead qualification result
export interface LeadQualification {
  score: QualificationScore;
  criteria: QualificationCriteria;
  notes?: string;
  rejectionReason?: string;
  qualifiedBy: string;
  qualifiedAt: string;
}

// Lead entity
export interface Lead {
  id: string;
  campaignId: string;
  campaignName: string;
  status: LeadStatus;
  priority: LeadPriority;
  
  // Contact details
  firstName: string;
  lastName: string;
  title?: string;
  contact: LeadContact;
  company: LeadCompany;
  
  // Source tracking
  source: LeadSource;
  
  // Qualification
  qualification?: LeadQualification;
  
  // Assignment
  assignedTo?: string;
  assignedToEmail?: string;
  assignedAt?: string;
  
  // Metadata
  tags?: string[];
  customFields?: Record<string, any>;
  
  // Timestamps
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Campaign creation payload
export interface CreateCampaignPayload {
  name: string;
  description?: string;
  targetCompanies: number;
  targetLeads: number;
  startDate: string;
  endDate?: string;
  clientId?: string;
  agencyId?: string;
}

// Campaign update payload
export interface UpdateCampaignPayload {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  targetCompanies?: number;
  targetLeads?: number;
  endDate?: string;
}

// Lead creation payload
export interface CreateLeadPayload {
  campaignId: string;
  firstName: string;
  lastName: string;
  title?: string;
  contact: LeadContact;
  company: LeadCompany;
  source: LeadSource;
  priority?: LeadPriority;
  tags?: string[];
}

// Lead update payload
export interface UpdateLeadPayload {
  status?: LeadStatus;
  priority?: LeadPriority;
  contact?: Partial<LeadContact>;
  company?: Partial<LeadCompany>;
  tags?: string[];
  customFields?: Record<string, any>;
}

// Bulk lead qualification payload
export interface BulkQualifyLeadsPayload {
  leadIds: string[];
  action: 'approve' | 'reject';
  score?: QualificationScore;
  notes?: string;
  rejectionReason?: string;
}

// Lead assignment payload
export interface AssignLeadsPayload {
  leadIds: string[];
  assignedTo: string;
  assignedToEmail: string;
  notifyAssignee?: boolean;
}

// Campaign statistics
export interface CampaignStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  rejectedLeads: number;
  assignedLeads: number;
  contactedLeads: number;
  convertedLeads: number;
  qualificationRate: number; // percentage
  conversionRate: number; // percentage
  averageScore?: number;
}

// Lead filters
export interface LeadFilters {
  campaignId?: string;
  status?: LeadStatus[];
  priority?: LeadPriority[];
  assignedTo?: string;
  qualificationScore?: QualificationScore[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
