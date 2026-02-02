# Dashin Research

Production-grade B2B SaaS platform for lead research and qualification.

## Architecture

Turborepo monorepo with domain-driven design:

```
/apps
  /web          - Next.js 14 (App Router) frontend
/packages
  /ui           - Shared component library (glassmorphism design system)
  /shared-types - TypeScript types and interfaces
  /auth         - [Coming in Segment 2] Supabase authentication
  /rbac         - [Coming in Segment 2] Role-based access control
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all apps in dev mode
pnpm dev

# Run only web app
cd apps/web && pnpm dev
```

### Build

```bash
# Build all apps
pnpm build

# Build only web app
cd apps/web && pnpm build
```

## Project Structure

### Apps

- `apps/web` - Main web application with App Router

### Packages

- `packages/ui` - Reusable UI components
- `packages/shared-types` - TypeScript type definitions

## Development Workflow

1. Feature branches follow pattern: `feature/segment-name`
2. Each segment is completed and committed separately
3. No mixed concerns per commit
4. All TypeScript strict mode enabled
5. Production-ready code only

## Design System

Apple-inspired glassmorphism with:
- Frosted glass panels with backdrop blur
- High contrast typography
- SVG-only icons (Lucide)
- Smooth animations and transitions
- Dense but readable layouts

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript compiler
- `pnpm clean` - Clean all build artifacts

## Environment Variables

Will be configured in Segment 2 with Supabase integration.

## Deployment

Optimized for Vercel:
- Edge Functions support
- ISR and SSR configured
- Build caching via Turborepo
- Automatic preview deployments

## Security

- TypeScript strict mode enforced
- No frontend trust model
- RLS enforced at database level (coming in Segment 2)
- Secure file access via signed URLs

## License

UNLICENSED - Proprietary software

---

**Current Status**: Segment 1 Complete - Repository & Base Architecture
**Next**: Segment 2 - Auth + RBAC Foundation
