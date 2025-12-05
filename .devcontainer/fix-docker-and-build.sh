#!/bin/bash
# Fix Docker permissions and build both containers
# All three options: permissions, group, and build

set -e

cd /workspaces/MMC_MCP_BRIDGE || exit 1

echo "🔧 Option 1: Fixing Docker socket permissions..."
if [ -S /var/run/docker.sock ]; then
    sudo chmod 666 /var/run/docker.sock 2>/dev/null && echo "✅ Socket permissions fixed" || echo "⚠️  Could not fix socket permissions (may need Docker Desktop restart)"
else
    echo "❌ Docker socket not found at /var/run/docker.sock"
    exit 1
fi

echo ""
echo "🔧 Option 2: Adding node user to docker group..."
sudo usermod -aG docker node 2>/dev/null && echo "✅ Node user added to docker group" || echo "⚠️  Could not add to docker group (may already be member)"

echo ""
echo "🔧 Verifying Docker access..."
# Test Docker access
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is accessible!"
    docker --version
else
    echo "⚠️  Docker not accessible yet. Group changes require new session."
    echo "   Try: newgrp docker"
    echo "   Or restart the devcontainer"
    exit 1
fi

echo ""
echo "🚀 Option 3: Building E2E container..."
docker compose -f docker-compose.e2e.yml build

echo ""
echo "🚀 Building App container..."
docker compose -f docker-compose.dev.yml build

echo ""
echo "✅ All done! Both containers built successfully!"
echo ""
echo "To start the containers:"
echo "  docker compose -f docker-compose.e2e.yml up -d"
echo "  docker compose -f docker-compose.dev.yml up -d"
