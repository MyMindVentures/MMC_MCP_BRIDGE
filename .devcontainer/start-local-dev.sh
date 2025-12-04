#!/bin/bash
# Start local Docker container for MCP Bridge development with hot reload

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🐳 Starting MCP Bridge local development container..."

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^mmc-mcp-bridge-dev$"; then
    echo "📦 Container exists, checking status..."
    
    if docker ps --format '{{.Names}}' | grep -q "^mmc-mcp-bridge-dev$"; then
        echo "✅ Container is already running"
        echo "🔄 Restarting to apply changes..."
        docker-compose -f docker-compose.dev.yml restart
    else
        echo "▶️  Starting existing container..."
        docker-compose -f docker-compose.dev.yml up -d
    fi
else
    echo "🏗️  Building and starting new container..."
    docker-compose -f docker-compose.dev.yml up -d --build
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
        echo "📝 View logs: docker-compose -f docker-compose.dev.yml logs -f"
        echo "🛑 Stop: docker-compose -f docker-compose.dev.yml down"
        exit 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 1
done

echo ""
echo "⚠️  Server did not start within $MAX_RETRIES seconds"
echo "📝 Check logs: docker-compose -f docker-compose.dev.yml logs"
exit 1

