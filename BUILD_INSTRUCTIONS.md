# 🐳 Container Build & Start Instructions

## Quick Start - All Containers

```bash
# Option 1: Use the build script
./build-and-start-containers.sh

# Option 2: Use npm scripts (sequential)
npm run docker:build:dev && npm run docker:dev:up
npm run docker:build:app && npm run docker:app:up
npm run docker:build:e2e && npm run docker:e2e:up

# Option 3: Use individual build scripts
./containers/dev/build.sh
./containers/app/build.sh
./containers/e2e/build.sh
```

## Individual Container Builds

### 1. Dev Container (Development with Hot-reload)

```bash
# Build
npm run docker:build:dev
# OR
docker compose build dev

# Start
npm run docker:dev:up
# OR
docker compose up -d dev

# Monitor logs
npm run docker:dev:logs
# OR
docker compose logs -f dev

# Check status
docker ps --filter "name=MMC_MCP_Bridge_Dev"
```

**Endpoints:**

- App: http://localhost:3000
- Health: http://localhost:3000/api/health
- SSE (MCP): http://localhost:3000/api/sse

---

### 2. App Container (Production)

```bash
# Build
npm run docker:build:app
# OR
docker compose build app

# Start
npm run docker:app:up
# OR
docker compose up -d app

# Monitor logs
npm run docker:app:logs
# OR
docker compose logs -f app

# Check status
docker ps --filter "name=MMC_MCP_Bridge_App"
```

**Endpoints:**

- App: http://localhost:3001
- Health: http://localhost:3001/api/health
- SSE (MCP): http://localhost:3001/api/sse

---

### 3. E2E Container (Testing)

```bash
# Build
npm run docker:build:e2e
# OR
docker compose build e2e

# Start
npm run docker:e2e:up
# OR
docker compose up -d e2e

# Monitor logs
npm run docker:e2e:logs
# OR
docker compose logs -f e2e

# Check status
docker ps --filter "name=MMC_MCP_Bridge_E2E"
```

---

## Build Monitoring

### Watch Build Progress

```bash
# Watch all container builds
docker compose build --progress=plain

# Watch specific container
docker compose build --progress=plain dev
```

### Check Container Status

```bash
# List all MMC containers
docker ps --filter "name=MMC_MCP_Bridge" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Detailed status
docker compose ps

# Health check
docker inspect MMC_MCP_Bridge_Dev | grep -A 10 Health
```

### Monitor Logs in Real-time

```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f dev
docker compose logs -f app
docker compose logs -f e2e
```

---

## Container Information

### Container Names (Docker Desktop UI)

- **Dev**: `MMC_MCP_Bridge_Dev` (Port 3000)
- **App**: `MMC_MCP_Bridge_App` (Port 3001)
- **E2E**: `MMC_MCP_Bridge_E2E` (No port)

### Image Names

- `mmc-mcp-bridge-dev:latest`
- `mmc-mcp-bridge-app:latest`
- `mmc-mcp-bridge-e2e:latest`

### Labels (Docker Desktop)

All containers have labels for easy identification:

- `com.docker.desktop.service.name`
- `com.mmc.project=mmc-mcp-bridge`
- `com.mmc.component={dev|app|e2e}`
- `com.mmc.container.type={development|production|testing}`

---

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
docker compose down
docker compose build --no-cache dev
```

### Container Won't Start

```bash
# Check logs
docker compose logs dev

# Check configuration
docker compose config

# Restart
docker compose restart dev
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Stop conflicting containers
docker compose down
```

### Health Check Fails

```bash
# Test health endpoint manually
curl http://localhost:3000/api/health

# Check container logs
docker compose logs dev | grep -i error
```

---

## Useful Commands

```bash
# Stop all containers
docker compose down

# Stop specific container
docker compose stop dev

# Restart container
docker compose restart dev

# Remove containers and volumes
docker compose down -v

# Clean up images
npm run docker:clean:images

# Full cleanup
npm run docker:clean:all
```
