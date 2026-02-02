/**
 * Data Sources List Endpoint
 * GET /data-sources
 * 
 * Returns paginated list of data sources with filtering and sorting
 */

import { handleRequest, successResponse, parsePaginationParams, applyPagination, getUserAgencyId } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    
    // Parse pagination params
    const paginationParams = parsePaginationParams(url);
    
    // Get filter params
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    // Get user's agency ID (RLS will handle permissions)
    const agencyId = await getUserAgencyId(supabase);
    
    // Build query
    let query = supabase
      .from('data_sources')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId);
    
    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply pagination
    query = applyPagination(query, paginationParams);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Calculate meta
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
