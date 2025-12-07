# 📋 Container Sync Checklist

## Overzicht

Dit document beschrijft welke bestanden en directories in elke container moeten zitten om up-to-date te blijven met de codebase.

---

## 🔄 Dev Container (Development)

### Vereiste Bestanden/Directories

- ✅ `package.json` + `package-lock.json` - Dependencies
- ✅ `app/` - Volledige source code (via volume mount voor hot-reload)
- ✅ `public/` - Public assets
- ✅ `messages/` - i18n translations
- ✅ `middleware.ts` - Next.js middleware (root level)
- ✅ `turbo.json` - Turborepo configuratie
- ✅ `tsconfig.json` - TypeScript configuratie
- ✅ `next-env.d.ts` - Next.js types (auto-generated, optioneel)

### Tools & CLI's

- ✅ Docker CLI - Voor Dagger/CI/CD
- ✅ Docker Compose - Voor container management
- ✅ Dagger CLI - Voor CI/CD pipeline testing
- ✅ Doppler CLI - Voor secrets management

### Volume Mounts (Hot-reload)

- `.:/workspaces/MMC_MCP_BRIDGE` - Volledige codebase
- `/workspaces/MMC_MCP_BRIDGE/node_modules` - Named volume
- `/workspaces/MMC_MCP_BRIDGE/.next` - Named volume

### Niet Vereist (via volume mount)

- Config files worden live gesynchroniseerd via volume mount
- Geen expliciete COPY nodig voor source code

---

## 🏭 App Container (Production)

### Builder Stage Vereisten

- ✅ `package.json` + `package-lock.json` - Dependencies
- ✅ `turbo.json` - Turborepo configuratie (expliciet gekopieerd)
- ✅ `tsconfig.json` - TypeScript configuratie (expliciet gekopieerd)
- ✅ `next-env.d.ts` - Next.js types (expliciet gekopieerd, optioneel)
- ✅ `app/` - Volledige source code
- ✅ `public/` - Public assets
- ✅ `messages/` - i18n translations
- ✅ `middleware.ts` - Next.js middleware (root level)

### Runner Stage Vereisten

- ✅ `package.json` - Voor npm start command
- ✅ `.next/` - Build output van builder stage
- ✅ `app/` - Source code (voor runtime)
- ✅ `public/` - Public assets
- ✅ `messages/` - i18n translations

### Niet Vereist

- ❌ `node_modules/` - Alleen production dependencies geïnstalleerd
- ❌ Development tools (Docker CLI, Dagger, etc.)
- ❌ Source maps (optioneel voor debugging)

---

## 🧪 E2E Container (Testing)

### Vereiste Bestanden/Directories

- ✅ `package.json` + `package-lock.json` - Dependencies (dev + production)
- ✅ `app/` - Volledige source code
- ✅ `public/` - Public assets
- ✅ `messages/` - i18n translations
- ✅ `middleware.ts` - Next.js middleware
- ✅ `turbo.json` - Turborepo configuratie
- ✅ `tsconfig.json` - TypeScript configuratie
- ✅ `.dagger/` - Dagger pipeline configuratie (voor CI/CD testing)

### Tools & CLI's

- ✅ Docker CLI - Voor Dagger/CI/CD
- ✅ Docker Compose - Voor container management
- ✅ Dagger CLI - Voor CI/CD pipeline testing
- ✅ Playwright - Voor browser automation testing
- ✅ Chromium - System browser voor Playwright

### Volume Mounts

- `.:/workspaces/MMC_MCP_BRIDGE` - Volledige codebase
- `/workspaces/MMC_MCP_BRIDGE/node_modules` - Named volume
- `/var/run/docker.sock` - Docker socket voor Dagger

---

## 📝 Sync Checklist per Container Update

### Wanneer containers updaten?

- ✅ Nieuwe dependencies toegevoegd (`package.json` gewijzigd)
- ✅ Nieuwe directories toegevoegd (`messages/`, nieuwe `app/api/` routes)
- ✅ Configuratie bestanden gewijzigd (`turbo.json`, `tsconfig.json`)
- ✅ Nieuwe tools/CLI's nodig (Docker, Dagger, etc.)
- ✅ Middleware of root-level bestanden gewijzigd

