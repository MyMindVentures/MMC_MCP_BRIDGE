#!/bin/bash
# Docker Build & Publish - Vervangt docker-hub-publish.yml
# Build en push Docker images naar registries
set -e

# Only e2e container remains - dev and app were removed (replaced by devcontainer)
CONTAINERS=("e2e")
REGISTRY_HUB="mymindventures"
REGISTRY_GHCR="ghcr.io/mymindventures"
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "latest")
PUSH_HUB=${PUSH_HUB:-false}
PUSH_GHCR=${PUSH_GHCR:-false}

echo "🐳 Building Docker Images..."
echo "   Version: ${VERSION}"

for container in "${CONTAINERS[@]}"; do
    echo ""
    echo "🔨 Building ${container} container..."
    
    # Build container
    docker compose build \
        --build-arg VERSION="${VERSION}" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
        "${container}" || {
        echo "❌ Failed to build ${container} container"
        exit 1
    }
    
    # Tag for Docker Hub
    if [ "$PUSH_HUB" = "true" ]; then
        echo "🏷️  Tagging for Docker Hub..."
        docker tag "mmc-mcp-bridge-${container}:latest" "${REGISTRY_HUB}/mmc-mcp-bridge-${container}:latest"
        docker tag "mmc-mcp-bridge-${container}:latest" "${REGISTRY_HUB}/mmc-mcp-bridge-${container}:${VERSION}"
        
        echo "📤 Pushing to Docker Hub..."
        docker push "${REGISTRY_HUB}/mmc-mcp-bridge-${container}:latest" || {
            echo "⚠️  Failed to push to Docker Hub (non-blocking)"
        }
        docker push "${REGISTRY_HUB}/mmc-mcp-bridge-${container}:${VERSION}" || {
            echo "⚠️  Failed to push to Docker Hub (non-blocking)"
        }
    fi
    
    # Tag for GHCR
    if [ "$PUSH_GHCR" = "true" ]; then
        echo "🏷️  Tagging for GHCR..."
        docker tag "mmc-mcp-bridge-${container}:latest" "${REGISTRY_GHCR}/mmc-mcp-bridge-${container}:latest"
        docker tag "mmc-mcp-bridge-${container}:latest" "${REGISTRY_GHCR}/mmc-mcp-bridge-${container}:${VERSION}"
        
        echo "📤 Pushing to GHCR..."
        docker push "${REGISTRY_GHCR}/mmc-mcp-bridge-${container}:latest" || {
            echo "⚠️  Failed to push to GHCR (non-blocking)"
        }
        docker push "${REGISTRY_GHCR}/mmc-mcp-bridge-${container}:${VERSION}" || {
            echo "⚠️  Failed to push to GHCR (non-blocking)"
        }
    fi
    
    echo "✅ ${container} container built successfully!"
done

echo ""
echo "✅ All Docker images built successfully!"

