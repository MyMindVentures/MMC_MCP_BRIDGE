# 🌿 Branching Strategy - MMC MCP Bridge

## 📋 Overzicht

We gebruiken een **feature branch workflow** met **geautomatiseerde checks** om ervoor te zorgen dat `main` altijd stable blijft.

---

## 🎯 Regels

### ✅ DO's

- ✅ **Altijd** werk op feature branches voor elke MCP upgrade
- ✅ **Altijd** run pre-merge checks voordat je merged naar main
- ✅ **Altijd** gebruik `--no-ff` bij merges (no fast-forward)
- ✅ **Altijd** verwijder feature branch na merge
- ✅ **Altijd** wacht tot Railway healthy is na merge

### ❌ DON'Ts

- ❌ **NOOIT** commit direct naar main (behalve hotfixes)
- ❌ **NOOIT** merge zonder build checks
- ❌ **NOOIT** force push naar main
- ❌ **NOOIT** skip pre-merge checks

---

## 🔄 Workflow

### **Stap 1: Nieuwe Feature Branch**

```bash
# Voor nieuwe MCP server upgrade
git checkout main
git pull origin main
git checkout -b feature/mcp-{server-name}

# Bijvoorbeeld:
git checkout -b feature/mcp-google-drive
```

### **Stap 2: Werk aan Feature**

```bash
# Maak je changes
# Test lokaal
# Commit regelmatig

git add .
git commit -m "feat: Add Google Drive MCP tools"
```

### **Stap 3: Pre-Merge Check (VERPLICHT)**

```bash
# Run pre-merge checks
./scripts/pre-merge-check.sh
```

**Dit script checkt:**
- ✅ Geen uncommitted changes
- ✅ Dependencies zijn up-to-date
- ✅ Build slaagt
- ✅ Branch is up-to-date met main

**Als dit faalt:**
```bash
# Fix de errors
# Run opnieuw
./scripts/pre-merge-check.sh
```

### **Stap 4: Merge naar Main**

**Optie A: Handmatig (met checks)**

```bash
# 1. Pre-merge check
./scripts/pre-merge-check.sh

# 2. Switch naar main
git checkout main
git pull origin main

# 3. Merge feature branch
git merge feature/mcp-google-drive --no-ff -m "MERGE: Google Drive - 20 Tools"

# 4. Push naar GitHub
git push origin main

# 5. Delete feature branch
git branch -d feature/mcp-google-drive
git push origin --delete feature/mcp-google-drive
```

**Optie B: Geautomatiseerd (AANBEVOLEN)**

```bash
# Dit doet alles automatisch:
# - Pre-merge checks
# - Merge naar main
# - Push naar GitHub
# - Delete feature branch
# - Wacht op Railway deployment

./scripts/merge-to-main.sh
```

### **Stap 5: Verifieer Railway Deployment**

```bash
# Check health
curl https://mmcmcphttpbridge-production.up.railway.app/api/health

# Of gebruik Railway CLI
railway logs
```

---

## 🤖 GitHub Actions CI/CD

### **Automatische Checks**

Elke push naar **elke branch** triggert automatisch:

1. **Build Test**: `npm ci && npm run build`
2. **Type Check**: TypeScript validatie
3. **Merge Guard**: Blokkeert merge als checks falen

### **Status Badges**

Check de status in GitHub:
- 🟢 **Green**: Safe to merge
- 🔴 **Red**: DO NOT MERGE - fix errors first
- 🟡 **Yellow**: In progress

### **Branch Protection Rules** (Aanbevolen)

Stel in via GitHub Settings → Branches → Branch protection rules:

```yaml
Branch: main

Rules:
✅ Require status checks to pass before merging
  - test-build
  - typecheck
✅ Require branches to be up to date before merging
✅ Do not allow bypassing the above settings
```

---

## 📝 Branch Naming Convention

```bash
# MCP Server Upgrades
feature/mcp-{server-name}
  └─ feature/mcp-postgres
  └─ feature/mcp-openai
  └─ feature/mcp-github

# Bug Fixes
fix/{description}
  └─ fix/oauth2-token-expiry
  └─ fix/postgres-connection-leak

# Infrastructure
infra/{description}
  └─ infra/add-rate-limiting
  └─ infra/redis-caching

# Hotfixes (direct naar main)
hotfix/{critical-issue}
  └─ hotfix/security-patch
  └─ hotfix/railway-crash
```

