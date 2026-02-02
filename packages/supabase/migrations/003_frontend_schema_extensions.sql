-- ============================================================================
-- Migration 003: Frontend Schema Extensions
-- ============================================================================
-- Purpose: Extend existing schema to support Segment 8 frontend requirements
-- Adds: data_sources table, notifications table, analytics tables, 
--       additional fields to campaigns/leads, scraping_jobs view

-- ============================================================================
-- DATA SOURCES TABLE
-- ============================================================================
-- Tracks external data sources for lead scraping and enrichment

CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('linkedin', 'apollo', 'zoominfo', 'custom', 'csv', 'api')),
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'error', 'testing')) DEFAULT 'inactive',
    
    -- Configuration (stored as JSONB for flexibility)
    config JSONB NOT NULL DEFAULT '{}',
    
    -- Authentication/credentials (encrypted)
    credentials JSONB DEFAULT '{}',
    
    -- Connection test results
    last_test_at TIMESTAMPTZ,
    last_test_status TEXT CHECK (last_test_status IN ('success', 'failed', 'pending')),
    last_test_error TEXT,
    
    -- Usage tracking
    total_jobs INTEGER NOT NULL DEFAULT 0,
    successful_jobs INTEGER NOT NULL DEFAULT 0,
    failed_jobs INTEGER NOT NULL DEFAULT 0,
    total_records_scraped INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_sources_agency_id ON data_sources(agency_id);
CREATE INDEX idx_data_sources_type ON data_sources(type);
CREATE INDEX idx_data_sources_status ON data_sources(status);
CREATE INDEX idx_data_sources_created_by ON data_sources(created_by);

-- ============================================================================
-- SCRAPING JOBS TABLE (Replacement for scrape_sessions)
-- ============================================================================
-- Tracks individual scraping job executions with real-time progress

CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- Job control
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    
    -- Progress tracking
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    records_processed INTEGER NOT NULL DEFAULT 0,
    records_qualified INTEGER NOT NULL DEFAULT 0,
    records_rejected INTEGER NOT NULL DEFAULT 0,
    
    -- Configuration
    config JSONB NOT NULL DEFAULT '{}',
    search_criteria JSONB DEFAULT '{}',
    
    -- Results
    result_file_url TEXT,
    raw_data_url TEXT,
    
    -- Error tracking
    errors JSONB DEFAULT '[]',
    error_count INTEGER NOT NULL DEFAULT 0,
    
    -- Execution details
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraping_jobs_agency_id ON scraping_jobs(agency_id);
CREATE INDEX idx_scraping_jobs_data_source_id ON scraping_jobs(data_source_id);
CREATE INDEX idx_scraping_jobs_campaign_id ON scraping_jobs(campaign_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_created_by ON scraping_jobs(created_by);
CREATE INDEX idx_scraping_jobs_created_at ON scraping_jobs(created_at DESC);

-- ============================================================================
-- SCRAPING JOB LOGS TABLE
-- ============================================================================
-- Detailed logs for each scraping job execution

CREATE TABLE scraping_job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES scraping_jobs(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraping_job_logs_job_id ON scraping_job_logs(job_id);
CREATE INDEX idx_scraping_job_logs_level ON scraping_job_logs(level);
CREATE INDEX idx_scraping_job_logs_created_at ON scraping_job_logs(created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
-- System notifications for users about important events

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Notification details
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'job_complete', 'job_failed', 'campaign_milestone', 'lead_assigned')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_entity_type TEXT CHECK (related_entity_type IN ('campaign', 'lead', 'job', 'data_source')),
    related_entity_id UUID,
    
    -- Actions
    action_url TEXT,
    action_label TEXT,
    
    -- Status
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_agency_id ON notifications(agency_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- EXTEND CAMPAIGNS TABLE
-- ============================================================================
-- Add fields required by frontend Campaign interface

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_companies INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_leads INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS qualified_leads INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS assigned_leads INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS rejected_leads INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- EXTEND LEADS TABLE
-- ============================================================================
-- Add fields required by frontend Lead interface

ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_data JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_data JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_data JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to_email TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Create index for assigned_to field
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON leads USING GIN (tags);

-- ============================================================================
-- ANALYTICS CACHE TABLE
-- ============================================================================
-- Pre-computed analytics for fast dashboard loading

CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Cache key
    metric_type TEXT NOT NULL CHECK (metric_type IN ('overview', 'campaign', 'lead', 'researcher')),
    entity_id UUID, -- NULL for overview, campaign/lead/user ID for specific metrics
    
    -- Time range
    date_range TEXT NOT NULL, -- e.g., "last_7_days", "last_30_days", "2026-W05"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Cached data
    data JSONB NOT NULL,
    
    -- Cache metadata
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    
    UNIQUE(agency_id, metric_type, entity_id, date_range)
);

CREATE INDEX idx_analytics_cache_agency_id ON analytics_cache(agency_id);
CREATE INDEX idx_analytics_cache_metric_type ON analytics_cache(metric_type);
CREATE INDEX idx_analytics_cache_entity_id ON analytics_cache(entity_id);
CREATE INDEX idx_analytics_cache_expires_at ON analytics_cache(expires_at);

-- ============================================================================
-- APPLY UPDATED_AT TRIGGERS TO NEW TABLES
-- ============================================================================

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_jobs_updated_at BEFORE UPDATE ON scraping_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update campaign metrics (called by triggers)
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update qualified_leads count
    UPDATE campaigns
    SET qualified_leads = (
        SELECT COUNT(*) FROM leads 
        WHERE campaign_id = NEW.campaign_id 
        AND status = 'qualified'
    )
    WHERE id = NEW.campaign_id;
    
    -- Update assigned_leads count
    UPDATE campaigns
    SET assigned_leads = (
        SELECT COUNT(*) FROM leads 
        WHERE campaign_id = NEW.campaign_id 
        AND assigned_to IS NOT NULL
    )
    WHERE id = NEW.campaign_id;
    
    -- Update rejected_leads count
    UPDATE campaigns
    SET rejected_leads = (
        SELECT COUNT(*) FROM leads 
        WHERE campaign_id = NEW.campaign_id 
        AND status = 'rejected'
    )
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update campaign metrics when leads change
CREATE TRIGGER update_campaign_metrics_on_lead_change
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_metrics();

-- Function to update data source metrics (called by triggers)
CREATE OR REPLACE FUNCTION update_data_source_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE data_sources
    SET 
        total_jobs = (SELECT COUNT(*) FROM scraping_jobs WHERE data_source_id = NEW.data_source_id),
        successful_jobs = (SELECT COUNT(*) FROM scraping_jobs WHERE data_source_id = NEW.data_source_id AND status = 'completed'),
        failed_jobs = (SELECT COUNT(*) FROM scraping_jobs WHERE data_source_id = NEW.data_source_id AND status = 'failed'),
        total_records_scraped = (SELECT COALESCE(SUM(records_processed), 0) FROM scraping_jobs WHERE data_source_id = NEW.data_source_id)
    WHERE id = NEW.data_source_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update data source metrics when jobs complete
CREATE TRIGGER update_data_source_metrics_on_job_change
    AFTER INSERT OR UPDATE ON scraping_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_data_source_metrics();

-- Function to invalidate analytics cache when data changes
CREATE OR REPLACE FUNCTION invalidate_analytics_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all cached analytics for this agency
    DELETE FROM analytics_cache WHERE agency_id = NEW.agency_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to invalidate cache on data changes
CREATE TRIGGER invalidate_cache_on_campaign_change
    AFTER INSERT OR UPDATE OR DELETE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_analytics_cache();

CREATE TRIGGER invalidate_cache_on_lead_change
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION invalidate_analytics_cache();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for campaign summary with counts
CREATE OR REPLACE VIEW campaign_summary AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.status,
    c.target_companies,
    c.target_leads,
    c.qualified_leads,
    c.assigned_leads,
    c.rejected_leads,
    c.start_date,
    c.end_date,
    c.agency_id,
    c.client_id,
    c.created_by,
    c.created_at,
    c.updated_at,
    cl.name AS client_name,
    u.email AS created_by_email,
    COUNT(DISTINCT l.id) AS total_leads
FROM campaigns c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN users u ON c.created_by = u.id
LEFT JOIN leads l ON c.id = l.campaign_id
GROUP BY c.id, cl.name, u.email;

-- View for lead with full details
CREATE OR REPLACE VIEW lead_details AS
SELECT 
    l.id,
    l.campaign_id,
    c.name AS campaign_name,
    l.status,
    l.priority,
    l.first_name,
    l.last_name,
    l.email,
    l.phone,
    l.company,
    l.title,
    l.industry,
    l.linkedin_url,
    l.contact,
    l.company_data,
    l.source_data,
    l.qualification_data,
    l.assigned_to,
    l.assigned_to_email,
    l.assigned_at,
    l.contacted_at,
    l.converted_at,
    l.notes,
    l.tags,
    l.custom_fields,
    l.agency_id,
    l.created_at,
    l.updated_at,
    u.email AS assigned_to_user_email
FROM leads l
LEFT JOIN campaigns c ON l.campaign_id = c.id
LEFT JOIN users u ON l.assigned_to = u.id;
