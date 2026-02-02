-- ============================================================================
-- Migration 004: RLS Policies for Frontend Schema Extensions
-- ============================================================================
-- Purpose: Add Row Level Security policies for new tables
-- Tables: data_sources, scraping_jobs, scraping_job_logs, notifications, analytics_cache

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DATA SOURCES POLICIES
-- ============================================================================

-- Super admins can do everything
CREATE POLICY "Super admins have full access to data sources"
    ON data_sources FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage data sources in their agency
CREATE POLICY "Agency admins can manage data sources"
    ON data_sources FOR ALL
    USING (
        auth.user_role() = 'agency_admin'
        AND agency_id = auth.user_agency_id()
    );

-- Researchers can view and create data sources in their agency
CREATE POLICY "Researchers can view data sources"
    ON data_sources FOR SELECT
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
    );

CREATE POLICY "Researchers can create data sources"
    ON data_sources FOR INSERT
    WITH CHECK (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND created_by = auth.uid()
    );

CREATE POLICY "Researchers can update their data sources"
    ON data_sources FOR UPDATE
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND created_by = auth.uid()
    );

-- Clients can view data sources in their agency
CREATE POLICY "Clients can view data sources"
    ON data_sources FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND agency_id = auth.user_agency_id()
    );

-- ============================================================================
-- SCRAPING JOBS POLICIES
-- ============================================================================

-- Super admins can do everything
CREATE POLICY "Super admins have full access to scraping jobs"
    ON scraping_jobs FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage scraping jobs in their agency
CREATE POLICY "Agency admins can manage scraping jobs"
    ON scraping_jobs FOR ALL
    USING (
        auth.user_role() = 'agency_admin'
        AND agency_id = auth.user_agency_id()
    );

-- Researchers can view, create, and manage their scraping jobs
CREATE POLICY "Researchers can view scraping jobs"
    ON scraping_jobs FOR SELECT
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
    );

CREATE POLICY "Researchers can create scraping jobs"
    ON scraping_jobs FOR INSERT
    WITH CHECK (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND created_by = auth.uid()
    );

CREATE POLICY "Researchers can update their scraping jobs"
    ON scraping_jobs FOR UPDATE
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND created_by = auth.uid()
    );

-- Clients can view scraping jobs in their agency
CREATE POLICY "Clients can view scraping jobs"
    ON scraping_jobs FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND agency_id = auth.user_agency_id()
    );

-- ============================================================================
-- SCRAPING JOB LOGS POLICIES
-- ============================================================================

-- Super admins can do everything
CREATE POLICY "Super admins have full access to job logs"
    ON scraping_job_logs FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view all logs in their agency
CREATE POLICY "Agency admins can view job logs"
    ON scraping_job_logs FOR SELECT
    USING (
        auth.user_role() = 'agency_admin'
        AND EXISTS (
            SELECT 1 FROM scraping_jobs
            WHERE id = scraping_job_logs.job_id
            AND agency_id = auth.user_agency_id()
        )
    );

-- Researchers can view logs for their jobs
CREATE POLICY "Researchers can view their job logs"
    ON scraping_job_logs FOR SELECT
    USING (
        auth.user_role() = 'researcher'
        AND EXISTS (
            SELECT 1 FROM scraping_jobs
            WHERE id = scraping_job_logs.job_id
            AND created_by = auth.uid()
        )
    );

-- System can insert logs (no RLS restriction for inserts by background processes)
CREATE POLICY "System can insert job logs"
    ON scraping_job_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Super admins can do everything
CREATE POLICY "Super admins have full access to notifications"
    ON notifications FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read/dismissed)
CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their notifications"
    ON notifications FOR DELETE
    USING (user_id = auth.uid());

-- System can create notifications for any user (for background processes)
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- ANALYTICS CACHE POLICIES
-- ============================================================================

-- Super admins can do everything
CREATE POLICY "Super admins have full access to analytics cache"
    ON analytics_cache FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view and manage analytics cache for their agency
CREATE POLICY "Agency admins can manage analytics cache"
    ON analytics_cache FOR ALL
    USING (
        auth.user_role() = 'agency_admin'
        AND agency_id = auth.user_agency_id()
    );

-- Researchers can view analytics cache for their agency
CREATE POLICY "Researchers can view analytics cache"
    ON analytics_cache FOR SELECT
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
    );

-- Clients can view analytics cache for their agency
CREATE POLICY "Clients can view analytics cache"
    ON analytics_cache FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND agency_id = auth.user_agency_id()
    );

-- System can insert/update cache (for background processes)
CREATE POLICY "System can manage analytics cache"
    ON analytics_cache FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update analytics cache"
    ON analytics_cache FOR UPDATE
    USING (true);

CREATE POLICY "System can delete expired cache"
    ON analytics_cache FOR DELETE
    USING (expires_at < NOW());

