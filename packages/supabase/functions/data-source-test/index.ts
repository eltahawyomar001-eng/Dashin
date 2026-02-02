/**
 * Data Source Test Connection Endpoint
 * POST /data-sources/:id/test
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, recordExists } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const dataSourceId = pathParts[pathParts.length - 2]; // .../data-sources/:id/test
    
    if (!dataSourceId) {
      return errorResponse('Data source ID required', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    
    const exists = await recordExists(supabase, 'data_sources', dataSourceId);
    if (!exists) {
      return errorResponse('Data source not found', 404);
    }
    
    // Get data source details (including credentials for testing)
    const { data: dataSource, error: fetchError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .eq('agency_id', agencyId)
      .single();
    
    if (fetchError || !dataSource) {
      return errorResponse('Data source not found', 404);
    }
    
    // Simulate connection test based on type
    // In production, this would actually test the connection to the external service
    let testResult = {
      success: false,
      message: '',
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Simulate different test scenarios based on type
      switch (dataSource.type) {
        case 'linkedin':
          // Check if credentials exist
          if (!dataSource.credentials || !dataSource.credentials.apiKey) {
            throw new Error('LinkedIn API key is required');
          }
          testResult = {
            success: true,
            message: 'Successfully connected to LinkedIn API',
            timestamp: new Date().toISOString(),
          };
          break;
          
        case 'apollo':
          if (!dataSource.credentials || !dataSource.credentials.apiKey) {
            throw new Error('Apollo API key is required');
          }
          testResult = {
            success: true,
            message: 'Successfully connected to Apollo.io API',
            timestamp: new Date().toISOString(),
          };
          break;
          
        case 'zoominfo':
          if (!dataSource.credentials || !dataSource.credentials.username || !dataSource.credentials.password) {
            throw new Error('ZoomInfo credentials are required');
          }
          testResult = {
            success: true,
            message: 'Successfully connected to ZoomInfo API',
            timestamp: new Date().toISOString(),
          };
          break;
          
        case 'api':
          if (!dataSource.config || !dataSource.config.url) {
            throw new Error('API URL is required in config');
          }
          testResult = {
            success: true,
            message: `Successfully connected to ${dataSource.config.url}`,
            timestamp: new Date().toISOString(),
          };
          break;
          
        case 'csv':
          testResult = {
            success: true,
            message: 'CSV data source configured correctly',
            timestamp: new Date().toISOString(),
          };
          break;
          
        default:
          testResult = {
            success: true,
            message: 'Data source configuration validated',
            timestamp: new Date().toISOString(),
          };
      }
    } catch (error: any) {
      testResult = {
        success: false,
        message: error.message || 'Connection test failed',
        timestamp: new Date().toISOString(),
      };
    }
    
    // Update data source with test results
    await supabase
      .from('data_sources')
      .update({
        last_test_at: testResult.timestamp,
        last_test_status: testResult.success ? 'success' : 'failed',
        last_test_error: testResult.success ? null : testResult.message,
        status: testResult.success ? 'active' : 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dataSourceId)
      .eq('agency_id', agencyId);
    
    return successResponse(testResult);
  });
});
