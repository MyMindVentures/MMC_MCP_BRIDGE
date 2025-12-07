#!/bin/bash
# ⚠️ DEPRECATED: This script is outdated after consolidation (December 2024)
# 
# containers/dev and containers/app have been removed.
# Use DevContainer for development (automatisch bij project openen).
# Use Railway for production deployment.
# 
# This script is kept for historical reference only.
#
# Build all 3 containers sequentially with detailed monitoring
# This script builds each container separately and shows progress

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MMC MCP Bridge - Container Build & Runtime Setup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is available${NC}"
echo ""

# Function to build container with monitoring
build_container() {
    local container=$1
    local name=$2
    local port=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔨 Building ${name} Container...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Get version info
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "2.0.0")
    BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
    VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    echo -e "${BLUE}📦 Build Information:${NC}"
    echo -e "   Version: ${GREEN}${VERSION}${NC}"
    echo -e "   Build Date: ${GREEN}${BUILD_DATE}${NC}"
    echo -e "   Git Commit: ${GREEN}${VCS_REF}${NC}"
    echo ""
    
    # Build with progress
    echo -e "${YELLOW}⏳ Building image (this may take a few minutes)...${NC}"
    if docker compose build \
        --build-arg VERSION="$VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --build-arg VCS_REF="$VCS_REF" \
        --progress=plain \
        "$container" 2>&1 | tee /tmp/docker-build-${container}.log; then
        echo ""
        echo -e "${GREEN}✅ ${name} container built successfully!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Failed to build ${name} container${NC}"
        echo -e "${YELLOW}📋 Check logs: /tmp/docker-build-${container}.log${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${YELLOW}🚀 Starting ${name} Container...${NC}"
    
    # Start container
    if docker compose up -d "$container"; then
        echo -e "${GREEN}✅ ${name} container started!${NC}"
        if [ -n "$port" ]; then
            echo -e "${BLUE}   🌐 Available at: http://localhost:${port}${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to start ${name} container${NC}"
        exit 1
    fi
    
    # Wait for health check
    if [ -n "$port" ]; then
        echo -e "${YELLOW}⏳ Waiting for container to be healthy...${NC}"
        sleep 5
        
        # Check if container is running
        if docker ps --filter "name=MMC_MCP_Bridge" --format "{{.Names}}" | grep -q "${container}"; then
            echo -e "${GREEN}✅ Container is running${NC}"
        else
            echo -e "${YELLOW}⚠️  Container may still be starting...${NC}"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📊 Current Container Status:${NC}"
    docker ps --filter "name=MMC_MCP_Bridge" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running yet"
    echo ""
    
    # Show logs snippet
    echo -e "${YELLOW}📝 Recent logs (last 5 lines):${NC}"
    docker compose logs --tail=5 "$container" 2>/dev/null || echo "No logs yet"
    echo ""
    
    # Wait before next container
    sleep 3
}

# Build Dev Container
build_container "dev" "Development (Hot-reload)" "3000"

# Build App Container
build_container "app" "Production App" "3001"

# Build E2E Container
build_container "e2e" "E2E Testing" ""

# Final summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 All containers built and started successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Container Summary:${NC}"
echo -e "  ${GREEN}•${NC} Dev Container:    ${BLUE}http://localhost:3000${NC} (Hot-reload enabled)"
echo -e "  ${GREEN}•${NC} App Container:     ${BLUE}http://localhost:3001${NC} (Production mode)"
echo -e "  ${GREEN}•${NC} E2E Container:     Testing container (no port)"
echo ""
echo -e "${BLUE}🌐 MCP Client Endpoints:${NC}"
echo -e "  ${GREEN}•${NC} SSE Endpoint:      ${BLUE}http://localhost:3000/api/sse${NC}"
echo -e "  ${GREEN}•${NC} Health Check:      ${BLUE}http://localhost:3000/api/health${NC}"
echo -e "  ${GREEN}•${NC} MCP HTTP:         ${BLUE}http://localhost:3000/api/mcp${NC}"
echo ""
echo -e "${BLUE}🔍 Useful Commands:${NC}"
echo -e "  ${YELLOW}•${NC} View all logs:     ${GREEN}docker compose logs -f${NC}"
echo -e "  ${YELLOW}•${NC} View dev logs:     ${GREEN}docker compose logs -f dev${NC}"
echo -e "  ${YELLOW}•${NC} View app logs:     ${GREEN}docker compose logs -f app${NC}"
echo -e "  ${YELLOW}•${NC} View e2e logs:     ${GREEN}docker compose logs -f e2e${NC}"
echo -e "  ${YELLOW}•${NC} Stop all:          ${GREEN}docker compose down${NC}"
echo -e "  ${YELLOW}•${NC} Restart dev:       ${GREEN}docker compose restart dev${NC}"
echo ""
echo -e "${BLUE}🐳 Docker Desktop:${NC}"
echo -e "  All containers are visible in Docker Desktop with clear names:"
echo -e "  ${GREEN}•${NC} MMC_MCP_Bridge_Dev"
echo -e "  ${GREEN}•${NC} MMC_MCP_Bridge_App"
echo -e "  ${GREEN}•${NC} MMC_MCP_Bridge_E2E"
echo ""
