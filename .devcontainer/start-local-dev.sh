#!/bin/bash
# Start local Docker container for MCP Bridge development with hot reload
# REUSES existing container and image to prevent Docker bloat

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🐳 Starting MCP Bridge local development container..."

# Check if container exists and is running
if docker ps --format '{{.Names}}' | grep -q "^mmc-mcp-bridge-dev$"; then
    echo "✅ Container is already running - REUSING existing container"
    echo "💡 Code changes will hot reload automatically"
    exit 0
fi

# Check if container exists but is stopped
if docker ps -a --format '{{.Names}}' | grep -q "^mmc-mcp-bridge-dev$"; then
    echo "📦 Container exists but stopped - REUSING existing container"
    docker compose -f docker-compose.dev.yml start
else
    # Check if image exists
    if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^mmc-mcp-bridge-dev:latest$"; then
        echo "🖼️  Image exists - REUSING existing image"
        echo "🏗️  Starting new container from existing image..."
        docker compose -f docker-compose.dev.yml up -d --no-build
    else
        echo "🏗️  Building image (first time only)..."
        docker compose -f docker-compose.dev.yml build
        docker compose -f docker-compose.dev.yml up -d
    fi
fi

echo ""
echo "⏳ Waiting for dev server to start..."
sleep 5

# Check if server is responding
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo ""
        echo "✅ MCP Bridge is running!"
        echo ""
        echo "📍 Local endpoints:"
        echo "   - Health: http://localhost:3000/api/health"
        echo "   - SSE:    http://localhost:3000/api/sse"
        echo "   - Frontend: http://localhost:3000"
        echo ""
        echo "🔧 MCP Client configured to: http://localhost:3000/api/sse"
        echo ""
        echo "📝 View logs: docker compose -f docker-compose.dev.yml logs -f"
        echo "🛑 Stop: docker compose -f docker-compose.dev.yml down"
        exit 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 1
done

echo ""
echo "⚠️  Server did not start within $MAX_RETRIES seconds"
echo "📝 Check logs: docker compose -f docker-compose.dev.yml logs"
exit 1
