# Production Deployment Guide

## Overview
This guide covers deploying the Dashin application to production using Vercel and Supabase.

## Prerequisites

- ✅ Vercel account
- ✅ Supabase project created
- ✅ GitHub repository
- ✅ Environment variables configured

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Vercel Edge                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Next.js 14 App (App Router)              │  │
│  │  - Static Pages (ISR)                            │  │
│  │  - API Routes (/api/*)                           │  │
│  │  - Edge Functions                                │  │
│  └──────────────────┬───────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────┘
                      │
                      ├──────────────────────────────────┐
                      │                                  │
         ┌────────────▼──────────┐       ┌───────────────▼─────────┐
         │   Supabase Cloud      │       │   CDN (Vercel Edge)     │
         │  - PostgreSQL DB      │       │  - Static Assets        │
         │  - Edge Functions     │       │  - Images (Next/Image)  │
         │  - Realtime           │       │  - Fonts                │
         │  - Storage            │       └─────────────────────────┘
         │  - Auth               │
         └───────────────────────┘
```

## Step 1: Environment Variables

### Required Variables (Set in Vercel Dashboard)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gehbpdghdkflhuapdkip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_JWT_SECRET=58lfpcSaqVkFKiQuUM7/0cjtPF+wR/k9K2...

# Database
POSTGRES_URL=postgres://postgres.gehbpdghdkflhuapdkip:...
POSTGRES_PRISMA_URL=postgres://postgres.gehbpdghdkflhuapdkip:...
POSTGRES_URL_NON_POOLING=postgres://postgres.gehbpdghdkflhuapdkip:...

# Application
NEXT_PUBLIC_APP_URL=https://dashin.vercel.app
NEXT_PUBLIC_API_URL=https://gehbpdghdkflhuapdkip.supabase.co
```

### Setting Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development environments
3. Ensure sensitive keys (SERVICE_ROLE_KEY, JWT_SECRET) are only in Production

## Step 2: Vercel Deployment

### Option A: Automatic Deployment (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Push to main branch
   git push origin main
   ```

2. **Vercel Auto-deploys**
   - Every push to `main` triggers production deployment
   - Pull requests create preview deployments
   - Build logs available in Vercel dashboard

### Option B: Manual Deployment via CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Step 3: Supabase Configuration

### Database Migration

```bash
# Run migrations on production database
npx supabase db push --db-url $POSTGRES_URL

# Verify migration
npx supabase db diff --linked
```

### Edge Functions Deployment

```bash
# Deploy all Supabase Edge Functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy campaigns

# Verify deployment
npx supabase functions list
```

### Row Level Security (RLS)

Ensure RLS policies are enabled:

```sql
-- Verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Enable RLS on tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
```

## Step 4: Post-Deployment Checks

### 1. Health Checks

```bash
# Check application health
curl https://dashin.vercel.app/api/health

# Check Supabase connection
curl https://gehbpdghdkflhuapdkip.supabase.co/rest/v1/

# Check edge functions
curl https://gehbpdghdkflhuapdkip.supabase.co/functions/v1/campaigns
```

### 2. Performance Monitoring

- **Vercel Analytics**: Enable in dashboard
- **Web Vitals**: Monitor LCP, FID, CLS
- **Error Tracking**: Check Vercel logs

### 3. Security Audit

- ✅ RLS policies active
- ✅ API keys not exposed in client
- ✅ HTTPS enforced
- ✅ CORS configured correctly
- ✅ Content Security Policy (CSP) headers

## Step 5: Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Settings → Domains
   - Add your custom domain (e.g., `app.dashin.io`)

2. **Configure DNS**
   ```
   Type: CNAME
   Name: app (or @)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Automatically provisioned by Vercel
   - Verify at https://app.dashin.io

## Step 6: Monitoring & Alerts

### Setup Monitoring

```javascript
// apps/web/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Setup error tracking
    // Setup performance monitoring
  }
}
```

### Vercel Alerts

1. Go to Settings → Notifications
2. Enable:
   - Deployment failed
   - Build errors
   - Performance degradation

## Step 7: Continuous Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`pnpm test`)
- [ ] Build successful (`pnpm build`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] RLS policies verified
- [ ] Edge functions tested

### Deployment
- [ ] Code pushed to main branch
- [ ] Vercel deployment triggered
- [ ] Build logs reviewed
- [ ] Deployment successful

### Post-Deployment
- [ ] Application accessible at production URL
- [ ] Authentication working
- [ ] Database connections verified
- [ ] API endpoints responding
- [ ] Real-time features functional
- [ ] Performance metrics acceptable
- [ ] Error tracking active
- [ ] SSL certificate valid

### Rollback Plan
- [ ] Previous deployment available
- [ ] Rollback procedure documented
- [ ] Database backup recent

## Common Issues & Solutions

### Issue: Build Fails

```bash
# Check build logs
vercel logs

# Test build locally
pnpm turbo run build

# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Issue: Environment Variables Not Loading

```bash
# Verify variables in Vercel dashboard
# Ensure they're set for the correct environment (Production/Preview)
# Redeploy after adding variables
```

### Issue: Database Connection Errors

```bash
# Check connection string format
# Verify IP allowlist in Supabase (allow all for Vercel)
# Test connection locally with production credentials
```

### Issue: Edge Functions Not Working

```bash
# Redeploy functions
npx supabase functions deploy

# Check function logs
npx supabase functions logs campaigns

# Verify CORS configuration
```

## Performance Optimization

### Enable Caching

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@dashin/ui', 'lucide-react'],
  },
  images: {
    domains: ['gehbpdghdkflhuapdkip.supabase.co'],
  },
}
```

### Enable Compression

Vercel automatically enables:
- Brotli compression
- GZIP fallback
- HTTP/2 push

### CDN Configuration

- Static assets cached at edge
- 31.536 million seconds cache for static files
- Smart cache invalidation on deployment

## Security Best Practices

1. **API Keys**: Never commit keys to git
2. **RLS**: Always enable Row Level Security
3. **CORS**: Restrict to your domain
4. **CSP**: Implement Content Security Policy
5. **Rate Limiting**: Use Vercel's built-in rate limiting

## Backup Strategy

### Database Backups
- Supabase: Automatic daily backups (retained 7 days)
- Manual backup: `pg_dump` via Supabase CLI

### Code Backups
- GitHub repository (main branch)
- Vercel deployment history (30 days)

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Dashboard**: https://vercel.com/dashin
- **Database Dashboard**: https://app.supabase.com/project/gehbpdghdkflhuapdkip

## Deployment Status

Current deployment status can be checked at:
- Production: https://dashin.vercel.app
- Preview: Generated for each PR
- Development: http://localhost:3000

---

**Last Updated**: February 3, 2026  
**Deployment Version**: 1.0.0  
**Next.js Version**: 14.2.35  
**Node Version**: 20.x
