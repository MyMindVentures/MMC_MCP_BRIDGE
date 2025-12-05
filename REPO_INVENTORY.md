# Repository Inventaris - MMC MCP Bridge

## Docker Compose Bestanden

### ✅ Actieve Bestanden

- `docker-compose.yml` - **HOOFDBESTAND** - Bevat app + e2e services, restart: "no", onafhankelijk

### ❌ Verwijderde Bestanden (oude versies)

- ~~`docker-compose.dev.yml`~~ - VERWIJDERD
- ~~`docker-compose.e2e.yml`~~ - VERWIJDERD

## Dockerfiles

### .devcontainer/

- `Dockerfile.dev` - App container (node:20.19.5-alpine)
- `Dockerfile.e2e` - E2E test container (node:20.19.5-alpine)
- `Dockerfile` - Devcontainer base
- `Dockerfile.prod` - Production container

## Configuratie Bestanden

### Root Level

- `package.json` - NPM scripts + dependencies (✅ geüpdatet met nieuwe docker scripts)
- `package-lock.json` - NPM lockfile
- `railway.json` - Railway deployment config
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variables template

### .devcontainer/

- `devcontainer.json` - VS Code devcontainer configuratie
- Scripts:
  - `auto-git-workflow.sh`
  - `build-app-container.sh`
  - `build-e2e-container.sh`
  - `build-sequential.sh`
  - `feature-tracker.sh`
  - `git-watcher.sh`
  - `install-docker-cli.sh`
  - `install-extensions.sh`
  - `persist-settings.sh`
  - `start-dev.sh`
  - `start-local-dev.sh`
  - `sync-todos.sh`

## Application Code

### app/

- `page.tsx` - Frontend entry point
- `layout.tsx` - Layout component
- `api/` - Backend API routes:
  - `health/route.ts` - Health check endpoint
  - `mcp-config.ts` - MCP servers configuratie (155k+ lines)
  - `mcp-executor.ts` - MCP execution logic
  - `sse/route.ts` - SSE endpoint voor MCP client
  - Tools: airtable, anthropic, brave-search, dagger, database-utils, doppler, git, github, linear, mongodb, notion, openai, playwright, postgres, railway, slack, sqlite
  - Agent routes: init, queue, route, status, submit
  - OAuth routes: authorize, clients, token
  - Admin routes: stats

## Documentation

- `README.md` - Project readme
- `PRD.md` - Product Requirements Document
- `Tasklist.prd` - Task tracking
- `agent.md` - Agent documentation

## CI/CD

### .github/workflows/

- `ci-full.yml` - Full CI pipeline
- `codeql.yml` - CodeQL security scanning
- `datadog-synthetics.yml` - Datadog monitoring
- `docker-hub-publish.yml` - Docker Hub publishing
- `docker-image.yml` - Docker image building
- `docker-publish.yml` - Docker publishing
- `label.yml` - Label management
- `manual.yml` - Manual workflows
- `node.js.yml` - Node.js CI
- `sonarqube.yml` - SonarQube analysis
- `super-linter.yml` - Linting

## Scripts

- `scripts/build-all-containers.sh` - Build script

## Dagger

- `.dagger/pipeline.ts` - Dagger pipeline configuratie

## Editor Config

- `.cursor/` - Cursor IDE settings
  - `rules/6filesystemrule.mdc` - File system rules
  - `settings.json` - Editor settings
- `.cursorrules` - Cursor rules

## Status

### ✅ Correct Geconfigureerd

- `docker-compose.yml` - Enige docker-compose bestand, correct geconfigureerd
- `package.json` - Scripts geüpdatet voor onafhankelijke containers
- Dockerfiles - Alle correct met node:20.19.5-alpine

### ⚠️ Te Controleren

- Geen duplicate bestanden meer
- Alle oude docker-compose bestanden verwijderd

## Docker Commando's

### Build Commando's

```bash
# App container
docker compose build app

# E2E container
docker compose build e2e

# Beide
docker compose build
```

### Start Commando's

```bash
# App container
docker compose up -d --build app

# E2E container
docker compose up -d --build e2e

# Beide
docker compose up -d --build
```

### Via NPM

```bash
npm run docker:app:up    # Build + start app
npm run docker:e2e:up     # Build + start e2e
npm run docker:build:all  # Build alle containers
```
