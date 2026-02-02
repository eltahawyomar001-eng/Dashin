-- Migration: Additional Database Functions & Stored Procedures
-- Description: Helper functions for complex operations and analytics
-- Version: 006
-- Date: 2025-01-XX

BEGIN;

-- Function: Get campaign performance summary
-- Returns aggregated metrics for a campaign
CREATE OR REPLACE FUNCTION get_campaign_performance(p_campaign_id UUID)
RETURNS TABLE (
  campaign_id UUID,
  campaign_name TEXT,
  total_leads INT,
  qualified_leads INT,
  contacted_leads INT,
  responded_leads INT,
  converted_leads INT,
  qualification_rate NUMERIC,
  response_rate NUMERIC,
  conversion_rate NUMERIC,
  avg_time_to_qualify INTERVAL,
  avg_time_to_respond INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as campaign_id,
    c.name as campaign_name,
    COALESCE(c.leads_count, 0)::INT as total_leads,
    COALESCE(c.qualified_leads_count, 0)::INT as qualified_leads,
    COALESCE(c.contacted_count, 0)::INT as contacted_leads,
    COALESCE(c.responded_count, 0)::INT as responded_leads,
    COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::INT as converted_leads,
    CASE WHEN c.leads_count > 0 
      THEN ROUND((c.qualified_leads_count::NUMERIC / c.leads_count::NUMERIC * 100), 2)
      ELSE 0
    END as qualification_rate,
    CASE WHEN c.contacted_count > 0
      THEN ROUND((c.responded_count::NUMERIC / c.contacted_count::NUMERIC * 100), 2)
      ELSE 0
    END as response_rate,
    CASE WHEN c.qualified_leads_count > 0
      THEN ROUND((COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::NUMERIC / c.qualified_leads_count::NUMERIC * 100), 2)
      ELSE 0
    END as conversion_rate,
    AVG(CASE WHEN l.qualified_at IS NOT NULL 
      THEN l.qualified_at - l.created_at 
      ELSE NULL 
    END) as avg_time_to_qualify,
    AVG(CASE WHEN l.last_responded_at IS NOT NULL AND l.last_contacted_at IS NOT NULL
      THEN l.last_responded_at - l.last_contacted_at
      ELSE NULL
    END) as avg_time_to_respond
  FROM campaigns c
  LEFT JOIN leads l ON l.campaign_id = c.id
  WHERE c.id = p_campaign_id
  GROUP BY c.id, c.name, c.leads_count, c.qualified_leads_count, c.contacted_count, c.responded_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Calculate lead score
-- Advanced lead scoring based on multiple factors
CREATE OR REPLACE FUNCTION calculate_lead_score(p_lead_id UUID)
RETURNS INT AS $$
DECLARE
  v_score INT := 0;
  v_lead RECORD;
  v_days_since_created INT;
  v_engagement_count INT;
BEGIN
  -- Get lead details
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Base score from qualification status
  CASE v_lead.qualification_status
    WHEN 'qualified' THEN v_score := v_score + 50;
    WHEN 'pending' THEN v_score := v_score + 25;
    WHEN 'disqualified' THEN v_score := v_score - 50;
    ELSE v_score := v_score + 0;
  END CASE;
  
  -- Status-based scoring
  CASE v_lead.status
    WHEN 'converted' THEN v_score := v_score + 100;
    WHEN 'responded' THEN v_score := v_score + 40;
    WHEN 'contacted' THEN v_score := v_score + 20;
    WHEN 'nurturing' THEN v_score := v_score + 15;
    WHEN 'new' THEN v_score := v_score + 10;
    WHEN 'disqualified' THEN v_score := v_score - 100;
    ELSE v_score := v_score + 0;
  END CASE;
  
  -- Priority-based scoring
  CASE v_lead.priority
    WHEN 'urgent' THEN v_score := v_score + 30;
    WHEN 'high' THEN v_score := v_score + 20;
    WHEN 'medium' THEN v_score := v_score + 10;
    WHEN 'low' THEN v_score := v_score + 0;
    ELSE v_score := v_score + 5;
  END CASE;
  
  -- Recent activity bonus
  IF v_lead.last_contacted_at IS NOT NULL AND v_lead.last_contacted_at > NOW() - INTERVAL '7 days' THEN
    v_score := v_score + 15;
  END IF;
  
  IF v_lead.last_responded_at IS NOT NULL AND v_lead.last_responded_at > NOW() - INTERVAL '7 days' THEN
    v_score := v_score + 25;
  END IF;
  
  -- Freshness penalty (older leads get lower scores)
  v_days_since_created := EXTRACT(DAY FROM NOW() - v_lead.created_at)::INT;
  IF v_days_since_created > 30 THEN
    v_score := v_score - (v_days_since_created - 30) / 10;
  END IF;
  
  -- Ensure score is between 0 and 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Bulk update lead status
-- Efficiently update multiple leads at once
CREATE OR REPLACE FUNCTION bulk_update_lead_status(
  p_lead_ids UUID[],
  p_new_status TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  updated_count INT,
  failed_ids UUID[]
) AS $$
DECLARE
  v_updated_count INT := 0;
  v_failed_ids UUID[] := ARRAY[]::UUID[];
  v_lead_id UUID;
BEGIN
  FOREACH v_lead_id IN ARRAY p_lead_ids
  LOOP
    BEGIN
      UPDATE leads
      SET 
        status = p_new_status,
        updated_at = NOW()
      WHERE id = v_lead_id;
      
      IF FOUND THEN
        v_updated_count := v_updated_count + 1;
      ELSE
        v_failed_ids := array_append(v_failed_ids, v_lead_id);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      v_failed_ids := array_append(v_failed_ids, v_lead_id);
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_updated_count, v_failed_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get agency overview statistics
-- Quick dashboard summary for an agency
CREATE OR REPLACE FUNCTION get_agency_overview(p_agency_id UUID)
RETURNS TABLE (
  total_campaigns INT,
  active_campaigns INT,
  total_leads INT,
  qualified_leads INT,
  total_users INT,
  active_data_sources INT,
  running_jobs INT,
  recent_leads_7d INT,
  recent_leads_30d INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM campaigns WHERE agency_id = p_agency_id) as total_campaigns,
    (SELECT COUNT(*)::INT FROM campaigns WHERE agency_id = p_agency_id AND status = 'active') as active_campaigns,
    (SELECT COUNT(*)::INT FROM leads WHERE agency_id = p_agency_id) as total_leads,
    (SELECT COUNT(*)::INT FROM leads WHERE agency_id = p_agency_id AND qualification_status = 'qualified') as qualified_leads,
    (SELECT COUNT(*)::INT FROM user_profiles WHERE agency_id = p_agency_id) as total_users,
    (SELECT COUNT(*)::INT FROM data_sources WHERE agency_id = p_agency_id AND status = 'active') as active_data_sources,
    (SELECT COUNT(*)::INT FROM scraping_jobs WHERE agency_id = p_agency_id AND status = 'running') as running_jobs,
    (SELECT COUNT(*)::INT FROM leads WHERE agency_id = p_agency_id AND created_at > NOW() - INTERVAL '7 days') as recent_leads_7d,
    (SELECT COUNT(*)::INT FROM leads WHERE agency_id = p_agency_id AND created_at > NOW() - INTERVAL '30 days') as recent_leads_30d;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Archive old analytics cache
-- Clean up old cached analytics data
CREATE OR REPLACE FUNCTION archive_old_analytics_cache(p_days_old INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM analytics_cache
  WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top performing campaigns
-- Returns campaigns sorted by qualification rate
CREATE OR REPLACE FUNCTION get_top_campaigns(
  p_agency_id UUID,
  p_limit INT DEFAULT 10,
  p_metric TEXT DEFAULT 'qualification_rate' -- qualification_rate, response_rate, conversion_rate
)
RETURNS TABLE (
  campaign_id UUID,
  campaign_name TEXT,
  status TEXT,
  total_leads INT,
  qualified_leads INT,
  contacted INT,
  responded INT,
  metric_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as campaign_id,
    c.name as campaign_name,
    c.status,
    COALESCE(c.leads_count, 0)::INT as total_leads,
    COALESCE(c.qualified_leads_count, 0)::INT as qualified_leads,
    COALESCE(c.contacted_count, 0)::INT as contacted,
    COALESCE(c.responded_count, 0)::INT as responded,
    CASE p_metric
      WHEN 'qualification_rate' THEN
        CASE WHEN c.leads_count > 0 
          THEN ROUND((c.qualified_leads_count::NUMERIC / c.leads_count::NUMERIC * 100), 2)
          ELSE 0
        END
      WHEN 'response_rate' THEN
        CASE WHEN c.contacted_count > 0
          THEN ROUND((c.responded_count::NUMERIC / c.contacted_count::NUMERIC * 100), 2)
          ELSE 0
        END
      WHEN 'conversion_rate' THEN
        CASE WHEN c.qualified_leads_count > 0
          THEN ROUND((
            (SELECT COUNT(*) FROM leads WHERE campaign_id = c.id AND status = 'converted')::NUMERIC 
            / c.qualified_leads_count::NUMERIC * 100
          ), 2)
          ELSE 0
        END
      ELSE 0
    END as metric_value
  FROM campaigns c
  WHERE c.agency_id = p_agency_id
  ORDER BY metric_value DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_campaign_performance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_lead_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_lead_status(UUID[], TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_agency_overview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_analytics_cache(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_campaigns(UUID, INT, TEXT) TO authenticated;

COMMIT;

-- Documentation: Using These Functions
--
-- 1. Get Campaign Performance:
--    SELECT * FROM get_campaign_performance('campaign-uuid');
--
-- 2. Calculate Lead Score:
--    SELECT calculate_lead_score('lead-uuid');
--    -- Can be used in queries: SELECT id, name, calculate_lead_score(id) as score FROM leads;
--
-- 3. Bulk Update Leads:
--    SELECT * FROM bulk_update_lead_status(
--      ARRAY['lead-1-uuid', 'lead-2-uuid']::UUID[],
--      'contacted',
--      'user-uuid'
--    );
--
-- 4. Agency Overview:
--    SELECT * FROM get_agency_overview('agency-uuid');
--
-- 5. Top Campaigns:
--    SELECT * FROM get_top_campaigns('agency-uuid', 5, 'qualification_rate');
--
-- 6. Archive Old Cache:
--    SELECT archive_old_analytics_cache(90); -- Delete cache older than 90 days
