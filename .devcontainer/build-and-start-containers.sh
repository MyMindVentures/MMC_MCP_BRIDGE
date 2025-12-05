#!/bin/bash
# Build and start both E2E and App containers

set -e

cd /workspaces/MMC_MCP_BRIDGE || exit 1

echo "🔧 Checking Docker access..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker not accessible. Fixing permissions..."
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Still cannot access Docker. Please check Docker Desktop is running."
        exit 1
    fi
fi

echo "✅ Docker is accessible"
echo ""

# Build E2E container
echo "🔨 Building E2E container..."
docker compose -f docker-compose.e2e.yml build

echo ""
echo "🚀 Starting E2E container..."
docker compose -f docker-compose.e2e.yml up -d

echo ""
echo "🔨 Building App container..."
docker compose -f docker-compose.dev.yml build

echo ""
echo "🚀 Starting App container..."
docker compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Waiting for containers to be healthy..."
sleep 5

echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|MMC_MCP_Bridge" || docker ps --filter "name=MMC_MCP_Bridge" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Both containers are running!"
echo ""
echo "🌐 Services:"
echo "  - E2E Container: MMC_MCP_Bridge_E2E"
echo "  - App Container: http://localhost:3000"
echo "  - MCP Bridge SSE: http://localhost:3000/api/sse"
echo "  - Health Check: http://localhost:3000/api/health"
echo ""
echo "📝 Useful commands:"
echo "  - View E2E logs: docker compose -f docker-compose.e2e.yml logs -f"
echo "  - View App logs: docker compose -f docker-compose.dev.yml logs -f"
echo "  - Stop all: docker compose -f docker-compose.e2e.yml stop && docker compose -f docker-compose.dev.yml stop"
