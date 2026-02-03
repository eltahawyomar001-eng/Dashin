-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'agency_admin', 'researcher', 'client');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'unqualified', 'archived');
CREATE TYPE lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE scraping_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Agencies table (must be created BEFORE users table since users references it)
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role user_role DEFAULT 'client',
  agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status campaign_status DEFAULT 'draft',
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  target_criteria JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"leads_count": 0, "qualified_count": 0, "converted_count": 0}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Contact information
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  
  -- Lead details
  status lead_status DEFAULT 'new',
  priority lead_priority DEFAULT 'medium',
  score INTEGER DEFAULT 0,
  source TEXT,
  industry TEXT,
  company_size TEXT,
  location TEXT,
  
  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[],
  notes TEXT,
  
  -- Timestamps
  last_contacted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  status scraping_job_status DEFAULT 'pending',
  source_url TEXT,
  config JSONB DEFAULT '{}',
  
  -- Progress tracking
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  successful_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  
  -- Results
  results JSONB DEFAULT '[]',
  error_log TEXT[],
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead activities table (for tracking interactions)
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  activity_type TEXT NOT NULL, -- 'email_sent', 'call_made', 'meeting_scheduled', 'note_added', etc.
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Metrics
  leads_added INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  meetings_scheduled INTEGER DEFAULT 0,
  
  -- Calculated metrics
  conversion_rate DECIMAL(5,2),
  qualification_rate DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(campaign_id, date)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_agency ON users(agency_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_campaigns_agency ON campaigns(agency_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_leads_agency ON leads(agency_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);

CREATE INDEX idx_scraping_jobs_campaign ON scraping_jobs(campaign_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);

CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_user ON lead_activities(user_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at);

CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_jobs_updated_at BEFORE UPDATE ON scraping_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Users can read their own data (simple auth check, no recursive query)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (
    auth.uid() = id
  );

-- Users can update their own data  
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Allow users to INSERT their own profile (for handle_new_user trigger)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Note: Super admin and agency admin policies removed to prevent infinite recursion
-- These should be implemented with service role or separate admin tables if needed

-- Campaigns: Users can view campaigns in their agency
CREATE POLICY "Users can view agency campaigns" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND agency_id = campaigns.agency_id
    )
  );

-- Campaigns: Agency admins can manage campaigns
CREATE POLICY "Agency admins can manage campaigns" ON campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
        AND role IN ('agency_admin', 'super_admin')
        AND agency_id = campaigns.agency_id
    )
  );

-- Leads: Users can view leads in their agency
CREATE POLICY "Users can view agency leads" ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND agency_id = leads.agency_id
    )
  );

-- Leads: Researchers and admins can manage leads
CREATE POLICY "Researchers can manage leads" ON leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
        AND role IN ('researcher', 'agency_admin', 'super_admin')
        AND agency_id = leads.agency_id
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Users can view agency scraping jobs" ON scraping_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN campaigns c ON c.id = scraping_jobs.campaign_id
      WHERE u.id = auth.uid() AND u.agency_id = c.agency_id
    )
  );

CREATE POLICY "Users can view lead activities" ON lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN leads l ON l.id = lead_activities.lead_id
      WHERE u.id = auth.uid() AND u.agency_id = l.agency_id
    )
  );

CREATE POLICY "Users can view campaign analytics" ON campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN campaigns c ON c.id = campaign_analytics.campaign_id
      WHERE u.id = auth.uid() AND u.agency_id = c.agency_id
    )
  );

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
