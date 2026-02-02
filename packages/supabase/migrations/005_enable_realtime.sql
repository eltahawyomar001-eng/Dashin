-- Migration: Enable Real-Time Database Features
-- Description: Configure Supabase Realtime for WebSocket subscriptions
-- Version: 005
-- Date: 2025-01-XX

BEGIN;

-- Enable realtime for key tables that need live updates
-- This allows frontend WebSocket subscriptions to receive real-time changes

-- Enable realtime on scraping_jobs table
-- Used for: Live job progress updates, status changes
ALTER TABLE IF EXISTS public.scraping_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scraping_jobs;

-- Enable realtime on campaigns table
-- Used for: Live campaign metrics updates
ALTER TABLE IF EXISTS public.campaigns REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;

-- Enable realtime on leads table
-- Used for: Live lead status changes, qualification updates
ALTER TABLE IF EXISTS public.leads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Enable realtime on notifications table
-- Used for: Real-time notification delivery
ALTER TABLE IF EXISTS public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime on data_sources table
-- Used for: Live data source status updates, connection test results
ALTER TABLE IF EXISTS public.data_sources REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_sources;

-- Enable realtime on scraping_job_logs table
-- Used for: Live job log streaming
ALTER TABLE IF EXISTS public.scraping_job_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scraping_job_logs;

-- Enable realtime on analytics_cache table (optional)
-- Used for: Live analytics updates (if needed)
ALTER TABLE IF EXISTS public.analytics_cache REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_cache;

-- Create a function to notify about job status changes
-- This can be used with pg_notify for additional real-time capabilities
CREATE OR REPLACE FUNCTION notify_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on status changes
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'job_status_change',
      json_build_object(
        'id', NEW.id,
        'agency_id', NEW.agency_id,
        'data_source_id', NEW.data_source_id,
        'campaign_id', NEW.campaign_id,
        'status', NEW.status,
        'progress', NEW.progress,
        'old_status', OLD.status
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job status notifications
DROP TRIGGER IF EXISTS trigger_notify_job_status_change ON scraping_jobs;
CREATE TRIGGER trigger_notify_job_status_change
  AFTER INSERT OR UPDATE ON scraping_jobs
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_status_change();

-- Create a function to notify about new notifications
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'agency_id', NEW.agency_id,
      'type', NEW.type,
      'title', NEW.title,
      'message', NEW.message
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new notification alerts
DROP TRIGGER IF EXISTS trigger_notify_new_notification ON notifications;
CREATE TRIGGER trigger_notify_new_notification
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_notification();

-- Create a function to broadcast campaign metric updates
CREATE OR REPLACE FUNCTION notify_campaign_metrics_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on metric changes
  IF TG_OP = 'UPDATE' AND (
    OLD.leads_count IS DISTINCT FROM NEW.leads_count OR
    OLD.qualified_leads_count IS DISTINCT FROM NEW.qualified_leads_count OR
    OLD.contacted_count IS DISTINCT FROM NEW.contacted_count OR
    OLD.responded_count IS DISTINCT FROM NEW.responded_count
  ) THEN
    PERFORM pg_notify(
      'campaign_metrics_update',
      json_build_object(
        'id', NEW.id,
        'agency_id', NEW.agency_id,
        'leads_count', NEW.leads_count,
        'qualified_leads_count', NEW.qualified_leads_count,
        'contacted_count', NEW.contacted_count,
        'responded_count', NEW.responded_count
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for campaign metric broadcasts
DROP TRIGGER IF EXISTS trigger_notify_campaign_metrics_update ON campaigns;
CREATE TRIGGER trigger_notify_campaign_metrics_update
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION notify_campaign_metrics_update();

COMMIT;

-- Documentation: Real-Time Setup Instructions
-- 
-- 1. This migration enables Realtime on all critical tables
-- 2. REPLICA IDENTITY FULL ensures all columns are sent in updates
-- 3. Frontend can subscribe using:
--    - supabase.channel('scraping_jobs').on('postgres_changes', ...)
--    - supabase.channel('notifications').on('postgres_changes', ...)
-- 
-- 4. Additional pg_notify channels available:
--    - 'job_status_change' - Job status updates
--    - 'new_notification' - New notification alerts
--    - 'campaign_metrics_update' - Campaign metric changes
-- 
-- 5. To listen to pg_notify in frontend:
--    const channel = supabase.channel('job_status_change')
--      .on('postgres_changes', { event: '*', schema: 'public', table: 'scraping_jobs' }, ...)
--      .subscribe()
-- 
-- 6. Remember to unsubscribe when components unmount:
--    useEffect(() => {
--      const channel = supabase.channel(...)
--      return () => { supabase.removeChannel(channel) }
--    }, [])
