# E2E Container Workflows

**Vervangt alle GitHub Actions workflows** - Volledige CI/CD pipeline in E2E container.

## 🎯 Overzicht

Alle GitHub Actions workflows zijn gemigreerd naar bash scripts die in de E2E container draaien. Dit geeft volledige controle en maakt debugging veel eenvoudiger.

## 📋 Workflows

### 1. **run-all.sh** - Master Workflow

Voert alle workflows sequentieel uit:

- Pre-merge checks
- CI Full Pipeline
- Linting
- Security Scan
- Docker Builds
- Dagger Pipeline

**Gebruik:**

```bash
npm run workflow:all
# of
./containers/e2e/workflows/run-all.sh
```

### 2. **pre-merge-check.sh** - Pre-Merge Validatie

Vervangt: `pre-merge-check.yml`

**Doel:** Type-check en build validatie voor merges

**Gebruik:**

```bash
npm run workflow:pre-merge
```

**Checks:**

- TypeScript type check
- Build validation
- Docker Compose validation

### 3. **ci-full.sh** - CI Full Pipeline

Vervangt: `ci-full.yml`

**Doel:** Volledige CI pipeline (lint, typecheck, build)

**Gebruik:**

```bash
npm run workflow:ci-full
```

**Stappen:**

- Type check
- Build

### 4. **lint.sh** - Code Linting

Vervangt: `super-linter.yml`

**Doel:** Code linting en formatting checks

**Gebruik:**

```bash
npm run workflow:lint
```

**Tools:**

- ESLint (als geconfigureerd)
- Prettier (als geconfigureerd)
- TypeScript strict checks

### 5. **security-scan.sh** - Security Scanning

Vervangt: Basic security scanning

**Doel:** Security vulnerability scanning

**Gebruik:**

```bash
npm run workflow:security
```

**Scans:**

- npm audit
- Snyk (als geïnstalleerd)
- Known vulnerable packages check

### 6. **codeql.sh** - CodeQL Security Scanning

Vervangt: `codeql.yml`

**Doel:** Advanced security scanning met CodeQL

**Gebruik:**

```bash
npm run workflow:codeql
```

**Features:**

- CodeQL database creation
- Multi-language analysis (JavaScript/TypeScript, Actions)
- SARIF result export
- Security vulnerability detection

### 7. **superlinter.sh** - Super Linter

Vervangt: `super-linter.yml`

**Doel:** Multi-language code linting

**Gebruik:**

```bash
npm run workflow:superlinter
```

**Features:**

- Runs in Docker container
- Supports multiple languages
- Validates codebase against best practices

### 8. **sonarqube.sh** - SonarQube Analysis

Vervangt: `sonarqube.yml`

**Doel:** Code quality and security analysis

**Gebruik:**

```bash
npm run workflow:sonarqube
```

**Requirements:**

- `SONAR_TOKEN` environment variable
- `SONAR_HOST_URL` environment variable
- `SONAR_PROJECT_KEY` environment variable

**Features:**

- Code quality metrics
- Security vulnerability detection
- Code smell detection
- Technical debt analysis

### 9. **datadog.sh** - Datadog Synthetic Tests

Vervangt: `datadog-synthetics.yml`

**Doel:** End-to-end synthetic testing

**Gebruik:**

```bash
npm run workflow:datadog
```

**Requirements:**

- `DD_API_KEY` environment variable
- `DD_APP_KEY` environment variable

**Features:**

- Synthetic test execution
- Test search by tags (`tag:e2e-tests`)
- CI/CD integration

### 10. **label.sh** - PR Labeler

Vervangt: `label.yml`

**Doel:** Auto-label pull requests based on changed files

**Gebruik:**

```bash
npm run workflow:label
```

**Requirements:**

- `GITHUB_TOKEN` environment variable
- `.github/labeler.yml` configuration file
- GitHub CLI (`gh`) or GitHub API access

**Features:**

- Automatic PR labeling
- File path-based labeling
- Custom label rules

### 11. **docker-build.sh** - Docker Builds

Vervangt: `docker-hub-publish.yml`

**Doel:** Build en push Docker images naar registries

**Gebruik:**

```bash
# Build only
npm run workflow:docker-build

# Build and push to Docker Hub
PUSH_HUB=true npm run workflow:docker-build

# Build and push to GHCR
PUSH_GHCR=true npm run workflow:docker-build

# Build and push to both
PUSH_HUB=true PUSH_GHCR=true npm run workflow:docker-build
```

**Containers:**

