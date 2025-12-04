#!/bin/bash
# Create OAuth2 Client for n8n AI Agent
# Usage: ./scripts/create-oauth2-client.sh [n8n-url] [admin-api-key]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     MMC MCP BRIDGE - OAuth2 Client Creator           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get parameters
N8N_URL="${1:-http://localhost:5678}"
ADMIN_API_KEY="${2:-${MCP_BRIDGE_API_KEY}}"
BRIDGE_URL="${BRIDGE_URL:-https://mmcmcphttpbridge-production.up.railway.app}"

if [ -z "$ADMIN_API_KEY" ]; then
  echo -e "${RED}❌ Error: Admin API key required${NC}"
  echo -e "${YELLOW}Usage: $0 [n8n-url] [admin-api-key]${NC}"
  echo -e "${YELLOW}Or set: export MCP_BRIDGE_API_KEY=your-key${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Bridge URL: ${BRIDGE_URL}"
echo -e "  n8n URL: ${N8N_URL}"
echo ""

# Check if Railway is healthy
echo -e "${BLUE}🔍 Checking Railway health...${NC}"
HEALTH=$(curl -s "${BRIDGE_URL}/api/health" | jq -r '.status' 2>/dev/null || echo "error")

if [ "$HEALTH" != "healthy" ]; then
  echo -e "${RED}❌ Railway is not healthy (status: $HEALTH)${NC}"
  echo -e "${YELLOW}⏳ Please wait for deployment to complete${NC}"
  echo -e "${YELLOW}💡 Check: https://railway.app/project/your-project${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Railway is healthy${NC}"
echo ""

# Create OAuth2 client
echo -e "${BLUE}🔐 Creating OAuth2 client...${NC}"

RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer ${ADMIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"n8n AI Agent\",
    \"redirectUris\": [
      \"${N8N_URL}/oauth/callback\",
      \"${N8N_URL}/rest/oauth2-credential/callback\"
    ],
    \"grants\": [\"authorization_code\", \"refresh_token\", \"client_credentials\"],
    \"scopes\": [\"*\"]
  }" \
  "${BRIDGE_URL}/api/oauth/clients")

# Check for errors
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${RED}❌ Error creating client:${NC}"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

# Extract credentials
CLIENT_ID=$(echo "$RESPONSE" | jq -r '.client.clientId')
CLIENT_SECRET=$(echo "$RESPONSE" | jq -r '.client.clientSecret')

if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "null" ]; then
  echo -e "${RED}❌ Failed to create OAuth2 client${NC}"
  echo "$RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ OAuth2 client created successfully!${NC}"
echo ""

# Display credentials
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🔑 OAUTH2 CREDENTIALS                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  SAVE THESE CREDENTIALS SECURELY!${NC}"
echo -e "${YELLOW}⚠️  The client secret will NOT be shown again!${NC}"
echo ""
echo -e "${GREEN}Client ID:${NC}"
echo -e "  ${CLIENT_ID}"
echo ""
echo -e "${GREEN}Client Secret:${NC}"
echo -e "  ${CLIENT_SECRET}"
echo ""

# Display n8n configuration
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           📝 N8N CONFIGURATION                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}In n8n → Credentials → Add Credential → MCP Client Tool:${NC}"
echo ""
echo -e "  ${BLUE}Authentication:${NC} OAuth2"
echo -e "  ${BLUE}Grant Type:${NC} Authorization Code"
echo ""
echo -e "  ${BLUE}Authorization URL:${NC}"
echo -e "    ${BRIDGE_URL}/api/oauth/authorize"
echo ""
echo -e "  ${BLUE}Access Token URL:${NC}"
echo -e "    ${BRIDGE_URL}/api/oauth/token"
echo ""
echo -e "  ${BLUE}Client ID:${NC}"
echo -e "    ${CLIENT_ID}"
echo ""
echo -e "  ${BLUE}Client Secret:${NC}"
echo -e "    ${CLIENT_SECRET}"
echo ""
echo -e "  ${BLUE}Scope:${NC} *"
echo ""
echo -e "  ${BLUE}Auth URI Query Parameters:${NC} {}"
echo -e "  ${BLUE}Authentication:${NC} Body"
echo ""

# Save to file
CONFIG_FILE="oauth2-n8n-config.json"
cat > "$CONFIG_FILE" <<EOF
{
  "name": "n8n AI Agent",
  "clientId": "${CLIENT_ID}",
  "clientSecret": "${CLIENT_SECRET}",
  "authorizationUrl": "${BRIDGE_URL}/api/oauth/authorize",
  "accessTokenUrl": "${BRIDGE_URL}/api/oauth/token",
  "scope": "*",
  "redirectUris": [
    "${N8N_URL}/oauth/callback",
    "${N8N_URL}/rest/oauth2-credential/callback"
  ],
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo -e "${GREEN}✅ Configuration saved to: ${CONFIG_FILE}${NC}"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🚀 NEXT STEPS                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  1️⃣  Open n8n: ${N8N_URL}"
echo -e "  2️⃣  Go to: Credentials → Add Credential"
echo -e "  3️⃣  Select: MCP Client Tool"
echo -e "  4️⃣  Choose: OAuth2 authentication"
echo -e "  5️⃣  Paste the credentials above"
echo -e "  6️⃣  Click: Connect"
echo -e "  7️⃣  Authorize in the popup window"
echo -e "  8️⃣  Start using MCP tools in your AI Agent! 🎉"
echo ""
echo -e "${GREEN}✨ Done!${NC}"

