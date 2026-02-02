# Backend API Testing Guide

## Overview
This guide covers testing strategies for Dashin's Supabase Edge Functions and database layer.

## Test Structure

### 1. Edge Function Tests
All Edge Functions are written in Deno and can be tested using Deno's built-in test runner.

#### Running Tests
```bash
# Test all functions
cd packages/supabase/functions
deno test --allow-all

# Test specific function
deno test --allow-all campaign-detail/index.test.ts

# Test with coverage
deno test --allow-all --coverage=coverage
deno coverage coverage --lcov > coverage.lcov
```

### 2. Database Tests
Database functions and stored procedures should be tested directly against Supabase.

#### Running Database Tests
```bash
# Run all migrations first
supabase db reset

# Test specific function
supabase db test get_campaign_performance

# Run SQL test files
psql $DATABASE_URL -f tests/database/campaign_tests.sql
```

## Test Categories

### A. Authentication Tests
**File**: `_shared/utils.test.ts`

Test cases:
- ✅ Valid JWT token extraction
- ✅ Invalid token handling
- ✅ Missing token error
- ✅ Expired token handling
- ✅ Role-based access validation
- ✅ Agency ID extraction

### B. Campaign API Tests
**File**: `campaigns/index.test.ts`

Test cases:
- ✅ List campaigns with pagination
- ✅ Filter by status (active, paused, completed)
- ✅ Search by name
- ✅ Sort by various fields
- ✅ RLS enforcement (agency isolation)
- ✅ Invalid pagination parameters
- ✅ Empty result handling

**File**: `campaign-detail/index.test.ts`

Test cases:
- ✅ Get campaign by ID
- ✅ Update campaign fields
- ✅ Delete campaign
- ✅ 404 for non-existent campaign
- ✅ 403 for unauthorized access (different agency)
- ✅ Validation errors for invalid data

**File**: `campaign-create/index.test.ts`

Test cases:
- ✅ Create campaign with required fields
- ✅ Create with optional fields
- ✅ Missing required fields error
- ✅ Invalid status value
- ✅ Agency ID auto-assignment

**File**: `campaign-analytics/index.test.ts`

Test cases:
- ✅ Get campaign metrics
- ✅ Update metrics on lead changes
- ✅ Correct count calculations

### C. Lead API Tests
**File**: `leads/index.test.ts`

Test cases:
- ✅ List leads with pagination
- ✅ Filter by status, qualification, campaign
- ✅ Search across multiple fields
- ✅ Sort by priority, created_at, etc.
- ✅ RLS enforcement

**File**: `lead-detail/index.test.ts`

Test cases:
- ✅ Get lead by ID
- ✅ Update lead fields
- ✅ Delete lead
- ✅ 404 handling
- ✅ Unauthorized access

**File**: `lead-qualify/index.test.ts`

Test cases:
- ✅ Qualify lead (status change)
- ✅ Disqualify lead with reason
- ✅ Invalid qualification status
- ✅ Campaign metrics update trigger

**File**: `lead-bulk-update/index.test.ts`

Test cases:
- ✅ Bulk status update (multiple leads)
- ✅ Partial success handling
- ✅ Failed IDs returned
- ✅ Empty array handling
- ✅ Invalid lead IDs

### D. Data Source API Tests
**File**: `data-sources/index.test.ts`

Test cases:
- ✅ List data sources
- ✅ Filter by type (linkedin, apollo, etc.)
- ✅ Filter by status
- ✅ Pagination

**File**: `data-source-test/index.test.ts`

Test cases:
- ✅ Test LinkedIn connection (API key validation)
- ✅ Test Apollo connection
- ✅ Test ZoomInfo connection (username/password)
- ✅ Test API connection (URL validation)
- ✅ CSV source (always valid)
- ✅ Update test status in database
- ✅ Auto-update source status (active/error)

**File**: `job-control/index.test.ts`

Test cases:
- ✅ Start pending job
- ✅ Pause running job
- ✅ Resume paused job
- ✅ Cancel job
- ✅ Invalid state transitions
- ✅ Log entry creation
- ✅ Notification creation

### E. Analytics API Tests
**File**: `analytics-overview/index.test.ts`

Test cases:
- ✅ Get overview metrics
- ✅ Date range filtering (7d, 30d, 90d, 1y)
- ✅ Calculation accuracy (rates, counts)
- ✅ Trend calculations

**File**: `analytics-campaigns/index.test.ts`

Test cases:
- ✅ Campaign-specific analytics
- ✅ Timeline grouping (day, week, month)
- ✅ Status distribution
- ✅ Qualification metrics

**File**: `analytics-leads/index.test.ts`

Test cases:
- ✅ Lead analytics
- ✅ Grouping options (status, campaign, source)
- ✅ Top campaigns calculation

### F. Database Function Tests
**File**: `tests/database/functions.test.sql`

