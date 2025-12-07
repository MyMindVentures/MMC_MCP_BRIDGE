# 🐳 Docker Architecture Analysis - Latest Decisions & Progress

**Date:** December 2024  
**Status:** Current Architecture Documentation  
**Purpose:** Complete analysis of Docker architecture decisions and latest progress

---

## 📋 Executive Summary

Het project heeft een **fundamentele architectuur shift** gemaakt van een multi-container setup naar een **single container architecture** met devcontainer en Docker Compose Watch voor hot reload. Deze documentatie analyseert alle Docker-gerelateerde bestanden en beslissingen.

---

## 🏗️ Architecture Evolution

### Oude Architectuur (Deprecated)

**3 Containers Setup:**

- `containers/dev/` - Development container ❌ Verouderd
- `containers/app/` - Production container ❌ Verouderd
- `containers/e2e/` - E2E testing container ⚠️ Optioneel (workflows nog bruikbaar)

**Problemen:**

- Complexe multi-container setup
- Container rebuilds nodig voor elke code change
- Bind mounts werkten niet goed in Docker-in-Docker context
- Overhead van meerdere containers

### Nieuwe Architectuur (Current)

**Single Container Setup:**

- **DevContainer** (`.devcontainer/Dockerfile`) - Full Stack development container
- **Docker Compose Watch** - Automatische hot reload zonder rebuilds
- **Production** - Railway deployment (zie `railway.json`)

**Voordelen:**

- ✅ Eenvoudige single container setup
- ✅ Hot reload via Docker Compose Watch
- ✅ Geen rebuilds voor code changes
- ✅ Betere performance en developer experience

---

## 📁 Docker Files Structure

### Root Level Files

#### `docker-compose.yml`

**Purpose:** Single service configuration met Docker Compose Watch

**Key Features:**

- **Service:** `app` - Full Stack development container
- **Build:** Uses `.devcontainer/Dockerfile`
- **Image:** `mmc-mcp-bridge-app:latest`
- **Port:** 3000
- **Volumes:** Bind mount `.:/workspaces/MMC_MCP_BRIDGE`
- **Docker Watch:** Automatische sync voor source code, rebuild voor dependencies

**Docker Compose Watch Configuration:**

```yaml
develop:
  watch:
    # Sync actions (geen rebuild)
    - action: sync
      path: ./app
      target: /workspaces/MMC_MCP_BRIDGE/app
    - action: sync
      path: ./public
      target: /workspaces/MMC_MCP_BRIDGE/public
    - action: sync
      path: ./messages
      target: /workspaces/MMC_MCP_BRIDGE/messages
    # Rebuild actions (alleen bij dependency changes)
    - action: rebuild
      path: ./package.json
    - action: rebuild
      path: ./package-lock.json
    - action: rebuild
      path: ./.devcontainer/Dockerfile
```

**Environment Variables:**

- `CHOKIDAR_USEPOLLING=true` - Hot reload polling
- `WATCHPACK_POLLING=true` - Next.js watch polling
- `NODE_ENV=development`
- `PORT=3000`

**Health Check:**

- Endpoint: `http://localhost:3000/api/health`
- Interval: 30s
- Timeout: 10s
- Start period: 40s
- Retries: 3

#### `.devcontainer/Dockerfile`

**Purpose:** Full Stack development container met alle tools

**Base Image:** `mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye`

**Installed Tools:**

- ✅ **Docker CLI** + Docker Compose Plugin
- ✅ **Dagger CLI** - CI/CD pipeline testing
- ✅ **Doppler CLI** - Secrets management (CRITICAL)
- ✅ **1Password CLI** - Credentials management (CRITICAL)
- ✅ **PowerShell Core** - Cross-platform scripting
- ✅ **Python 3** + build tools - Voor native modules (better-sqlite3)
- ✅ **Playwright dependencies** - E2E testing
- ✅ **System tools** - git, curl, wget, vim, nano, redis-tools, postgresql-client, jq

**Labels:**

- OCI labels: `org.opencontainers.image.*`
- Custom labels: `com.mmc.project`, `com.mmc.component`, `com.mmc.version`
- Container type: `com.mmc.container.type=development`
- Hot reload: `com.mmc.hot-reload=enabled`
- Docker Watch: `com.mmc.docker-watch=enabled`

**User:** `node` (non-root)

#### `.devcontainer/devcontainer.json`

**Purpose:** VS Code/Cursor devcontainer configuration

**Key Features:**

- **Docker-in-Docker Feature:** `ghcr.io/devcontainers/features/docker-in-docker:2`
  - Non-root Docker access enabled
  - Moby engine
  - Volledige Docker functionaliteit zonder socket mount