-- ============================================================================
-- ADDITIONAL HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user can access a specific campaign
CREATE OR REPLACE FUNCTION auth.can_access_campaign(campaign_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM campaigns
        WHERE id = campaign_id
        AND (
            auth.user_role() = 'super_admin'
            OR (
                auth.user_role() IN ('agency_admin', 'researcher', 'client')
                AND agency_id = auth.user_agency_id()
            )
        )
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user can access a specific lead
CREATE OR REPLACE FUNCTION auth.can_access_lead(lead_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM leads
        WHERE id = lead_id
        AND (
            auth.user_role() = 'super_admin'
            OR (
                auth.user_role() IN ('agency_admin', 'researcher')
                AND agency_id = auth.user_agency_id()
            )
            OR (
                auth.user_role() = 'researcher'
                AND assigned_to = auth.uid()
            )
        )
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user can modify a lead
CREATE OR REPLACE FUNCTION auth.can_modify_lead(lead_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM leads
        WHERE id = lead_id
        AND (
            auth.user_role() = 'super_admin'
            OR (
                auth.user_role() = 'agency_admin'
                AND agency_id = auth.user_agency_id()
            )
            OR (
                auth.user_role() = 'researcher'
                AND (created_by = auth.uid() OR assigned_to = auth.uid())
            )
        )
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- UPDATE EXISTING CAMPAIGN POLICIES TO USE NEW FIELDS
-- ============================================================================

-- Drop old policies if they exist and recreate with new fields
DROP POLICY IF EXISTS "Agency admins can manage their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Researchers can view campaigns" ON campaigns;
DROP POLICY IF EXISTS "Clients can view their campaigns" ON campaigns;

-- Agency admins can manage all campaigns in their agency
CREATE POLICY "Agency admins can manage campaigns"
    ON campaigns FOR ALL
    USING (
        (auth.user_role() = 'agency_admin' OR auth.user_role() = 'super_admin')
        AND agency_id = auth.user_agency_id()
    );

-- Researchers can view all campaigns and create new ones
CREATE POLICY "Researchers can view campaigns"
    ON campaigns FOR SELECT
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
    );

CREATE POLICY "Researchers can create campaigns"
    ON campaigns FOR INSERT
    WITH CHECK (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND created_by = auth.uid()
    );

CREATE POLICY "Researchers can update their campaigns"
    ON campaigns FOR UPDATE
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND created_by = auth.uid()
    );

-- Clients can view campaigns for their client record
CREATE POLICY "Clients can view their campaigns"
    ON campaigns FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND agency_id = auth.user_agency_id()
        AND client_id IN (
            SELECT id FROM clients WHERE agency_id = auth.user_agency_id()
        )
    );

-- ============================================================================
-- UPDATE EXISTING LEAD POLICIES TO USE NEW FIELDS
-- ============================================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Agency admins can manage leads" ON leads;
DROP POLICY IF EXISTS "Researchers can view leads" ON leads;
DROP POLICY IF EXISTS "Researchers can create leads" ON leads;
DROP POLICY IF EXISTS "Researchers can update leads" ON leads;

-- Agency admins can manage all leads in their agency
CREATE POLICY "Agency admins can manage all leads"
    ON leads FOR ALL
    USING (
        (auth.user_role() = 'agency_admin' OR auth.user_role() = 'super_admin')
        AND agency_id = auth.user_agency_id()
    );

-- Researchers can view all leads in their agency
CREATE POLICY "Researchers can view all leads"
    ON leads FOR SELECT
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
    );

-- Researchers can create leads in their agency
CREATE POLICY "Researchers can create leads"
    ON leads FOR INSERT
    WITH CHECK (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND (researcher_id = auth.uid() OR researcher_id IS NULL)
    );

-- Researchers can update leads they created or are assigned to
CREATE POLICY "Researchers can update their leads"
    ON leads FOR UPDATE
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND (researcher_id = auth.uid() OR assigned_to = auth.uid())
    );

-- Researchers can delete leads they created
CREATE POLICY "Researchers can delete their leads"
    ON leads FOR DELETE
    USING (
        auth.user_role() = 'researcher'
        AND agency_id = auth.user_agency_id()
        AND researcher_id = auth.uid()
    );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE data_sources IS 'External data sources for lead scraping and enrichment';
COMMENT ON TABLE scraping_jobs IS 'Tracks individual scraping job executions with real-time progress';
COMMENT ON TABLE scraping_job_logs IS 'Detailed execution logs for scraping jobs';
COMMENT ON TABLE notifications IS 'System notifications for users about important events';
COMMENT ON TABLE analytics_cache IS 'Pre-computed analytics for fast dashboard loading';

COMMENT ON COLUMN data_sources.config IS 'Data source configuration (URLs, selectors, etc.) stored as JSONB';
COMMENT ON COLUMN data_sources.credentials IS 'Encrypted authentication credentials stored as JSONB';
COMMENT ON COLUMN scraping_jobs.config IS 'Job-specific configuration and parameters stored as JSONB';
COMMENT ON COLUMN scraping_jobs.search_criteria IS 'Search/filter criteria used for this job stored as JSONB';
COMMENT ON COLUMN scraping_jobs.errors IS 'Array of error objects encountered during execution stored as JSONB';
COMMENT ON COLUMN leads.contact IS 'Contact information (email, phone, linkedin, etc.) stored as JSONB';
COMMENT ON COLUMN leads.company_data IS 'Company information (name, industry, size, etc.) stored as JSONB';
COMMENT ON COLUMN leads.source_data IS 'Lead source tracking information stored as JSONB';
COMMENT ON COLUMN leads.qualification_data IS 'Lead qualification results and criteria stored as JSONB';
COMMENT ON COLUMN analytics_cache.data IS 'Pre-computed analytics data stored as JSONB';
