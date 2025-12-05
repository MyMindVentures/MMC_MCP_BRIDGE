#!/bin/bash
# STANDALONE: Build and run E2E container
# No dependencies - just works

set -e

cd "$(dirname "$0")"

echo "🔨 Building E2E container..."
docker compose -f docker-compose.e2e.yml build

echo ""
echo "🚀 Starting E2E container..."
docker compose -f docker-compose.e2e.yml up -d

echo ""
echo "✅ E2E container is running!"
echo "📝 View logs: docker compose -f docker-compose.e2e.yml logs -f"
echo "🛑 Stop: docker compose -f docker-compose.e2e.yml stop"
