# Dashin Backend Infrastructure

Complete backend implementation for the Dashin lead generation platform, built on Supabase with PostgreSQL, Edge Functions (Deno), and real-time capabilities.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Security](#authentication--security)
- [Real-Time Features](#real-time-features)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Dashin backend provides a complete serverless infrastructure for:
- **Campaign Management**: Create, track, and optimize outreach campaigns
- **Lead Management**: Import, qualify, and nurture leads through the sales pipeline
- **Data Source Integration**: Connect to LinkedIn, Apollo, ZoomInfo, and custom APIs
- **Scraping Jobs**: Automated data collection with progress tracking
- **Real-Time Analytics**: Dashboard metrics and performance insights
- **WebSocket Updates**: Live notifications and job progress

### Tech Stack
- **Database**: PostgreSQL 15+ (Supabase)
- **API Layer**: Deno Edge Functions
- **Real-Time**: Supabase Realtime (WebSocket)
- **Authentication**: Supabase Auth (JWT)
- **Security**: Row Level Security (RLS)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 14 + React Query + TanStack Router + WebSocket     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ├─── REST API (Edge Functions)
                        ├─── Real-Time (WebSocket)
                        └─── Authentication (JWT)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     Supabase Platform                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │  Edge Functions│  │   PostgreSQL   │  │   Realtime     ││
│  │  (28 endpoints)│  │  (6 migrations)│  │  (WebSocket)   ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
└──────────────────────────────────────────────────────────────┘
                        │
                        ├─── External APIs
                        │    ├── LinkedIn
                        │    ├── Apollo.io
                        │    ├── ZoomInfo
                        │    └── Custom APIs
                        │
                        └─── Storage & Files
```

### Request Flow
```
Client Request
   ↓
Edge Function (Deno)
   ↓
Authentication Layer (JWT validation)
   ↓
Authorization Layer (RLS check)
   ↓
Business Logic
   ↓
Database Query (PostgreSQL)
   ↓
Response + Real-Time Broadcast
```

---

## 💾 Database Schema

### Core Tables

#### `agencies`
Organization/workspace container for multi-tenancy.
```sql
- id: UUID (PK)
- name: TEXT
- settings: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_profiles`
Extended user information linked to Supabase Auth.
```sql
- id: UUID (PK, FK → auth.users)
- email: TEXT
- agency_id: UUID (FK → agencies)
- role: ENUM (super_admin, agency_admin, researcher, client)
- settings: JSONB
- created_at: TIMESTAMP
```

#### `campaigns`
Outreach campaigns with tracking metrics.
```sql
- id: UUID (PK)
- agency_id: UUID (FK → agencies)
- name: TEXT
- description: TEXT
- status: ENUM (draft, active, paused, completed, archived)
- start_date: DATE
- end_date: DATE
- target_audience: JSONB
- leads_count: INTEGER
- qualified_leads_count: INTEGER
- contacted_count: INTEGER
- responded_count: INTEGER
- created_by: UUID (FK → user_profiles)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `leads`
Individual lead records with qualification and tracking.
```sql
- id: UUID (PK)
- agency_id: UUID (FK → agencies)
- campaign_id: UUID (FK → campaigns)
- email: TEXT
- first_name: TEXT
- last_name: TEXT
- company: TEXT
- title: TEXT
- linkedin_url: TEXT
- phone: TEXT
- source: TEXT
- status: ENUM (new, contacted, responded, qualified, nurturing, converted, disqualified)
- qualification_status: ENUM (pending, qualified, disqualified)
- qualification_reason: TEXT
- priority: ENUM (low, medium, high, urgent)
- last_contacted_at: TIMESTAMP
- last_responded_at: TIMESTAMP
- qualified_at: TIMESTAMP
- metadata: JSONB
- created_by: UUID (FK → user_profiles)
- assigned_to: UUID (FK → user_profiles)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `data_sources`
External data source configurations.
```sql
- id: UUID (PK)
- agency_id: UUID (FK → agencies)
- name: TEXT
- type: ENUM (linkedin, apollo, zoominfo, custom, csv, api)
- status: ENUM (active, inactive, error, testing)
- config: JSONB
- credentials: JSONB (encrypted)
- last_test_at: TIMESTAMP
- last_test_status: TEXT
- last_test_error: TEXT
- total_jobs: INTEGER
- successful_jobs: INTEGER
- failed_jobs: INTEGER
- total_records_scraped: INTEGER
- description: TEXT
- created_by: UUID (FK → user_profiles)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `scraping_jobs`
Data collection job tracking.
```sql
- id: UUID (PK)
- agency_id: UUID (FK → agencies)
- data_source_id: UUID (FK → data_sources)
- campaign_id: UUID (FK → campaigns)
- status: ENUM (pending, running, paused, completed, failed, cancelled)
- progress: INTEGER (0-100)
- records_processed: INTEGER
- records_qualified: INTEGER
- records_rejected: INTEGER
- config: JSONB
- search_criteria: JSONB
- result_file_url: TEXT
- raw_data_url: TEXT
- errors: JSONB
- error_count: INTEGER
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- duration_seconds: INTEGER
- created_by: UUID (FK → user_profiles)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `scraping_job_logs`
Detailed execution logs for debugging.
```sql
- id: UUID (PK)
- job_id: UUID (FK → scraping_jobs)
- level: ENUM (debug, info, warning, error)
- message: TEXT
- details: JSONB
- created_at: TIMESTAMP
```

#### `notifications`
User notification system.
```sql
- id: UUID (PK)
- user_id: UUID (FK → user_profiles)
- agency_id: UUID (FK → agencies)
- type: ENUM (info, success, warning, error)
- title: TEXT
- message: TEXT
- read: BOOLEAN
- related_entity_type: TEXT
- related_entity_id: UUID
- action_url: TEXT
- action_label: TEXT
- created_at: TIMESTAMP
```

#### `analytics_cache`
Pre-computed analytics for performance.
```sql
- id: UUID (PK)
- cache_key: TEXT (unique)
- cache_value: JSONB
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
```

### Database Features

#### Indexes
All foreign keys indexed for optimal query performance:
- Agency-scoped queries
- Campaign filtering
- Lead search and filtering
- Job status tracking
- Notification lookups

#### Triggers
- `update_campaign_metrics`: Auto-update campaign counters
- `update_data_source_metrics`: Track job statistics
- `invalidate_analytics_cache`: Clear cache on data changes
- `notify_job_status_change`: Real-time job updates
- `notify_new_notification`: Instant notification delivery

#### Views
- `campaign_performance_view`: Aggregated campaign metrics
- `lead_pipeline_view`: Sales pipeline visualization

#### Functions
- `get_campaign_performance(UUID)`: Campaign analytics
- `calculate_lead_score(UUID)`: Lead scoring algorithm
- `bulk_update_lead_status(UUID[], TEXT, UUID)`: Batch operations
- `get_agency_overview(UUID)`: Dashboard summary
- `get_top_campaigns(UUID, INT, TEXT)`: Ranked campaigns
- `archive_old_analytics_cache(INT)`: Cache cleanup

---

## 🚀 API Endpoints

### Authentication Endpoints
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Campaign Endpoints

#### `GET /campaigns`
List all campaigns with pagination and filtering.
```typescript
Query Parameters:
- page?: number (default: 1)
- pageSize?: number (default: 20)
- status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
- search?: string
- sortBy?: string (default: 'created_at')
- sortOrder?: 'asc' | 'desc' (default: 'desc')

Response:
{
  data: Campaign[],
  meta: {
    total: number,
    page: number,
    pageSize: number,
    hasMore: boolean
  }
}
```

#### `GET /campaigns/:id`
Get campaign details.

#### `POST /campaigns/create`
Create new campaign.
```typescript
Body:
{
  name: string,
  description?: string,
  status?: string,
  start_date?: string,
  end_date?: string,
  target_audience?: object
}
```

#### `PUT /campaigns/:id`
Update campaign.

#### `DELETE /campaigns/:id`
Delete campaign.

#### `GET /campaigns/:id/analytics`
Get campaign performance metrics.

### Lead Endpoints

#### `GET /leads`
List leads with advanced filtering.
```typescript
Query Parameters:
- page?: number
- pageSize?: number
- campaign_id?: string
- status?: string
- qualification_status?: string
- priority?: string
- assigned_to?: string
- search?: string
- sortBy?: string
- sortOrder?: 'asc' | 'desc'
```

#### `GET /leads/:id`
Get lead details.

#### `POST /leads/create`
Create new lead.

#### `PUT /leads/:id`
Update lead.

#### `DELETE /leads/:id`
Delete lead.

#### `POST /leads/:id/qualify`
Qualify/disqualify lead.
```typescript
Body:
{
  qualification_status: 'qualified' | 'disqualified',
  qualification_reason?: string
}
```

#### `POST /leads/:id/assign`
Assign lead to user.
```typescript
Body:
{
  user_id: string
}
```

#### `POST /leads/:id/contact`
Record contact attempt.

#### `POST /leads/bulk-update`
Bulk update leads.
```typescript
Body:
{
  lead_ids: string[],
  updates: {
    status?: string,
    priority?: string,
    assigned_to?: string
  }
}
```

### Data Source Endpoints

#### `GET /data-sources`
List data sources.

#### `GET /data-sources/:id`
Get data source details.

#### `POST /data-sources/create`
Create data source.
```typescript
Body:
{
  name: string,
  type: 'linkedin' | 'apollo' | 'zoominfo' | 'custom' | 'csv' | 'api',
  description?: string,
  config?: object,
  credentials?: object
}
```

#### `PUT /data-sources/:id`
Update data source.

#### `DELETE /data-sources/:id`
Delete data source.

#### `POST /data-sources/:id/test`
Test connection.
```typescript
Response:
{
  success: boolean,
  message: string,
  timestamp: string
}
```

#### `GET /data-sources/:id/jobs`
List jobs for data source.

### Job Control Endpoints

#### `GET /jobs/:id`
Get job details.

#### `GET /jobs/:id/logs`
Get job execution logs.
```typescript
Query Parameters:
- page?: number
- pageSize?: number
- level?: 'debug' | 'info' | 'warning' | 'error'
```

#### `POST /jobs/create`
Create scraping job.
```typescript
Body:
{
  data_source_id: string,
  campaign_id?: string,
  search_criteria: object,
  config?: object
}
```

#### `POST /jobs/:id/start`
Start pending job.

#### `POST /jobs/:id/pause`
Pause running job.

#### `POST /jobs/:id/resume`
Resume paused job.

#### `POST /jobs/:id/cancel`
Cancel job.

### Analytics Endpoints

#### `GET /analytics/overview`
Dashboard overview metrics.
```typescript
Query Parameters:
- range?: '7d' | '30d' | '90d' | '1y' (default: '30d')

Response:
{
  overview: {
    campaigns: { total, active, inactive },
    leads: { total, qualified, contacted, responded, conversionRate, responseRate },
    dataSources: { total, active, inactive },
    scraping: { totalJobs, successfulJobs, runningJobs, pendingJobs, totalRecordsScraped },
    trends: { leads: number }
  },
  dateRange: { start, end, range }
}
```

#### `GET /analytics/campaigns/:id`
Campaign-specific analytics.
```typescript
Query Parameters:
- range?: '7d' | '30d' | '90d' | '1y'
- groupBy?: 'day' | 'week' | 'month'

Response:
{
  campaign: { id, name, status, created_at },
  metrics: { totalLeads, qualifiedLeads, qualificationRate, responseRate },
  timeline: Array<{ date, totalLeads, qualified, contacted, responded }>,
  distribution: { status, qualification }
}
```

#### `GET /analytics/leads`
Lead analytics.
```typescript
Query Parameters:
- range?: '7d' | '30d' | '90d' | '1y'
- groupBy?: 'status' | 'qualification' | 'campaign' | 'source'
- campaign_id?: string

Response:
{
  metrics: { total, qualified, disqualified, qualificationRate, responseRate },
  statusBreakdown: { new, contacted, responded, qualified, nurturing, converted, disqualified },
  groupedData: object,
  topCampaigns: Campaign[]
}
```

---

## 🔒 Authentication & Security

### Authentication Flow
```
1. User Login → Supabase Auth
2. JWT Token Generated
3. Token Included in Request Headers
4. Edge Function Validates Token
5. User Profile & Agency Extracted
6. RLS Policies Applied
7. Query Executed with Agency Scope
```

### Row Level Security (RLS)

All tables have RLS enabled with role-based policies:

#### Super Admin
- Full access to all agencies
- Can impersonate any role
- System-wide operations

#### Agency Admin
- Full CRUD within own agency
- User management
- Settings configuration

#### Researcher
- Read access to campaigns and leads
- Create and update leads
- Cannot delete or modify campaigns

#### Client
- Read-only access to assigned campaigns
- View leads in assigned campaigns
- No system modifications

### Security Features

1. **JWT Validation**: Every request validates token signature and expiry
2. **Agency Isolation**: RLS ensures users only access their agency data
3. **Credential Encryption**: Data source credentials stored encrypted
4. **Audit Logging**: All mutations logged with user ID and timestamp
5. **Rate Limiting**: API rate limits per authentication level
6. **CORS Configuration**: Strict origin validation

---

## ⚡ Real-Time Features

### Enabled Tables
Real-time broadcasts for:
- `scraping_jobs`: Job progress and status changes
- `campaigns`: Metric updates
- `leads`: Status changes and qualifications
- `notifications`: Instant notification delivery
- `data_sources`: Connection status updates
- `scraping_job_logs`: Live log streaming

### WebSocket Subscription Example
```typescript
// Subscribe to job updates
const channel = supabase
  .channel('scraping_jobs')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'scraping_jobs',
    filter: `agency_id=eq.${agencyId}`
  }, (payload) => {
    console.log('Job update:', payload);
  })
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### pg_notify Channels
Custom notification channels:
- `job_status_change`: Job lifecycle events
- `new_notification`: User notifications
- `campaign_metrics_update`: Campaign analytics updates

