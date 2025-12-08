#!/bin/bash
# Add Secrets to Doppler via API
# Uses Doppler REST API to add secrets programmatically

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

echo -e "${BLUE}🔐 Add Secrets to Doppler via API${NC}"
echo "=========================================="
echo ""

# Get Doppler API token
if [ -z "$DOPPLER_TOKEN" ]; then
  # Try to get from doppler CLI config
  if command -v doppler &> /dev/null; then
    DOPPLER_TOKEN=$(doppler configure get token --plain 2>/dev/null || echo "")
  fi
fi

if [ -z "$DOPPLER_TOKEN" ]; then
  echo -e "${RED}❌ DOPPLER_TOKEN not set${NC}"
  echo "   Set it as environment variable or run: doppler configure set token"
  echo "   Or get token from: https://dashboard.doppler.com/workplace"
  exit 1
fi

echo -e "${GREEN}✅ Doppler API token found${NC}"

# Get project slug
PROJECT_SLUG=$(doppler projects get "$PROJECT_NAME" --format json 2>/dev/null | grep -o '"slug":"[^"]*' | cut -d'"' -f4 || echo "$PROJECT_NAME")

if [ -z "$PROJECT_SLUG" ]; then
  echo -e "${RED}❌ Project '$PROJECT_NAME' not found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Project found: $PROJECT_SLUG${NC}"
echo ""

# Configs to add secrets to
CONFIGS=("dev" "staging" "production")

# List of credentials with their values from environment variables
# Format: "KEY_NAME:ENV_VAR_NAME"
declare -a CREDENTIALS=(
  "OPENAI_API_KEY:OPENAI_API_KEY"
  "ANTHROPIC_API_KEY:ANTHROPIC_API_KEY"
  "GITHUB_TOKEN:GITHUB_TOKEN"
  "LINEAR_API_KEY:LINEAR_API_KEY"
  "MONGODB_CONNECTION_STRING:MONGODB_CONNECTION_STRING"
  "POSTGRES_CONNECTION_STRING:POSTGRES_CONNECTION_STRING"
  "SQLITE_DB_PATH:SQLITE_DB_PATH"
  "NOTION_API_KEY:NOTION_API_KEY"
  "SLACK_BOT_TOKEN:SLACK_BOT_TOKEN"
  "AIRTABLE_API_KEY:AIRTABLE_API_KEY"
  "RAINDROP_TOKEN:RAINDROP_TOKEN"
  "POSTMAN_API_KEY:POSTMAN_API_KEY"
  "GOOGLE_DRIVE_CREDENTIALS:GOOGLE_DRIVE_CREDENTIALS"
  "STRAPI_URL:STRAPI_URL"
  "STRAPI_API_KEY:STRAPI_API_KEY"
  "STRIPE_SECRET_KEY:STRIPE_SECRET_KEY"
  "REDIS_URL:REDIS_URL"
  "SENTRY_DSN:SENTRY_DSN"
  "OLLAMA_BASE_URL:OLLAMA_BASE_URL"
  "BRAVE_SEARCH_API_KEY:BRAVE_SEARCH_API_KEY"
  "MCP_BRIDGE_API_KEY:MCP_BRIDGE_API_KEY"
  "RAILWAY_TOKEN:RAILWAY_TOKEN"
  "N8N_INSTANCE_APIKEY:N8N_INSTANCE_APIKEY"
  "N8N_API_KEY:N8N_API_KEY"
  "N8N_BASE_URL:N8N_BASE_URL"
)

# Function to add secret via API
add_secret_via_api() {
  local key=$1
  local value=$2
  local config=$3
  
  if [ -z "$value" ]; then
    return 1
  fi
  
  # Get config name (slug)
  CONFIG_SLUG=$(doppler configs get "$config" --project "$PROJECT_NAME" --format json 2>/dev/null | grep -o '"name":"[^"]*' | cut -d'"' -f4 || echo "$config")
  
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
    --data-urlencode "config=$CONFIG_SLUG")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    return 0
  else
    echo "   API Error: $HTTP_CODE - $BODY" >&2
    return 1
  fi
}

# Add secrets to each config
TOTAL_SUCCESS=0
TOTAL_SKIP=0
TOTAL_FAIL=0

for config in "${CONFIGS[@]}"; do
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo -e "${BLUE}Adding secrets to: ${config}${NC}"
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo ""
  
  # Verify config exists
  if ! doppler configs get "$config" --project "$PROJECT_NAME" &> /dev/null; then
    echo -e "${RED}❌ Config '$config' does not exist${NC}"
    echo "   Skipping..."
    echo ""
    continue
  fi
  
  SUCCESS_COUNT=0
  SKIP_COUNT=0
  FAIL_COUNT=0
  
  for cred_entry in "${CREDENTIALS[@]}"; do
    IFS=':' read -r key env_var <<< "$cred_entry"
    
    # Get value from environment variable
    value="${!env_var}"
    
    if [ -z "$value" ]; then
      echo -e "  ${YELLOW}⏭️  ${key}${NC} (not set in environment)"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      TOTAL_SKIP=$((TOTAL_SKIP + 1))
      continue
    fi
    
    # Check if already exists
    EXISTING=$(doppler secrets get "$key" --project "$PROJECT_NAME" --config "$config" --plain 2>/dev/null || echo "")
    
    if [ -n "$EXISTING" ]; then
      echo -e "  ${YELLOW}⚠️  ${key}${NC} (already exists)"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      TOTAL_SKIP=$((TOTAL_SKIP + 1))
      continue
    fi
    
    # Add via API
    echo -n "  ${BLUE}📝 ${key}${NC} ... "
    
    if add_secret_via_api "$key" "$value" "$config"; then
      echo -e "${GREEN}✅${NC}"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
      TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
    else
      echo -e "${RED}❌${NC}"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      TOTAL_FAIL=$((TOTAL_FAIL + 1))
    fi
  done
  
  echo ""
  echo -e "${BLUE}Summary for ${config}:${NC}"
  echo -e "   ${GREEN}✅ Added:${NC} $SUCCESS_COUNT"
  echo -e "   ${YELLOW}⏭️  Skipped:${NC} $SKIP_COUNT"
  echo -e "   ${RED}❌ Failed:${NC} $FAIL_COUNT"
  echo ""
done

# Final summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ API Migration Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Total Summary:${NC}"
echo -e "   ${GREEN}✅ Added:${NC} $TOTAL_SUCCESS"
echo -e "   ${YELLOW}⏭️  Skipped:${NC} $TOTAL_SKIP"
echo -e "   ${RED}❌ Failed:${NC} $TOTAL_FAIL"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Verify secrets: doppler secrets --project $PROJECT_NAME --config dev"
echo "   2. Test credentials: .devcontainer/validate-credentials.sh"
echo ""
