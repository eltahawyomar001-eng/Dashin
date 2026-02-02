/**
 * Create Scraping Job Endpoint
 * POST /jobs/create
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, validateRequiredFields, getUserProfile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }
    
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    const body = await req.json();
    
    // Validate required fields
    const validationError = validateRequiredFields(body, ['data_source_id', 'search_criteria']);
    if (validationError) {
      return errorResponse(validationError, 400);
    }
    
    const {
      data_source_id,
      campaign_id,
      search_criteria,
      config = {},
    } = body;
    
    // Verify data source exists and belongs to agency
    const { data: dataSource, error: sourceError } = await supabase
      .from('data_sources')
      .select('id, status')
      .eq('id', data_source_id)
      .eq('agency_id', agencyId)
      .single();
    
    if (sourceError || !dataSource) {
      return errorResponse('Data source not found', 404);
    }
    
    if (dataSource.status !== 'active') {
      return errorResponse('Data source is not active', 400);
    }
    
    // Verify campaign if provided
    if (campaign_id) {
      const { error: campaignError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('id', campaign_id)
        .eq('agency_id', agencyId)
        .single();
      
      if (campaignError) {
        return errorResponse('Campaign not found', 404);
      }
    }
    
    // Create the job
    const { data: job, error: createError } = await supabase
      .from('scraping_jobs')
      .insert({
        agency_id: agencyId,
        data_source_id,
        campaign_id: campaign_id || null,
        status: 'pending',
        progress: 0,
        records_processed: 0,
        records_qualified: 0,
        records_rejected: 0,
        search_criteria,
        config,
        error_count: 0,
        created_by: profile.id,
      })
      .select()
      .single();
    
    if (createError) {
      throw createError;
    }
    
    // Create initial log entry
    await supabase
      .from('scraping_job_logs')
      .insert({
        job_id: job.id,
        level: 'info',
        message: `Job created by ${profile.email}`,
        details: {
          data_source_id,
          campaign_id,
          search_criteria,
        },
      });
    
    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        agency_id: agencyId,
        type: 'info',
        title: 'Scraping Job Created',
        message: 'Your scraping job has been created and is ready to start.',
        related_entity_type: 'job',
        related_entity_id: job.id,
        action_url: `/dashboard/sources/jobs/${job.id}`,
        action_label: 'View Job',
      });
    
    return successResponse({
      job,
      message: 'Job created successfully',
    });
  });
});
