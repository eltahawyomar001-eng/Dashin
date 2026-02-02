/**
 * Analytics Overview Endpoint
 * GET /analytics/overview
 */

import { handleRequest, successResponse, getUserAgencyId } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }
    
    const agencyId = await getUserAgencyId(supabase);
    const url = new URL(req.url);
    const dateRange = url.searchParams.get('range') || '30d'; // 7d, 30d, 90d, 1y
    
    // Calculate date based on range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Get campaign metrics
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('status, leads_count, qualified_leads_count, contacted_count, responded_count, created_at')
      .eq('agency_id', agencyId);
    
    if (campaignError) {
      throw campaignError;
    }
    
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads_count || 0), 0);
    const qualifiedLeads = campaigns.reduce((sum, c) => sum + (c.qualified_leads_count || 0), 0);
    const contacted = campaigns.reduce((sum, c) => sum + (c.contacted_count || 0), 0);
    const responded = campaigns.reduce((sum, c) => sum + (c.responded_count || 0), 0);
    
    // Get lead metrics
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('status, qualification_status, created_at')
      .eq('agency_id', agencyId)
      .gte('created_at', startDate.toISOString());
    
    if (leadsError) {
      throw leadsError;
    }
    
    const newLeads = leads.filter(l => new Date(l.created_at) >= startDate).length;
    const qualifiedLeadsInRange = leads.filter(l => l.qualification_status === 'qualified').length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(2) : '0.00';
    const responseRate = contacted > 0 ? (responded / contacted * 100).toFixed(2) : '0.00';
    
    // Get data source metrics
    const { data: dataSources, error: sourcesError } = await supabase
      .from('data_sources')
      .select('status, total_jobs, successful_jobs, failed_jobs, total_records_scraped')
      .eq('agency_id', agencyId);
    
    if (sourcesError) {
      throw sourcesError;
    }
    
    const totalDataSources = dataSources.length;
    const activeDataSources = dataSources.filter(ds => ds.status === 'active').length;
    const totalScrapingJobs = dataSources.reduce((sum, ds) => sum + (ds.total_jobs || 0), 0);
    const successfulJobs = dataSources.reduce((sum, ds) => sum + (ds.successful_jobs || 0), 0);
    const totalRecordsScraped = dataSources.reduce((sum, ds) => sum + (ds.total_records_scraped || 0), 0);
    
    // Get recent scraping jobs
    const { data: recentJobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('status, created_at')
      .eq('agency_id', agencyId)
      .gte('created_at', startDate.toISOString());
    
    if (jobsError) {
      throw jobsError;
    }
    
    const runningJobs = recentJobs.filter(j => j.status === 'running').length;
    const pendingJobs = recentJobs.filter(j => j.status === 'pending').length;
    
    // Calculate trends (compare to previous period)
    const prevStartDate = new Date(startDate);
    prevStartDate.setTime(prevStartDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const { data: prevLeads } = await supabase
      .from('leads')
      .select('created_at')
      .eq('agency_id', agencyId)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());
    
    const prevLeadsCount = prevLeads?.length || 0;
    const leadsTrend = prevLeadsCount > 0 
      ? ((newLeads - prevLeadsCount) / prevLeadsCount * 100).toFixed(2)
      : '0.00';
    
    return successResponse({
      overview: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
          inactive: totalCampaigns - activeCampaigns,
        },
        leads: {
          total: totalLeads,
          new: newLeads,
          qualified: qualifiedLeads,
          contacted,
          responded,
          conversionRate: parseFloat(conversionRate),
          responseRate: parseFloat(responseRate),
        },
        dataSources: {
          total: totalDataSources,
          active: activeDataSources,
          inactive: totalDataSources - activeDataSources,
        },
        scraping: {
          totalJobs: totalScrapingJobs,
          successfulJobs,
          runningJobs,
          pendingJobs,
          totalRecordsScraped,
        },
        trends: {
          leads: parseFloat(leadsTrend),
        },
      },
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        range: dateRange,
      },
    });
  });
});