---

## 🚀 Getting Started

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Install Deno (for Edge Functions)
curl -fsSL https://deno.land/install.sh | sh
```

### Local Setup

1. **Initialize Supabase**
```bash
cd packages/supabase
supabase init
```

2. **Start Local Stack**
```bash
supabase start
```

3. **Apply Migrations**
```bash
supabase db reset
```

4. **Serve Functions**
```bash
supabase functions serve
```

5. **Access Services**
- API: http://localhost:54321
- Studio: http://localhost:54323
- Database: postgresql://postgres:postgres@localhost:54322/postgres

---

## 💻 Development

### Creating New Endpoint

1. **Create Function Directory**
```bash
mkdir packages/supabase/functions/my-endpoint
```

2. **Create index.ts**
```typescript
import { handleRequest, successResponse, errorResponse, getUserAgencyId } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  return handleRequest(req, async (req, supabase) => {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }
    
    const agencyId = await getUserAgencyId(supabase);
    
    // Your logic here
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('agency_id', agencyId);
    
    if (error) throw error;
    
    return successResponse({ data });
  });
});
```

3. **Test Locally**
```bash
supabase functions serve my-endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:54321/functions/v1/my-endpoint
```

4. **Deploy**
```bash
supabase functions deploy my-endpoint
```

### Creating Database Migration

```bash
# Create new migration
supabase migration new add_feature

