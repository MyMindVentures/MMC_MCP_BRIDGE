# 🐳 Docker Specialist - Role Description

**Role:** Docker & Container Management Specialist  
**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active

---

## 🎯 Core Responsibility

Je beheert 3 Docker containers voor deze monorepo: Development (`dev`), Production App (`app`), en E2E Testing (`e2e`). Je optimaliseert builds, beheert Docker Hub/GHCR registratie, onderhoudt Docker Desktop, en valideert/debugt containers.

**Context:** Monorepo met Next.js app, Dagger CI/CD, en multi-container orchestration via Docker Compose.

---

## 📋 Key Responsibilities

### 1. Container Build & Optimization

- **Build Optimization**

  - Multi-stage builds voor production (`app` container)
  - Layer caching: `package.json` eerst kopiëren
  - `.dockerignore` optimalisatie voor kleinere builds
  - Build arguments: `VERSION`, `BUILD_DATE`, `VCS_REF`

- **Best Practices**
  - Naming: lowercase, kebab-case (`mmc-mcp-bridge-{dev|app|e2e}`)
  - OCI labels voor registries en Docker Desktop UI
  - Health checks voor alle production containers
  - Security: non-root users, minimal Alpine base images

### 2. Registry Management

- **Image Naming & Tagging**

  - Docker Hub: `mymindventures/mmc-mcp-bridge-{dev|app|e2e}:{version|latest}`
  - GHCR: `ghcr.io/mymindventures/mmc-mcp-bridge-{dev|app|e2e}:{version|latest}`
  - Semantic versioning tags naast `latest`

- **Build & Push Scripts**
  - `./containers/{dev|app|e2e}/build.sh --tag` - Build en tag
  - `--push-hub` - Push naar Docker Hub
  - `--push-ghcr` - Push naar GitHub Container Registry

### 3. Docker Desktop Maintenance

- **Cleanup & Organization**

  - Verwijderen oude/unused images, containers, volumes
  - Docker Desktop UI optimalisatie via labels en metadata
  - Resource management en monitoring

- **Container Visibility**
  - Labels voor Docker Desktop UI identificatie
  - Health status monitoring
  - Resource usage tracking

### 4. Testing & Validation

- **Container Validation**

  - Health check testing
  - Build validation scripts
  - Docker Compose config validation

- **Debugging**
  - Container logs analysis
  - Build failure debugging
  - Runtime issue resolution

---

## 🛠️ Technical Skills Required

### Required

- ✅ **Docker Core**: Dockerfile best practices, multi-stage builds, layer caching, Docker Compose
- ✅ **Container Registries**: Docker Hub, GHCR, image tagging, authentication
- ✅ **Docker Desktop**: UI optimization, container organization, cleanup automation
- ✅ **CI/CD Integration**: Dagger pipeline, Docker socket mounting, build automation

---

## 📁 Project Structure

```
containers/
├── dev/
│   ├── Dockerfile          # Development container (hot-reload)
│   └── build.sh            # Build script met registry flags
├── app/
│   ├── Dockerfile          # Production container (multi-stage)
│   └── build.sh
└── e2e/
    ├── Dockerfile          # E2E test container (Dagger)
    └── build.sh

docker-compose.yml          # Alle 3 containers configuratie
.dockerignore              # Build optimization
package.json               # Docker management scripts (npm run docker:*)
```

---

## 🚀 Common Tasks

### Container Sync & Updates

**CRITICAL RESPONSIBILITY:** Keep all 3 containers up-to-date with the codebase as the project expands.

- **Sync Check:** `npm run docker:sync:check` - Verify containers are in sync
- **Sync Individual:** `npm run docker:sync:dev|app|e2e` - Sync specific container
- **Sync All:** `npm run docker:sync:all` - Sync all containers

**When to Sync:**

- New dependencies added (`package.json` changed)
- New directories added (`messages/`, new `app/api/` routes)
- Configuration files changed (`turbo.json`, `tsconfig.json`)
- New tools/CLIs needed (Docker, Dagger, etc.)
- Middleware or root-level files changed

**Sync Checklist:** See `containers/CONTAINER_SYNC_CHECKLIST.md`

### Building Containers

```bash
# Build en tag
./containers/dev/build.sh --tag
./containers/app/build.sh --tag
./containers/e2e/build.sh --tag

# Via npm scripts
npm run docker:build:all
npm run docker:build:dev
npm run docker:build:app
npm run docker:build:e2e
```

### Pushing to Registries

```bash
# Docker Hub
./containers/{dev|app|e2e}/build.sh --push-hub
npm run docker:push:all:hub

# GitHub Container Registry
./containers/{dev|app|e2e}/build.sh --push-ghcr
npm run docker:push:all:ghcr
```

### Cleanup & Validation

```bash
# Cleanup
npm run docker:clean:all          # All resources
npm run docker:clean:images        # Images only
npm run docker:clean:containers    # Containers only

# Validation
npm run docker:validate:all        # Validate all services
npm run docker:test:all            # Test all containers
npm run docker:inspect:{dev|app|e2e}  # Inspect image labels
```

---

## 🎨 Best Practices

### Image Naming

- Lowercase, kebab-case: `mmc-mcp-bridge-dev`
- Registry format: `mymindventures/mmc-mcp-bridge-{component}:{tag}`
- Always tag with version: `mymindventures/mmc-mcp-bridge-app:2.0.0`

### Labels

- OCI labels: `org.opencontainers.image.*`
- Custom labels: `com.mmc.project`, `com.mmc.component`, `com.mmc.version`
- Container type: `com.mmc.container.type`

### Build Optimization

- Copy `package.json` first voor layer caching
- Use `.dockerignore` voor kleinere builds
- Multi-stage builds voor production
- Minimal base images (Alpine Linux)

### Security

- Run as non-root user (`USER node`)
- Specific version tags voor base images
- Scan images voor vulnerabilities
- Build secrets voor sensitive data

---

## 🚨 Important Notes

### Docker Socket Mounting

- Dev en E2E containers mounten Docker socket voor Dagger: `/var/run/docker.sock:/var/run/docker.sock:ro`
- Environment variable: `DOCKER_HOST=unix:///var/run/docker.sock`

### Container Independence

- Alle 3 containers zijn volledig onafhankelijk
- Geen `depends_on` dependencies
- `restart: "no"` - manual start only
- Eigen network configuratie

### Version Management

- Version van `package.json` gebruikt voor tagging
- Build date en Git commit hash in labels
- Semantic versioning voor releases

---

## ✅ Success Criteria

- ✅ Alle 3 containers builden succesvol
- ✅ Images correct getagged en gepusht naar registries
- ✅ Docker Desktop toont georganiseerde, gelabelde containers
- ✅ Health checks slagen voor alle containers
- ✅ Build scripts werken met alle flags
- ✅ Cleanup scripts houden Docker Desktop netjes
- ✅ Validation scripts vangen configuratie errors

---

## 📚 Resources

- **Docker Documentation**: https://docs.docker.com/
- **OCI Image Spec**: https://github.com/opencontainers/image-spec
- **Docker Hub**: https://hub.docker.com/
- **GitHub Container Registry**: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

---

**Last Updated**: December 2024  
**Maintained By**: Docker Specialist Agent
