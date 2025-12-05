#!/bin/bash
# Build and start the Development container
# Usage: ./containers/dev/build.sh [--tag] [--push-hub] [--push-ghcr]
set -e

cd /workspaces/MMC_MCP_BRIDGE

VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "🔨 Building development container..."
echo "   Version: $VERSION"
echo "   Build Date: $BUILD_DATE"
echo "   Git Commit: $VCS_REF"

docker compose build \
  --build-arg VERSION="$VERSION" \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  --build-arg VCS_REF="$VCS_REF" \
  dev

# Tag for Docker Hub
if [[ "$*" == *"--tag"* ]] || [[ "$*" == *"--push-hub"* ]] || [[ "$*" == *"--push-ghcr"* ]]; then
  echo "🏷️  Tagging images..."
  docker tag mmc-mcp-bridge-dev:latest mymindventures/mmc-mcp-bridge-dev:latest
  docker tag mmc-mcp-bridge-dev:latest mymindventures/mmc-mcp-bridge-dev:"$VERSION"
  docker tag mmc-mcp-bridge-dev:latest ghcr.io/mymindventures/mmc-mcp-bridge-dev:latest
  docker tag mmc-mcp-bridge-dev:latest ghcr.io/mymindventures/mmc-mcp-bridge-dev:"$VERSION"
fi

# Push to Docker Hub
if [[ "$*" == *"--push-hub"* ]]; then
  echo "📤 Pushing to Docker Hub..."
  docker push mymindventures/mmc-mcp-bridge-dev:latest
  docker push mymindventures/mmc-mcp-bridge-dev:"$VERSION"
fi

# Push to GHCR
if [[ "$*" == *"--push-ghcr"* ]]; then
  echo "📤 Pushing to GitHub Container Registry..."
  docker push ghcr.io/mymindventures/mmc-mcp-bridge-dev:latest
  docker push ghcr.io/mymindventures/mmc-mcp-bridge-dev:"$VERSION"
fi

echo "🚀 Starting development container..."
docker compose up -d dev

echo "✅ Development container started!"
echo "📝 View logs: docker compose logs -f dev"
echo "🌐 App available at: http://localhost:3000"
echo "🔄 Hot-reload enabled"
echo ""
echo "📦 Image: mmc-mcp-bridge-dev:latest"
echo "   Docker Hub: mymindventures/mmc-mcp-bridge-dev:$VERSION"
echo "   GHCR: ghcr.io/mymindventures/mmc-mcp-bridge-dev:$VERSION"

