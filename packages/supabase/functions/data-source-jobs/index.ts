/**
 * Scraping Jobs List for Data Source Endpoint
 * GET /data-sources/:id/jobs
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, parsePaginationParams, applyPagination, recordExists } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const dataSourceId = pathParts[pathParts.length - 2]; // .../data-sources/:id/jobs
    
    if (!dataSourceId) {
      return errorResponse('Data source ID required', 400);
    }
    
    const paginationParams = parsePaginationParams(url);
    const status = url.searchParams.get('status');
    
    const agencyId = await getUserAgencyId(supabase);
    
    const exists = await recordExists(supabase, 'data_sources', dataSourceId);
    if (!exists) {
      return errorResponse('Data source not found', 404);
    }
    
    let query = supabase
      .from('scraping_jobs')
      .select('*', { count: 'exact' })
      .eq('data_source_id', dataSourceId)
      .eq('agency_id', agencyId);
    
    if (status) {
      query = query.eq('status', status);
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
