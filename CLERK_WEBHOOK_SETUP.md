# Clerk to Supabase User Sync Setup

This guide will help you sync user authentication data from Clerk to your Supabase database.

## Prerequisites

✅ Clerk account and application set up
✅ Supabase project with users table created
✅ Webhook endpoint deployed and accessible

## Step 1: Verify Environment Variables

Make sure these environment variables are set in `apps/web/.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...  # ⚠️ This is needed! Get from Clerk dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ Service role key needed for webhook!
```

## Step 2: Get Your Webhook Endpoint URL

Your webhook endpoint is at:
```
https://your-domain.com/api/webhooks/clerk
```

For local development with ngrok:
```bash
# Install ngrok if not already installed
brew install ngrok  # or download from ngrok.com

# Start your dev server
pnpm dev

# In another terminal, create tunnel
ngrok http 3000

# Your webhook URL will be:
https://your-random-id.ngrok.io/api/webhooks/clerk
```

## Step 3: Configure Clerk Webhook

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Navigate to**: Your App → Webhooks (in sidebar)
3. **Click**: "Add Endpoint"
4. **Fill in**:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Subscribe to events**:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - **Message Filtering**: Leave empty (optional)

5. **Click**: "Create"

6. **Copy the Signing Secret**: 
   - After creating, you'll see a signing secret starting with `whsec_`
   - Copy this to your `.env.local` as `CLERK_WEBHOOK_SECRET`

## Step 4: Update Your .env.local

Add the webhook secret:

```env
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

**⚠️ Important**: Restart your dev server after adding this!

## Step 5: Test the Webhook

### Option A: Create a Test User in Clerk

1. Go to Clerk Dashboard → Users
2. Click "Create User"
3. Fill in email and name
4. Check your Supabase users table - user should appear!

### Option B: Sign Up Through Your App

1. Go to `/auth/signup` in your app
2. Create a new account
3. Check Supabase users table

### Option C: Use Clerk's Test Feature

1. In Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "Testing" tab
4. Select `user.created` event
5. Click "Send Example"
6. Check response - should be `200 OK`

## Step 6: Verify in Supabase

Query your users table:

```sql
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

You should see users with:
- `id`: Clerk user ID (starts with `user_`)
- `email`: User's email
- `role`: Default `client`
- `created_at`: Timestamp

## Troubleshooting

### Issue: Webhook returns 400 "Missing svix headers"

**Cause**: Clerk isn't sending proper webhook headers
**Fix**: Make sure endpoint URL is correct in Clerk dashboard

### Issue: "Error verifying webhook"

**Cause**: Wrong `CLERK_WEBHOOK_SECRET`
**Fix**: 
1. Go to Clerk Dashboard → Webhooks
2. Click your endpoint
3. Find "Signing Secret"
4. Copy it exactly to `.env.local`
5. Restart server

### Issue: "Missing CLERK_WEBHOOK_SECRET"

**Cause**: Environment variable not set
**Fix**: Add to `.env.local` and restart server

### Issue: Users not appearing in Supabase

**Cause**: Multiple possible reasons
**Debug**:
1. Check server logs when signing up: `pnpm dev`
2. Look for webhook errors in terminal
3. Check Clerk Dashboard → Webhooks → Your endpoint → Recent deliveries
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key!)

### Issue: "permission denied" in Supabase

**Cause**: Using anon key instead of service role key
**Fix**: 
1. Go to Supabase Dashboard → Settings → API
2. Copy "service_role" key (not "anon" key)
3. Set as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Issue: Webhook works locally but not in production

**Cause**: Environment variables not set in deployment
**Fix**: Add all env vars to your hosting platform (Vercel/Netlify/etc)

## Production Deployment Checklist

- [ ] Add `CLERK_WEBHOOK_SECRET` to production environment
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to production environment  
- [ ] Update Clerk webhook URL to production domain
- [ ] Test webhook with real user signup
- [ ] Monitor webhook deliveries in Clerk dashboard

## Webhook Flow Diagram

```
┌──────────────┐
│  User Signs  │
│   Up in App  │
└───────┬──────┘
        │
        ▼
┌──────────────────┐
│  Clerk Creates   │
│  Auth Account    │
└───────┬──────────┘
        │
        ▼
┌──────────────────┐
│  Clerk Sends     │ user.created event
│  Webhook to API  │────────────────────┐
└──────────────────┘                    │
                                        ▼
                            ┌──────────────────────┐
                            │  /api/webhooks/clerk │
                            │  - Verifies signature│
                            │  - Extracts user data│
                            └───────┬──────────────┘
                                    │
                                    ▼
                            ┌──────────────────┐
                            │  Insert into     │
                            │  Supabase users  │
                            │  table           │
                            └──────────────────┘
```

## Manual User Sync (Backup Method)

If webhooks aren't working, you can manually sync existing Clerk users:

1. Export users from Clerk Dashboard
2. Use this SQL to insert them:

```sql
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES 
  ('user_clerk_id_1', 'user1@example.com', 'client', NOW(), NOW()),
  ('user_clerk_id_2', 'user2@example.com', 'client', NOW(), NOW());
```

## Next Steps

Once webhooks are working:

1. **Set User Roles**: Update roles in Supabase for admins
   ```sql
   UPDATE users SET role = 'super_admin' WHERE email = 'admin@yourdomain.com';
   ```

2. **Add publicMetadata in Clerk**: For RBAC
   - Go to Clerk Dashboard → Users → Select user
   - Metadata tab → Public metadata
   - Add: `{"role": "super_admin"}`

3. **Test RBAC**: User should now have admin permissions

## Support

- **Clerk Docs**: https://clerk.com/docs/integration/webhooks
- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **GitHub Issues**: Report problems in your repo

---

**Last Updated**: February 4, 2026
