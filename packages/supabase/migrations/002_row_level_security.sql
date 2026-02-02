-- Enable Row Level Security on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanroom_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE researcher_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_snapshots ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get current user's agency_id
CREATE OR REPLACE FUNCTION auth.user_agency_id()
RETURNS UUID AS $$
    SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- AGENCIES POLICIES
-- ============================================================================

-- Super admins can do everything
CREATE POLICY "Super admins have full access to agencies"
    ON agencies FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view their own agency
CREATE POLICY "Agency admins can view their agency"
    ON agencies FOR SELECT
    USING (
        auth.user_role() IN ('agency_admin', 'researcher', 'client')
        AND id = auth.user_agency_id()
    );

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Super admins can manage all users
CREATE POLICY "Super admins have full access to users"
    ON users FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view and manage users in their agency
CREATE POLICY "Agency admins can view users in their agency"
    ON users FOR SELECT
    USING (
        auth.user_role() = 'agency_admin'
        AND agency_id = auth.user_agency_id()
    );

CREATE POLICY "Agency admins can create users in their agency"
    ON users FOR INSERT
    WITH CHECK (
        auth.user_role() = 'agency_admin'
        AND agency_id = auth.user_agency_id()
        AND role IN ('researcher', 'client')
    );

CREATE POLICY "Agency admins can update users in their agency"
    ON users FOR UPDATE
    USING (
        auth.user_role() = 'agency_admin'
        AND agency_id = auth.user_agency_id()
    );

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND role = (SELECT role FROM users WHERE id = auth.uid())
        AND agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
    );

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

-- Super admins can manage all clients
CREATE POLICY "Super admins have full access to clients"
    ON clients FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage clients in their agency
CREATE POLICY "Agency admins can manage their clients"
    ON clients FOR ALL
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can view clients in their agency
CREATE POLICY "Researchers can view clients in their agency"
    ON clients FOR SELECT
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'researcher');

-- Clients can view their own record
CREATE POLICY "Clients can view their own record"
    ON clients FOR SELECT
    USING (auth.user_role() = 'client');

-- ============================================================================
-- CAMPAIGNS POLICIES
-- ============================================================================

-- Super admins can manage all campaigns
CREATE POLICY "Super admins have full access to campaigns"
    ON campaigns FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage campaigns in their agency
CREATE POLICY "Agency admins can manage their campaigns"
    ON campaigns FOR ALL
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can view campaigns in their agency
CREATE POLICY "Researchers can view campaigns in their agency"
    ON campaigns FOR SELECT
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'researcher');

-- Clients can view campaigns they're associated with
CREATE POLICY "Clients can view their campaigns"
    ON campaigns FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND client_id IN (
            SELECT id FROM clients WHERE agency_id = auth.user_agency_id()
        )
    );

-- ============================================================================
-- LEADS POLICIES
-- ============================================================================

-- Super admins can manage all leads
CREATE POLICY "Super admins have full access to leads"
    ON leads FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage leads in their agency
CREATE POLICY "Agency admins can manage their leads"
    ON leads FOR ALL
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can view and create leads in their agency
CREATE POLICY "Researchers can view leads in their agency"
    ON leads FOR SELECT
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'researcher');

CREATE POLICY "Researchers can create leads"
    ON leads FOR INSERT
    WITH CHECK (
        agency_id = auth.user_agency_id()
        AND auth.user_role() = 'researcher'
        AND researcher_id = auth.uid()
    );

CREATE POLICY "Researchers can update their own leads"
    ON leads FOR UPDATE
    USING (
        agency_id = auth.user_agency_id()
        AND auth.user_role() = 'researcher'
        AND researcher_id = auth.uid()
        AND status NOT IN ('approved', 'rejected')
    );

-- Clients can view leads in their campaigns
CREATE POLICY "Clients can view leads in their campaigns"
    ON leads FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND campaign_id IN (
            SELECT id FROM campaigns
            WHERE client_id IN (
                SELECT id FROM clients WHERE agency_id = auth.user_agency_id()
            )
        )
    );

