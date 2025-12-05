#!/bin/bash
# STANDALONE: Build and run ALL containers
# No dependencies - just works

set -e

cd "$(dirname "$0")"

echo "🚀 Building and starting ALL containers..."
echo ""

# Build and start E2E
echo "📦 E2E Container..."
docker compose -f docker-compose.e2e.yml build
docker compose -f docker-compose.e2e.yml up -d

echo ""

# Build and start App
echo "📦 App Container..."
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Waiting for containers to be ready..."
sleep 5

echo ""
echo "✅ All containers are running!"
echo ""
echo "📊 Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|MMC_MCP_Bridge" || docker ps --filter "name=MMC_MCP_Bridge"
echo ""
echo "🌐 Services:"
echo "  - E2E Container: MMC_MCP_Bridge_E2E"
echo "  - App Container: http://localhost:3000"
echo "  - MCP Bridge SSE: http://localhost:3000/api/sse"
echo "  - Health Check: http://localhost:3000/api/health"
echo ""
echo "📝 Commands:"
echo "  - E2E logs: docker compose -f docker-compose.e2e.yml logs -f"
echo "  - App logs: docker compose -f docker-compose.dev.yml logs -f"
echo "  - Stop all: docker compose -f docker-compose.e2e.yml stop && docker compose -f docker-compose.dev.yml stop"
