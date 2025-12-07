# 🐳 Docker Compose Watch - Hot Reload Guide

## Overzicht

De MMC MCP Bridge gebruikt **Docker Compose Watch** voor automatische hot reload zonder rebuilds. Alle code wijzigingen worden direct gesynchroniseerd naar de container zonder dat je de container opnieuw hoeft te bouwen.

## 🚀 Quick Start

### Start met Docker Watch (Aanbevolen)

```bash
# Start container met watch mode - automatische hot reload
npm run docker:up:watch
# of
docker compose watch
```

### Start zonder Watch (Traditioneel)

```bash
# Start container zonder watch - handmatige rebuilds nodig
npm run docker:up
# of
docker compose up -d --build app
```

## 📋 Hoe het werkt

### Docker Compose Watch Configuratie

In `docker-compose.yml` is een `develop.watch` sectie geconfigureerd die automatisch:

1. **Sync Actions** - Synchroniseert code wijzigingen direct naar de container:
   - `./app` → `/workspaces/MMC_MCP_BRIDGE/app`
   - `./public` → `/workspaces/MMC_MCP_BRIDGE/public`
   - `./messages` → `/workspaces/MMC_MCP_BRIDGE/messages`
   - `./middleware.ts` → `/workspaces/MMC_MCP_BRIDGE/middleware.ts`
   - Config files (`tsconfig.json`, `turbo.json`)

2. **Rebuild Actions** - Rebuild container alleen bij dependency changes:
   - `package.json` wijzigingen
   - `package-lock.json` wijzigingen
   - `.devcontainer/Dockerfile` wijzigingen

### Hot Reload Flow

```
Code Wijziging (bijv. app/page.tsx)
    ↓
Docker Compose Watch detecteert wijziging
    ↓
Sync action: Bestand wordt direct gekopieerd naar container
    ↓
Next.js Fast Refresh detecteert wijziging
    ↓
Browser update automatisch (geen page reload nodig)
```

### Rebuild Flow (alleen bij dependencies)

```
package.json wijziging
    ↓
Docker Compose Watch detecteert wijziging
    ↓
Rebuild action: Container wordt opnieuw gebouwd
    ↓
Container restart met nieuwe dependencies
    ↓
Next.js dev server start opnieuw
```

## 🛠️ Commands

### Development

```bash
# Start met watch (aanbevolen)
npm run docker:up:watch

# Start zonder watch
npm run docker:up

# Stop container
npm run docker:down

# View logs
npm run docker:logs

# Restart container
npm run docker:restart
```

### Build & Deploy

```bash
# Build container
npm run docker:build

# Tag voor registries
npm run docker:tag

# Push naar Docker Hub
npm run docker:push:hub

# Push naar GHCR
npm run docker:push:ghcr
```

### Cleanup

```bash
# Clean alle Docker resources
npm run docker:clean:all

# Clean alleen images
npm run docker:clean:images

# Clean alleen containers
npm run docker:clean:containers

# Clean alleen volumes
npm run docker:clean:volumes
```

## 📁 Volume Mounts

### Bind Mounts (Hot Reload)

- `.:/workspaces/MMC_MCP_BRIDGE` - Volledige codebase (live sync)

### Named Volumes (Geen Sync)

- `mmc-node-modules` - `node_modules` (niet overschrijven)
- `mmc-next-build` - `.next` build cache (niet overschrijven)

## ⚡ Performance Tips

### 1. Gebruik Docker Watch

Docker Watch is veel sneller dan handmatige rebuilds:

- **Sync**: < 1 seconde (directe file copy)
- **Rebuild**: 30-60 seconden (volledige container rebuild)

### 2. Exclude Directories

De volgende directories worden automatisch geïgnoreerd door watch:

- `node_modules/` - Named volume
- `.next/` - Named volume
- `.git/` - Git metadata

### 3. Environment Variables

Hot reload environment variables zijn geconfigureerd:

- `CHOKIDAR_USEPOLLING=true` - Betrouwbare file watching
- `WATCHPACK_POLLING=true` - Next.js file watching
- `WATCHPACK_WATCHER_LIMIT=10000` - Hoge file limit

## 🔍 Troubleshooting

### Watch werkt niet

1. **Check Docker Compose versie**:

   ```bash
   docker compose version
   # Vereist: v2.22.0+ voor watch support
   ```

2. **Check watch status**:

   ```bash
   docker compose watch --dry-run
   ```

3. **Restart watch**:
   ```bash
   # Stop watch
   Ctrl+C
   # Start opnieuw
   docker compose watch
   ```

### Hot Reload werkt niet

1. **Check Next.js dev server**:

   ```bash
   docker compose logs app | grep "ready"
   ```

2. **Check file sync**:

   ```bash
   # Test: Wijzig een bestand en check logs
   docker compose logs app | grep "watch"
   ```

3. **Force rebuild**:
   ```bash
   npm run docker:down
   npm run docker:up
   ```

### Container rebuild te vaak

Als de container te vaak rebuild:

- Check of je `package.json` of `package-lock.json` wijzigt
- Check of je `.devcontainer/Dockerfile` wijzigt
- Alleen source code wijzigingen triggeren sync (geen rebuild)

## 📚 Meer Informatie

- [Docker Compose Watch Documentation](https://docs.docker.com/compose/file-watch/)
- [Next.js Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh)
- [Docker Volume Mounts](https://docs.docker.com/storage/volumes/)

---

**Last Updated:** December 2024  
**Maintained By:** Docker Specialist Agent
