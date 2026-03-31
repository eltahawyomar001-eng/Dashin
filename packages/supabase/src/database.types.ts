// Generated Supabase types
// This file will be generated using: supabase gen types typescript --local > database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'super_admin' | 'agency_admin' | 'researcher' | 'client';
          agency_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'super_admin' | 'agency_admin' | 'researcher' | 'client';
          agency_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'super_admin' | 'agency_admin' | 'researcher' | 'client';
          agency_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agencies: {
        Row: {
          id: string;
          name: string;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: 'active' | 'inactive' | 'suspended';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          agency_id: string;
          client_id: string;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          agency_id: string;
          client_id: string;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          agency_id?: string;
          client_id?: string;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          name: string;
          agency_id: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          agency_id: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          agency_id?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          agency_id: string;
          campaign_id: string | null;
          status: 'raw' | 'qualified' | 'enriched' | 'approved' | 'rejected' | 'invalid' | 'bounced';
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          company: string | null;
          title: string | null;
          industry: string | null;
          linkedin_url: string | null;
          source: string | null;
          researcher_id: string | null;
          approved_by: string | null;
          rejected_by: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          campaign_id?: string | null;
          status?: 'raw' | 'qualified' | 'enriched' | 'approved' | 'rejected' | 'invalid' | 'bounced';
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          title?: string | null;
          industry?: string | null;
          linkedin_url?: string | null;
          source?: string | null;
          researcher_id?: string | null;
          approved_by?: string | null;
          rejected_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          campaign_id?: string | null;
          status?: 'raw' | 'qualified' | 'enriched' | 'approved' | 'rejected' | 'invalid' | 'bounced';
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          title?: string | null;
          industry?: string | null;
          linkedin_url?: string | null;
          source?: string | null;
          researcher_id?: string | null;
          approved_by?: string | null;
          rejected_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      data_sources: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'website' | 'api' | 'social_media' | 'database' | 'file' | 'linkedin' | 'apollo' | 'zoominfo' | 'csv';
          status: 'active' | 'inactive' | 'error' | 'pending';
          config: Json;
          credentials: Json;
          frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
          last_scraped_at: string | null;
          next_scheduled_at: string | null;
          total_records: number;
          error_count: number;
          agency_id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'website' | 'api' | 'social_media' | 'database' | 'file' | 'linkedin' | 'apollo' | 'zoominfo' | 'csv';
          status?: 'active' | 'inactive' | 'error' | 'pending';
          config?: Json;
          credentials?: Json;
          frequency?: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
          last_scraped_at?: string | null;
          next_scheduled_at?: string | null;
          total_records?: number;
          error_count?: number;
          agency_id: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: 'website' | 'api' | 'social_media' | 'database' | 'file' | 'linkedin' | 'apollo' | 'zoominfo' | 'csv';
          status?: 'active' | 'inactive' | 'error' | 'pending';
          config?: Json;
          credentials?: Json;
          frequency?: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
          last_scraped_at?: string | null;
          next_scheduled_at?: string | null;
          total_records?: number;
          error_count?: number;
          agency_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scraping_jobs: {
        Row: {
          id: string;
          agency_id: string;
          data_source_id: string;
          campaign_id: string | null;
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
          progress: number;
          records_processed: number;
          records_qualified: number;
          records_rejected: number;
          search_criteria: Json;
          config: Json;
          error_count: number;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          duration_seconds: number | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          data_source_id: string;
          campaign_id?: string | null;
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
          progress?: number;
          records_processed?: number;
          records_qualified?: number;
          records_rejected?: number;
          search_criteria?: Json;
          config?: Json;
          error_count?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration_seconds?: number | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          data_source_id?: string;
          campaign_id?: string | null;
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
          progress?: number;
          records_processed?: number;
          records_qualified?: number;
          records_rejected?: number;
          search_criteria?: Json;
          config?: Json;
          error_count?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration_seconds?: number | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scraping_job_logs: {
        Row: {
          id: string;
          job_id: string;
          level: 'info' | 'warning' | 'error';
          message: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          level?: 'info' | 'warning' | 'error';
          message: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          level?: 'info' | 'warning' | 'error';
          message?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
