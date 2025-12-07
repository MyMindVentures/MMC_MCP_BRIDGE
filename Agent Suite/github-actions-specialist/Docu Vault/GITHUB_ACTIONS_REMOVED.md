# GitHub Actions - Verwijderd

**Datum:** 2024-12-06  
**Reden:** Railway heeft eigen deployment, GitHub Actions is niet nodig

---

## ✅ Wat We Nu Gebruiken

### Railway Deployment (Code as Config)

- **Config:** `railway.json`
- **Features:**
  - Auto-deploy op push naar main
  - PR preview deployments
  - Predeploy checks (`npm run type-check && npm run build`)
  - Health checks (`/api/health`)
  - Auto-cleanup na merge

### Lokale CI/CD met Dagger

- **Pipeline:** `.dagger/pipeline.ts`
- **Run:** `npm run dagger:local`
- **Features:**
  - Multi-stage builds met caching
  - Parallel execution
  - Type-check, build validation
  - Railway config validation
  - Docker Hub publishing

### Lokale Testing

- **Build check:** `npm run build` (MANDATORY voor elke commit)
- **Type check:** `npm run type-check`
- **Docker testing:** `npm run docker:test:all`

---

## 🗑️ Verwijderde Workflows

Alle GitHub Actions workflows zijn verwijderd:

- ❌ `pre-merge-check.yml` - Railway doet dit zelf
- ❌ `ci-full.yml` - Dagger pipeline lokaal
- ❌ `codeql.yml` - Security scanning (optioneel later)
- ❌ `docker-hub-publish.yml` - Dagger pipeline
- ❌ `datadog-synthetics.yml` - Externe service
- ❌ `label.yml` - Auto-labeling (optioneel)
- ❌ `manual.yml` - Test workflow
- ❌ `node.js.yml` - Railway test dit
- ❌ `sonarqube.yml` - Code analysis (optioneel later)
- ❌ `super-linter.yml` - Linting (optioneel later)

---

## ✅ Workflow Nu

### Voor Elke Commit

```bash
# 1. Type check
npm run type-check

# 2. Build
npm run build

# 3. Commit
git commit -m "..."

# 4. Push
git push origin feature/name
```

### Railway Auto-Deploys

- Push naar main → Production deploy
- PR naar main → Preview deploy
- Railway voert automatisch uit:
  - `npm ci`
  - `npm run type-check` (via predeployCommand)
  - `npm run build` (via predeployCommand)
  - `npm run start` (via startCommand)

### Lokale CI/CD Pipeline

```bash
# Run volledige pipeline lokaal
npm run dagger:local

# Dit doet:
# - Type-check
# - Build
# - Railway config validatie
# - Docker builds (optioneel)
```

---

## 📝 Notities

- **Railway is de enige CI/CD** - Geen GitHub Actions meer nodig
- **Lokale testing is MANDATORY** - Altijd `npm run build` voor commit
- **Dagger voor complexe builds** - Container builds, multi-stage, caching
- **Railway predeploy checks** - Type-check en build gebeuren automatisch

---

**Status:** ✅ GitHub Actions volledig verwijderd, Railway + Dagger workflow actief
