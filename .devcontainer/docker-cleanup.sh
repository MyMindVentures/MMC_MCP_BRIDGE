#!/bin/bash
# Docker cleanup script - removes unused images, containers, and builds
# Prevents Docker bloat while keeping the active dev container

set -e

echo "🧹 Cleaning up Docker resources..."

# Get active container ID
ACTIVE_CONTAINER=$(docker ps -a --filter "name=mmc-mcp-bridge-dev" --format "{{.ID}}" | head -1)
ACTIVE_IMAGE="mmc-mcp-bridge-dev:latest"

echo "📦 Active container: ${ACTIVE_CONTAINER:-none}"
echo "🖼️  Active image: ${ACTIVE_IMAGE}"

# Remove stopped containers (except our dev container)
echo ""
echo "🗑️  Removing stopped containers (keeping dev container)..."
docker ps -a --filter "status=exited" --format "{{.ID}} {{.Names}}" | \
  grep -v "mmc-mcp-bridge-dev" | \
  awk '{print $1}' | \
  xargs -r docker rm 2>/dev/null || true

# Remove dangling images
echo ""
echo "🗑️  Removing dangling images..."
docker image prune -f

# Remove unused images (except our dev image)
echo ""
echo "🗑️  Removing unused images (keeping dev image)..."
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | \
  grep -v "^${ACTIVE_IMAGE}" | \
  grep -v "^<none>" | \
  awk '{print $2}' | \
  xargs -r docker rmi 2>/dev/null || true

# Remove unused build cache
echo ""
echo "🗑️  Removing unused build cache..."
docker builder prune -f

# Show current disk usage
echo ""
echo "💾 Current Docker disk usage:"
docker system df

echo ""
echo "✅ Cleanup complete!"
echo "💡 Dev container and image are preserved"

