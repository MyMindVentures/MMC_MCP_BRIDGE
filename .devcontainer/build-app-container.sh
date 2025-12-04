#!/bin/bash
# Build and start the app container on Docker Desktop
# This script runs from within the devcontainer to manage the app container

set -e

cd /workspaces/MMC_MCP_BRIDGE || exit 1

echo "🐳 Checking Docker availability..."

# Check if Docker CLI is available
if ! command -v docker &> /dev/null; then
  echo "❌ Docker CLI not found. Please rebuild the devcontainer."
  exit 1
fi

# Check if Docker socket is available
if [ ! -S /var/run/docker.sock ]; then
  echo "❌ Docker socket not found at /var/run/docker.sock"
  echo "   Please ensure Docker Desktop is running and socket is mounted."
  exit 1
fi

# Test Docker connection
if ! docker info > /dev/null 2>&1; then
  echo "❌ Cannot connect to Docker. Is Docker Desktop running?"
  exit 1
fi

echo "✅ Docker is available"

# Check if app container is already running
if docker ps --format '{{.Names}}' | grep -q "^mcp-bridge-dev$"; then
  echo "✅ App container 'mcp-bridge-dev' is already running"
  echo "   To rebuild: docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml build"
  exit 0
fi

# Check if container exists but is stopped
if docker ps -a --format '{{.Names}}' | grep -q "^mcp-bridge-dev$"; then
  echo "🔄 Starting existing app container..."
  docker compose -f docker-compose.dev.yml start
  echo "✅ App container started"
  exit 0
fi

# Build and start the container
echo "🔨 Building app container (this may take a few minutes)..."
docker compose -f docker-compose.dev.yml build

echo "🚀 Starting app container..."
docker compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for container to be healthy..."
sleep 5

# Check container status
if docker ps --format '{{.Names}}' | grep -q "^mcp-bridge-dev$"; then
  echo "✅ App container is running!"
  echo "📝 View logs: docker compose -f docker-compose.dev.yml logs -f"
  echo "🌐 App available at: http://localhost:3000"
  echo "🛑 Stop container: docker compose -f docker-compose.dev.yml stop"
else
  echo "❌ Container failed to start. Check logs:"
  docker compose -f docker-compose.dev.yml logs
  exit 1
fi

