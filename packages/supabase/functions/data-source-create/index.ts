/**
 * Data Source Create Endpoint
 * POST /data-sources/create
 */

import { handleRequest, successResponse, getUserAgencyId, validateRequiredFields, getUserProfile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }
    
    const body = await req.json();
    
    validateRequiredFields(body, ['name', 'type']);
    
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    
    const { data, error } = await supabase
      .from('data_sources')
      .insert({
        name: body.name,
        description: body.description,
        type: body.type,
        status: body.status || 'inactive',
        config: body.config || {},
        credentials: body.credentials || {},
        agency_id: agencyId,
        created_by: profile.id,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Don't expose credentials in response
    const { credentials, ...safeData } = data;
    
    return successResponse(safeData, undefined, 201);
  });
});