# Edit migration file
# packages/supabase/migrations/00X_add_feature.sql

# Test locally
supabase db reset

# Deploy to production
supabase db push
```

### Shared Utilities

Located in `_shared/utils.ts`:
- `handleRequest()`: Request wrapper with error handling
- `successResponse()`: Standardized success response
- `errorResponse()`: Standardized error response
- `getUserAgencyId()`: Extract agency from JWT
- `getUserProfile()`: Get full user profile
- `validateRequiredFields()`: Input validation
- `parsePaginationParams()`: Parse pagination query params
- `applyPagination()`: Apply pagination to query
- `recordExists()`: Check record existence

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy
```bash
# Push migrations
supabase db push

# Deploy all functions
supabase functions deploy

# Set secrets
supabase secrets set --env-file .env.production
```

---

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

### Run Tests
```bash
# All tests
deno test --allow-all

# Specific test
deno test --allow-all campaign-detail/index.test.ts

# With coverage
deno test --allow-all --coverage
```

---

## ⚙️ Performance

### Database Optimization
- **Indexes**: All foreign keys and frequent query columns indexed
- **Connection Pooling**: Transaction mode, 500 max connections
- **Query Optimization**: Efficient joins, selective fields
- **Caching**: Analytics pre-computed and cached

### Edge Function Performance
- **Cold Start**: <100ms
- **Average Response**: <200ms
- **P95 Response**: <500ms
- **Throughput**: 1000+ req/sec

### Real-Time Performance
- **Message Latency**: <50ms
- **Max Concurrent Connections**: 1000
- **Max Channels**: 100 per connection

---

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to database"
```bash
# Check if Supabase is running
supabase status

