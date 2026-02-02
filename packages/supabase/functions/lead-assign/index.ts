/**
 * Lead Assign Endpoint
 * POST /leads/:id/assign
 * 
 * Assign a lead to a user
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists, validateRequiredFields } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const leadId = pathParts[pathParts.length - 2]; // .../leads/:id/assign
    
    if (!leadId) {
      return errorResponse('Lead ID required', 400);
    }
    
    const body = await req.json();
    
    // Validate required fields
    validateRequiredFields(body, ['assignedTo']);
    
    const agencyId = await getUserAgencyId(supabase);
    
    // Check if lead exists
    const exists = await recordExists(supabase, 'leads', leadId);
    if (!exists) {
      return errorResponse('Lead not found', 404);
    }
    
    // Get assigned user's email
    const { data: assignedUser, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', body.assignedTo)
      .eq('agency_id', agencyId)
      .single();
    
    if (userError || !assignedUser) {
      return errorResponse('Assigned user not found in your agency', 404);
    }
    
    // Update lead with assignment
    const { data, error } = await supabase
      .from('leads')
      .update({
        assigned_to: body.assignedTo,
        assigned_to_email: assignedUser.email,
        assigned_at: new Date().toISOString(),
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('agency_id', agencyId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Create notification for assigned user
    await supabase
      .from('notifications')
      .insert({
        user_id: body.assignedTo,
        agency_id: agencyId,
        type: 'lead_assigned',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${data.first_name} ${data.last_name}`,
        related_entity_type: 'lead',
        related_entity_id: leadId,
        action_url: `/dashboard/leads/${leadId}`,
        action_label: 'View Lead',
      });
    
    return successResponse(data);
  });
});
