# GitHub Actions Workflows - DISABLED

**Status:** ❌ Alle workflows zijn gemigreerd naar E2E container

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

**Alle GitHub Actions workflows zijn nu DISABLED of VERWIJDERD.**

Gebruik de E2E container workflows voor alle CI/CD taken.

---

**Migratie Datum:** 2024-12-04  
**Status:** ✅ Volledig Gemigreerd

