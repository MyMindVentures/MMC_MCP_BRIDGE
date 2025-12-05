#!/bin/bash
# Build and start the E2E container on Docker Desktop
# This script runs from within the devcontainer to manage the E2E container

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

# Check if E2E container is already running
if docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
  echo "✅ E2E container 'MMC_MCP_Bridge_E2E' is already running"
  echo "   To rebuild: docker compose -f docker-compose.e2e.yml down && docker compose -f docker-compose.e2e.yml build"
  exit 0
fi

# Check if container exists but is stopped
if docker ps -a --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
  echo "🔄 Starting existing E2E container..."
  docker compose -f docker-compose.e2e.yml start
  echo "✅ E2E container started"
  exit 0
fi

# Build and start the container
echo "🔨 Building E2E container (this may take a few minutes)..."
docker compose -f docker-compose.e2e.yml build

echo "🚀 Starting E2E container..."
docker compose -f docker-compose.e2e.yml up -d

echo "⏳ Waiting for E2E container to be ready..."
sleep 5

# Check container status
if docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
  echo "✅ E2E container 'MMC_MCP_Bridge_E2E' is running!"
  echo "📝 View logs: docker compose -f docker-compose.e2e.yml logs -f"
  echo "🛑 Stop container: docker compose -f docker-compose.e2e.yml stop"
  echo "📊 Container info: docker inspect MMC_MCP_Bridge_E2E"
else
  echo "❌ Container failed to start. Check logs:"
  docker compose -f docker-compose.e2e.yml logs
  exit 1
fi