- **MCP Client Configuration:**
  - Local: `http://localhost:3000/api/sse`
  - Railway: `https://mmcmcphttpbridge-production.up.railway.app/api/sse` (fallback)
- **Post Create Command:** Installeert dependencies en setup scripts
- **Post Start Command:** Restore settings, feature updates, git-watcher daemon, todos-sync daemon
- **Post Attach Command:** Restore settings, ensure git branch
- **Port Forwarding:** 3000 (Next.js Dev Server)

**VS Code Extensions:**

- Docker, Docker Compose
- Doppler, 1Password
- Git, GitHub Actions
- TypeScript, ESLint, Prettier
- Playwright, MongoDB
- PowerShell
- En 20+ andere extensions

**Persistent Volume:**

- `mmc-devcontainer-persist` - Settings en state persistence

---

## 🔄 Docker Compose Watch - Hot Reload

### How It Works

**Docker Compose Watch** zorgt voor automatische hot reload:

1. **Sync Actions** (geen rebuild):
   - Source code wijzigingen (`./app`, `./public`, `./messages`)
   - Config files (`tsconfig.json`, `turbo.json`)
   - Direct file sync naar container

2. **Rebuild Actions** (alleen bij dependency changes):
   - `package.json` wijzigingen
   - `package-lock.json` wijzigingen
   - `.devcontainer/Dockerfile` wijzigingen
   - Container rebuild met layer caching

3. **Hot Reload:**
   - Next.js Fast Refresh detecteert wijzigingen
   - Automatische page refresh
   - Geen container restart nodig

### Usage

```bash
# Met Docker Watch (aanbevolen - hot reload)
npm run docker:up:watch
# of
docker compose watch

# Zonder watch (traditioneel)
npm run docker:up
# of
docker compose up -d --build app
```

---

## 🚀 Development Workflow

### Correcte Workflow (DevContainer First)

**BELANGRIJK:** We zitten AL IN de devcontainer!

**GEEN docker-compose container nodig voor development!**

1. **Check Dependencies:**

   ```bash
   if [ ! -d node_modules ]; then
     npm install
   fi
   ```

2. **Start Next.js Dev Server:**

   ```bash
   npm run dev:host
   ```

3. **Hot Reload:**
   - Code wijzigingen worden automatisch gedetecteerd
   - Next.js Fast Refresh werkt automatisch
   - **GEEN container rebuild nodig!**

### Verkeerde Workflow (Oude Architectuur)

**NIET doen:**

- ❌ `docker compose up` - Dit is voor OUDE architectuur
- ❌ Container rebuilds voor code changes
- ❌ Docker-in-Docker containers starten

---

## 📦 NPM Scripts

### Development

```bash
npm run docker:up:watch       # Start met Docker Watch (hot reload)
npm run docker:up             # Start zonder watch
npm run docker:down           # Stop container
npm run docker:logs           # View logs
npm run docker:restart        # Restart container
```

### Build & Deploy

```bash
npm run docker:build          # Build container
npm run docker:tag           # Tag voor registries
npm run docker:push:hub      # Push naar Docker Hub
npm run docker:push:ghcr     # Push naar GHCR
```

### Cleanup

```bash
npm run docker:clean:all      # Clean alle resources
npm run docker:clean:images   # Clean images only
npm run docker:clean:containers # Clean containers only
npm run docker:clean:volumes  # Clean volumes only
```

### Validation

```bash
npm run docker:validate       # Validate docker-compose.yml
npm run docker:test          # Test container health
npm run docker:inspect       # Inspect image labels
```

---

## 🗂️ Legacy Containers

### `containers/` Directory - Deprecated

**Status:** Verouderde configuraties die niet meer gebruikt worden

#### `containers/dev/` - ❌ Verouderd

- **Vervangen door:** `.devcontainer/Dockerfile`
- Development container met hot-reload
- Nu geconsolideerd in devcontainer

#### `containers/app/` - ❌ Verouderd

- **Vervangen door:** `.devcontainer/Dockerfile` (development mode)
- Production container
- Production builds nu via Railway (zie `railway.json`)

#### `containers/e2e/` - ⚠️ Optioneel

- **Status:** Kan nog gebruikt worden voor CI/CD workflows
- E2E test container met Playwright en Dagger
- Workflows in `containers/e2e/workflows/` kunnen nog gebruikt worden
- Niet meer nodig voor lokale development

---

## 🔐 Docker-in-Docker Feature

### Implementation

**Feature:** `ghcr.io/devcontainers/features/docker-in-docker:2`

**Configuration:**

- `enableNonRootDocker: true` - Non-root Docker access
- `moby: true` - Moby engine
- Volledige Docker functionaliteit zonder socket mount

**Voordelen:**

