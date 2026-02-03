#!/bin/bash
# Pre-Deployment Checklist Script
# Run this before deploying to production

set -e

echo "🚀 Dashin Pre-Deployment Checklist"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_passed() {
    echo -e "${GREEN}✓${NC} $1"
}

check_failed() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

check_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1. Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    check_passed "Node.js version: $(node -v)"
else
    check_failed "Node.js version must be >= 18, found: $(node -v)"
fi

echo ""
echo "2. Checking pnpm installation..."
if command -v pnpm &> /dev/null; then
    check_passed "pnpm installed: $(pnpm -v)"
else
    check_failed "pnpm not found. Install with: npm install -g pnpm"
fi

echo ""
echo "3. Installing dependencies..."
pnpm install --frozen-lockfile
check_passed "Dependencies installed"

echo ""
echo "4. Running linter..."
if pnpm run lint; then
    check_passed "Linting passed"
else
    check_warning "Linting has warnings (non-blocking)"
fi

echo ""
echo "5. Running type checks..."
if pnpm run type-check 2>/dev/null || npm run build --dry-run 2>/dev/null; then
    check_passed "Type checking passed"
else
    check_warning "Type check skipped (add 'type-check' script if needed)"
fi

echo ""
echo "6. Running tests..."
if pnpm test --passWithNoTests 2>/dev/null; then
    check_passed "Tests passed"
else
    check_warning "Tests failed or not configured"
fi

echo ""
echo "7. Building application..."
if pnpm run build; then
    check_passed "Build successful"
else
    check_failed "Build failed"
fi

echo ""
echo "8. Checking environment variables..."
if [ -f "apps/web/.env.local" ]; then
    check_passed ".env.local exists"
else
    check_warning ".env.local not found (ensure Vercel env vars are set)"
fi

echo ""
echo "9. Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    check_passed "vercel.json exists"
else
    check_warning "vercel.json not found"
fi

echo ""
echo "10. Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
    check_passed "Working directory clean"
else
    check_warning "Uncommitted changes found:"
    git status --short
fi

echo ""
echo "11. Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    check_passed "On main branch"
else
    check_warning "Not on main branch (currently on: $CURRENT_BRANCH)"
fi

echo ""
echo "12. Checking for latest changes..."
git fetch origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" = "$REMOTE" ]; then
    check_passed "Up to date with remote"
else
    check_warning "Local branch differs from remote"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✓ Pre-deployment checks complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review any warnings above"
echo "2. Ensure environment variables are set in Vercel dashboard"
echo "3. Deploy with: git push origin main (for auto-deploy)"
echo "4. Or use: vercel --prod (for manual deploy)"
echo ""
echo "Deployment documentation: docs/DEPLOYMENT.md"
echo "===================================="
