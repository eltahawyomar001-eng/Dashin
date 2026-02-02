/**
 * Lead Create Endpoint
 * POST /leads/create
 * 
 * Create a new lead
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
    validateRequiredFields(body, ['firstName', 'lastName', 'campaignId']);
    
    // Get user's agency ID and profile
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    
    // Build lead data
    const leadData: any = {
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      phone: body.phone,
      company: body.company,
      title: body.title,
      industry: body.industry,
      linkedin_url: body.linkedinUrl,
      campaign_id: body.campaignId,
      status: body.status || 'new',
      priority: body.priority || 'medium',
      agency_id: agencyId,
      researcher_id: profile.id,
      notes: body.notes,
      tags: body.tags || [],
    };
    
    // JSONB fields
    if (body.contact) {
      leadData.contact = body.contact;
    }
    if (body.companyData) {
      leadData.company_data = body.companyData;
    }
    if (body.sourceData) {
      leadData.source_data = body.sourceData;
    }
    if (body.customFields) {
      leadData.custom_fields = body.customFields;
    }
    
    // Create lead
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return successResponse(data, undefined, 201);
  });
});
