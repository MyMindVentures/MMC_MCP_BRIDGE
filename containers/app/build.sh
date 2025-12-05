#!/bin/bash
# Build and start the Full Stack App container
set -e

cd /workspaces/MMC_MCP_BRIDGE

echo "🔨 Building full stack app container..."
docker compose build app

echo "🚀 Starting full stack app container..."
docker compose up -d app

echo "✅ Full stack app container started!"
echo "📝 View logs: docker compose logs -f app"
echo "🌐 App available at: http://localhost:3000"
echo "🏭 Production mode"