### Update Procedure

**⚠️ BELANGRIJK:** Na consolidatie (December 2024):

- ❌ `containers/dev/` - **VERWIJDERD** (vervangen door devcontainer)
- ❌ `containers/app/` - **VERWIJDERD** (vervangen door Railway)
- ⚠️ `containers/e2e/` - Optioneel behouden voor CI/CD workflows

#### 1. DevContainer (Primair)

```bash
# DevContainer start automatisch bij project openen
# Voor dependency changes: rebuild devcontainer via VS Code/Cursor
# Voor code changes: hot reload werkt automatisch (geen rebuild nodig)

# Check if Next.js dev server is running
ps aux | grep "next dev" | grep -v grep

# Start dev server (in devcontainer terminal)
npm run dev:host
```

#### 2. Docker Compose (Optioneel)

```bash
# Rebuild (alleen indien gebruikt)
docker compose build app

# Start nieuwe versie (alleen indien gebruikt)
docker compose up -d app
```

#### 3. E2E Container (Optioneel - CI/CD Workflows)

```bash
# Rebuild na dependency of tool changes (indien gebruikt)
docker compose build e2e

# Start nieuwe versie (indien gebruikt)
docker compose up -d e2e
```

---

## 🔍 Verificatie Checklist

### Na elke container update, verifieer:

#### DevContainer (Primair)

- [ ] Container start zonder errors
- [ ] Hot-reload werkt (wijzig bestand, check logs)
- [ ] Health endpoint reageert: `curl http://localhost:3000/api/health`
- [ ] SSE endpoint werkt: `curl http://localhost:3000/api/sse`
- [ ] Docker CLI beschikbaar: `docker --version`
- [ ] Dagger CLI beschikbaar: `dagger version`

#### Docker Compose Container (Optioneel)

- [ ] Container start zonder errors (indien gebruikt)
- [ ] Health endpoint reageert: `curl http://localhost:3000/api/health` (indien gebruikt)
- [ ] SSE endpoint werkt: `curl http://localhost:3000/api/sse` (indien gebruikt)

#### E2E Container (Optioneel - CI/CD Workflows)

- [ ] Container start zonder errors
- [ ] Docker CLI beschikbaar
- [ ] Dagger CLI beschikbaar
- [ ] Playwright werkt: `npx playwright --version`
- [ ] Tests kunnen draaien: `npm run test:e2e`

---

## 🚨 Veelvoorkomende Issues

### Issue: Container mist nieuwe directory

**Oplossing:** Check Dockerfile COPY statements, voeg expliciet toe indien nodig

### Issue: Dependencies niet up-to-date

**Oplossing:** Rebuild container na `npm install` of `package.json` wijzigingen

### Issue: Configuratie bestanden niet gesynchroniseerd

**Oplossing:** Voeg expliciete COPY toe voor config files (turbo.json, tsconfig.json)

### Issue: i18n messages ontbreken

**Oplossing:** Zorg dat `messages/` directory gekopieerd wordt in app container runner stage

### Issue: Middleware niet werkt

**Oplossing:** Zorg dat `middleware.ts` in root directory gekopieerd wordt

---

## 📚 Best Practices

1. **Expliciete COPY voor config files**
   - Gebruik expliciete COPY voor `turbo.json`, `tsconfig.json`, `next-env.d.ts`
   - Dit voorkomt dat ze gemist worden door `.dockerignore`

2. **Layer caching optimalisatie**
   - Kopieer `package.json` eerst voor dependency caching
   - Kopieer config files daarna
   - Kopieer source code als laatste

3. **Production container optimalisatie**
   - Kopieer alleen wat nodig is in runner stage
   - Gebruik multi-stage builds voor kleinere images
   - Exclude development dependencies

4. **Dev container volume mounts**
   - Gebruik volume mounts voor hot-reload
   - Named volumes voor `node_modules` en `.next`
   - Dit voorkomt synchronisatie issues

5. **E2E container volledigheid**
   - Include alle tools en dependencies
   - Mount Docker socket voor Dagger
   - Include test files en configuratie

---

**Last Updated:** December 2024  
**Maintained By:** Docker Specialist Agent
