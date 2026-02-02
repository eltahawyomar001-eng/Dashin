/**
 * Leads Analytics Endpoint
 * GET /analytics/leads
 */

import { handleRequest, successResponse, getUserAgencyId, parsePaginationParams } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }
    
    const agencyId = await getUserAgencyId(supabase);
    const url = new URL(req.url);
    
    const dateRange = url.searchParams.get('range') || '30d';
    const groupBy = url.searchParams.get('groupBy') || 'status'; // status, qualification, campaign, source
    const campaignId = url.searchParams.get('campaign_id');
    
    // Calculate date range
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
    
    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId)
      .gte('created_at', startDate.toISOString());
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    const { data: leads, error: leadsError, count } = await query;
    
    if (leadsError) {
      throw leadsError;
    }
    
    // Group data based on groupBy parameter
    let groupedData: any = {};
    
    switch (groupBy) {
      case 'status':
        groupedData = leads.reduce((acc: any, lead: any) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {});
        break;
        
      case 'qualification':
        groupedData = leads.reduce((acc: any, lead: any) => {
          const qual = lead.qualification_status || 'pending';
          acc[qual] = (acc[qual] || 0) + 1;
          return acc;
        }, {});
        break;
        
      case 'campaign':
        // Get campaign names
        const campaignIds = [...new Set(leads.map((l: any) => l.campaign_id).filter(Boolean))];
        
        if (campaignIds.length > 0) {
          const { data: campaigns } = await supabase
            .from('campaigns')
            .select('id, name')
            .in('id', campaignIds);
          
          const campaignMap = new Map(campaigns?.map((c: any) => [c.id, c.name]));
          
          groupedData = leads.reduce((acc: any, lead: any) => {
            const campaignName = lead.campaign_id 
              ? campaignMap.get(lead.campaign_id) || 'Unknown'
              : 'No Campaign';
            acc[campaignName] = (acc[campaignName] || 0) + 1;
            return acc;
          }, {});
        }
        break;
        
      case 'source':
        groupedData = leads.reduce((acc: any, lead: any) => {
          const source = lead.source || 'Unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});
        break;
    }
    
    // Calculate overall metrics
    const totalLeads = count || 0;
    const qualified = leads.filter((l: any) => l.qualification_status === 'qualified').length;
    const disqualified = leads.filter((l: any) => l.qualification_status === 'disqualified').length;
    const pending = leads.filter((l: any) => !l.qualification_status || l.qualification_status === 'pending').length;
    const contacted = leads.filter((l: any) => l.last_contacted_at).length;
    const responded = leads.filter((l: any) => l.last_responded_at).length;
    
    // Calculate by status
    const statusBreakdown = {
      new: leads.filter((l: any) => l.status === 'new').length,
      contacted: leads.filter((l: any) => l.status === 'contacted').length,
      responded: leads.filter((l: any) => l.status === 'responded').length,
      qualified: leads.filter((l: any) => l.status === 'qualified').length,
      nurturing: leads.filter((l: any) => l.status === 'nurturing').length,
      converted: leads.filter((l: any) => l.status === 'converted').length,
      disqualified: leads.filter((l: any) => l.status === 'disqualified').length,
    };
    
    // Calculate rates
    const qualificationRate = totalLeads > 0 ? (qualified / totalLeads * 100).toFixed(2) : '0.00';
    const responseRate = contacted > 0 ? (responded / contacted * 100).toFixed(2) : '0.00';
    const conversionRate = qualified > 0 
      ? (statusBreakdown.converted / qualified * 100).toFixed(2) 
      : '0.00';
    
    // Get top performing campaigns
    const { data: topCampaigns } = await supabase
      .from('campaigns')
      .select('id, name, leads_count, qualified_leads_count')
      .eq('agency_id', agencyId)
      .order('qualified_leads_count', { ascending: false })
      .limit(5);
    
    return successResponse({
      metrics: {
        total: totalLeads,
        qualified,
        disqualified,
        pending,
        contacted,
        responded,
        qualificationRate: parseFloat(qualificationRate),
        responseRate: parseFloat(responseRate),
        conversionRate: parseFloat(conversionRate),
      },
      statusBreakdown,
      groupedData,
      topCampaigns: topCampaigns || [],
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        range: dateRange,
        groupBy,
      },
    });
  });
});
