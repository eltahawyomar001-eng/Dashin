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
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
