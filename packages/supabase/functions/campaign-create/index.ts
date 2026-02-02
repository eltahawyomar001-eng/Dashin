/**
 * Campaign Create Endpoint
 * POST /campaigns/create
 * 
 * Create a new campaign
 */

import { handleRequest, successResponse, getUserAgencyId, validateRequiredFields, getUserProfile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }
    
    const body = await req.json();
    
    // Validate required fields
    validateRequiredFields(body, ['name', 'clientId']);
    
    // Get user's agency ID and profile
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    
    // Create campaign
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        description: body.description,
        status: body.status || 'draft',
        target_companies: body.targetCompanies || 0,
        target_leads: body.targetLeads || 0,
        start_date: body.startDate,
        end_date: body.endDate,
        agency_id: agencyId,
        client_id: body.clientId,
        created_by: profile.id,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return successResponse(data, undefined, 201);
  });
});
