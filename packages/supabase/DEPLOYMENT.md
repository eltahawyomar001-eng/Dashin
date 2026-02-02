# Dashin Backend Deployment Guide

## Overview
Complete guide for deploying the Dashin backend infrastructure on Supabase, including Edge Functions, database migrations, and environment configuration.

---

## Prerequisites

### Required Tools
- **Supabase CLI**: `npm install -g supabase`
- **Supabase Account**: Sign up at https://supabase.com
- **Git**: For version control
- **Node.js**: v18+ (for local development)
- **PostgreSQL**: Client tools (optional, for direct DB access)

### Required Access
- Supabase project owner or admin access
- GitHub repository access (if using CI/CD)
- Production environment secrets

---

## Environment Setup

### 1. Local Development Environment

#### Create Local Environment File
```bash
# packages/supabase/.env.local
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRY=3600
```

#### Start Local Supabase
```bash
# Initialize Supabase (first time only)
cd packages/supabase
supabase init

# Link to your project (optional, for production sync)
supabase link --project-ref your-project-ref

# Start local development stack
supabase start

# Output will show:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Inbucket URL: http://localhost:54324 (email testing)
# - anon key: eyJhbG...
# - service_role key: eyJhbG...
```

#### Apply Migrations Locally
```bash
# Reset database and apply all migrations
supabase db reset

# Apply specific migration
supabase migration up

# Create new migration
supabase migration new migration_name
```

#### Serve Functions Locally
```bash
# Serve all Edge Functions
supabase functions serve

# Serve specific function
supabase functions serve campaign-detail

# Access functions at:
# http://localhost:54321/functions/v1/{function-name}
```

### 2. Production Environment

#### Environment Variables
Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Production Environment Variables
SUPABASE_PROJECT_ID=prod-project-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key

# JWT Configuration (CRITICAL - Use strong secret!)
JWT_SECRET=production-super-secret-jwt-key-min-32-chars-random
JWT_ALGORITHM=HS256
JWT_EXPIRY=3600

# Optional: External Services
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
APOLLO_API_KEY=your-apollo-api-key
ZOOMINFO_API_KEY=your-zoominfo-api-key
```

#### Set Secrets via CLI
```bash
# Set individual secret
supabase secrets set JWT_SECRET=your-secret-key

# Set multiple secrets from .env file
supabase secrets set --env-file .env.production

# List all secrets (values hidden)
supabase secrets list

# Unset a secret
supabase secrets unset SECRET_NAME
```

---

## Database Deployment

### Migration Strategy

#### 1. Development to Production
```bash
# Step 1: Test migrations locally
supabase db reset  # Clean slate
supabase migration up  # Apply all

# Step 2: Generate types (optional, for type safety)
supabase gen types typescript --local > lib/database.types.ts

# Step 3: Push to production
supabase db push

# Step 4: Verify migrations applied
supabase migration list
```

#### 2. Rolling Back Migrations
```bash
# View migration history
supabase migration list

# Rollback to specific version
supabase migration repair --version 20250101000001

# Rollback all (DANGEROUS - only in dev)
supabase db reset
```

#### 3. Zero-Downtime Migrations
For production migrations without downtime:

```sql
-- Example: Adding a column with default
-- Step 1: Add column (non-blocking)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS new_field TEXT;

-- Step 2: Backfill data in batches
UPDATE leads SET new_field = 'default_value' 
WHERE new_field IS NULL 
LIMIT 1000;

-- Step 3: Add constraint after backfill
ALTER TABLE leads ALTER COLUMN new_field SET NOT NULL;

-- Step 4: Add index concurrently (non-blocking)
CREATE INDEX CONCURRENTLY idx_leads_new_field ON leads(new_field);
```

### Database Backup

#### Manual Backup
```bash
# Backup entire database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup specific schema
pg_dump -n public $DATABASE_URL > public_backup.sql

# Restore from backup
psql $DATABASE_URL < backup_20250101.sql
```

#### Automated Backups
Supabase provides automatic daily backups. Configure in Dashboard:
- **Retention**: 7 days (free tier), 30+ days (pro+)
- **Point-in-Time Recovery**: Enable in pro tier
- **Access**: Dashboard → Database → Backups

---

## Edge Functions Deployment

### Deploy All Functions
```bash
# Deploy all functions to production
supabase functions deploy

