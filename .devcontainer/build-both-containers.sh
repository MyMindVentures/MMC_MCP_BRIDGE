#!/bin/bash
# Build both E2E and App containers
# Fixes Docker permissions if needed

set -e

cd /workspaces/MMC_MCP_BRIDGE || exit 1

echo "🔧 Checking Docker permissions..."

# Try to fix Docker socket permissions
if [ -S /var/run/docker.sock ]; then
    # Check if we can access Docker
    if ! docker info > /dev/null 2>&1; then
        echo "⚠️  Docker permission issue detected. Attempting to fix..."
        sudo chmod 666 /var/run/docker.sock 2>/dev/null || {
            echo "❌ Cannot fix permissions automatically."
            echo "   Please run: sudo chmod 666 /var/run/docker.sock"
            echo "   Or restart Docker Desktop"
            exit 1
        }
    fi
fi

# Verify Docker is accessible
if ! docker info > /dev/null 2>&1; then
    echo "❌ Cannot connect to Docker. Is Docker Desktop running?"
    exit 1
fi

echo "✅ Docker is accessible"
echo ""

# Build E2E container
echo "🚀 Building E2E container..."
docker compose -f docker-compose.e2e.yml build

echo ""
echo "🚀 Building App container..."
docker compose -f docker-compose.dev.yml build

echo ""
echo "✅ Both containers built successfully!"
echo ""
echo "To start the containers:"
echo "  docker compose -f docker-compose.e2e.yml up -d"
echo "  docker compose -f docker-compose.dev.yml up -d"
