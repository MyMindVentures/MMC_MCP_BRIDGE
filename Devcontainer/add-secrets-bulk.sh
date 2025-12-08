#!/bin/bash
# Bulk Add Secrets to Doppler from Environment Variables or File
# Usage: 
#   - From env vars: ENV_VAR_PREFIX=MYAPP_ .devcontainer/add-secrets-bulk.sh
#   - From file: .devcontainer/add-secrets-bulk.sh < secrets-file.txt

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

echo -e "${BLUE}🔐 Bulk Add Secrets to Doppler${NC}"
echo "=========================================="
echo ""

# Check if Doppler CLI is available and authenticated
if ! command -v doppler &> /dev/null; then
  echo -e "${RED}❌ Doppler CLI not found${NC}"
  exit 1
fi

if ! doppler me &> /dev/null; then
  echo -e "${RED}❌ Doppler not authenticated${NC}"
  exit 1
fi

# Get config (default: dev)
CONFIG="${1:-dev}"

if [ "$CONFIG" != "dev" ] && [ "$CONFIG" != "staging" ] && [ "$CONFIG" != "production" ]; then
  echo -e "${RED}❌ Invalid config: $CONFIG${NC}"
  echo "   Use: dev, staging, or production"
  exit 1
fi

echo -e "${GREEN}✅ Doppler CLI authenticated${NC}"
echo -e "${BLUE}📋 Project: $PROJECT_NAME${NC}"
echo -e "${BLUE}📋 Config: $CONFIG${NC}"
echo ""

# List of credential keys
declare -a CREDENTIAL_KEYS=(
  "OPENAI_API_KEY"
  "ANTHROPIC_API_KEY"
  "GITHUB_TOKEN"
  "LINEAR_API_KEY"
  "MONGODB_CONNECTION_STRING"
  "POSTGRES_CONNECTION_STRING"
  "SQLITE_DB_PATH"
  "NOTION_API_KEY"
  "SLACK_BOT_TOKEN"
  "AIRTABLE_API_KEY"
  "RAINDROP_TOKEN"
  "POSTMAN_API_KEY"
  "GOOGLE_DRIVE_CREDENTIALS"
  "STRAPI_URL"
  "STRAPI_API_KEY"
  "STRIPE_SECRET_KEY"
  "REDIS_URL"
  "SENTRY_DSN"
  "OLLAMA_BASE_URL"
  "BRAVE_SEARCH_API_KEY"
  "MCP_BRIDGE_API_KEY"
  "RAILWAY_TOKEN"
  "N8N_INSTANCE_APIKEY"
  "N8N_API_KEY"
  "N8N_BASE_URL"
)

echo -e "${BLUE}📋 Adding secrets from environment variables...${NC}"
echo ""

SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

for key in "${CREDENTIAL_KEYS[@]}"; do
  # Get value from environment variable
  value="${!key}"
  
  if [ -z "$value" ]; then
    echo -e "  ${YELLOW}⏭️  ${key}${NC} (not set)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi
  
  # Check if already exists
  EXISTING=$(doppler secrets get "$key" --project "$PROJECT_NAME" --config "$CONFIG" --plain 2>/dev/null || echo "")
  
  if [ -n "$EXISTING" ]; then
    echo -e "  ${YELLOW}⚠️  ${key}${NC} (already exists)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi
  
  # Add secret
  if doppler secrets set "$key"="$value" --project "$PROJECT_NAME" --config "$CONFIG" &> /dev/null; then
    echo -e "  ${GREEN}✅ ${key}${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo -e "  ${RED}❌ ${key}${NC} (failed)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Bulk Add Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   ${GREEN}✅ Added:${NC} $SUCCESS_COUNT"
echo -e "   ${YELLOW}⏭️  Skipped:${NC} $SKIP_COUNT"
echo -e "   ${RED}❌ Failed:${NC} $FAIL_COUNT"
echo ""
echo -e "${BLUE}💡 Tip:${NC}"
echo "   To add to all configs, run:"
echo "   for config in dev staging production; do"
echo "     CONFIG=\$config .devcontainer/add-secrets-bulk.sh"
echo "   done"
echo ""
