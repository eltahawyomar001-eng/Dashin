/**
 * Scraping Job Control Endpoint
 * POST /jobs/:id/start
 * POST /jobs/:id/pause
 * POST /jobs/:id/resume
 * POST /jobs/:id/cancel
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId, getUserProfile } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1]; // start, pause, resume, cancel
    const jobId = pathParts[pathParts.length - 2];
    
    if (!jobId) {
      return errorResponse('Job ID required', 400);
    }
    
    if (!['start', 'pause', 'resume', 'cancel'].includes(action)) {
      return errorResponse('Invalid action', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    const profile = await getUserProfile(supabase);
    
    // Get current job status
    const { data: job, error: fetchError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('agency_id', agencyId)
      .single();
    
    if (fetchError || !job) {
      return errorResponse('Job not found', 404);
    }
    
    let updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    let logMessage = '';
    let logLevel = 'info';
    
    // Handle different actions
    switch (action) {
      case 'start':
        if (job.status !== 'pending') {
          return errorResponse(`Cannot start job with status: ${job.status}`, 400);
        }
        updateData.status = 'running';
        updateData.started_at = new Date().toISOString();
        logMessage = `Job started by ${profile.email}`;
        break;
        
      case 'pause':
        if (job.status !== 'running') {
          return errorResponse(`Cannot pause job with status: ${job.status}`, 400);
        }
        updateData.status = 'paused';
        logMessage = `Job paused by ${profile.email}`;
        logLevel = 'warning';
        break;
        
      case 'resume':
        if (job.status !== 'paused') {
          return errorResponse(`Cannot resume job with status: ${job.status}`, 400);
        }
        updateData.status = 'running';
        logMessage = `Job resumed by ${profile.email}`;
        break;
        
      case 'cancel':
        if (!['pending', 'running', 'paused'].includes(job.status)) {
          return errorResponse(`Cannot cancel job with status: ${job.status}`, 400);
        }
        updateData.status = 'cancelled';
        updateData.completed_at = new Date().toISOString();
        if (job.started_at) {
          const duration = Math.floor(
            (new Date().getTime() - new Date(job.started_at).getTime()) / 1000
          );
          updateData.duration_seconds = duration;
        }
        logMessage = `Job cancelled by ${profile.email}`;
        logLevel = 'warning';
        break;
    }
    
    // Update job
    const { data: updatedJob, error: updateError } = await supabase
      .from('scraping_jobs')
      .update(updateData)
      .eq('id', jobId)
      .eq('agency_id', agencyId)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // Add log entry
    await supabase
      .from('scraping_job_logs')
      .insert({
        job_id: jobId,
        level: logLevel,
        message: logMessage,
        details: {
          action,
          previous_status: job.status,
          new_status: updateData.status,
          user_id: profile.id,
        },
      });
    
    // Create notification for job owner
    if (job.created_by && job.created_by !== profile.id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: job.created_by,
          agency_id: agencyId,
          type: 'info',
          title: 'Job Status Changed',
          message: logMessage,
          related_entity_type: 'job',
          related_entity_id: jobId,
          action_url: `/dashboard/sources/jobs/${jobId}`,
          action_label: 'View Job',
        });
    }
    
    return successResponse({
      job: updatedJob,
      message: logMessage,
    });
  });
});
