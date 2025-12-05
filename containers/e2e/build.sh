#!/bin/bash
# Build and start the e2e container
set -e

cd /workspaces/MMC_MCP_BRIDGE

echo "🔨 Building e2e container..."
docker compose build e2e

echo "🚀 Starting e2e container..."
docker compose up -d e2e

echo "✅ E2E container started!"
echo "📝 View logs: docker compose logs -f e2e"
