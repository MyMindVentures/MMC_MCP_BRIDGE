# 📦 Containers Directory

## ✅ Consolidatie Voltooid

**De deprecated containers (`dev/` en `app/`) zijn verwijderd.**

De applicatie gebruikt nu **één enkele container** via de devcontainer (`.devcontainer/Dockerfile`) met Docker Compose Watch voor hot reload.

## 🎯 Huidige Setup

### Single Container Architecture

- **DevContainer**: `.devcontainer/Dockerfile` - Full Stack development container
- **Docker Compose**: `docker-compose.yml` - 1 service (`app`) met Docker Watch (optioneel)
- **Hot Reload**: Automatisch via Docker Compose Watch - geen rebuilds nodig

### Development Workflow

**Primaire Methode: DevContainer (Aanbevolen)**

Wanneer je het project opent in VS Code/Cursor, start de devcontainer automatisch:

```bash
# In devcontainer terminal
npm install          # Eerste keer of na dependency changes
npm run dev:host     # Start Next.js dev server
```

**Hot reload werkt automatisch** - geen container rebuilds nodig voor code changes.

**Alternatieve Methode: Docker Compose (Optioneel)**

Alleen gebruiken voor specifieke use cases (bijv. Docker-in-Docker testing):

```bash
# Met Docker Watch (aanbevolen - hot reload)
npm run docker:up:watch

# Zonder watch (traditioneel)
npm run docker:up
```

**⚠️ Let op:** Docker Compose is optioneel. Voor normale development gebruik je de devcontainer direct.

## 📁 Huidige Directory Structuur

### `containers/e2e/` - ✅ Behouden

**Status:** Optioneel - gebruikt voor CI/CD workflows

- E2E test container met Playwright en Dagger
- Workflows in `containers/e2e/workflows/` worden gebruikt door package.json scripts
- Niet nodig voor lokale development

### Verwijderde Directories

- ❌ `containers/dev/` - Verwijderd (vervangen door `.devcontainer/Dockerfile`)
- ❌ `containers/app/` - Verwijderd (vervangen door Railway deployment)
- ❌ Legacy scripts - Verwijderd (`build-and-start-containers.sh`, `sync-containers.sh`, `validate.sh`)

## 📚 Documentatie

- **DevContainer Workflow**: `Agent Suite/DEVCONTAINER_WORKFLOW.md` - Unified workflow guide
- **DevContainer Config**: `.devcontainer/devcontainer.json`
- **Docker Compose**: `docker-compose.yml` (optioneel)

## 🔄 Migratie Geschiedenis

**December 2024 - Consolidatie:**

- ✅ Deprecated containers (`dev/`, `app/`) verwijderd
- ✅ Legacy scripts verwijderd
- ✅ Single container architecture geconsolideerd
- ✅ Documentatie geüpdatet met duidelijke workflow

---

**Last Updated:** December 2024  
**Status:** ✅ Geconsolideerd - DevContainer is primaire development omgeving
