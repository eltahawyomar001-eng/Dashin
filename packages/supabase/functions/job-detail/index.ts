/**
 * Scraping Job Detail Endpoint
 * GET /jobs/:id
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[pathParts.length - 1];
    
    if (!jobId) {
      return errorResponse('Job ID required', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('agency_id', agencyId)
      .single();
    
    if (error || !data) {
      return errorResponse('Job not found', 404);
    }
    
    return successResponse(data);
  });
});
