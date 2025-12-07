#!/bin/bash
# Setup Doppler Project and Configs
# Creates project and configs, then creates service tokens

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

echo -e "${BLUE}🚀 Doppler Project Setup${NC}"
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
echo -e "${BLUE}📋 User: $(echo "$USER_INFO" | grep -o '"email":"[^"]*' | cut -d'"' -f4 || echo "Unknown")${NC}"
echo ""

# Step 1: Create or verify project
echo -e "${BLUE}Step 1: Creating/Verifying Project${NC}"
if doppler projects get "$PROJECT_NAME" &> /dev/null; then
  echo -e "${GREEN}✅ Project '$PROJECT_NAME' already exists${NC}"
  PROJECT_INFO=$(doppler projects get "$PROJECT_NAME" --format json 2>/dev/null || echo "{}")
  echo -e "${BLUE}   Project ID: $(echo "$PROJECT_INFO" | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "Unknown")${NC}"
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

# Step 2: Create configs
echo -e "${BLUE}Step 2: Creating/Verifying Configs${NC}"
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

# Step 3: List all configs
echo -e "${BLUE}Step 3: Verifying Setup${NC}"
ALL_CONFIGS=$(doppler configs get --project "$PROJECT_NAME" --format json 2>/dev/null || echo "[]")
CONFIG_COUNT=$(echo "$ALL_CONFIGS" | grep -o '"name"' | wc -l || echo "0")

echo -e "${GREEN}✅ Found $CONFIG_COUNT config(s)${NC}"
for config in "${CONFIGS[@]}"; do
  if echo "$ALL_CONFIGS" | grep -q "\"name\":\"$config\""; then
    echo -e "   ${GREEN}✅${NC} $config"
  else
    echo -e "   ${RED}❌${NC} $config (missing)"
  fi
done

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Project Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Project: ${PROJECT_NAME}${NC}"
echo -e "${BLUE}📋 Configs: dev, staging, production${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. Create service tokens: .devcontainer/create-doppler-service-tokens.sh"
echo "   2. Add credentials to Doppler: doppler secrets set KEY=\"value\" --project $PROJECT_NAME --config dev"
echo "   3. Test setup: .devcontainer/validate-credentials.sh"
echo ""
