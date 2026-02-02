/**
 * Data Source Detail/Update/Delete Endpoint
 * GET /data-sources/:id
 * PUT /data-sources/:id
 * DELETE /data-sources/:id
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const dataSourceId = pathParts[pathParts.length - 1];
    
    if (!dataSourceId) {
      return errorResponse('Data source ID required', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    
    // GET - Fetch data source detail
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('id', dataSourceId)
        .eq('agency_id', agencyId)
        .single();
      
      if (error || !data) {
        return errorResponse('Data source not found', 404);
      }
      
      // Don't expose credentials in response
      const { credentials, ...safeData } = data;
      
      return successResponse(safeData);
    }
    
    // PUT - Update data source
    if (req.method === 'PUT') {
      const body = await req.json();
      
      const exists = await recordExists(supabase, 'data_sources', dataSourceId);
      if (!exists) {
        return errorResponse('Data source not found', 404);
      }
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.config !== undefined) updateData.config = body.config;
      if (body.credentials !== undefined) updateData.credentials = body.credentials;
      
      const { data, error } = await supabase
        .from('data_sources')
        .update(updateData)
        .eq('id', dataSourceId)
        .eq('agency_id', agencyId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Don't expose credentials in response
      const { credentials, ...safeData } = data;
      
      return successResponse(safeData);
    }
    
    // DELETE - Delete data source
    if (req.method === 'DELETE') {
      const exists = await recordExists(supabase, 'data_sources', dataSourceId);
      if (!exists) {
        return errorResponse('Data source not found', 404);
      }
      
      const { error } = await supabase
        .from('data_sources')
        .delete()
        .eq('id', dataSourceId)
        .eq('agency_id', agencyId);
      
      if (error) {
        throw error;
      }
      
      return successResponse({ message: 'Data source deleted successfully' });
    }
    
    return errorResponse('Method not allowed', 405);
  });
});
