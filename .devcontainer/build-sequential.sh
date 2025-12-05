#!/bin/bash
# Sequential build script: DevContainer → E2E → App
# This script runs from within the devcontainer to build containers in sequence
# NO script dependencies - all docker compose commands are executed directly

set -e

cd /workspaces/MMC_MCP_BRIDGE || exit 1

echo "🚀 Starting sequential container build process..."
echo ""

# Step 1: Verify devcontainer is running
echo "📋 Step 1/4: Verifying devcontainer is running..."
if [ ! -f /workspaces/MMC_MCP_BRIDGE/package.json ]; then
  echo "❌ Devcontainer not properly initialized. Please rebuild devcontainer."
  exit 1
fi
echo "✅ Devcontainer is running"
echo ""

# Step 2: Verify Docker and docker-compose files exist
echo "📋 Step 2/4: Verifying Docker and docker-compose files..."

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker CLI not found. Please rebuild the devcontainer."
  exit 1
fi

if [ ! -S /var/run/docker.sock ]; then
  echo "❌ Docker socket not found at /var/run/docker.sock"
  echo "   Please ensure Docker Desktop is running and socket is mounted."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "❌ Cannot connect to Docker. Is Docker Desktop running?"
  exit 1
fi

# Check docker-compose files
if [ ! -f docker-compose.e2e.yml ]; then
  echo "❌ docker-compose.e2e.yml not found!"
  echo "   This file is required for building the E2E container."
  exit 1
fi

if [ ! -f docker-compose.dev.yml ]; then
  echo "❌ docker-compose.dev.yml not found!"
  echo "   This file is required for building the App container."
  exit 1
fi

echo "✅ Docker is available"
echo "✅ All docker-compose files found"
echo ""

# Step 3: Build and start E2E container (DIRECT docker compose commands)
echo "📋 Step 3/4: Building and starting E2E container..."
echo "⏳ This may take several minutes..."

# Check if E2E container is already running
if docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
  echo "✅ E2E container 'MMC_MCP_Bridge_E2E' is already running"
else
  # Check if container exists but is stopped
  if docker ps -a --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
    echo "🔄 Starting existing E2E container..."
    docker compose -f docker-compose.e2e.yml start
  else
    # Build and start the container
    echo "🔨 Building E2E container..."
    docker compose -f docker-compose.e2e.yml build
    echo "🚀 Starting E2E container..."
    docker compose -f docker-compose.e2e.yml up -d
  fi
  
  echo "⏳ Waiting for E2E container to be ready..."
  sleep 10
  
  # Verify E2E is running
  if ! docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_E2E$"; then
    echo "❌ E2E container failed to start. Check logs:"
    docker compose -f docker-compose.e2e.yml logs
    exit 1
  fi
fi

echo "✅ E2E container is running"
echo ""

# Step 4: Build and start App container (DIRECT docker compose commands)
echo "📋 Step 4/4: Building and starting App container..."
echo "⏳ This may take several minutes..."

# Check if App container is already running
if docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_App$"; then
  echo "✅ App container 'MMC_MCP_Bridge_App' is already running"
else
  # Check if container exists but is stopped
  if docker ps -a --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_App$"; then
    echo "🔄 Starting existing App container..."
    docker compose -f docker-compose.dev.yml start
  else
    # Build and start the container
    echo "🔨 Building App container..."
    docker compose -f docker-compose.dev.yml build
    echo "🚀 Starting App container..."
    docker compose -f docker-compose.dev.yml up -d
  fi
  
  echo "⏳ Waiting for App container to be healthy..."
  sleep 10
  
  # Verify App is running
  if ! docker ps --format '{{.Names}}' | grep -q "^MMC_MCP_Bridge_App$"; then
    echo "❌ App container failed to start. Check logs:"
    docker compose -f docker-compose.dev.yml logs
    exit 1
  fi
fi

echo "✅ App container is running"
echo ""

# Final status
echo "🎉 All containers are running!"
echo ""
echo "📊 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|MMC_MCP_Bridge"
echo ""
echo "🌐 Services:"
echo "  - DevContainer: /workspaces/MMC_MCP_BRIDGE"
echo "  - E2E Container: MMC_MCP_Bridge_E2E"
echo "  - App Container: http://localhost:3000"
echo "  - MCP Bridge SSE: http://localhost:3000/api/sse"
echo "  - Health Check: http://localhost:3000/api/health"
echo ""
echo "📝 Useful commands:"
echo "  - View E2E logs: docker compose -f docker-compose.e2e.yml logs -f"
echo "  - View App logs: docker compose -f docker-compose.dev.yml logs -f"
echo "  - Stop all: docker compose -f docker-compose.e2e.yml stop && docker compose -f docker-compose.dev.yml stop"
