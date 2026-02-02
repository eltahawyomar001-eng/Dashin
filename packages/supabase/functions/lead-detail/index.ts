/**
 * Lead Detail Endpoint
 * GET /leads/:id
 * PUT /leads/:id
 * DELETE /leads/:id
 * 
 * Manage individual lead records
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists, validateRequiredFields } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.length - 1];
    
    if (!leadId) {
      return errorResponse('Lead ID required', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    
    // GET - Fetch lead detail
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('lead_details')
        .select('*')
        .eq('id', leadId)
        .eq('agency_id', agencyId)
        .single();
      
      if (error || !data) {
        return errorResponse('Lead not found', 404);
      }
      
      return successResponse(data);
    }
    
    // PUT - Update lead
    if (req.method === 'PUT') {
      const body = await req.json();
      
      // Check if lead exists
      const exists = await recordExists(supabase, 'leads', leadId);
      if (!exists) {
        return errorResponse('Lead not found', 404);
      }
      
      // Build update object
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Map frontend field names to database field names
      if (body.firstName !== undefined) updateData.first_name = body.firstName;
      if (body.lastName !== undefined) updateData.last_name = body.lastName;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.company !== undefined) updateData.company = body.company;
      if (body.title !== undefined) updateData.title = body.title;
      if (body.industry !== undefined) updateData.industry = body.industry;
      if (body.linkedinUrl !== undefined) updateData.linkedin_url = body.linkedinUrl;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.campaignId !== undefined) updateData.campaign_id = body.campaignId;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.tags !== undefined) updateData.tags = body.tags;
      
      // JSONB fields
      if (body.contact !== undefined) updateData.contact = body.contact;
      if (body.companyData !== undefined) updateData.company_data = body.companyData;
      if (body.sourceData !== undefined) updateData.source_data = body.sourceData;
      if (body.customFields !== undefined) updateData.custom_fields = body.customFields;
      
      // Update lead
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .eq('agency_id', agencyId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return successResponse(data);
    }
    
    // DELETE - Delete lead
    if (req.method === 'DELETE') {
      // Check if lead exists
      const exists = await recordExists(supabase, 'leads', leadId);
      if (!exists) {
        return errorResponse('Lead not found', 404);
      }
      
      // Delete lead (RLS will handle permissions)
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('agency_id', agencyId);
      
      if (error) {
        throw error;
      }
      
      return successResponse({ message: 'Lead deleted successfully' });
    }
    
    return errorResponse('Method not allowed', 405);
  });
});
