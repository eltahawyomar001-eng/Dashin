/**
 * Lead List Endpoint
 * GET /leads
 * 
 * Returns paginated list of leads with filtering and sorting
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
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const campaignId = url.searchParams.get('campaignId');
    const assignedTo = url.searchParams.get('assignedTo');
    const search = url.searchParams.get('search');
    
    // Get user's agency ID (RLS will handle permissions)
    const agencyId = await getUserAgencyId(supabase);
    
    // Build query using lead_details view for full information
    let query = supabase
      .from('lead_details')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId);
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
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
