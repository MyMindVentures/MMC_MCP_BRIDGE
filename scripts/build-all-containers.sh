#!/bin/bash
# Build all containers and push to Docker Hub
# DevContainer, App Container, and E2E Container
# OPTIMIZED: Parallel builds with cache

set -e

DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME:-mymindventures}
PROJECT_NAME="mmc-mcp-bridge"
VERSION=${VERSION:-2.0.0}

echo "🔨 Building all containers for Docker Hub (PARALLEL)..."
echo "  Username: $DOCKER_HUB_USERNAME"
echo "  Project: $PROJECT_NAME"
echo "  Version: $VERSION"
echo ""

# Build all containers in parallel with cache
echo "📦 Building all containers in parallel..."
(
  docker build \
    -f .devcontainer/Dockerfile \
    -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:$VERSION \
    -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:latest \
    --cache-from $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:latest \
    --label "com.mmc.project=$PROJECT_NAME" \
    --label "com.mmc.component=devcontainer" \
    --label "com.mmc.version=$VERSION" \
    --label "com.mmc.name=MMC_MCP_Bridge_DevContainer" \
    --label "com.mmc.image=$DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:$VERSION" \
    --label "org.opencontainers.image.title=MMC_MCP_Bridge_DevContainer" \
    . > /tmp/build-devcontainer.log 2>&1 &
  echo "  ✅ MMC_MCP_Bridge_DevContainer build started (PID: $!)"
) &

(
  docker build \
    -f .devcontainer/Dockerfile.prod \
    -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:$VERSION \
    -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:latest \
    --cache-from $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:latest \
    --label "com.mmc.project=$PROJECT_NAME" \
    --label "com.mmc.component=app" \
    --label "com.mmc.version=$VERSION" \
    --label "com.mmc.name=MMC_MCP_Bridge_App" \
    --label "com.mmc.container=MMC_MCP_Bridge_App" \
    --label "com.mmc.image=$DOCKER_HUB_USERNAME/$PROJECT_NAME-app:$VERSION" \
    --label "org.opencontainers.image.title=MMC_MCP_Bridge_App" \
    . > /tmp/build-app.log 2>&1 &
  echo "  ✅ MMC_MCP_Bridge_App build started (PID: $!)"
) &

(
  docker build \
    -f .devcontainer/Dockerfile.e2e \
    -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:$VERSION \
    -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:latest \
    --cache-from $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:latest \
    --label "com.mmc.project=$PROJECT_NAME" \
    --label "com.mmc.component=e2e" \
    --label "com.mmc.version=$VERSION" \
    --label "com.mmc.name=MMC_MCP_Bridge_E2E" \
    --label "com.mmc.container=MMC_MCP_Bridge_E2E" \
    --label "com.mmc.image=$DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:$VERSION" \
    --label "org.opencontainers.image.title=MMC_MCP_Bridge_E2E" \
    . > /tmp/build-e2e.log 2>&1 &
  echo "  ✅ MMC_MCP_Bridge_E2E build started (PID: $!)"
) &

# Wait for all builds to complete
echo ""
echo "⏳ Waiting for all builds to complete..."
wait

# Check results
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ All containers built successfully!"
  echo ""
  echo "📊 Build logs:"
  echo "  MMC_MCP_Bridge_DevContainer: tail -20 /tmp/build-devcontainer.log"
  echo "  MMC_MCP_Bridge_App: tail -20 /tmp/build-app.log"
  echo "  MMC_MCP_Bridge_E2E: tail -20 /tmp/build-e2e.log"
else
  echo ""
  echo "❌ Some builds failed. Check logs above."
  exit 1
fi

echo ""
echo "✅ All containers built successfully!"
echo ""
echo "To push to Docker Hub:"
echo "  docker login"
echo "  docker push $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:latest"
echo "  docker push $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:latest"
echo "  docker push $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:latest"

