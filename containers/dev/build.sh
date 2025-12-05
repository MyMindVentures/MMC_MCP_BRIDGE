#!/bin/bash
# Build and start the Development container
set -e

cd /workspaces/MMC_MCP_BRIDGE

echo "🔨 Building development container..."
docker compose build dev

echo "🚀 Starting development container..."
docker compose up -d dev

echo "✅ Development container started!"
echo "📝 View logs: docker compose logs -f dev"
echo "🌐 App available at: http://localhost:3000"
echo "🔄 Hot-reload enabled"

