/**
 * Lead Qualify Endpoint
 * POST /leads/:id/qualify
 * 
 * Qualify a lead with scoring and criteria
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists, validateRequiredFields, getUserProfile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.length - 2]; // .../leads/:id/qualify
    
    if (!leadId) {
      return errorResponse('Lead ID required', 400);
    }
    
    const body = await req.json();
    
    // Validate required fields
    validateRequiredFields(body, ['score']);
    
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    
    // Check if lead exists
    const exists = await recordExists(supabase, 'leads', leadId);
    if (!exists) {
      return errorResponse('Lead not found', 404);
    }
    
    // Build qualification data
    const qualificationData = {
      score: body.score,
      criteria: body.criteria || {},
      notes: body.notes,
      rejectionReason: body.rejectionReason,
      qualifiedBy: profile.id,
      qualifiedAt: new Date().toISOString(),
    };
    
    // Determine new status based on score and rejection reason
    let newStatus = 'qualified';
    if (body.rejectionReason) {
      newStatus = 'rejected';
    } else if (body.score <= 2) {
      newStatus = 'rejected';
    }
    
    // Update lead with qualification data
    const { data, error } = await supabase
      .from('leads')
      .update({
        qualification_data: qualificationData,
        status: newStatus,
        ...(newStatus === 'rejected' && { 
          rejected_by: profile.id,
          rejection_reason: body.rejectionReason 
        }),
        ...(newStatus === 'qualified' && { 
          approved_by: profile.id 
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('agency_id', agencyId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return successResponse(data);
  });
});
