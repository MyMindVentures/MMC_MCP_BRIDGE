#!/bin/bash
# Sequential build script: DevContainer → E2E → App
# This script runs from within the devcontainer to build containers in sequence

set -e

cd /workspaces/MMC_MCP_BRIDGE || exit 1

echo "🚀 Starting sequential container build process..."
echo ""

# Step 1: Verify devcontainer is running
echo "📋 Step 1/3: Verifying devcontainer is running..."
if [ ! -f /workspaces/MMC_MCP_BRIDGE/package.json ]; then
  echo "❌ Devcontainer not properly initialized. Please rebuild devcontainer."
  exit 1
fi
echo "✅ Devcontainer is running"
echo ""

# Step 2: Build and start E2E container
echo "📋 Step 2/3: Building and starting E2E container..."
echo "⏳ This may take several minutes..."
/usr/local/bin/build-e2e-container.sh

# Wait for E2E to be fully ready
echo ""
echo "⏳ Waiting for E2E container to be fully ready..."
sleep 10

# Verify E2E is running
if ! docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
  echo "❌ E2E container failed to start. Aborting."
  exit 1
fi
echo "✅ E2E container is running"
echo ""

# Step 3: Build and start App container
echo "📋 Step 3/3: Building and starting App container..."
echo "⏳ This may take several minutes..."
/usr/local/bin/build-app-container.sh

# Wait for App to be fully ready
echo ""
echo "⏳ Waiting for App container to be fully ready..."
sleep 10

# Verify App is running
if ! docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_App$"; then
  echo "❌ App container failed to start. Aborting."
  exit 1
fi
echo "✅ App container is running"
echo ""

# Final status
echo "🎉 All containers are running!"
echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|MMC_MCP_Bridge"
echo ""
echo "🌐 Services:"
echo "  - DevContainer: /workspaces/MMC_MCP_BRIDGE"
echo "  - E2E Container: MMC_MCP_Bridge_E2E"
echo "  - App Container: http://localhost:3000"
echo "  - MCP Bridge SSE: http://localhost:3000/api/sse"
echo "  - Health Check: http://localhost:3000/api/health"
echo ""
echo "📝 Useful commands:"
echo "  - View E2E logs: docker compose -f docker-compose.e2e.yml logs -f"
echo "  - View App logs: docker compose -f docker-compose.dev.yml logs -f"
echo "  - Stop all: docker compose -f docker-compose.e2e.yml stop && docker compose -f docker-compose.dev.yml stop"