- dev
- app
- e2e

### 12. **dagger-pipeline.sh** - Dagger Pipeline

Vervangt: Dagger CI/CD workflows

**Doel:** Run Dagger pipeline voor builds en deployments

**Gebruik:**

```bash
npm run workflow:dagger
```

### 13. **node-multi-version.sh** - Multi-Version Testing

Vervangt: `node.js.yml`

**Doel:** Test op meerdere Node versies (18.x, 20.x, 22.x)

**Gebruik:**

```bash
npm run workflow:node-versions
```

**Nota:** Vereist nvm of n (node version manager)

## 🚀 Gebruik in E2E Container

### Standaard Command

De E2E container draait automatisch alle workflows:

```bash
docker compose up -d e2e
```

### Individuele Workflows

```bash
# Pre-merge checks
docker compose exec e2e ./containers/e2e/workflows/pre-merge-check.sh

# CI Full Pipeline
docker compose exec e2e ./containers/e2e/workflows/ci-full.sh

# Linting
docker compose exec e2e ./containers/e2e/workflows/lint.sh

# Security Scan
docker compose exec e2e ./containers/e2e/workflows/security-scan.sh

# CodeQL Security Scanning
docker compose exec e2e ./containers/e2e/workflows/codeql.sh

# Super Linter
docker compose exec e2e ./containers/e2e/workflows/superlinter.sh

# SonarQube Analysis
docker compose exec e2e ./containers/e2e/workflows/sonarqube.sh

# Datadog Synthetic Tests
docker compose exec e2e ./containers/e2e/workflows/datadog.sh

# PR Labeler
docker compose exec e2e ./containers/e2e/workflows/label.sh

# Docker Builds
docker compose exec e2e ./containers/e2e/workflows/docker-build.sh

# Dagger Pipeline
docker compose exec e2e ./containers/e2e/workflows/dagger-pipeline.sh
```

## 📦 NPM Scripts

Alle workflows zijn beschikbaar via npm scripts:

```bash
npm run workflow:all          # Run all workflows
npm run workflow:pre-merge    # Pre-merge checks
npm run workflow:ci-full      # CI Full Pipeline
npm run workflow:lint         # Linting
npm run workflow:security     # Security Scan
npm run workflow:codeql        # CodeQL Security Scanning
npm run workflow:superlinter   # Super Linter
npm run workflow:sonarqube    # SonarQube Analysis
npm run workflow:datadog      # Datadog Synthetic Tests
npm run workflow:label        # PR Labeler
npm run workflow:docker-build # Docker Builds
npm run workflow:dagger       # Dagger Pipeline
npm run workflow:node-versions # Multi-version testing
```

## 🔧 Configuratie

### Environment Variables

**Docker Builds:**

- `PUSH_HUB=true` - Push naar Docker Hub
- `PUSH_GHCR=true` - Push naar GHCR

**Security Scan:**

- Vereist Snyk CLI voor volledige functionaliteit (optioneel)

**Node Multi-Version:**

- Vereist nvm of n (node version manager)

## ✅ Voordelen vs GitHub Actions

1. **Volledige Controle** - Alle scripts zijn lokaal en aanpasbaar
2. **Eenvoudig Debuggen** - Directe toegang tot logs en output
3. **Geen Dependabot/Copilot Interferentie** - Geen automatische wijzigingen
4. **Lokale Testing** - Test workflows lokaal voordat je pusht
5. **Sneller** - Geen GitHub Actions queue tijd
6. **Kostenbesparend** - Geen GitHub Actions minuten verbruik

## 🐛 Troubleshooting

### Workflow Fails

```bash
# Check logs
docker compose logs e2e

# Run workflow manually
docker compose exec e2e ./containers/e2e/workflows/[workflow-name].sh
```

### Docker Build Fails

```bash
# Check Docker daemon
docker info

# Check Docker socket mount
ls -la /var/run/docker.sock
```

### Dagger Pipeline Fails

```bash
# Check Dagger CLI
docker compose exec e2e dagger version

# Run Dagger manually
docker compose exec e2e dagger run ./.dagger/pipeline.ts
```

## 📝 Notities

- Alle workflows zijn bash scripts voor maximale compatibiliteit
- Scripts gebruiken `set -e` voor error handling
- Non-blocking checks (security scan) geven warnings maar blokkeren niet
- Docker builds vereisen Docker socket mount (`/var/run/docker.sock`)

---

**Laatste Update:** 2024-12-04  
**Status:** ✅ Alle GitHub Actions workflows gemigreerd