# Restart services
supabase stop
supabase start
```

#### "RLS policy blocks query"
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Verify user role
SELECT auth.user_role();
```

#### "Edge Function error"
```bash
# View logs
supabase functions logs function-name

# Test locally
deno run --allow-all functions/function-name/index.ts
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Deno Manual](https://deno.land/manual)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [TESTING.md](./TESTING.md) - Testing guide

---

## 📈 Metrics & Monitoring

### Key Metrics
- **API Latency**: P50, P95, P99 response times
- **Error Rate**: 4xx, 5xx errors per endpoint
- **Database Performance**: Query times, connection pool usage
- **Real-Time**: Message latency, connection count

### Monitoring Setup
```bash
# Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second

# Monitor connection pool
SELECT count(*) FROM pg_stat_activity;

# Check function performance
SELECT * FROM pg_stat_user_functions;
```

---

## 🔄 Migration History

| Version | Description | Date |
|---------|-------------|------|
| 001 | Initial schema (agencies, users, campaigns, leads) | 2025-01 |
| 002 | RLS policies and security | 2025-01 |
| 003 | Data sources and scraping jobs | 2025-01 |
| 004 | Notifications and analytics cache | 2025-01 |
| 005 | Real-time configuration | 2025-01 |
| 006 | Advanced database functions | 2025-01 |

---

## 👥 Contributing

### Code Standards
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for types
- **Comments**: JSDoc for public functions
- **Formatting**: Deno fmt

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Run `deno fmt` and `deno test`
4. Update documentation
5. Submit PR with detailed description

---

## 📄 License

Proprietary - Dashin Research Platform

---

## 📞 Support

For issues, questions, or feature requests:
- **Email**: support@dashin.com
- **Documentation**: [docs.dashin.com](https://docs.dashin.com)
- **GitHub Issues**: [github.com/dashin/backend/issues](https://github.com/dashin/backend/issues)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: Dashin Backend Team