-- ============================================================================
-- SCRAPE_SESSIONS POLICIES
-- ============================================================================

-- Super admins can manage all scrape sessions
CREATE POLICY "Super admins have full access to scrape_sessions"
    ON scrape_sessions FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage scrape sessions in their agency
CREATE POLICY "Agency admins can manage their scrape_sessions"
    ON scrape_sessions FOR ALL
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can view and create their own scrape sessions
CREATE POLICY "Researchers can view their scrape_sessions"
    ON scrape_sessions FOR SELECT
    USING (
        agency_id = auth.user_agency_id()
        AND auth.user_role() = 'researcher'
        AND researcher_id = auth.uid()
    );

CREATE POLICY "Researchers can create scrape_sessions"
    ON scrape_sessions FOR INSERT
    WITH CHECK (
        agency_id = auth.user_agency_id()
        AND auth.user_role() = 'researcher'
        AND researcher_id = auth.uid()
    );

-- ============================================================================
-- CLEANROOM_JOBS POLICIES
-- ============================================================================

-- Super admins can manage all cleanroom jobs
CREATE POLICY "Super admins have full access to cleanroom_jobs"
    ON cleanroom_jobs FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can manage cleanroom jobs in their agency
CREATE POLICY "Agency admins can manage their cleanroom_jobs"
    ON cleanroom_jobs FOR ALL
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can view cleanroom jobs for their scrape sessions
CREATE POLICY "Researchers can view their cleanroom_jobs"
    ON cleanroom_jobs FOR SELECT
    USING (
        agency_id = auth.user_agency_id()
        AND auth.user_role() = 'researcher'
        AND scrape_session_id IN (
            SELECT id FROM scrape_sessions WHERE researcher_id = auth.uid()
        )
    );

-- ============================================================================
-- RESEARCHER_SCORES POLICIES
-- ============================================================================

-- Super admins can view all scores
CREATE POLICY "Super admins have full access to researcher_scores"
    ON researcher_scores FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view scores in their agency
CREATE POLICY "Agency admins can view scores in their agency"
    ON researcher_scores FOR SELECT
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can view their own scores
CREATE POLICY "Researchers can view their own scores"
    ON researcher_scores FOR SELECT
    USING (researcher_id = auth.uid() AND auth.user_role() = 'researcher');

-- ============================================================================
-- TIME_LOGS POLICIES
-- ============================================================================

-- Super admins can manage all time logs
CREATE POLICY "Super admins have full access to time_logs"
    ON time_logs FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view time logs in their agency
CREATE POLICY "Agency admins can view time_logs in their agency"
    ON time_logs FOR SELECT
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Researchers can manage their own time logs
CREATE POLICY "Researchers can manage their own time_logs"
    ON time_logs FOR ALL
    USING (
        agency_id = auth.user_agency_id()
        AND auth.user_role() = 'researcher'
        AND researcher_id = auth.uid()
    );

-- ============================================================================
-- COST_SNAPSHOTS POLICIES
-- ============================================================================

-- Super admins can manage all cost snapshots
CREATE POLICY "Super admins have full access to cost_snapshots"
    ON cost_snapshots FOR ALL
    USING (auth.user_role() = 'super_admin');

-- Agency admins can view cost snapshots in their agency
CREATE POLICY "Agency admins can view cost_snapshots in their agency"
    ON cost_snapshots FOR SELECT
    USING (agency_id = auth.user_agency_id() AND auth.user_role() = 'agency_admin');

-- Clients can view cost snapshots for their campaigns
CREATE POLICY "Clients can view cost_snapshots for their campaigns"
    ON cost_snapshots FOR SELECT
    USING (
        auth.user_role() = 'client'
        AND campaign_id IN (
            SELECT id FROM campaigns
            WHERE client_id IN (
                SELECT id FROM clients WHERE agency_id = auth.user_agency_id()
            )
        )
    );
