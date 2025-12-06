#!/bin/bash
# Credentials Validation Script
# Validates all credentials used in the codebase against Doppler or environment

set -e

PROJECT_ROOT="/workspaces/MMC_MCP_BRIDGE"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 MMC MCP Bridge - Credentials Validation${NC}"
echo "=========================================="
echo ""

# Check if Doppler CLI is available
USE_DOPPLER=false
if command -v doppler &> /dev/null; then
  if doppler me &> /dev/null; then
    USE_DOPPLER=true
    echo -e "${GREEN}✅ Doppler CLI detected and authenticated${NC}"
    
    # Get current project context
    DOPPLER_PROJECT=$(doppler configure get project --plain 2>/dev/null || echo "")
    DOPPLER_CONFIG=$(doppler configure get config --plain 2>/dev/null || echo "")
    
    if [ -n "$DOPPLER_PROJECT" ] && [ -n "$DOPPLER_CONFIG" ]; then
      echo -e "${BLUE}📋 Doppler Context: ${DOPPLER_PROJECT}/${DOPPLER_CONFIG}${NC}"
    else
      echo -e "${YELLOW}⚠️  Doppler project context not set. Run: doppler setup${NC}"
      USE_DOPPLER=false
    fi
  else
    echo -e "${YELLOW}⚠️  Doppler CLI not authenticated. Run: doppler login${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Doppler CLI not available (using environment variables)${NC}"
fi

echo ""
echo -e "${BLUE}📊 Validating Credentials...${NC}"
echo ""

# List of all credentials to validate
declare -A CREDENTIALS=(
  # AI Services
  ["OPENAI_API_KEY"]="OpenAI API Key"
  ["ANTHROPIC_API_KEY"]="Anthropic API Key"
  
  # Development Tools
  ["GITHUB_TOKEN"]="GitHub Personal Access Token"
  ["LINEAR_API_KEY"]="Linear API Key"
  
  # Databases
  ["MONGODB_CONNECTION_STRING"]="MongoDB Connection String"
  ["POSTGRES_CONNECTION_STRING"]="PostgreSQL Connection String"
  ["SQLITE_DB_PATH"]="SQLite Database Path"
  
  # Productivity
  ["NOTION_API_KEY"]="Notion Integration Token"
  ["SLACK_BOT_TOKEN"]="Slack Bot Token"
  
  # Integration Services
  ["AIRTABLE_API_KEY"]="Airtable API Key"
  ["RAINDROP_TOKEN"]="Raindrop OAuth Token"
  ["POSTMAN_API_KEY"]="Postman API Key"
  ["GOOGLE_DRIVE_CREDENTIALS"]="Google Drive Service Account JSON"
  ["STRAPI_URL"]="Strapi Base URL"
  ["STRAPI_API_KEY"]="Strapi API Key"
  ["STRIPE_SECRET_KEY"]="Stripe Secret Key"
  
  # Infrastructure
  ["REDIS_URL"]="Redis Connection String"
  ["SENTRY_DSN"]="Sentry DSN"
  ["OLLAMA_BASE_URL"]="Ollama Base URL"
  
  # Search & Automation
  ["BRAVE_SEARCH_API_KEY"]="Brave Search API Key"
  
  # Application
  ["MCP_BRIDGE_API_KEY"]="MCP Bridge API Key"
  ["RAILWAY_TOKEN"]="Railway API Token"
  
  # n8n
  ["N8N_INSTANCE_APIKEY"]="n8n Instance API Key"
  ["N8N_API_KEY"]="n8n API Key (legacy)"
  ["N8N_BASE_URL"]="n8n Base URL"
)

# Function to check credential
check_credential() {
  local key=$1
  local description=$2
  local value=""
  
  if [ "$USE_DOPPLER" = true ]; then
    # Try to get from Doppler
    value=$(doppler secrets get "$key" --plain 2>/dev/null || echo "")
    
    if [ -n "$value" ]; then
      echo -e "  ${GREEN}✅${NC} $key: ${GREEN}Set in Doppler${NC}"
      return 0
    else
      # Fallback to environment
      value="${!key}"
      if [ -n "$value" ]; then
        echo -e "  ${YELLOW}⚠️${NC}  $key: ${YELLOW}Set in environment (not in Doppler)${NC}"
        return 1
      else
        echo -e "  ${RED}❌${NC} $key: ${RED}Missing${NC}"
        return 2
      fi
    fi
  else
    # Check environment variable
    value="${!key}"
    if [ -n "$value" ]; then
      echo -e "  ${GREEN}✅${NC} $key: ${GREEN}Set in environment${NC}"
      return 0
    else
      echo -e "  ${RED}❌${NC} $key: ${RED}Missing${NC}"
      return 2
    fi
  fi
}

# Validate all credentials
VALID_COUNT=0
WARNING_COUNT=0
MISSING_COUNT=0

for key in "${!CREDENTIALS[@]}"; do
  description="${CREDENTIALS[$key]}"
  check_credential "$key" "$description"
  case $? in
    0) VALID_COUNT=$((VALID_COUNT + 1)) ;;
    1) WARNING_COUNT=$((WARNING_COUNT + 1)) ;;
    2) MISSING_COUNT=$((MISSING_COUNT + 1)) ;;
  esac
done

echo ""
echo "=========================================="
echo -e "${BLUE}📊 Validation Summary${NC}"
echo -e "  ${GREEN}✅ Valid:${NC} $VALID_COUNT"
echo -e "  ${YELLOW}⚠️  Warnings:${NC} $WARNING_COUNT"
echo -e "  ${RED}❌ Missing:${NC} $MISSING_COUNT"
echo ""

if [ $MISSING_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ All required credentials are configured!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some credentials are missing. Please configure them.${NC}"
  if [ "$USE_DOPPLER" = true ]; then
    echo -e "${BLUE}💡 Tip: Add missing credentials to Doppler:${NC}"
    echo -e "   ${BLUE}doppler secrets set KEY_NAME=\"value\"${NC}"
  else
    echo -e "${BLUE}💡 Tip: Set environment variables or configure Doppler${NC}"
  fi
  exit 1
fi