# Output shows each function being deployed:
# - campaigns
# - campaign-detail
# - campaign-create
# - leads
# - lead-detail
# ... (28 functions total)
```

### Deploy Specific Function
```bash
# Deploy single function
supabase functions deploy campaign-detail

# Deploy with custom import map
supabase functions deploy campaign-detail --import-map import_map.json

# Deploy with environment variables
supabase functions deploy campaign-detail --env-file .env.production
```

### Function Versioning
```bash
# Tag functions with version
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Deploy specific version
git checkout v1.0.0
supabase functions deploy
```

### Function Monitoring
Access function logs:
```bash
# View logs in real-time
supabase functions logs campaign-detail

# View logs with filters
supabase functions logs campaign-detail --level error

# Export logs
supabase functions logs campaign-detail > function_logs.txt
```

---

## CORS Configuration

### Configure CORS for Frontend
```sql
-- Run in SQL Editor (Dashboard → SQL Editor)

-- Allow your production domain
INSERT INTO storage.cors (
  origin,
  allowed_methods,
  allowed_headers,
  max_age
) VALUES (
  'https://yourdomain.com',
  ARRAY['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ARRAY['Content-Type', 'Authorization', 'apikey'],
  3600
);

-- Allow staging domain
INSERT INTO storage.cors (
  origin,
  allowed_methods,
  allowed_headers,
  max_age
) VALUES (
  'https://staging.yourdomain.com',
  ARRAY['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ARRAY['Content-Type', 'Authorization', 'apikey'],
  3600
);
```

### Update Supabase Dashboard CORS
1. Go to **Settings** → **API** → **CORS**
2. Add allowed origins:
   - `https://yourdomain.com`
   - `https://staging.yourdomain.com`
   - `http://localhost:3000` (development)

---

## Real-Time Configuration

### Enable Real-Time on Tables
Already configured in migration `005_enable_realtime.sql`, but to verify:

```sql
-- Check realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Should show:
-- scraping_jobs, campaigns, leads, notifications, etc.
```

### Configure Realtime Quotas
In Supabase Dashboard → Settings → Realtime:
- **Max Connections**: 1000 (pro tier)
- **Max Channels**: 100 per connection
- **Message Rate**: 100 messages/second

---

## Authentication Configuration

### JWT Configuration
```sql
-- Verify JWT settings in database
SELECT 
  current_setting('app.settings.jwt_secret') as jwt_secret,
  current_setting('app.settings.jwt_exp') as jwt_exp;

-- Update JWT expiry (in seconds)
ALTER DATABASE postgres SET app.settings.jwt_exp = '3600';
```

### Auth Providers
Configure in Dashboard → Authentication → Providers:

1. **Email** (default): Already enabled
2. **OAuth Providers** (optional):
   - Google
   - GitHub
   - LinkedIn (for B2B users)

### Email Templates
Customize in Dashboard → Authentication → Email Templates:
- Confirmation email
- Password reset
- Magic link

---

## Security Configuration

### Row Level Security (RLS)
Already configured in migration `002_rls_policies.sql`. Verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Should return all tables with RLS enabled
```

### API Key Rotation
```bash
# Generate new anon key (Dashboard → Settings → API)
# 1. Generate new key
# 2. Update frontend .env files
# 3. Deploy frontend with new key
# 4. Revoke old key after verification

# Service role key should NEVER be exposed to frontend
# Only use in Edge Functions (server-side)
```

### Rate Limiting
Configure in Dashboard → Settings → API:
- **Anonymous requests**: 60 requests/minute
- **Authenticated requests**: 600 requests/minute
- **Custom limits**: Available in pro tier

---

## Monitoring & Logging

### Enable Logging
```bash
# View Edge Function logs
supabase functions logs

# Filter by function
supabase functions logs campaign-detail

# Filter by level
supabase functions logs --level error

# Stream logs in real-time
supabase functions logs --follow
```

### Database Performance Monitoring
```sql
-- Monitor slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slowest queries
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 20;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### External Monitoring (Optional)
Integrate with:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Infrastructure monitoring
- **New Relic**: APM

---

## Performance Optimization

### Database Indexes
```sql
-- Check missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;

-- Create composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_leads_campaign_status 
ON leads(campaign_id, status);

CREATE INDEX CONCURRENTLY idx_leads_agency_created 
ON leads(agency_id, created_at DESC);
```

### Connection Pooling
Configure in Dashboard → Settings → Database:
- **Connection pooler**: Enabled
- **Pool mode**: Transaction
- **Max connections**: Based on plan (60 for free, 500+ for pro)

### Caching Strategy
Use analytics_cache table (already configured):
```sql
-- Insert computed analytics
INSERT INTO analytics_cache (
  cache_key,
  cache_value,
  expires_at
) VALUES (
  'dashboard_overview_agency_' || p_agency_id,
  computed_data,
  NOW() + INTERVAL '1 hour'
);

-- Retrieve cached data
SELECT cache_value 
FROM analytics_cache 
WHERE cache_key = 'key' AND expires_at > NOW();
```

---

## CI/CD Pipeline

### GitHub Actions Workflow
Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'packages/supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Run Migrations
        run: |
          cd packages/supabase
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Deploy Edge Functions
        run: |
          cd packages/supabase
          supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Run Tests
        run: |
          cd packages/supabase/functions
          deno test --allow-all
```

### Required Secrets
Add to GitHub repository secrets:
- `SUPABASE_ACCESS_TOKEN`: From Supabase Dashboard
- `SUPABASE_PROJECT_REF`: Your project reference ID

---

## Troubleshooting

### Common Issues

#### Issue: Migration fails on production
**Solution**:
```bash
# Check migration status
supabase migration list

# Repair migrations
supabase migration repair --version <last-successful>

# Re-run failed migration
supabase db push
```

#### Issue: Edge Function deployment fails
**Solution**:
```bash
# Check function syntax
cd functions/function-name
deno run --allow-all index.ts

# Deploy with verbose logging
supabase functions deploy function-name --debug
```

#### Issue: RLS blocking legitimate queries
**Solution**:
```sql
-- Temporarily disable RLS (DANGEROUS - dev only!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Fix policy
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ON table_name ...
```

#### Issue: Database connection limit reached
**Solution**:
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
  AND state_change < NOW() - INTERVAL '10 minutes';
```

---

## Maintenance Tasks

### Weekly
- Review function error logs
- Check database performance metrics
- Monitor connection pool usage
- Review slow query log

### Monthly
- Archive old analytics cache
- Review and optimize indexes
- Update dependencies
- Backup verification

### Quarterly
- Security audit
- Performance benchmarking
- Capacity planning
- Cost optimization

---

## Support & Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Deno Docs: https://deno.land/manual
- PostgreSQL Docs: https://www.postgresql.org/docs/

### Community
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

### Emergency Contacts
- Supabase Support: support@supabase.com
- Team Lead: [contact info]
- DevOps: [contact info]

---

## Deployment Checklist

### Pre-Deployment
- [ ] All migrations tested locally
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Rollback plan documented

### Deployment
- [ ] Migrations applied successfully
- [ ] Edge Functions deployed
- [ ] CORS configured
- [ ] Real-time enabled
- [ ] Smoke tests passing

### Post-Deployment
- [ ] Monitor error logs (30 min)
- [ ] Verify key workflows
- [ ] Check performance metrics
- [ ] Update documentation
- [ ] Notify team

---

## Quick Reference

### Essential Commands
```bash
# Local development
supabase start
supabase db reset
supabase functions serve

# Production deployment
supabase db push
supabase functions deploy

# Monitoring
supabase functions logs
supabase db inspect

# Maintenance
supabase migration new <name>
supabase secrets set KEY=value
```

### Connection Strings
```bash
# Local
postgresql://postgres:postgres@localhost:54322/postgres

# Production (Connection Pooler)
postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:6543/postgres

# Production (Direct)
postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained By**: Dashin Development Team
