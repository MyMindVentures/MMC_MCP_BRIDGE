#!/bin/bash
# Build and start all 3 containers sequentially with monitoring
# Usage: ./build-and-start-containers.sh [dev|app|e2e|all]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🐳 MMC MCP Bridge - Container Build & Start Script"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build and start a container
build_and_start() {
    local container=$1
    local name=$2
    local port=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔨 Building ${name} Container...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Build the container
    if docker compose build "$container"; then
        echo -e "${GREEN}✅ ${name} container built successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to build ${name} container${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}🚀 Starting ${name} Container...${NC}"
    
    # Start the container
    if docker compose up -d "$container"; then
        echo -e "${GREEN}✅ ${name} container started!${NC}"
        if [ -n "$port" ]; then
            echo -e "${BLUE}   🌐 Available at: http://localhost:${port}${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to start ${name} container${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}📊 Container Status:${NC}"
    docker ps --filter "name=MMC_MCP_Bridge" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Wait a bit before next container
    sleep 2
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    exit 1
fi

echo -e "${GREEN}✅ Docker is available${NC}"
echo ""

# Parse arguments
CONTAINER=${1:-all}

# Build and start containers based on argument
case "$CONTAINER" in
    dev)
        build_and_start "dev" "Development" "3000"
        ;;
    app)
        build_and_start "app" "Production App" "3001"
        ;;
    e2e)
        build_and_start "e2e" "E2E Testing" ""
        ;;
    all|*)
        # Build and start Dev Container
        build_and_start "dev" "Development" "3000"
        
        # Build and start App Container
        build_and_start "app" "Production App" "3001"
        
        # Build and start E2E Container
        build_and_start "e2e" "E2E Testing" ""
        ;;
esac

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All containers built and started successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Container Summary:"
echo "  • Dev Container:    http://localhost:3000 (Hot-reload enabled)"
echo "  • App Container:     http://localhost:3001 (Production mode)"
echo "  • E2E Container:     Testing container (no port)"
echo ""
echo "🔍 Useful Commands:"
echo "  • View all logs:     docker compose logs -f"
echo "  • View dev logs:     docker compose logs -f dev"
echo "  • View app logs:     docker compose logs -f app"
echo "  • View e2e logs:     docker compose logs -f e2e"
echo "  • Stop all:          docker compose down"
echo "  • Restart dev:       docker compose restart dev"
echo ""
echo "🌐 MCP Client Endpoints:"
echo "  • SSE Endpoint:      http://localhost:3000/api/sse"
echo "  • Health Check:      http://localhost:3000/api/health"
echo "  • MCP HTTP:          http://localhost:3000/api/mcp"
echo ""
