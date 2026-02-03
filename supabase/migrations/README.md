# Database Setup

This directory contains SQL migrations for the Dashin application database.

## Running Migrations

### Option 1: Via Supabase Dashboard (Recommended for initial setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `001_initial_schema.sql`
5. Click **Run** to execute the migration

### Option 2: Via Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

## Migration Files

### 001_initial_schema.sql

Creates the initial database schema including:

#### Tables
- `users` - User profiles (extends auth.users)
- `agencies` - Agency/organization data
- `campaigns` - Marketing/research campaigns
- `leads` - Lead information and tracking
- `scraping_jobs` - Web scraping job queue
- `lead_activities` - Lead interaction history
- `campaign_analytics` - Campaign metrics and analytics

#### Enum Types
- `user_role` - User permission levels (super_admin, agency_admin, researcher, client)
- `campaign_status` - Campaign states (draft, active, paused, completed, archived)
- `lead_status` - Lead pipeline stages (new, contacted, qualified, converted, unqualified, archived)
- `lead_priority` - Lead urgency (low, medium, high, urgent)
- `scraping_job_status` - Job states (pending, running, completed, failed, cancelled)

#### Features
- **Row Level Security (RLS)** - Policies for multi-tenant data isolation
- **Automatic timestamps** - `created_at` and `updated_at` triggers
- **Indexes** - Optimized queries for common access patterns
- **Foreign keys** - Referential integrity
- **User registration hook** - Auto-creates user profile on signup

## Verifying Migration

After running the migration, verify in the Supabase dashboard:

1. **Database** → **Tables** - Should see all 7 tables
2. **Authentication** → **Policies** - Should see RLS policies enabled
3. **Database** → **Functions** - Should see triggers and functions

## Schema Overview

```
┌─────────────┐
│ auth.users  │  (Supabase Auth)
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
┌──────▼──────┐                   ┌─────▼──────┐
│   users     │◄──────────────────┤  agencies  │
└──────┬──────┘                   └─────┬──────┘
       │                                 │
       │                                 │
       ├─────────────────────────────────┤
       │                                 │
┌──────▼──────┐                   ┌─────▼───────┐
│  campaigns  │◄──────────────────┤    leads    │
└──────┬──────┘                   └─────┬───────┘
       │                                 │
       │                                 │
┌──────▼──────────┐            ┌─────────▼─────────┐
│ scraping_jobs   │            │  lead_activities  │
└─────────────────┘            └───────────────────┘
       │
┌──────▼────────────────┐
│ campaign_analytics    │
└───────────────────────┘
```

## Default User Roles

After migration, users are created with `client` role by default. To upgrade a user to admin:

```sql
-- Update user role via SQL Editor
UPDATE users 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

## Testing the Schema

```sql
-- Test user creation
SELECT * FROM users WHERE id = auth.uid();

-- Test campaign creation
INSERT INTO campaigns (name, description) 
VALUES ('Test Campaign', 'Testing the schema');

-- Test lead creation
INSERT INTO leads (campaign_id, first_name, last_name, email)
SELECT id, 'John', 'Doe', 'john@example.com'
FROM campaigns LIMIT 1;
```

## Troubleshooting

### Error: "relation already exists"
- The tables may already be created
- Drop existing tables or use a fresh database

### Error: "permission denied"
- Ensure you're connected as the database owner
- Check Supabase service role key is configured

### RLS Blocking Access
- Check user is authenticated: `SELECT auth.uid()`
- Verify user has correct role in `users` table
- Review RLS policies in Supabase dashboard
