#!/bin/bash
# Complete Doppler Setup: Project, Configs, and Service Tokens
# Creates project, configs, and service tokens in one go

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

echo -e "${BLUE}🚀 Doppler Complete Setup${NC}"
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
echo ""

# Get current user info
USER_INFO=$(doppler me --format json 2>/dev/null || echo "{}")
USER_EMAIL=$(echo "$USER_INFO" | grep -o '"email":"[^"]*' | cut -d'"' -f4 || echo "Unknown")
echo -e "${BLUE}📋 User: ${USER_EMAIL}${NC}"
echo ""

# ============================================
# STEP 1: Create or verify project
# ============================================
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1: Project Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if doppler projects get "$PROJECT_NAME" &> /dev/null; then
  echo -e "${GREEN}✅ Project '$PROJECT_NAME' already exists${NC}"
  PROJECT_INFO=$(doppler projects get "$PROJECT_NAME" --format json 2>/dev/null || echo "{}")
  PROJECT_ID=$(echo "$PROJECT_INFO" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "Unknown")
  echo -e "${BLUE}   Project ID: $PROJECT_ID${NC}"
else
  echo -e "${YELLOW}📦 Creating project '$PROJECT_NAME'...${NC}"
  PROJECT_OUTPUT=$(doppler projects create "$PROJECT_NAME" --format json 2>&1)
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Project '$PROJECT_NAME' created${NC}"
    PROJECT_ID=$(echo "$PROJECT_OUTPUT" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")
    if [ -n "$PROJECT_ID" ]; then
      echo -e "${BLUE}   Project ID: $PROJECT_ID${NC}"
    fi
  else
    echo -e "${RED}❌ Failed to create project${NC}"
    echo "   Error: $PROJECT_OUTPUT"
    exit 1
  fi
fi

echo ""

# ============================================
# STEP 2: Create configs
# ============================================
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Step 2: Configs Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

CONFIGS=("dev" "staging" "production")

for config in "${CONFIGS[@]}"; do
  if doppler configs get "$config" --project "$PROJECT_NAME" &> /dev/null; then
    echo -e "${GREEN}✅ Config '$config' already exists${NC}"
  else
    echo -e "${YELLOW}📦 Creating config '$config'...${NC}"
    CONFIG_OUTPUT=$(doppler configs create "$config" --project "$PROJECT_NAME" --format json 2>&1)
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ Config '$config' created${NC}"
    else
      echo -e "${RED}❌ Failed to create config '$config'${NC}"
      echo "   Error: $CONFIG_OUTPUT"
      exit 1
    fi
  fi
done

echo ""

# Verify all configs
ALL_CONFIGS=$(doppler configs get --project "$PROJECT_NAME" --format json 2>/dev/null || echo "[]")
echo -e "${BLUE}📋 Available configs:${NC}"
for config in "${CONFIGS[@]}"; do
  if echo "$ALL_CONFIGS" | grep -q "\"name\":\"$config\""; then
    echo -e "   ${GREEN}✅${NC} $config"
  else
    echo -e "   ${RED}❌${NC} $config (missing)"
  fi
done

echo ""

# ============================================
# STEP 3: Create service tokens
# ============================================
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3: Service Tokens Creation${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

TOKENS_FILE="$PROJECT_ROOT/temp-doppler-service-tokens.txt"
echo "# Doppler Service Tokens - Created: $(date)" > "$TOKENS_FILE"
echo "# ⚠️  KEEP THESE TOKENS SECURE - DO NOT COMMIT TO GIT" >> "$TOKENS_FILE"
echo "# This file is in .gitignore and should never be committed" >> "$TOKENS_FILE"
echo "" >> "$TOKENS_FILE"

TOKEN_CREATED_COUNT=0
TOKEN_EXISTING_COUNT=0

for config in "${CONFIGS[@]}"; do
  TOKEN_NAME="${config}-service-token"
  
  echo -e "${BLUE}Creating token for: ${config}${NC}"
  
  # Check if token already exists
  if doppler configs tokens get "$TOKEN_NAME" --project "$PROJECT_NAME" --config "$config" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Token '$TOKEN_NAME' already exists${NC}"
    echo "   Skipping creation (use existing token or delete first)"
    TOKEN_EXISTING_COUNT=$((TOKEN_EXISTING_COUNT + 1))
    
    # Try to get existing token (may not work, but worth trying)
    EXISTING_TOKEN=$(doppler configs tokens get "$TOKEN_NAME" --project "$PROJECT_NAME" --config "$config" --format json 2>/dev/null | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
    
    if [ -n "$EXISTING_TOKEN" ]; then
      echo "" >> "$TOKENS_FILE"
      echo "# ${config} config (existing)" >> "$TOKENS_FILE"
      echo "DOPPLER_TOKEN_${config^^}=${EXISTING_TOKEN}" >> "$TOKENS_FILE"
      echo "DOPPLER_PROJECT=${PROJECT_NAME}" >> "$TOKENS_FILE"
      echo "DOPPLER_CONFIG=${config}" >> "$TOKENS_FILE"
    fi
  else
    # Create new token
    TOKEN_OUTPUT=$(doppler configs tokens create "$TOKEN_NAME" \
      --project "$PROJECT_NAME" \
      --config "$config" \
      --format json 2>&1)
    
    if [ $? -eq 0 ]; then
      TOKEN_VALUE=$(echo "$TOKEN_OUTPUT" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
      
      if [ -n "$TOKEN_VALUE" ]; then
        echo -e "${GREEN}✅ Token created for: ${config}${NC}"
        TOKEN_CREATED_COUNT=$((TOKEN_CREATED_COUNT + 1))
        echo "" >> "$TOKENS_FILE"
        echo "# ${config} config" >> "$TOKENS_FILE"
        echo "DOPPLER_TOKEN_${config^^}=${TOKEN_VALUE}" >> "$TOKENS_FILE"
        echo "DOPPLER_PROJECT=${PROJECT_NAME}" >> "$TOKENS_FILE"
        echo "DOPPLER_CONFIG=${config}" >> "$TOKENS_FILE"
      else
        echo -e "${YELLOW}⚠️  Token created but value not extracted${NC}"
        echo "   Check Doppler dashboard for token value"
        echo "" >> "$TOKENS_FILE"
        echo "# ${config} config (check dashboard)" >> "$TOKENS_FILE"
        echo "$TOKEN_OUTPUT" >> "$TOKENS_FILE"
      fi
    else
      echo -e "${RED}❌ Failed to create token for: ${config}${NC}"
      echo "   Error: $TOKEN_OUTPUT"
    fi
  fi
  echo ""
done

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   Project: ${GREEN}${PROJECT_NAME}${NC}"
echo -e "   Configs: ${GREEN}dev, staging, production${NC}"
echo -e "   Tokens created: ${GREEN}${TOKEN_CREATED_COUNT}${NC}"
echo -e "   Tokens existing: ${YELLOW}${TOKEN_EXISTING_COUNT}${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "   Tokens saved to: ${BLUE}${TOKENS_FILE}${NC}"
echo -e "   ${RED}DO NOT COMMIT THIS FILE TO GIT${NC}"
echo -e "   (File is in .gitignore)"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Review tokens: cat $TOKENS_FILE"
echo "   2. Add tokens to Railway environment variables"
echo "   3. Add credentials to Doppler:"
echo "      doppler secrets set KEY=\"value\" --project $PROJECT_NAME --config dev"
echo "   4. Test setup: .devcontainer/validate-credentials.sh"
echo ""
