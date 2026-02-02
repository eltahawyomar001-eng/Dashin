/**
 * Lead Bulk Operations Endpoint
 * POST /leads/bulk-update
 * POST /leads/bulk-assign
 * DELETE /leads/bulk
 * 
 * Bulk operations on multiple leads
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, validateRequiredFields, getUserProfile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    // Only allow POST and DELETE
    if (req.method !== 'POST' && req.method !== 'DELETE') {
      throw new Error('Method not allowed');
    }
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const operation = pathParts[pathParts.length - 1]; // bulk-update, bulk-assign, or bulk
    
    const body = await req.json();
    
    // Validate required fields
    validateRequiredFields(body, ['leadIds']);
    
    if (!Array.isArray(body.leadIds) || body.leadIds.length === 0) {
      return errorResponse('leadIds must be a non-empty array', 400);
    }
    
    if (body.leadIds.length > 100) {
      return errorResponse('Cannot process more than 100 leads at once', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    
    // BULK UPDATE
    if (operation === 'bulk-update' && req.method === 'POST') {
      // Build update object
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (body.status !== undefined) updateData.status = body.status;
      if (body.priority !== undefined) updateData.priority = body.priority;
      if (body.campaignId !== undefined) updateData.campaign_id = body.campaignId;
      if (body.tags !== undefined) updateData.tags = body.tags;
      
      // Update multiple leads
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .in('id', body.leadIds)
        .eq('agency_id', agencyId)
        .select();
      
      if (error) {
        throw error;
      }
      
      return successResponse({
        updated: data?.length || 0,
        leads: data,
      });
    }
    
    // BULK ASSIGN
    if (operation === 'bulk-assign' && req.method === 'POST') {
      validateRequiredFields(body, ['assignedTo']);
      
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
      
      // Update multiple leads
      const { data, error } = await supabase
        .from('leads')
        .update({
          assigned_to: body.assignedTo,
          assigned_to_email: assignedUser.email,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
          updated_at: new Date().toISOString(),
        })
        .in('id', body.leadIds)
        .eq('agency_id', agencyId)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Create notification for assigned user
      const assignedCount = data?.length || 0;
      if (assignedCount > 0) {
        await supabase
          .from('notifications')
          .insert({
            user_id: body.assignedTo,
            agency_id: agencyId,
            type: 'lead_assigned',
            title: 'New Leads Assigned',
            message: `You have been assigned ${assignedCount} new lead${assignedCount > 1 ? 's' : ''}`,
            related_entity_type: 'lead',
            action_url: `/dashboard/leads?assignedTo=${body.assignedTo}`,
            action_label: 'View Leads',
          });
      }
      
      return successResponse({
        assigned: assignedCount,
        leads: data,
      });
    }
    
    // BULK DELETE
    if (operation === 'bulk' && req.method === 'DELETE') {
      // Delete multiple leads
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', body.leadIds)
        .eq('agency_id', agencyId);
      
      if (error) {
        throw error;
      }
      
      return successResponse({
        deleted: body.leadIds.length,
        message: `Successfully deleted ${body.leadIds.length} lead${body.leadIds.length > 1 ? 's' : ''}`,
      });
    }
    
    return errorResponse('Invalid operation', 400);
  });
});
