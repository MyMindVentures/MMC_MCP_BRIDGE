# 🚨 DevOps Tips & Pitfalls - Docker Specialist

**Last Updated:** December 2024  
**Status:** Active Knowledge Base

---

## 📋 Overview

Deze documentatie bevat praktische tips, veelvoorkomende problemen, en oplossingen voor Docker en DevContainer development gebaseerd op productie ervaringen.

---

## ⚠️ Common Pitfalls & Solutions

### 1. Docker Socket Permissions

**Problem:**

```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution:**

- ✅ Gebruik Docker-in-Docker feature (aanbevolen)
- ✅ Of: `sudo chmod 666 /var/run/docker.sock` (development only)
- ✅ Of: Voeg gebruiker toe aan docker group: `sudo usermod -aG docker $USER`

**Best Practice:**

```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {
    "enableNonRootDocker": true
  }
}
```

---

### 2. Hot Reload Not Working

**Problem:**

- File changes niet gedetecteerd
- Next.js Fast Refresh werkt niet
- Container rebuild te vaak

**Solutions:**

1. **Enable Polling:**

```dockerfile
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV WATCHPACK_WATCHER_LIMIT=10000
```

2. **Docker Compose Watch:**

```yaml
develop:
  watch:
    - action: sync
      path: ./app
      target: /workspaces/MMC_MCP_BRIDGE/app
```

3. **Named Volumes:**

```yaml
volumes:
  - mmc-node-modules:/workspaces/MMC_MCP_BRIDGE/node_modules
  - mmc-next-build:/workspaces/MMC_MCP_BRIDGE/.next
```

---

### 3. Native Module Compilation Failures

**Problem:**

```
Error: Cannot find module 'better-sqlite3'
gyp ERR! build error
```

**Solution:**
Installeer build tools in Dockerfile:

```dockerfile
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    build-essential
```

**Best Practice:**

- ✅ Installeer build tools altijd in base image
- ✅ Gebruik `--no-install-recommends` voor kleinere images
- ✅ Clean apt cache na installatie

---

### 4. Container Rebuilds Too Often

**Problem:**

- Container rebuild bij elke code wijziging
- Langzame development workflow

**Solution:**
Gebruik Docker Compose Watch met juiste actions:

```yaml
develop:
  watch:
    # Sync (geen rebuild)
    - action: sync
      path: ./app
    # Rebuild (alleen bij dependencies)
    - action: rebuild
      path: ./package.json
```

**Best Practice:**

- ✅ Sync voor source code
- ✅ Rebuild alleen voor dependencies
- ✅ Ignore patterns voor node_modules en .next

---

### 5. Volume Mount Performance Issues

**Problem:**

- Langzame file sync
- High CPU usage
- File watcher errors

**Solutions:**

1. **Use Named Volumes:**

```yaml
volumes:
  - mmc-node-modules:/workspaces/MMC_MCP_BRIDGE/node_modules
```

2. **Exclude Directories:**

```yaml
watch:
  - action: sync
    path: ./app
    ignore:
      - node_modules/
      - .next/
```

3. **Increase Watcher Limit:**

```dockerfile
ENV WATCHPACK_WATCHER_LIMIT=10000
```

---

### 6. Dependency Version Conflicts

**Problem:**

- `npm ci` faalt
- Lock file out of sync
- Version conflicts

**Solutions:**

1. **Always use lock files:**

```bash
npm install  # Update package-lock.json
npm ci       # Clean install from lock file
```

2. **Regular audits:**

```bash
npm audit
npm audit fix
```

3. **Version pinning:**

```json
{
  "dependencies": {
    "next": "15.1.0" // Pin major versions
  }
}
```

---

### 7. Docker Build Cache Issues

**Problem:**

- Builds te langzaam
- Cache niet gebruikt
- Unnecessary rebuilds

**Solutions:**

1. **Layer Ordering:**

```dockerfile
# Dependencies first (cached)
COPY package*.json ./
RUN npm ci

# Source code last (changes often)
COPY . .
```

2. **BuildKit Cache:**

```json
{
  "build": {
    "args": {
      "BUILDKIT_INLINE_CACHE": "1"
    }
  }
}
```

3. **Multi-stage builds:**

```dockerfile
FROM node:20 AS builder
# Build stage

FROM node:20 AS runner
# Runtime stage
```

---

### 8. Health Check Failures

**Problem:**

```
Health check failed
Container marked as unhealthy
```

**Solutions:**

1. **Correct health check:**

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  start_period: 40s
  retries: 3
```

2. **Start period:**

- Geef container tijd om te starten
- Start period > container start time

3. **Health endpoint:**

- Implementeer `/api/health` endpoint
- Return 200 OK when healthy

---

## 💡 Performance Tips

### 1. Image Size Optimization

- ✅ Use Alpine Linux base images
- ✅ Multi-stage builds
- ✅ Remove build dependencies in runtime stage
- ✅ Clean apt cache: `rm -rf /var/lib/apt/lists/*`

### 2. Build Speed

- ✅ Layer caching (dependencies first)
- ✅ BuildKit inline cache
- ✅ Parallel builds waar mogelijk
- ✅ .dockerignore voor excluded files

### 3. Development Speed

- ✅ Docker Compose Watch (sync vs rebuild)
- ✅ Named volumes voor node_modules
- ✅ Hot reload met polling
- ✅ Fast Refresh enabled

---

## 🔒 Security Best Practices

### 1. Non-Root User

```dockerfile
USER node
```

### 2. Minimal Base Images

- ✅ Official images
- ✅ Specific versions (not latest)
- ✅ Security updates regelmatig

### 3. Secrets Management

- ✅ No hardcoded secrets
- ✅ Environment variables
- ✅ Doppler/1Password CLI
- ✅ .env in .gitignore

### 4. Docker Socket Security

- ✅ Docker-in-Docker feature (aanbevolen)
- ✅ Non-root Docker access
- ✅ Development only (niet production)

---

## 📊 Monitoring & Debugging

### 1. Container Logs

```bash
docker compose logs -f app
docker compose logs --tail=100 app
```

### 2. Container Inspection

```bash
docker compose exec app sh
docker inspect mmc-mcp-bridge-app
```

### 3. Resource Usage

```bash
docker stats
docker compose top
```

### 4. Build Debugging

```bash
docker compose build --progress=plain
docker compose build --no-cache
```

---

## 🚀 Deployment Tips

### 1. Production Builds

- ✅ Multi-stage builds
- ✅ Production dependencies only
- ✅ Health checks
- ✅ Restart policies

### 2. Registry Management

- ✅ Semantic versioning
- ✅ Latest tag + version tag
- ✅ Docker Hub + GHCR
- ✅ Automated builds

### 3. CI/CD Integration

- ✅ Build cache in CI
- ✅ Parallel builds
- ✅ Test before push
- ✅ Rollback strategy

---

## 📚 References

- **Docker Best Practices**: `docker-devcontainer-best-practices-2024.md`
- **DevContainer Audit**: `devcontainer-audit-2024.md`
- **Docker Watch Guide**: `DOCKER_WATCH_GUIDE.md`

---

**Last Updated:** December 2024  
**Maintained By:** Docker Specialist Agent
