#!/bin/bash
# Migrate All Secrets to Doppler
# Adds all identified credentials to Doppler project mmc-mcp-bridge

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

echo -e "${BLUE}🔐 Migrate All Secrets to Doppler${NC}"
echo "=========================================="
echo ""

# Check if Doppler CLI is available and authenticated
if ! command -v doppler &> /dev/null; then
  echo -e "${RED}❌ Doppler CLI not found${NC}"
  echo "   Please install Doppler CLI first"
  exit 1
fi

if ! doppler me &> /dev/null; then
  echo -e "${RED}❌ Doppler not authenticated${NC}"
  echo "   Run: doppler login"
  exit 1
fi

echo -e "${GREEN}✅ Doppler CLI authenticated${NC}"

# Verify project exists
if ! doppler projects get "$PROJECT_NAME" &> /dev/null; then
  echo -e "${RED}❌ Project '$PROJECT_NAME' does not exist${NC}"
  echo "   Create it first: doppler projects create $PROJECT_NAME"
  exit 1
fi

echo -e "${GREEN}✅ Project '$PROJECT_NAME' exists${NC}"
echo ""

# List of all credentials to migrate
# Format: "KEY_NAME:Description:Source"
declare -a CREDENTIALS=(
  # AI Services
  "OPENAI_API_KEY:OpenAI API Key:AI Service"
  "ANTHROPIC_API_KEY:Anthropic API Key:AI Service"
  
  # Development Tools
  "GITHUB_TOKEN:GitHub Personal Access Token:Development"
  "LINEAR_API_KEY:Linear API Key:Development"
  
  # Databases
  "MONGODB_CONNECTION_STRING:MongoDB Connection String:Database"
  "POSTGRES_CONNECTION_STRING:PostgreSQL Connection String:Database"
  "SQLITE_DB_PATH:SQLite Database Path:Database"
  
  # Productivity
  "NOTION_API_KEY:Notion Integration Token:Productivity"
  "SLACK_BOT_TOKEN:Slack Bot Token:Productivity"
  
  # Integration Services
  "AIRTABLE_API_KEY:Airtable API Key:Integration"
  "RAINDROP_TOKEN:Raindrop OAuth Token:Integration"
  "POSTMAN_API_KEY:Postman API Key:Integration"
  "GOOGLE_DRIVE_CREDENTIALS:Google Drive Service Account JSON:Integration"
  "STRAPI_URL:Strapi Base URL:Integration"
  "STRAPI_API_KEY:Strapi API Key:Integration"
  "STRIPE_SECRET_KEY:Stripe Secret Key:Integration"
  
  # Infrastructure
  "REDIS_URL:Redis Connection String:Infrastructure"
  "SENTRY_DSN:Sentry DSN:Infrastructure"
  "OLLAMA_BASE_URL:Ollama Base URL:Infrastructure"
  
  # Search & Automation
  "BRAVE_SEARCH_API_KEY:Brave Search API Key:Search"
  
  # Application
  "MCP_BRIDGE_API_KEY:MCP Bridge API Key:Application"
  "RAILWAY_TOKEN:Railway API Token:Infrastructure"
  
  # n8n
  "N8N_INSTANCE_APIKEY:n8n Instance API Key:n8n"
  "N8N_API_KEY:n8n API Key (legacy):n8n"
  "N8N_BASE_URL:n8n Base URL:n8n"
)

# Configs to migrate to
CONFIGS=("dev" "staging" "production")

echo -e "${BLUE}📋 Credentials to migrate: ${#CREDENTIALS[@]}${NC}"
echo -e "${BLUE}📋 Configs: dev, staging, production${NC}"
echo ""
echo -e "${YELLOW}⚠️  This script will prompt for each credential value${NC}"
echo -e "${YELLOW}⚠️  You can skip credentials by pressing Enter${NC}"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Function to add secret to Doppler
add_secret() {
  local key=$1
  local description=$2
  local source=$3
  local config=$4
  local value=$5
  
  if [ -z "$value" ]; then
    echo -e "  ${YELLOW}⏭️  Skipped${NC}"
    return 1
  fi
  
  # Add secret to Doppler
  if doppler secrets set "$key"="$value" --project "$PROJECT_NAME" --config "$config" &> /dev/null; then
    echo -e "  ${GREEN}✅ Added${NC}"
    
    # Add note if possible (Doppler CLI may not support notes directly)
    return 0
  else
    echo -e "  ${RED}❌ Failed${NC}"
    return 1
  fi
}

# Migrate secrets
SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

for config in "${CONFIGS[@]}"; do
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo -e "${BLUE}Migrating to: ${config}${NC}"
  echo -e "${BLUE}═══════════════════════════════════════${NC}"
  echo ""
  
  # Verify config exists
  if ! doppler configs get "$config" --project "$PROJECT_NAME" &> /dev/null; then
    echo -e "${RED}❌ Config '$config' does not exist${NC}"
    echo "   Skipping..."
    echo ""
    continue
  fi
  
  for cred_entry in "${CREDENTIALS[@]}"; do
    IFS=':' read -r key description source <<< "$cred_entry"
    
    echo -e "${BLUE}📝 ${key}${NC}"
    echo -e "   ${description} (${source})"
    
    # Check if secret already exists
    EXISTING_VALUE=$(doppler secrets get "$key" --project "$PROJECT_NAME" --config "$config" --plain 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_VALUE" ]; then
      echo -e "  ${YELLOW}⚠️  Already exists (skipping)${NC}"
      SKIP_COUNT=$((SKIP_COUNT + 1))
      echo ""
      continue
    fi
    
    # Prompt for value
    echo -n "   Enter value (or press Enter to skip): "
    read -s value
    echo ""
    
    if add_secret "$key" "$description" "$source" "$config" "$value"; then
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
      if [ -z "$value" ]; then
        SKIP_COUNT=$((SKIP_COUNT + 1))
      else
        FAIL_COUNT=$((FAIL_COUNT + 1))
      fi
    fi
    
    echo ""
  done
  
  echo ""
done

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   ${GREEN}✅ Added:${NC} $SUCCESS_COUNT"
echo -e "   ${YELLOW}⏭️  Skipped:${NC} $SKIP_COUNT"
echo -e "   ${RED}❌ Failed:${NC} $FAIL_COUNT"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Verify secrets: doppler secrets --project $PROJECT_NAME --config dev"
echo "   2. Test credentials: .devcontainer/validate-credentials.sh"
echo "   3. Create service tokens: .devcontainer/create-doppler-service-tokens.sh"
echo ""