- ✅ Betere isolatie
- ✅ Non-root Docker access
- ✅ Geen socket mount nodig
- ✅ Environment variable `DOCKER_HOST` automatisch geconfigureerd

---

## 📊 Volume Mounts

### Bind Mounts (Hot Reload)

- `.:/workspaces/MMC_MCP_BRIDGE` - Volledige codebase (live sync)
- Direct file sync zonder rebuild

### Named Volumes (Geen Sync)

**Uitgeschakeld in huidige setup:**

- `mmc-node-modules` - `node_modules` (niet overschrijven)
- `mmc-next-build` - `.next` build cache (niet overschrijven)

**Reden:** Bind mount werkt niet goed met named volumes in Docker-in-Docker context

---

## 🎯 MCP Client Configuration

### DevContainer MCP Setup

**Local Dev Container:**

- URL: `http://localhost:3000/api/sse`
- Description: "Local MCP Bridge on DevContainer - ALL 26 servers (Hot Reload + Docker Watch). Start: docker compose watch of npm run docker:up:watch"

**Railway Production:**

- URL: `https://mmcmcphttpbridge-production.up.railway.app/api/sse`
- Description: "Production MCP Bridge on Railway - ALL 26 servers (Fallback)"

**Belangrijk:** Start de container eerst voordat je de MCP client gebruikt:

```bash
npm run docker:up:watch
```

---

## 🔄 Migration Path

### Van Oude naar Nieuwe Setup

**Oud:**

```bash
docker compose up -d dev    # Development
docker compose up -d app    # Production
docker compose up -d e2e   # Testing
```

**Nieuw:**

```bash
docker compose watch        # Development met hot reload
# of
npm run docker:up:watch    # Met npm script
```

---

## ✅ Best Practices

### 1. Development

- ✅ Gebruik Docker Watch voor development (hot reload zonder rebuilds)
- ✅ Start container voordat je MCP client gebruikt
- ✅ Gebruik `npm run dev:host` in devcontainer (niet docker-compose)

### 2. Production

- ✅ Production builds via Railway (zie `railway.json`)
- ✅ Geen Docker Compose voor production
- ✅ Railway auto-deploys op push naar main

### 3. Maintenance

- ✅ Cleanup regelmatig met `npm run docker:clean:all`
- ✅ Valideer configuratie met `npm run docker:validate`
- ✅ Test container health met `npm run docker:test`

### 4. Image Management

- ✅ Tag images met version: `mymindventures/mmc-mcp-bridge-app:2.0.0`
- ✅ Push naar beide registries: Docker Hub + GHCR
- ✅ Gebruik semantic versioning

---

## 🚨 Critical Notes

### Terminal & Runtime First

**MANDATORY WORKFLOW: Terminal → Runtime → Success Reports Only**

- ✅ **ALWAYS**: Use Hot Reload via Next.js dev server in devcontainer
- ✅ **ALWAYS**: Code changes are automatically synced via Docker Compose Watch
- ✅ **ALWAYS**: Check if Next.js dev server is running before operations
- ✅ **ALWAYS**: Reuse existing terminals - Check terminal history before creating new ones
- ❌ **NEVER**: Rebuild container for code changes - Hot reload handles it automatically
- ❌ **NEVER**: Stop/restart container for source code changes

### DevContainer First

- ✅ **ALWAYS**: We zitten AL IN de devcontainer
- ✅ **ALWAYS**: Gebruik `npm install` en `npm run dev:host` direct in devcontainer
- ❌ **NEVER**: Start docker-compose container voor normale development
- ❌ **NEVER**: Rebuild container voor code changes

---

## 📚 Related Documentation

- **Monorepo Structure:** `.cursor/rules/monorepostructure.mdc`
- **Docker Specialist Rules:** `.cursor/rules/docker-specialist.mdc`
- **DevContainer Usage:** `Agent Suite/DEVCONTAINER_USAGE.md`
- **Containers README:** `containers/README.md`
- **Docker Specialist Role:** `Agent Suite/docker-specialist/Role Description.md`

---

## 🔍 Key Decisions Summary

1. **Single Container Architecture** - Van 3 containers naar 1 devcontainer
2. **Docker Compose Watch** - Hot reload zonder rebuilds
3. **DevContainer First** - Development direct in devcontainer, niet via docker-compose
4. **Docker-in-Docker Feature** - Betere isolatie zonder socket mount
5. **Legacy Containers Deprecated** - `containers/dev/` en `containers/app/` vervangen
6. **Production via Railway** - Geen Docker Compose voor production
7. **Hot Reload via Next.js** - Fast Refresh, geen container rebuilds

---

**Last Updated:** December 2024  
**Status:** Current Architecture - Single Container + Docker Watch  
**Maintained By:** AI Role Instructions Specialist
