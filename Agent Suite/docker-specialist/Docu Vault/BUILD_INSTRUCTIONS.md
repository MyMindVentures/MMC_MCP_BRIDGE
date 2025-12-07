# 🐳 Container Build & Start Instructions - DEPRECATED

## ⚠️ BELANGRIJK: Deze instructies zijn verouderd

**De containers/dev en containers/app zijn verwijderd.**

**Zie `Agent Suite/DEVCONTAINER_WORKFLOW.md` voor de correcte workflow.**

## ✅ Huidige Setup

### DevContainer (Primair)

- **Automatisch gestart** wanneer project wordt geopend in VS Code/Cursor
- **Gebruik:** `npm install` → `npm run dev:host` (in devcontainer terminal)
- **Hot reload:** Automatisch - geen rebuilds nodig

### Docker Compose (Optioneel)

- Alleen voor specifieke use cases (Docker-in-Docker testing)
- Gebruikt `.devcontainer/Dockerfile` (zelfde als devcontainer)
- Commands: `npm run docker:up:watch` of `npm run docker:up`

### E2E Container (Optioneel - CI/CD Workflows)

**Alleen containers/e2e blijft over voor CI/CD workflows:**

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
