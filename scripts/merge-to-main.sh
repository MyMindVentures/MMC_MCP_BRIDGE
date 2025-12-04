#!/bin/bash
# Automated Merge to Main Script
# Runs all checks and merges if everything passes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         AUTOMATED MERGE TO MAIN - WITH CHECKS         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📋 Current branch:${NC} ${CURRENT_BRANCH}"

# Check if on feature branch
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo -e "${RED}❌ You are already on main branch!${NC}"
  exit 1
fi

# Confirm merge
echo ""
echo -e "${YELLOW}⚠️  This will:${NC}"
echo -e "  1. Run pre-merge checks"
echo -e "  2. Merge ${CURRENT_BRANCH} → main"
echo -e "  3. Push to GitHub"
echo -e "  4. Delete feature branch"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}❌ Merge cancelled${NC}"
  exit 1
fi

# Step 1: Run pre-merge checks
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 1: PRE-MERGE CHECKS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

if ! ./scripts/pre-merge-check.sh; then
  echo -e "${RED}❌ Pre-merge checks failed!${NC}"
  echo -e "${YELLOW}Fix the errors before merging.${NC}"
  exit 1
fi

# Step 2: Merge to main
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 2: MERGING TO MAIN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Get commit message
MERGE_MSG="MERGE: ${CURRENT_BRANCH}"
echo -e "${BLUE}📝 Merge message:${NC} ${MERGE_MSG}"
echo ""

# Switch to main
echo -e "${BLUE}🔄 Switching to main...${NC}"
git checkout main

# Pull latest main
echo -e "${BLUE}📥 Pulling latest main...${NC}"
git pull origin main

# Merge feature branch
echo -e "${BLUE}🔀 Merging ${CURRENT_BRANCH}...${NC}"
git merge "${CURRENT_BRANCH}" --no-ff -m "${MERGE_MSG}"

echo -e "${GREEN}✅ Merge successful${NC}"
echo ""

# Step 3: Push to GitHub
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 3: PUSHING TO GITHUB${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo ""

# Step 4: Delete feature branch
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 4: CLEANUP${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}🗑️  Deleting local branch: ${CURRENT_BRANCH}${NC}"
git branch -d "${CURRENT_BRANCH}"

echo -e "${BLUE}🗑️  Deleting remote branch: ${CURRENT_BRANCH}${NC}"
git push origin --delete "${CURRENT_BRANCH}"

echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 5: Wait for Railway deployment
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 5: RAILWAY DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}⏳ Waiting for Railway deployment...${NC}"
echo -e "${YELLOW}This may take 2-5 minutes${NC}"
echo ""

RAILWAY_URL="https://mmcmcphttpbridge-production.up.railway.app/api/health"
MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  
  STATUS=$(curl -s "$RAILWAY_URL" | jq -r '.status' 2>/dev/null || echo "error")
  
  if [ "$STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Railway deployment successful!${NC}"
    echo ""
    curl -s "$RAILWAY_URL" | jq '.'
    break
  fi
  
  echo -ne "${YELLOW}⏳ Attempt $ATTEMPT/$MAX_ATTEMPTS - Status: $STATUS${NC}\r"
  sleep 5
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo ""
  echo -e "${RED}❌ Railway deployment timeout${NC}"
  echo -e "${YELLOW}⚠️  Check Railway logs manually${NC}"
  echo -e "${YELLOW}🔗 https://railway.app/project/your-project${NC}"
  exit 1
fi

# Final summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🎉 MERGE COMPLETED SUCCESSFULLY           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Branch merged: ${CURRENT_BRANCH} → main${NC}"
echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo -e "${GREEN}✅ Feature branch deleted${NC}"
echo -e "${GREEN}✅ Railway deployment healthy${NC}"
echo ""
echo -e "${BLUE}🔗 Production URL:${NC}"
echo -e "   https://mmcmcphttpbridge-production.up.railway.app"
echo ""