---

## 🚨 Troubleshooting

### **Probleem 1: Build faalt op feature branch**

```bash
# Run build lokaal
npm run build

# Check errors
# Fix errors
# Commit fix
git add .
git commit -m "fix: Build errors"

# Run pre-merge check opnieuw
./scripts/pre-merge-check.sh
```

### **Probleem 2: Branch is achter op main**

```bash
# Rebase op main
git fetch origin main
git rebase origin/main

# Als er conflicts zijn:
# 1. Resolve conflicts
# 2. git add .
# 3. git rebase --continue

# Force push (alleen op feature branch!)
git push origin feature/mcp-{server-name} --force
```

### **Probleem 3: Railway deployment faalt na merge**

```bash
# Check Railway logs
railway logs

# Als build faalt:
# 1. Fix errors op nieuwe feature branch
# 2. Merge fix naar main
# 3. Railway auto-redeploys

# Als rollback nodig is:
git revert HEAD
git push origin main
```

### **Probleem 4: Merge conflict**

```bash
# Update feature branch met main
git checkout feature/mcp-{server-name}
git fetch origin main
git merge origin/main

# Resolve conflicts
# Test build
npm run build

# Commit merge
git add .
git commit -m "merge: Resolve conflicts with main"

# Push
git push origin feature/mcp-{server-name}

# Run pre-merge check
./scripts/pre-merge-check.sh
```

---

## 📊 Workflow Diagram

```
┌─────────────────┐
│  main (stable)  │
└────────┬────────┘
         │
         │ git checkout -b feature/mcp-x
         ├──────────────────────────────────┐
         │                                  │
         │                         ┌────────▼────────┐
         │                         │ feature/mcp-x   │
         │                         │                 │
         │                         │ 1. Develop      │
         │                         │ 2. Commit       │
         │                         │ 3. Test         │
         │                         └────────┬────────┘
         │                                  │
         │                                  │ ./scripts/pre-merge-check.sh
         │                                  │
         │                         ┌────────▼────────┐
         │                         │  Pre-Merge      │
         │                         │  Checks         │
         │                         │                 │
         │                         │ ✅ Build OK     │
         │                         │ ✅ Types OK     │
         │                         │ ✅ Up-to-date   │
         │                         └────────┬────────┘
         │                                  │
         │                                  │ ./scripts/merge-to-main.sh
         │                                  │
         │ ◄────────────────────────────────┤
         │         Merge (--no-ff)          │
         │                                  │
         ├──────────────────────────────────┘
         │
         │ git push origin main
         │
         ▼
    ┌────────────────┐
    │  Railway       │
    │  Auto-Deploy   │
    │                │
    │  Build → Test  │
    │  → Deploy      │
    └────────────────┘
```

---

## ✅ Checklist voor Merge

Voordat je merged naar main:

- [ ] Feature branch is up-to-date met main
- [ ] Alle changes zijn committed
- [ ] Pre-merge check succesvol (`./scripts/pre-merge-check.sh`)
- [ ] Build slaagt lokaal (`npm run build`)
- [ ] GitHub Actions checks zijn green
- [ ] Code is gereviewed (optioneel)
- [ ] Merge message is duidelijk
- [ ] Railway deployment is gemonitord
- [ ] Feature branch is verwijderd na merge

---

## 🎯 Best Practices

1. **Klein en Frequent**: Merge kleine features vaak, niet grote features zelden
2. **Test Eerst**: Altijd pre-merge checks runnen
3. **Descriptive Commits**: Gebruik duidelijke commit messages
4. **Monitor Railway**: Wacht tot deployment healthy is
5. **Cleanup**: Verwijder feature branches na merge
6. **Rebase vs Merge**: Gebruik rebase voor feature branch updates, merge voor main

---

## 📚 Gerelateerde Documentatie

- [GitHub Actions Workflow](.github/workflows/test-build.yml)
- [Pre-Merge Check Script](scripts/pre-merge-check.sh)
- [Merge to Main Script](scripts/merge-to-main.sh)
- [Railway Configuration](railway.json)

---

## 🆘 Hulp Nodig?

```bash
# Pre-merge check
./scripts/pre-merge-check.sh --help

# Merge to main
./scripts/merge-to-main.sh --help

# Check Railway status
curl https://mmcmcphttpbridge-production.up.railway.app/api/health | jq
```

**Questions?** Check de scripts of vraag in het team! 🚀

