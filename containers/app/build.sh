#!/bin/bash
# Build and start the Full Stack App container
# Usage: ./containers/app/build.sh [--tag] [--push-hub] [--push-ghcr]
set -e

cd /workspaces/MMC_MCP_BRIDGE

VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "🔨 Building full stack app container..."
echo "   Version: $VERSION"
echo "   Build Date: $BUILD_DATE"
echo "   Git Commit: $VCS_REF"

docker compose build \
  --build-arg VERSION="$VERSION" \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  --build-arg VCS_REF="$VCS_REF" \
  app

# Tag for Docker Hub and GHCR
if [[ "$*" == *"--tag"* ]] || [[ "$*" == *"--push-hub"* ]] || [[ "$*" == *"--push-ghcr"* ]]; then
  echo "🏷️  Tagging images..."
  docker tag mmc-mcp-bridge-app:latest mymindventures/mmc-mcp-bridge-app:latest
  docker tag mmc-mcp-bridge-app:latest mymindventures/mmc-mcp-bridge-app:"$VERSION"
  docker tag mmc-mcp-bridge-app:latest ghcr.io/mymindventures/mmc-mcp-bridge-app:latest
  docker tag mmc-mcp-bridge-app:latest ghcr.io/mymindventures/mmc-mcp-bridge-app:"$VERSION"
fi

# Push to Docker Hub
if [[ "$*" == *"--push-hub"* ]]; then
  echo "📤 Pushing to Docker Hub..."
  docker push mymindventures/mmc-mcp-bridge-app:latest
  docker push mymindventures/mmc-mcp-bridge-app:"$VERSION"
fi

# Push to GHCR
if [[ "$*" == *"--push-ghcr"* ]]; then
  echo "📤 Pushing to GitHub Container Registry..."
  docker push ghcr.io/mymindventures/mmc-mcp-bridge-app:latest
  docker push ghcr.io/mymindventures/mmc-mcp-bridge-app:"$VERSION"
fi

echo "🚀 Starting full stack app container..."
docker compose up -d app

echo "✅ Full stack app container started!"
echo "📝 View logs: docker compose logs -f app"
echo "🌐 App available at: http://localhost:3001"
echo "🏭 Production mode"
echo ""
echo "📦 Image: mmc-mcp-bridge-app:latest"
echo "   Docker Hub: mymindventures/mmc-mcp-bridge-app:$VERSION"
echo "   GHCR: ghcr.io/mymindventures/mmc-mcp-bridge-app:$VERSION"