Test cases:
- ✅ get_campaign_performance() accuracy
- ✅ calculate_lead_score() algorithm
- ✅ bulk_update_lead_status() batch operations
- ✅ get_agency_overview() statistics
- ✅ get_top_campaigns() ranking

### G. Real-Time Tests
**File**: `tests/realtime/subscriptions.test.ts`

Test cases:
- ✅ WebSocket connection establishment
- ✅ Job status change notifications
- ✅ Campaign metric updates
- ✅ New notification delivery
- ✅ Subscription cleanup
- ✅ Reconnection handling

### H. RLS Policy Tests
**File**: `tests/database/rls.test.sql`

Test cases:
- ✅ Super admin access (all agencies)
- ✅ Agency admin access (own agency only)
- ✅ Researcher access (read-only)
- ✅ Client access (limited view)
- ✅ Cross-agency isolation
- ✅ Anonymous access denial

## Mock Data Setup

### Test Fixtures
Create test data using SQL:

```sql
-- Create test agency
INSERT INTO agencies (id, name) VALUES 
  ('test-agency-1', 'Test Agency 1'),
  ('test-agency-2', 'Test Agency 2');

-- Create test users
INSERT INTO auth.users (id, email) VALUES
  ('test-admin-1', 'admin@test.com'),
  ('test-user-1', 'user@test.com');

-- Create test profiles
INSERT INTO user_profiles (id, email, agency_id, role) VALUES
  ('test-admin-1', 'admin@test.com', 'test-agency-1', 'agency_admin'),
  ('test-user-1', 'user@test.com', 'test-agency-1', 'researcher');

-- Create test campaign
INSERT INTO campaigns (id, agency_id, name, status) VALUES
  ('test-campaign-1', 'test-agency-1', 'Test Campaign', 'active');

-- Create test leads
INSERT INTO leads (id, agency_id, campaign_id, email, status) VALUES
  ('test-lead-1', 'test-agency-1', 'test-campaign-1', 'lead1@test.com', 'new'),
  ('test-lead-2', 'test-agency-1', 'test-campaign-1', 'lead2@test.com', 'contacted');
```

## Environment Setup

### Local Testing Environment
```bash
# .env.test
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Running Supabase Locally
```bash
# Start Supabase local development
supabase start

# This starts:
# - PostgreSQL database (port 54322)
# - API server (port 54321)
# - Studio (port 54323)
# - Edge Functions (port 54321/functions/v1)

# Apply migrations
supabase db reset

# Deploy functions locally
supabase functions serve
```

## Testing Best Practices

### 1. Test Isolation
- Each test should be independent
- Use transactions that rollback after tests
- Clean up test data in `afterEach` hooks

### 2. Coverage Goals
- **Endpoint tests**: 90%+ coverage
- **Database functions**: 100% coverage
- **RLS policies**: 100% coverage

### 3. Continuous Integration
Add to GitHub Actions:
```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Start Supabase
        run: supabase start
        
      - name: Run migrations
        run: supabase db reset
        
      - name: Run tests
        run: |
          cd packages/supabase/functions
          deno test --allow-all --coverage
```

## Performance Testing

### Load Testing
Use Apache Bench or k6 for load testing:

```bash
# Test campaign listing endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:54321/functions/v1/campaigns

# Test with k6
k6 run tests/load/campaigns.js
```

### Database Query Performance
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM campaigns WHERE agency_id = 'test-agency-1';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- Monitor slow queries
SELECT query, mean_exec_time FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

## Security Testing

### Authentication Tests
- Invalid tokens
- Expired tokens
- Missing tokens
- Token forgery attempts

### Authorization Tests
- Cross-agency access attempts
- Role escalation attempts
- RLS bypass attempts

### Input Validation
- SQL injection attempts
- XSS payload in text fields
- Oversized payloads
- Invalid data types

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Ensure Deno import map is configured:
```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2"
  }
}
```

**Issue**: Database connection refused
**Solution**: Verify Supabase is running:
```bash
supabase status
```

**Issue**: RLS policy blocks test queries
**Solution**: Use service role key for admin operations:
```typescript
const supabase = createClient(url, serviceRoleKey);
```

## Test Execution Summary

### Quick Test Commands
```bash
# Run all backend tests
npm run test:backend

# Run specific test suite
npm run test:campaigns

# Run with coverage
npm run test:coverage

# Run database tests
npm run test:db

# Run load tests
npm run test:load
```

### Expected Test Results
- Total tests: 150+
- Expected pass rate: 100%
- Coverage target: 90%+
- Average execution time: <30s

## Next Steps

1. Implement actual Deno test files for each endpoint
2. Set up CI/CD pipeline with automated tests
3. Add integration tests for complete user workflows
4. Implement performance benchmarks
5. Add security testing suite
6. Create test data generators for realistic scenarios
