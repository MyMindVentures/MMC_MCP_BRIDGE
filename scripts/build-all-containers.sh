#!/bin/bash
# Build all containers and push to Docker Hub
# DevContainer, App Container, and E2E Container

set -e

DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME:-mymindventures}
PROJECT_NAME="mmc-mcp-bridge"
VERSION=${VERSION:-2.0.0}

echo "🔨 Building all containers for Docker Hub..."
echo "  Username: $DOCKER_HUB_USERNAME"
echo "  Project: $PROJECT_NAME"
echo "  Version: $VERSION"
echo ""

# Build DevContainer
echo "📦 Building DevContainer..."
docker build \
  -f .devcontainer/Dockerfile \
  -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:$VERSION \
  -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:latest \
  --label "com.mmc.project=$PROJECT_NAME" \
  --label "com.mmc.component=devcontainer" \
  --label "com.mmc.version=$VERSION" \
  .

# Build App Container
echo "📦 Building App Container..."
docker build \
  -f .devcontainer/Dockerfile.prod \
  -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:$VERSION \
  -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:latest \
  --label "com.mmc.project=$PROJECT_NAME" \
  --label "com.mmc.component=app" \
  --label "com.mmc.version=$VERSION" \
  .

# Build E2E Container
echo "📦 Building E2E Container..."
docker build \
  -f .devcontainer/Dockerfile.e2e \
  -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:$VERSION \
  -t $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:latest \
  --label "com.mmc.project=$PROJECT_NAME" \
  --label "com.mmc.component=e2e" \
  --label "com.mmc.version=$VERSION" \
  .

echo ""
echo "✅ All containers built successfully!"
echo ""
echo "To push to Docker Hub:"
echo "  docker login"
echo "  docker push $DOCKER_HUB_USERNAME/$PROJECT_NAME-devcontainer:latest"
echo "  docker push $DOCKER_HUB_USERNAME/$PROJECT_NAME-app:latest"
echo "  docker push $DOCKER_HUB_USERNAME/$PROJECT_NAME-e2e:latest"

