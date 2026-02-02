// Core types for Dashin Research platform

// Export scraping types
export * from './scraping';

// Export campaign types
export * from './campaigns';

// Export analytics types
export * from './analytics';

// User Roles
export type UserRole = 'super_admin' | 'agency_admin' | 'researcher' | 'client';

// Base User
export interface User {
  id: string;
  email: string;
  role: UserRole;
  agencyId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Agency
export interface Agency {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// Client
export interface Client {
  id: string;
  name: string;
  agencyId: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Scrape Session
export interface ScrapeSession {
  id: string;
  agencyId: string;
  campaignId: string | null;
  researcherId: string;
  source: 'web' | 'mobile';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  targetUrl: string;
  rawFileUrl: string | null;
  totalRecords: number;
  createdAt: string;
  completedAt: string | null;
}

// Cleanroom Job
export interface CleanroomJob {
  id: string;
  agencyId: string;
  scrapeSessionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  includeKeywords: string[];
  excludeKeywords: string[];
  targetIndustries: string[];
  qualifiedCount: number;
  enrichmentCount: number;
  trashCount: number;
  createdAt: string;
  completedAt: string | null;
}

// Researcher Score
export interface ResearcherScore {
  id: string;
  researcherId: string;
  agencyId: string;
  period: string; // ISO week format: 2026-W05
  accuracyScore: number; // 0-100
  bounceRate: number; // percentage
  rejectionRate: number; // percentage
  criticalFailures: number;
  totalLeads: number;
  personalEmailViolations: number;
  titleMismatches: number;
  createdAt: string;
}

// Time Log
export interface TimeLog {
  id: string;
  researcherId: string;
  agencyId: string;
  campaignId: string | null;
  hours: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

// Cost Snapshot
export interface CostSnapshot {
  id: string;
  agencyId: string;
  campaignId: string | null;
  period: string; // ISO week format
  totalHours: number;
  totalLeads: number;
  costPerLead: number;
  costPerHour: number;
  totalCost: number;
  reusedLeads: number;
  reuseSavings: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type WithId<T> = T & {
  id: string;
};
