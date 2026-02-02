/**
 * Campaign Analytics Endpoint
 * GET /campaigns/:id/analytics
 * 
 * Returns analytics data for a specific campaign
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const campaignId = pathParts[pathParts.length - 2]; // .../campaigns/:id/analytics
    
    if (!campaignId) {
      return errorResponse('Campaign ID required', 400);
    }
    
    // Get date range params
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    const agencyId = await getUserAgencyId(supabase);
    
    // Get campaign to verify access
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, name')
      .eq('id', campaignId)
      .eq('agency_id', agencyId)
      .single();
    
    if (campaignError || !campaign) {
      return errorResponse('Campaign not found', 404);
    }
    
    // Get lead stats
    let leadQuery = supabase
      .from('leads')
      .select('status, created_at')
      .eq('campaign_id', campaignId);
    
    if (startDate) {
      leadQuery = leadQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      leadQuery = leadQuery.lte('created_at', endDate);
    }
    
    const { data: leads, error: leadsError } = await leadQuery;
    
    if (leadsError) {
      throw leadsError;
    }
    
    // Calculate metrics
    const totalLeads = leads?.length || 0;
    const qualifiedLeads = leads?.filter((l) => l.status === 'qualified').length || 0;
    const rejectedLeads = leads?.filter((l) => l.status === 'rejected').length || 0;
    const assignedLeads = leads?.filter((l) => l.status === 'assigned').length || 0;
    const convertedLeads = leads?.filter((l) => l.status === 'converted').length || 0;
    
    // Get scraping job stats
    const { data: jobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('status, records_processed, records_qualified, records_rejected')
      .eq('campaign_id', campaignId);
    
    const totalJobsRun = jobs?.length || 0;
    const totalRecordsProcessed = jobs?.reduce((sum, job) => sum + (job.records_processed || 0), 0) || 0;
    
    // Calculate conversion rates
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    const conversionRate = qualifiedLeads > 0 ? (convertedLeads / qualifiedLeads) * 100 : 0;
    
    // Calculate trends (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentLeads = leads?.filter((l) => new Date(l.created_at) >= last7Days) || [];
    const previousLeads = leads?.filter(
      (l) => new Date(l.created_at) >= previous7Days && new Date(l.created_at) < last7Days
    ) || [];
    
    const leadsThisWeek = recentLeads.length;
    const leadsLastWeek = previousLeads.length;
    const leadsTrend = leadsLastWeek > 0 
      ? ((leadsThisWeek - leadsLastWeek) / leadsLastWeek) * 100 
      : 0;
    
    // Build response
    const analytics = {
      campaignId,
      campaignName: campaign.name,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      metrics: {
        totalLeads,
        qualifiedLeads,
        rejectedLeads,
        assignedLeads,
        convertedLeads,
        qualificationRate: Math.round(qualificationRate * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      scraping: {
        totalJobsRun,
        totalRecordsProcessed,
      },
      trends: {
        leadsThisWeek,
        leadsLastWeek,
        leadsTrend: Math.round(leadsTrend * 100) / 100,
      },
    };
    
    return successResponse(analytics);
  });
});
