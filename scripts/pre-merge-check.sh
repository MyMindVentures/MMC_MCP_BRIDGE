#!/bin/bash
# Pre-Merge Check Script
# Run this before merging any branch to main

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           PRE-MERGE CHECK - MMC MCP BRIDGE            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📋 Current branch:${NC} ${CURRENT_BRANCH}"
echo ""

# Check if on feature branch
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo -e "${RED}❌ You are on main branch!${NC}"
  echo -e "${YELLOW}⚠️  This script should be run on feature branches before merging.${NC}"
  exit 1
fi

# Step 1: Check for uncommitted changes
echo -e "${BLUE}1️⃣  Checking for uncommitted changes...${NC}"
if ! git diff-index --quiet HEAD --; then
  echo -e "${RED}❌ You have uncommitted changes!${NC}"
  echo -e "${YELLOW}⚠️  Commit or stash your changes first.${NC}"
  git status --short
  exit 1
fi
echo -e "${GREEN}✅ No uncommitted changes${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}2️⃣  Installing dependencies...${NC}"
npm ci --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Check Railway Preview Deployment
echo -e "${BLUE}3️⃣  Checking Railway preview deployment...${NC}"

# Get Railway preview URL for current branch
RAILWAY_PREVIEW_URL=$(railway status --json 2>/dev/null | jq -r '.deployments[0].url' 2>/dev/null || echo "")

if [ -z "$RAILWAY_PREVIEW_URL" ]; then
  echo -e "${YELLOW}⚠️  No Railway preview deployment found${NC}"
  echo -e "${YELLOW}⚠️  Running local build check instead...${NC}"
  echo ""
  
  export DATABASE_URL="postgresql://mock:mock@localhost:5432/mock"
  export POSTGRES_URL="postgresql://mock:mock@localhost:5432/mock"
  export MONGODB_URI="mongodb://mock:mock@localhost:27017/mock"
  export REDIS_URL="redis://localhost:6379"
  export NODE_ENV="production"

  if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✅ Local build successful${NC}"
  else
    echo -e "${RED}❌ Build failed!${NC}"
    echo ""
    echo -e "${YELLOW}Build errors:${NC}"
    tail -50 /tmp/build.log
    echo ""
    echo -e "${RED}❌ DO NOT MERGE TO MAIN${NC}"
    echo -e "${YELLOW}Fix the build errors first!${NC}"
    exit 1
  fi
else
  echo -e "${BLUE}🔗 Railway Preview:${NC} ${RAILWAY_PREVIEW_URL}"
  
  # Check if preview deployment is healthy
  PREVIEW_STATUS=$(curl -s "${RAILWAY_PREVIEW_URL}/api/health" | jq -r '.status' 2>/dev/null || echo "error")
  
  if [ "$PREVIEW_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Railway preview deployment is healthy${NC}"
  else
    echo -e "${RED}❌ Railway preview deployment failed!${NC}"
    echo -e "${YELLOW}Status: ${PREVIEW_STATUS}${NC}"
    echo -e "${RED}❌ DO NOT MERGE TO MAIN${NC}"
    echo -e "${YELLOW}Check Railway logs: railway logs${NC}"
    exit 1
  fi
fi
echo ""

# Step 4: Check for main branch updates
echo -e "${BLUE}4️⃣  Checking if main is up to date...${NC}"
git fetch origin main --quiet
BEHIND=$(git rev-list --count HEAD..origin/main)
if [ "$BEHIND" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Your branch is $BEHIND commits behind main${NC}"
  echo -e "${YELLOW}⚠️  Consider rebasing: git rebase origin/main${NC}"
else
  echo -e "${GREEN}✅ Branch is up to date with main${NC}"
fi
echo ""

# Step 5: Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   ✅ ALL CHECKS PASSED                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Safe to merge to main!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. git checkout main"
echo -e "  2. git merge ${CURRENT_BRANCH} --no-ff -m \"MERGE: ${CURRENT_BRANCH}\""
echo -e "  3. git push origin main"
echo -e "  4. git branch -d ${CURRENT_BRANCH}"
echo -e "  5. git push origin --delete ${CURRENT_BRANCH}"
echo ""
echo -e "${YELLOW}Or use the automated merge script:${NC}"
echo -e "  ./scripts/merge-to-main.sh"
echo ""

