#!/bin/bash
# Create Doppler Service Tokens for mmc-mcp-bridge project
# Creates service tokens for dev, staging, and production configs

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

echo -e "${BLUE}🔐 Doppler Service Tokens Creation${NC}"
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

# Check if project exists
if ! doppler projects get "$PROJECT_NAME" &> /dev/null; then
  echo -e "${YELLOW}⚠️  Project '$PROJECT_NAME' does not exist${NC}"
  echo "   Creating project..."
  doppler projects create "$PROJECT_NAME" || {
    echo -e "${RED}❌ Failed to create project${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Project '$PROJECT_NAME' created${NC}"
else
  echo -e "${GREEN}✅ Project '$PROJECT_NAME' exists${NC}"
fi

echo ""

# Configs to create tokens for
CONFIGS=("dev" "staging" "production")

# Create configs if they don't exist
echo -e "${BLUE}📋 Checking configs...${NC}"
for config in "${CONFIGS[@]}"; do
  if ! doppler configs get "$config" --project "$PROJECT_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Config '$config' does not exist${NC}"
    echo "   Creating config..."
    doppler configs create "$config" --project "$PROJECT_NAME" || {
      echo -e "${RED}❌ Failed to create config '$config'${NC}"
      exit 1
    }
    echo -e "${GREEN}✅ Config '$config' created${NC}"
  else
    echo -e "${GREEN}✅ Config '$config' exists${NC}"
  fi
done

echo ""
echo -e "${BLUE}🔑 Creating Service Tokens...${NC}"
echo ""

# Create service tokens
TOKENS_FILE="$PROJECT_ROOT/temp-doppler-service-tokens.txt"
echo "# Doppler Service Tokens - Created: $(date)" > "$TOKENS_FILE"
echo "# ⚠️  KEEP THESE TOKENS SECURE - DO NOT COMMIT TO GIT" >> "$TOKENS_FILE"
echo "" >> "$TOKENS_FILE"

for config in "${CONFIGS[@]}"; do
  TOKEN_NAME="${config}-service-token"
  
  echo -e "${BLUE}Creating token for: ${config}${NC}"
  
  # Check if token already exists
  if doppler configs tokens get "$TOKEN_NAME" --project "$PROJECT_NAME" --config "$config" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Token '$TOKEN_NAME' already exists${NC}"
    echo "   Skipping creation (use existing token or delete first)"
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
        echo "" >> "$TOKENS_FILE"
        echo "# ${config} config" >> "$TOKENS_FILE"
        echo "DOPPLER_TOKEN_${config^^}=${TOKEN_VALUE}" >> "$TOKENS_FILE"
        echo "DOPPLER_PROJECT=${PROJECT_NAME}" >> "$TOKENS_FILE"
        echo "DOPPLER_CONFIG=${config}" >> "$TOKENS_FILE"
      else
        echo -e "${YELLOW}⚠️  Token created but value not extracted${NC}"
        echo "   Check Doppler dashboard for token value"
        echo "$TOKEN_OUTPUT" >> "$TOKENS_FILE"
      fi
    else
      echo -e "${RED}❌ Failed to create token for: ${config}${NC}"
      echo "   Error: $TOKEN_OUTPUT"
    fi
  fi
  echo ""
done

echo "=========================================="
echo -e "${GREEN}✅ Service Tokens Creation Complete${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "   Tokens saved to: ${BLUE}${TOKENS_FILE}${NC}"
echo -e "   ${RED}DO NOT COMMIT THIS FILE TO GIT${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "   1. Add tokens to Railway environment variables"
echo "   2. Add tokens to DevContainer configuration"
echo "   3. Test credentials: .devcontainer/validate-credentials.sh"
echo ""
