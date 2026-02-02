/**
 * Campaign Analytics Endpoint
 * GET /analytics/campaigns/:id
 */

import { handleRequest, successResponse, errorResponse, getUserAgencyId } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const campaignId = pathParts[pathParts.length - 1];
    
    if (!campaignId) {
      return errorResponse('Campaign ID required', 400);
    }
    
    const agencyId = await getUserAgencyId(supabase);
    const dateRange = url.searchParams.get('range') || '30d';
    const groupBy = url.searchParams.get('groupBy') || 'day'; // day, week, month
    
    // Verify campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('agency_id', agencyId)
      .single();
    
    if (campaignError || !campaign) {
      return errorResponse('Campaign not found', 404);
    }
    
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
    
    // Get leads with timeline
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('status, qualification_status, created_at, last_contacted_at, last_responded_at')
      .eq('campaign_id', campaignId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });
    
    if (leadsError) {
      throw leadsError;
    }
    
    // Group leads by time period
    const timelineData: any[] = [];
    const groupedData = new Map();
    
    leads.forEach((lead: any) => {
      const date = new Date(lead.created_at);
      let key: string;
      
      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          date: key,
          totalLeads: 0,
          qualified: 0,
          contacted: 0,
          responded: 0,
          disqualified: 0,
        });
      }
      
      const group = groupedData.get(key);
      group.totalLeads++;
      
      if (lead.qualification_status === 'qualified') group.qualified++;
      if (lead.qualification_status === 'disqualified') group.disqualified++;
      if (lead.last_contacted_at) group.contacted++;
      if (lead.last_responded_at) group.responded++;
    });
    
    groupedData.forEach((value) => timelineData.push(value));
    
    // Calculate status distribution
    const statusDistribution = leads.reduce((acc: any, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate qualification distribution
    const qualificationDistribution = leads.reduce((acc: any, lead: any) => {
      if (lead.qualification_status) {
        acc[lead.qualification_status] = (acc[lead.qualification_status] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Calculate metrics
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter((l: any) => l.qualification_status === 'qualified').length;
    const contacted = leads.filter((l: any) => l.last_contacted_at).length;
    const responded = leads.filter((l: any) => l.last_responded_at).length;
    
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads * 100).toFixed(2) : '0.00';
    const contactRate = totalLeads > 0 ? (contacted / totalLeads * 100).toFixed(2) : '0.00';
    const responseRate = contacted > 0 ? (responded / contacted * 100).toFixed(2) : '0.00';
    
    return successResponse({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        created_at: campaign.created_at,
      },
      metrics: {
        totalLeads,
        qualifiedLeads,
        contacted,
        responded,
        qualificationRate: parseFloat(qualificationRate),
        contactRate: parseFloat(contactRate),
        responseRate: parseFloat(responseRate),
      },
      timeline: timelineData,
      distribution: {
        status: statusDistribution,
        qualification: qualificationDistribution,
      },
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        range: dateRange,
        groupBy,
      },
    });
  });
});
