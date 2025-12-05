#!/bin/bash
# STANDALONE: Build and run App container
# No dependencies - just works

set -e

cd "$(dirname "$0")"

echo "🔨 Building App container..."
docker compose -f docker-compose.dev.yml build

echo ""
echo "🚀 Starting App container..."
docker compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ Waiting for app to be ready..."
sleep 5

echo ""
echo "✅ App container is running!"
echo "🌐 App: http://localhost:3000"
echo "🔌 MCP Bridge: http://localhost:3000/api/sse"
echo "🏥 Health: http://localhost:3000/api/health"
echo ""
echo "📝 View logs: docker compose -f docker-compose.dev.yml logs -f"
echo "🛑 Stop: docker compose -f docker-compose.dev.yml stop"
