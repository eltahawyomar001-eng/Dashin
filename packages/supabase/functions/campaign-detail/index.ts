/**
 * Campaign Detail Endpoint
 * GET /campaigns/:id
 * PUT /campaigns/:id
 * DELETE /campaigns/:id
 * 
 * Manage individual campaign records
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists, validateRequiredFields } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const campaignId = pathParts[pathParts.length - 1];
    
    if (!campaignId) {
      return errorResponse('Campaign ID required', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    
    // GET - Fetch campaign detail
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('campaign_summary')
        .select('*')
        .eq('id', campaignId)
        .eq('agency_id', agencyId)
        .single();
      
      if (error || !data) {
        return errorResponse('Campaign not found', 404);
      }
      
      return successResponse(data);
    }
    
    // PUT - Update campaign
    if (req.method === 'PUT') {
      const body = await req.json();
      
      // Check if campaign exists
      const exists = await recordExists(supabase, 'campaigns', campaignId);
      if (!exists) {
        return errorResponse('Campaign not found', 404);
      }
      
      // Update campaign
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          name: body.name,
          description: body.description,
          status: body.status,
          target_companies: body.targetCompanies,
          target_leads: body.targetLeads,
          start_date: body.startDate,
          end_date: body.endDate,
          client_id: body.clientId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('agency_id', agencyId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data);
    }
    
    // DELETE - Delete campaign
    if (req.method === 'DELETE') {
      // Check if campaign exists
      const exists = await recordExists(supabase, 'campaigns', campaignId);
      if (!exists) {
        return errorResponse('Campaign not found', 404);
      }
      
      // Delete campaign (RLS will handle permissions)
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('agency_id', agencyId);
      
      if (error) {
        throw error;
      }
      
      return successResponse({ message: 'Campaign deleted successfully' });
    }
    
    return errorResponse('Method not allowed', 405);
  });
});
