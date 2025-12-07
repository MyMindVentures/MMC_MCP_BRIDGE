# GitHub Actions Workflows - DISABLED

**Status:** ❌ GEEN GitHub Actions workflows - Alle CI/CD via Railway + Dagger

## 🎯 Reden voor Migratie

Alle GitHub Actions workflows zijn gemigreerd naar de E2E container om:

- Volledige controle te hebben over CI/CD
- Eenvoudiger te debuggen
- Dependabot/Copilot interferentie te voorkomen
- Lokale testing mogelijk te maken
- Kosten te besparen

## 📋 Gemigreerde Workflows

Alle workflows zijn nu beschikbaar in `containers/e2e/workflows/`:

1. ✅ `pre-merge-check.yml` → `pre-merge-check.sh`
2. ✅ `ci-full.yml` → `ci-full.sh`
3. ✅ `node.js.yml` → `node-multi-version.sh`
4. ✅ `super-linter.yml` → `lint.sh`
5. ✅ `codeql.yml` → `security-scan.sh`
6. ✅ `docker-hub-publish.yml` → `docker-build.sh`
7. ✅ Dagger workflows → `dagger-pipeline.sh`

## 🚀 Gebruik

Zie `containers/e2e/workflows/README.md` voor volledige documentatie.

**Quick Start:**

```bash
# Run all workflows
npm run workflow:all

# Or in E2E container
docker compose up -d e2e
```

## ⚠️ Belangrijk

**GEEN GitHub Actions workflows worden gebruikt!**

**CI/CD wordt volledig gedaan via:**

- ✅ **Railway** - Auto-deploy op push/PR (zie `railway.json`)
- ✅ **Dagger** - Container builds en pipelines (zie `.dagger/pipeline.ts`)
- ✅ **E2E Container** - Lokale workflow testing (zie `containers/e2e/workflows/`)

**Waarom geen GitHub Actions?**

- Volledige controle over CI/CD
- Eenvoudiger te debuggen
- Dependabot/Copilot interferentie voorkomen
- Lokale testing mogelijk maken
- Kosten besparen

---

**Migratie Datum:** 2024-12-04  
**Status Update:** 2024-12-06  
**Status:** ❌ GEEN GitHub Actions - Railway + Dagger voor CI/CD
