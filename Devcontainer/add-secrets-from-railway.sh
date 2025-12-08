#!/bin/bash
# Add Secrets to Doppler from Railway Environment Variables
# Fetches secrets from Railway API and adds them to Doppler

set -e

PROJECT_NAME="mmc-mcp-bridge"
PROJECT_ROOT="/workspaces/MMC_MCP_BRIDGE"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Add Secrets from Railway to Doppler${NC}"
echo "=========================================="
echo ""

# Check for Railway token
if [ -z "$RAILWAY_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  RAILWAY_TOKEN not set${NC}"
  echo "   Set it: export RAILWAY_TOKEN=\"your-token\""
  echo "   Or get from: https://railway.app/account/tokens"
  echo ""
  read -p "Enter Railway token (or press Enter to skip): " RAILWAY_TOKEN_INPUT
  if [ -n "$RAILWAY_TOKEN_INPUT" ]; then
    export RAILWAY_TOKEN="$RAILWAY_TOKEN_INPUT"
  else
    echo -e "${RED}❌ Railway token required${NC}"
    exit 1
  fi
fi

# Check for Doppler token
if [ -z "$DOPPLER_TOKEN" ]; then
  if command -v doppler &> /dev/null; then
    DOPPLER_TOKEN=$(doppler configure get token --plain 2>/dev/null || echo "")
  fi
fi

if [ -z "$DOPPLER_TOKEN" ]; then
  echo -e "${RED}❌ DOPPLER_TOKEN not set${NC}"
  echo "   Set it: export DOPPLER_TOKEN=\"your-token\""
  exit 1
fi

echo -e "${GREEN}✅ Tokens configured${NC}"
echo ""

# Get Railway project ID (you may need to set this)
if [ -z "$RAILWAY_PROJECT_ID" ]; then
  echo -e "${YELLOW}⚠️  RAILWAY_PROJECT_ID not set${NC}"
  echo "   Fetching projects..."
  
  RAILWAY_PROJECTS=$(curl -s \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    "https://api.railway.app/v1/projects")
  
  echo "$RAILWAY_PROJECTS" | jq -r '.projects[] | "\(.id) - \(.name)"'
  echo ""
  read -p "Enter Railway project ID: " RAILWAY_PROJECT_ID
fi

# Get service ID (you may need to set this)
if [ -z "$RAILWAY_SERVICE_ID" ]; then
  echo -e "${YELLOW}⚠️  RAILWAY_SERVICE_ID not set${NC}"
  echo "   Fetching services..."
  
  RAILWAY_SERVICES=$(curl -s \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    "https://api.railway.app/v1/projects/$RAILWAY_PROJECT_ID/services")
  
  echo "$RAILWAY_SERVICES" | jq -r '.services[] | "\(.id) - \(.name)"'
  echo ""
  read -p "Enter Railway service ID: " RAILWAY_SERVICE_ID
fi

echo -e "${BLUE}📋 Fetching variables from Railway...${NC}"

# Fetch variables from Railway
RAILWAY_VARS=$(curl -s \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  "https://api.railway.app/v1/services/$RAILWAY_SERVICE_ID/variables")

# Parse and add to Doppler
echo -e "${BLUE}📝 Adding to Doppler...${NC}"
echo ""

CONFIG="${1:-dev}"

ADDED_COUNT=0
SKIP_COUNT=0

# Parse Railway variables and add to Doppler
echo "$RAILWAY_VARS" | jq -r '.variables[] | "\(.name)=\(.value)"' | while IFS='=' read -r key value; do
  if [ -z "$key" ] || [ "$key" = "null" ]; then
    continue
  fi
  
  # Skip Doppler-specific variables
  if [[ "$key" == DOPPLER_* ]]; then
    echo -e "  ${YELLOW}⏭️  ${key}${NC} (Doppler variable, skipping)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi
  
  # Check if already exists in Doppler
  EXISTING=$(doppler secrets get "$key" --project "$PROJECT_NAME" --config "$CONFIG" --plain 2>/dev/null || echo "")
  
  if [ -n "$EXISTING" ]; then
    echo -e "  ${YELLOW}⚠️  ${key}${NC} (already exists)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi
  
  # Add to Doppler
  if doppler secrets set "$key"="$value" --project "$PROJECT_NAME" --config "$CONFIG" &> /dev/null; then
    echo -e "  ${GREEN}✅ ${key}${NC}"
    ADDED_COUNT=$((ADDED_COUNT + 1))
  else
    echo -e "  ${RED}❌ ${key}${NC} (failed)"
  fi
done

echo ""
echo -e "${GREEN}✅ Migration from Railway complete!${NC}"
echo -e "${BLUE}📊 Added: $ADDED_COUNT, Skipped: $SKIP_COUNT${NC}"
echo ""
