#!/bin/bash
# Test script for n8n MCP integration

set -e

echo "🧪 Testing n8n MCP Integration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_KEY="${MCP_BRIDGE_API_KEY:-test}"
BASE_URL="${MCP_BRIDGE_URL:-http://localhost:3000}"
N8N_API_KEY="${N8N_INSTANCE_APIKEY:-${N8N_API_KEY}}"
N8N_BASE_URL="${N8N_BASE_URL:-https://mmc-n8n-instance.up.railway.app}"

echo "📋 Configuration:"
echo "  MCP Bridge URL: $BASE_URL"
echo "  n8n Base URL: $N8N_BASE_URL"
echo "  n8n API Key: ${N8N_API_KEY:+***configured***}${N8N_API_KEY:-NOT SET}"
echo ""

# Test 1: Check if n8n server is listed
echo "1️⃣  Testing: GET /api/servers (check n8n server)"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/servers" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | jq -e '.servers[] | select(.name == "n8n")' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ n8n server found in servers list${NC}"
  N8N_TOOLS=$(echo "$RESPONSE" | jq '.servers[] | select(.name == "n8n") | .tools | length')
  echo "   Tools available: $N8N_TOOLS"
else
  echo -e "${YELLOW}⚠️  n8n server not found or not configured${NC}"
  echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: List n8n tools via SSE endpoint (tools/list)
echo "2️⃣  Testing: POST /api/sse (tools/list)"
SSE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sse" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }')

if echo "$SSE_RESPONSE" | jq -e '.result.tools[] | select(.name | startswith("n8n_"))' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ n8n tools found in tools/list${NC}"
  N8N_TOOL_NAMES=$(echo "$SSE_RESPONSE" | jq -r '.result.tools[] | select(.name | startswith("n8n_")) | .name' | head -5)
  echo "   Sample tools:"
  echo "$N8N_TOOL_NAMES" | while read tool; do
    echo "     - $tool"
  done
else
  echo -e "${YELLOW}⚠️  No n8n tools found${NC}"
  echo "   Response: $(echo "$SSE_RESPONSE" | jq -c '.' | head -c 200)"
fi
echo ""

# Test 3: Test listWorkflows tool (if n8n is configured)
if [ -n "$N8N_API_KEY" ]; then
  echo "3️⃣  Testing: POST /api/mcp/n8n/listWorkflows"
  LIST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcp/n8n/listWorkflows" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{}')
  
  if echo "$LIST_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ listWorkflows executed successfully${NC}"
    WORKFLOW_COUNT=$(echo "$LIST_RESPONSE" | jq '.result.content[0].text' | jq 'fromjson | length' 2>/dev/null || echo "N/A")
    echo "   Workflows found: $WORKFLOW_COUNT"
  else
    echo -e "${RED}❌ listWorkflows failed${NC}"
    echo "   Response: $(echo "$LIST_RESPONSE" | jq -c '.' | head -c 300)"
  fi
else
  echo -e "${YELLOW}⏭️  Skipping listWorkflows test (N8N_API_KEY not set)${NC}"
fi
echo ""

# Test 4: Test getWorkflow tool (if we have a workflow ID)
if [ -n "$N8N_API_KEY" ] && [ -n "$N8N_WORKFLOW_ID" ]; then
  echo "4️⃣  Testing: POST /api/mcp/n8n/getWorkflow"
  GET_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcp/n8n/getWorkflow" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"workflowId\": \"$N8N_WORKFLOW_ID\"}")
  
  if echo "$GET_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ getWorkflow executed successfully${NC}"
  else
    echo -e "${RED}❌ getWorkflow failed${NC}"
    echo "   Response: $(echo "$GET_RESPONSE" | jq -c '.' | head -c 300)"
  fi
else
  echo -e "${YELLOW}⏭️  Skipping getWorkflow test (N8N_WORKFLOW_ID not set)${NC}"
fi
echo ""

# Test 5: Test buildWorkflowFromDescription (AI builder)
if [ -n "$N8N_API_KEY" ]; then
  echo "5️⃣  Testing: POST /api/mcp/n8n/buildWorkflowFromDescription"
  BUILD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/mcp/n8n/buildWorkflowFromDescription" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "description": "Create a simple workflow that sends a Slack message when triggered"
    }')
  
  if echo "$BUILD_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ buildWorkflowFromDescription executed successfully${NC}"
  else
    echo -e "${YELLOW}⚠️  buildWorkflowFromDescription response:${NC}"
    echo "   $(echo "$BUILD_RESPONSE" | jq -c '.' | head -c 300)"
  fi
else
  echo -e "${YELLOW}⏭️  Skipping buildWorkflowFromDescription test (N8N_API_KEY not set)${NC}"
fi
echo ""

echo "================================"
echo -e "${GREEN}✅ Testing complete!${NC}"
echo ""
echo "💡 Tips:"
echo "  - Set N8N_INSTANCE_APIKEY or N8N_API_KEY to test n8n tools"
echo "  - Set N8N_BASE_URL to point to your n8n instance"
echo "  - Set N8N_WORKFLOW_ID to test getWorkflow with a specific workflow"
echo ""
