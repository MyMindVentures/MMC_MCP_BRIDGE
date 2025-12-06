#!/bin/bash
# Container Sync Script - Keep containers up-to-date with codebase
# Usage: ./containers/sync-containers.sh [dev|app|e2e|all] [--check-only]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CHECK_ONLY=false
CONTAINER=${1:-all}

if [[ "$*" == *"--check-only"* ]]; then
    CHECK_ONLY=true
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Container Sync - Keep Containers Up-to-Date            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if file/directory exists in codebase
check_exists() {
    local path=$1
    if [ -e "$PROJECT_ROOT/$path" ]; then
        echo -e "${GREEN}✅${NC} $path"
        return 0
    else
        echo -e "${RED}❌${NC} $path (MISSING)"
        return 1
    fi
}

# Function to check container Dockerfile for required files
check_dockerfile() {
    local container=$1
    local dockerfile="containers/$container/Dockerfile"
    
    if [ ! -f "$dockerfile" ]; then
        echo -e "${RED}❌ Dockerfile not found: $dockerfile${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📋 Checking $container container Dockerfile...${NC}"
    
    # Check for required COPY statements
    case "$container" in
        dev)
            # Dev container uses volume mounts, but check for tools
            if grep -q "docker" "$dockerfile" && grep -q "dagger" "$dockerfile"; then
                echo -e "${GREEN}✅${NC} Tools (Docker, Dagger) configured"
            else
                echo -e "${YELLOW}⚠️${NC}  Tools may be missing"
            fi
            ;;
        app)
            # App container needs explicit COPY for config files
            local missing=0
            if ! grep -q "COPY.*turbo.json" "$dockerfile"; then
                echo -e "${RED}❌${NC} turbo.json not explicitly copied"
                missing=1
            fi
            if ! grep -q "COPY.*tsconfig.json" "$dockerfile"; then
                echo -e "${RED}❌${NC} tsconfig.json not explicitly copied"
                missing=1
            fi
            if ! grep -q "COPY.*messages" "$dockerfile"; then
                echo -e "${RED}❌${NC} messages/ directory not explicitly copied"
                missing=1
            fi
            if [ $missing -eq 0 ]; then
                echo -e "${GREEN}✅${NC} Required files explicitly copied"
            fi
            ;;
        e2e)
            # E2E container needs tools and full codebase
            if grep -q "docker" "$dockerfile" && grep -q "dagger" "$dockerfile" && grep -q "playwright\|chromium" "$dockerfile"; then
                echo -e "${GREEN}✅${NC} Tools (Docker, Dagger, Playwright) configured"
            else
                echo -e "${YELLOW}⚠️${NC}  Some tools may be missing"
            fi
            ;;
    esac
}

# Function to verify codebase files exist
verify_codebase() {
    echo -e "${BLUE}🔍 Verifying codebase files...${NC}"
    echo ""
    
    local all_exist=0
    
    # Core files
    check_exists "package.json" || all_exist=1
    check_exists "package-lock.json" || all_exist=1
    check_exists "turbo.json" || all_exist=1
    check_exists "tsconfig.json" || all_exist=1
    check_exists "middleware.ts" || all_exist=1
    
    # Directories
    check_exists "app" || all_exist=1
    check_exists "public" || all_exist=1
    check_exists "messages" || all_exist=1
    
    echo ""
    
    if [ $all_exist -eq 0 ]; then
        echo -e "${GREEN}✅ All core files exist${NC}"
    else
        echo -e "${RED}❌ Some core files are missing${NC}"
    fi
    
    return $all_exist
}

# Function to sync container
sync_container() {
    local container=$1
    local name=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔄 Syncing ${name} Container...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check Dockerfile
    check_dockerfile "$container"
    echo ""
    
    if [ "$CHECK_ONLY" = true ]; then
        echo -e "${YELLOW}ℹ️  Check-only mode: skipping rebuild${NC}"
        return 0
    fi
    
    # Rebuild container
    echo -e "${YELLOW}🔨 Rebuilding ${name} container...${NC}"
    if docker compose build "$container"; then
        echo -e "${GREEN}✅ ${name} container rebuilt successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to rebuild ${name} container${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}🚀 Restarting ${name} container...${NC}"
    if docker compose up -d "$container"; then
        echo -e "${GREEN}✅ ${name} container restarted!${NC}"
    else
        echo -e "${RED}❌ Failed to restart ${name} container${NC}"
        return 1
    fi
    
    echo ""
}

# Main execution
echo -e "${BLUE}Step 1: Verifying codebase...${NC}"
if ! verify_codebase; then
    echo -e "${RED}❌ Codebase verification failed. Please fix missing files first.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Checking container Dockerfiles...${NC}"
echo ""

# Sync containers based on argument
case "$CONTAINER" in
    dev)
        sync_container "dev" "Development"
        ;;
    app)
        sync_container "app" "Production App"
        ;;
    e2e)
        sync_container "e2e" "E2E Testing"
        ;;
    all|*)
        sync_container "dev" "Development"
        sync_container "app" "Production App"
        sync_container "e2e" "E2E Testing"
        ;;
esac

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$CHECK_ONLY" = true ]; then
    echo -e "${GREEN}✅ Container sync check completed!${NC}"
else
    echo -e "${GREEN}🎉 All containers synced successfully!${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "  ${YELLOW}•${NC} Check container logs: ${GREEN}docker compose logs -f${NC}"
echo -e "  ${YELLOW}•${NC} Verify health endpoints: ${GREEN}curl http://localhost:3000/api/health${NC}"
echo -e "  ${YELLOW}•${NC} Test MCP endpoints: ${GREEN}curl http://localhost:3000/api/sse${NC}"
echo ""
