/**
 * Scraping Job Logs Endpoint
 * GET /jobs/:id/logs
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, parsePaginationParams, applyPagination, recordExists } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[pathParts.length - 2]; // .../jobs/:id/logs
    
    if (!jobId) {
      return errorResponse('Job ID required', 400);
    }
    
    const paginationParams = parsePaginationParams(url);
    const level = url.searchParams.get('level');
    
    const agencyId = await getUserAgencyId(supabase);
    
    // Check if job exists and belongs to user's agency
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .select('id')
      .eq('id', jobId)
      .eq('agency_id', agencyId)
      .single();
    
    if (jobError || !job) {
      return errorResponse('Job not found', 404);
    }
    
    let query = supabase
      .from('scraping_job_logs')
      .select('*', { count: 'exact' })
      .eq('job_id', jobId);
    
    if (level) {
      query = query.eq('level', level);
    }
    
    query = applyPagination(query, paginationParams);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    const total = count || 0;
    const totalPages = Math.ceil(total / (paginationParams.pageSize || 20));
    const hasMore = (paginationParams.page || 1) < totalPages;
    
    return successResponse(data, {
      total,
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
      hasMore,
    });
  });
});
