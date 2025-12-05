#!/bin/bash
# Build and start the E2E Test container
# Usage: ./containers/e2e/build.sh [--tag] [--push-hub] [--push-ghcr]
set -e

cd /workspaces/MMC_MCP_BRIDGE

VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo "🔨 Building E2E test container..."
echo "   Version: $VERSION"
echo "   Build Date: $BUILD_DATE"
echo "   Git Commit: $VCS_REF"

docker compose build \
  --build-arg VERSION="$VERSION" \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  --build-arg VCS_REF="$VCS_REF" \
  e2e

# Tag for Docker Hub and GHCR
if [[ "$*" == *"--tag"* ]] || [[ "$*" == *"--push-hub"* ]] || [[ "$*" == *"--push-ghcr"* ]]; then
  echo "🏷️  Tagging images..."
  docker tag mmc-mcp-bridge-e2e:latest mymindventures/mmc-mcp-bridge-e2e:latest
  docker tag mmc-mcp-bridge-e2e:latest mymindventures/mmc-mcp-bridge-e2e:"$VERSION"
  docker tag mmc-mcp-bridge-e2e:latest ghcr.io/mymindventures/mmc-mcp-bridge-e2e:latest
  docker tag mmc-mcp-bridge-e2e:latest ghcr.io/mymindventures/mmc-mcp-bridge-e2e:"$VERSION"
fi

# Push to Docker Hub
if [[ "$*" == *"--push-hub"* ]]; then
  echo "📤 Pushing to Docker Hub..."
  docker push mymindventures/mmc-mcp-bridge-e2e:latest
  docker push mymindventures/mmc-mcp-bridge-e2e:"$VERSION"
fi

# Push to GHCR
if [[ "$*" == *"--push-ghcr"* ]]; then
  echo "📤 Pushing to GitHub Container Registry..."
  docker push ghcr.io/mymindventures/mmc-mcp-bridge-e2e:latest
  docker push ghcr.io/mymindventures/mmc-mcp-bridge-e2e:"$VERSION"
fi

echo "🚀 Starting E2E test container..."
docker compose up -d e2e

echo "✅ E2E test container started!"
echo "📝 View logs: docker compose logs -f e2e"
echo "🧪 Running tests..."
echo ""
echo "📦 Image: mmc-mcp-bridge-e2e:latest"
echo "   Docker Hub: mymindventures/mmc-mcp-bridge-e2e:$VERSION"
echo "   GHCR: ghcr.io/mymindventures/mmc-mcp-bridge-e2e:$VERSION"
