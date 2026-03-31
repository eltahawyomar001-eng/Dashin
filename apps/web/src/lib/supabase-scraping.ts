/**
 * Supabase Scraping Service
 *
 * Direct Supabase client calls for data sources and scraping jobs.
 * This replaces the broken REST API approach — the edge functions exist
 * but there were no Next.js API routes to proxy to them.
 */

import { getSupabaseBrowserClient } from '@dashin/supabase';
import type { Database } from '@dashin/supabase';

type DataSourceRow = Database['public']['Tables']['data_sources']['Row'];
type DataSourceInsert = Database['public']['Tables']['data_sources']['Insert'];
type DataSourceUpdate = Database['public']['Tables']['data_sources']['Update'];

type ScrapingJobRow = Database['public']['Tables']['scraping_jobs']['Row'];
type ScrapingJobInsert = Database['public']['Tables']['scraping_jobs']['Insert'];
type ScrapingJobUpdate = Database['public']['Tables']['scraping_jobs']['Update'];

// ============================================================================
// DATA SOURCES
// ============================================================================

export interface DataSourceFilters {
  type?: DataSourceRow['type'];
  status?: DataSourceRow['status'];
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchDataSources(filters: DataSourceFilters = {}) {
  const supabase = getSupabaseBrowserClient();
  const { page = 1, pageSize = 20, type, status, search } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('data_sources')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

export async function fetchDataSource(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDataSource(payload: DataSourceInsert): Promise<DataSourceRow> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('data_sources')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDataSource(id: string, payload: DataSourceUpdate): Promise<DataSourceRow> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('data_sources')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDataSource(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from('data_sources').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleDataSourceStatus(id: string, currentStatus: DataSourceRow['status']) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  return updateDataSource(id, { status: newStatus });
}

// ============================================================================
// SCRAPING JOBS
// ============================================================================

export interface ScrapingJobFilters {
  dataSourceId?: string;
  status?: ScrapingJobRow['status'];
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchScrapingJobs(filters: ScrapingJobFilters = {}) {
  const supabase = getSupabaseBrowserClient();
  const { page = 1, pageSize = 20, dataSourceId, status } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('scraping_jobs')
    .select('*, data_sources(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (dataSourceId) query = query.eq('data_source_id', dataSourceId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

export async function fetchScrapingJob(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('scraping_jobs')
    .select('*, data_sources(name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createScrapingJob(payload: ScrapingJobInsert) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('scraping_jobs')
    .insert(payload)
    .select('*, data_sources(name)')
    .single();

  if (error) throw error;

  // Create initial log entry
  await supabase.from('scraping_job_logs').insert({
    job_id: data.id,
    level: 'info',
    message: 'Job created',
    details: { search_criteria: payload.search_criteria },
  });

  return data;
}

export async function controlScrapingJob(
  id: string,
  action: 'start' | 'pause' | 'resume' | 'cancel'
) {
  const supabase = getSupabaseBrowserClient();

  // Fetch current job to validate state transition
  const { data: job, error: fetchError } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !job) throw fetchError ?? new Error('Job not found');

  const updates: ScrapingJobUpdate = { updated_at: new Date().toISOString() };
  let logMessage = '';

  switch (action) {
    case 'start':
      if (job.status !== 'pending') throw new Error(`Cannot start job with status: ${job.status}`);
      updates.status = 'running';
      updates.started_at = new Date().toISOString();
      logMessage = 'Job started';
      break;
    case 'pause':
      if (job.status !== 'running') throw new Error(`Cannot pause job with status: ${job.status}`);
      updates.status = 'paused';
      logMessage = 'Job paused';
      break;
    case 'resume':
      if (job.status !== 'paused') throw new Error(`Cannot resume job with status: ${job.status}`);
      updates.status = 'running';
      logMessage = 'Job resumed';
      break;
    case 'cancel':
      if (!['pending', 'running', 'paused'].includes(job.status))
        throw new Error(`Cannot cancel job with status: ${job.status}`);
      updates.status = 'cancelled';
      updates.completed_at = new Date().toISOString();
      logMessage = 'Job cancelled';
      break;
  }

  const { data: updated, error: updateError } = await supabase
    .from('scraping_jobs')
    .update(updates)
    .eq('id', id)
    .select('*, data_sources(name)')
    .single();

  if (updateError) throw updateError;

  // Log the action
  await supabase.from('scraping_job_logs').insert({
    job_id: id,
    level: action === 'cancel' ? 'warning' : 'info',
    message: logMessage,
    details: { action, previous_status: job.status, new_status: updates.status },
  });

  return updated;
}

export async function retryScrapingJob(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { data: job, error: fetchError } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !job) throw fetchError ?? new Error('Job not found');
  if (job.status !== 'failed') throw new Error('Can only retry failed jobs');

  const { data: updated, error } = await supabase
    .from('scraping_jobs')
    .update({
      status: 'pending',
      progress: 0,
      error_message: null,
      error_count: 0,
      started_at: null,
      completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, data_sources(name)')
    .single();

  if (error) throw error;

  await supabase.from('scraping_job_logs').insert({
    job_id: id,
    level: 'info',
    message: 'Job queued for retry',
    details: { retry_count: (job.error_count ?? 0) + 1 },
  });

  return updated;
}

export async function deleteScrapingJob(id: string) {
  const supabase = getSupabaseBrowserClient();
  // Delete logs first (FK constraint)
  await supabase.from('scraping_job_logs').delete().eq('job_id', id);
  const { error } = await supabase.from('scraping_jobs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// JOB LOGS
// ============================================================================

export async function fetchJobLogs(jobId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('scraping_job_logs')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ============================================================================
// STATS HELPERS
// ============================================================================

export async function fetchScrapingStats() {
  const supabase = getSupabaseBrowserClient();

  const [sourcesResult, jobsResult] = await Promise.all([
    supabase.from('data_sources').select('status', { count: 'exact' }),
    supabase.from('scraping_jobs').select('status, records_processed', { count: 'exact' }),
  ]);

  const sources = sourcesResult.data ?? [];
  const jobs = jobsResult.data ?? [];

  return {
    totalSources: sources.length,
    activeSources: sources.filter((s: any) => s.status === 'active').length,
    totalJobs: jobs.length,
    runningJobs: jobs.filter((j: any) => j.status === 'running').length,
    completedJobs: jobs.filter((j: any) => j.status === 'completed').length,
    failedJobs: jobs.filter((j: any) => j.status === 'failed').length,
    totalRecords: jobs.reduce((sum: number, j: any) => sum + (j.records_processed ?? 0), 0),
  };
}
