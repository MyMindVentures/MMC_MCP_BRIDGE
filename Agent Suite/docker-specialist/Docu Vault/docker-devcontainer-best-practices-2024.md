# 🐳 Docker DevContainer Best Practices 2024

**Source:** Web Research - December 2024  
**Status:** Best Practices & Recommendations

---

## 📋 Overview

Deze documentatie bevat best practices voor Docker DevContainer configuratie gebaseerd op officiële documentatie en community best practices van 2024.

---

## 1. Package Manager Best Practices

### Lock Files

- ✅ **ALWAYS** gebruik lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`)
- ✅ **ALWAYS** commit lock files naar versiebeheer
- ✅ **ALWAYS** gebruik `npm ci` voor CI/CD (sneller en betrouwbaarder)
- ✅ **ALWAYS** gebruik `npm install` voor development

### Versie Management

- ✅ Pin versies voor kritieke dependencies
- ✅ Gebruik caret (^) voor minor updates waar acceptabel
- ✅ Regelmatig `npm audit` uitvoeren
- ⚠️ Overweeg Dependabot voor automatische updates

**References:**

- [npm Best Practices](https://docs.npmjs.com/cli/v9/commands/npm-ci)
- [Lock File Management](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json)

---

## 2. CLI Tools Installation

### Best Practices

- ✅ **ALWAYS** gebruik officiële repositories
- ✅ **ALWAYS** verifieer GPG keys
- ✅ **ALWAYS** pin versies voor productie builds
- ✅ **ALWAYS** gebruik latest voor development

### Installation Methods

**Docker CLI:**

```dockerfile
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bullseye stable" > /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-compose-plugin
```

**Dagger CLI:**

```dockerfile
RUN cd /tmp && \
    curl -L https://dl.dagger.io/dagger/install.sh | sh && \
    mv ./bin/dagger /usr/local/bin/dagger && \
    chmod +x /usr/local/bin/dagger
```

**References:**

- [Docker Installation](https://docs.docker.com/engine/install/)
- [Dagger Installation](https://docs.dagger.io/install)

---

## 3. Docker Socket Security

### Current Setup

```json
"mounts": [
  "source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind"
]
```

### Security Considerations

- ⚠️ Docker socket geeft volledige Docker toegang
- ⚠️ Alleen gebruiken in development omgeving
- ✅ Non-root user gebruiken
- ✅ Permissions correct instellen

### Recommended: Docker-in-Docker

Voor betere isolatie, overweeg Docker-in-Docker feature:

```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {
    "version": "latest",
    "enableNonRootDocker": true,
    "moby": true
  }
}
```

**Benefits:**

- ✅ Betere isolatie
- ✅ Non-root Docker support
- ✅ Volledige Docker functionaliteit

**References:**

- [Docker-in-Docker Feature](https://containers.dev/features/docker-in-docker)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

---

## 4. VS Code Extensions

### Best Practices

- ✅ **ONLY** essentiële extensions
- ✅ Automatische installatie via devcontainer.json
- ✅ Geen conflicterende extensions
- ✅ Regelmatig reviewen en opruimen

### Extension Categories

**Core Development:**

- TypeScript, ESLint, Prettier, EditorConfig

**Docker & Containers:**

- DevContainers, Docker, Remote Containers

**Git & GitHub:**

- GitLens, Git Graph, GitHub Actions, PR Reviews

**Testing & Quality:**

- Jest, Playwright, Error Lens

**Database & APIs:**

- Redis, MongoDB, REST Client, Postman

**References:**

- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [DevContainer Extensions](https://containers.dev/supporting)

---

## 5. Hot Reload Configuration

### Docker Compose Watch

**Best Practice:**

```yaml
develop:
  watch:
    - action: sync
      path: ./app
      target: /workspaces/MMC_MCP_BRIDGE/app
    - action: rebuild
      path: ./package.json
```

### Environment Variables

```dockerfile
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV WATCHPACK_WATCHER_LIMIT=10000
```

### Volume Mounts

- ✅ Bind mounts voor live sync
- ✅ Named volumes voor `node_modules` en `.next`
- ✅ Persistent volumes voor settings

**References:**

- [Docker Compose Watch](https://docs.docker.com/compose/file-watch/)
- [Next.js Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh)

---

## 6. System Dependencies

### Best Practices

- ✅ **ALWAYS** gebruik `--no-install-recommends`
- ✅ **ALWAYS** `apt-get clean` na installatie
- ✅ **ALWAYS** verwijder `/var/lib/apt/lists/*`
- ✅ **ALWAYS** combineer RUN commands waar mogelijk

**Example:**

```dockerfile
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git curl wget \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
```

**References:**

- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## 7. Security Best Practices

### User Management

- ✅ **ALWAYS** gebruik non-root user
- ✅ **ALWAYS** minimal base image
- ✅ **NEVER** hardcode secrets
- ✅ **ALWAYS** gebruik secrets management (Doppler, 1Password)

### Base Images

- ✅ Microsoft devcontainer images (geoptimaliseerd)
- ✅ Official images van vendors
- ✅ Regelmatig updates voor security patches

### Secrets Management

- ✅ Doppler CLI voor secrets
- ✅ 1Password CLI voor credentials
- ✅ Environment variables (geen hardcoding)
- ✅ `.env` files in `.gitignore`

**References:**

- [Docker Security](https://docs.docker.com/engine/security/)
- [DevContainer Security](https://containers.dev/implementors/security/)

---

## 8. Performance Optimization

### Layer Caching

- ✅ Copy `package.json` eerst
- ✅ Install dependencies
- ✅ Copy source code als laatste

**Example:**

```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
```

### Multi-Stage Builds

Voor production builds:

```dockerfile
FROM node:20 AS builder
# Build stage

FROM node:20 AS runner
# Runtime stage
```

**References:**

- [Docker Layer Caching](https://docs.docker.com/build/cache/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 9. Documentation

### Required Documentation

- ✅ README met setup instructies
- ✅ Dockerfile comments
- ✅ devcontainer.json comments
- ✅ Environment variables documentatie

### Version Control

- ✅ **ALWAYS** commit configuratie bestanden
- ✅ **ALWAYS** document wijzigingen
- ✅ **ALWAYS** update documentatie bij changes

---

## 10. Validation & Testing

### Pre-Deployment Checks

- ✅ `docker compose config --quiet` (validate config)
- ✅ `npm run build` (test build)
- ✅ `npm run type-check` (type validation)
- ✅ Health checks geconfigureerd

### Regular Audits

- ✅ Dependency audits (`npm audit`)
- ✅ Security scans
- ✅ Performance monitoring
- ✅ Configuration reviews

**References:**

- [Docker Compose Validate](https://docs.docker.com/compose/reference/config/)
- [npm Audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)

---

## 📚 Additional Resources

- [DevContainer Specification](https://containers.dev/implementors/spec/)
- [VS Code DevContainer Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)

---

**Last Updated:** December 2024  
**Source:** Web Research + Official Documentation  
**Status:** Active Best Practices
