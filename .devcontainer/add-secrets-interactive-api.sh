#!/bin/bash
# Interactive Add Secrets to Doppler via API
# Prompts for each credential and adds via API

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

echo -e "${BLUE}🔐 Interactive Add Secrets to Doppler via API${NC}"
echo "=========================================="
echo ""

# Get Doppler API token
if [ -z "$DOPPLER_TOKEN" ]; then
  if command -v doppler &> /dev/null; then
    DOPPLER_TOKEN=$(doppler configure get token --plain 2>/dev/null || echo "")
  fi
fi

if [ -z "$DOPPLER_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  DOPPLER_TOKEN not set${NC}"
  echo "   Getting from Doppler CLI..."
  read -p "Enter Doppler API token (or press Enter to get from CLI): " TOKEN_INPUT
  if [ -n "$TOKEN_INPUT" ]; then
    export DOPPLER_TOKEN="$TOKEN_INPUT"
  else
    echo -e "${RED}❌ DOPPLER_TOKEN required${NC}"
    echo "   Get from: https://dashboard.doppler.com/workplace → Settings → Access → Tokens"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Doppler API token configured${NC}"

# Verify project exists
if ! doppler projects get "$PROJECT_NAME" &> /dev/null; then
  echo -e "${RED}❌ Project '$PROJECT_NAME' not found${NC}"
  exit 1
fi

PROJECT_SLUG=$(doppler projects get "$PROJECT_NAME" --format json 2>/dev/null | grep -o '"slug":"[^"]*' | cut -d'"' -f4 || echo "$PROJECT_NAME")
echo -e "${GREEN}✅ Project found: $PROJECT_SLUG${NC}"
echo ""

# Configs to add secrets to
CONFIG="${1:-dev}"

if [ "$CONFIG" != "dev" ] && [ "$CONFIG" != "staging" ] && [ "$CONFIG" != "production" ]; then
  echo -e "${RED}❌ Invalid config: $CONFIG${NC}"
  echo "   Use: dev, staging, or production"
  exit 1
fi

# Verify config exists
if ! doppler configs get "$CONFIG" --project "$PROJECT_NAME" &> /dev/null; then
  echo -e "${RED}❌ Config '$CONFIG' not found${NC}"
  exit 1
fi

CONFIG_SLUG=$(doppler configs get "$CONFIG" --project "$PROJECT_NAME" --format json 2>/dev/null | grep -o '"name":"[^"]*' | cut -d'"' -f4 || echo "$CONFIG")
echo -e "${GREEN}✅ Config found: $CONFIG_SLUG${NC}"
echo ""

# List of credentials with descriptions
declare -a CREDENTIALS=(
  "OPENAI_API_KEY:OpenAI API Key:AI Service"
  "ANTHROPIC_API_KEY:Anthropic API Key:AI Service"
  "GITHUB_TOKEN:GitHub Personal Access Token:Development"
  "LINEAR_API_KEY:Linear API Key:Development"
  "MONGODB_CONNECTION_STRING:MongoDB Connection String:Database"
  "POSTGRES_CONNECTION_STRING:PostgreSQL Connection String:Database"
  "SQLITE_DB_PATH:SQLite Database Path:Database"
  "NOTION_API_KEY:Notion Integration Token:Productivity"
  "SLACK_BOT_TOKEN:Slack Bot Token:Productivity"
  "AIRTABLE_API_KEY:Airtable API Key:Integration"
  "RAINDROP_TOKEN:Raindrop OAuth Token:Integration"
  "POSTMAN_API_KEY:Postman API Key:Integration"
  "GOOGLE_DRIVE_CREDENTIALS:Google Drive Service Account JSON:Integration"
  "STRAPI_URL:Strapi Base URL:Integration"
  "STRAPI_API_KEY:Strapi API Key:Integration"
  "STRIPE_SECRET_KEY:Stripe Secret Key:Integration"
  "REDIS_URL:Redis Connection String:Infrastructure"
  "SENTRY_DSN:Sentry DSN:Infrastructure"
  "OLLAMA_BASE_URL:Ollama Base URL:Infrastructure"
  "BRAVE_SEARCH_API_KEY:Brave Search API Key:Search"
  "MCP_BRIDGE_API_KEY:MCP Bridge API Key:Application"
  "RAILWAY_TOKEN:Railway API Token:Infrastructure"
  "N8N_INSTANCE_APIKEY:n8n Instance API Key:n8n"
  "N8N_API_KEY:n8n API Key (legacy):n8n"
  "N8N_BASE_URL:n8n Base URL:n8n"
)

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Adding secrets to: ${config}${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Press Enter to skip a credential${NC}"
echo -e "${YELLOW}💡 Tip: Type 'exit' to stop${NC}"
echo ""

SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

# Function to add secret via API
add_secret_via_api() {
  local key=$1
  local value=$2
  local config_slug=$3
  
  if [ -z "$value" ]; then
    return 1
  fi
  
  # Doppler API endpoint
  API_URL="https://api.doppler.com/v3/configs/config/secrets"
  
  # Create JSON payload
  JSON_PAYLOAD=$(jq -n \
    --arg key "$key" \
    --arg value "$value" \
    '{name: $key, value: $value}')
  
  # Make API request
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL" \
    -H "Authorization: Bearer $DOPPLER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    -G \
    --data-urlencode "project=$PROJECT_SLUG" \
    --data-urlencode "config=$config_slug" 2>&1)
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    return 0
  else
    echo "   API Error: $HTTP_CODE" >&2
    if echo "$BODY" | grep -q "already exists"; then
      return 2  # Already exists
    fi
    return 1
  fi
}

# Add each credential
for cred_entry in "${CREDENTIALS[@]}"; do
  IFS=':' read -r key description category <<< "$cred_entry"
  
  echo -e "${BLUE}📝 ${key}${NC}"
  echo -e "   ${description} (${category})"
  
  # Check if already exists
  EXISTING=$(doppler secrets get "$key" --project "$PROJECT_NAME" --config "$CONFIG" --plain 2>/dev/null || echo "")
  
  if [ -n "$EXISTING" ]; then
    echo -e "  ${YELLOW}⚠️  Already exists (skipping)${NC}"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    echo ""
    continue
  fi
  
  # Prompt for value
  echo -n "   Enter value (or press Enter to skip): "
  read -s value
  echo ""
  
  if [ -z "$value" ]; then
    echo -e "  ${YELLOW}⏭️  Skipped${NC}"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    echo ""
    continue
  fi
  
  if [ "$value" = "exit" ]; then
    echo -e "${YELLOW}⚠️  Stopping...${NC}"
    break
  fi
  
  # Add via API
  echo -n "  ${BLUE}Adding via API...${NC} "
  
  add_secret_via_api "$key" "$value" "$CONFIG_SLUG"
  RESULT=$?
  
  case $RESULT in
    0)
      echo -e "${GREEN}✅ Added${NC}"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
      ;;
    2)
      echo -e "${YELLOW}⚠️  Already exists${NC}"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      ;;
    *)
      echo -e "${RED}❌ Failed${NC}"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      ;;
  esac
  
  echo ""
done

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ API Migration Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   ${GREEN}✅ Added:${NC} $SUCCESS_COUNT"
echo -e "   ${YELLOW}⏭️  Skipped:${NC} $SKIP_COUNT"
echo -e "   ${RED}❌ Failed:${NC} $FAIL_COUNT"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Verify: doppler secrets --project $PROJECT_NAME --config $CONFIG"
echo "   2. Add to other configs: Run script with staging/production"
echo "   3. Test: .devcontainer/validate-credentials.sh"
echo ""
