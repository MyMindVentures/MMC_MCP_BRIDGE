#!/bin/bash
# Build and start the E2E Test container
set -e

cd /workspaces/MMC_MCP_BRIDGE

echo "🔨 Building E2E test container..."
docker compose build e2e

echo "🚀 Starting E2E test container..."
docker compose up -d e2e

echo "✅ E2E test container started!"
echo "📝 View logs: docker compose logs -f e2e"
echo "🧪 Running tests..."
