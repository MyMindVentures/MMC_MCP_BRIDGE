# 🐳 DevContainer Usage - DEPRECATED

## ⚠️ Deze documentatie is vervangen

**Zie `Agent Suite/DEVCONTAINER_WORKFLOW.md` voor de unified workflow guide.**

Deze file wordt behouden voor referentie maar is vervangen door de unified workflow documentatie.

## ✅ Correcte Workflow

### 1. Check Dependencies

```powershell
# Check if node_modules exists
Test-Path node_modules

# If not, install dependencies
npm install
```

### 2. Start Next.js Dev Server

```powershell
# Check if dev server is running
Get-Process -Name node | Where-Object { $_.CommandLine -like '*next dev*' }

# If not running, start it
npm run dev:host
```

### 3. Hot Reload

- Code wijzigingen worden automatisch gedetecteerd
- Next.js Fast Refresh werkt automatisch
- **GEEN container rebuild nodig!**

## ❌ Verkeerde Workflow (Oude Architectuur)

**NIET doen:**

- ❌ `docker compose up` - Dit is voor OUDE architectuur
- ❌ Container rebuilds voor code changes
- ❌ Docker-in-Docker containers starten

## ✅ Correcte Architectuur

**DevContainer (huidige situatie):**

- ✅ We zitten AL in devcontainer
- ✅ Alle tools zijn al geïnstalleerd
- ✅ Gewoon `npm install` en `npm run dev:host`
- ✅ Hot reload werkt automatisch

**Docker Compose (alleen voor testing):**

- ⚠️ Alleen nodig voor Docker-in-Docker testing
- ⚠️ Niet nodig voor normale development
- ⚠️ Bind mount werkt niet goed in Docker-in-Docker context

## 📋 Agent Verantwoordelijkheden

**ELKE AGENT MOET:**

1. **Dependencies installeren:**

   ```powershell
   if (-not (Test-Path node_modules)) {
       npm install
   }
   ```

2. **Dev server starten (als niet running):**

   ```powershell
   $nextDev = Get-Process -Name node | Where-Object { $_.CommandLine -like '*next dev*' }
   if (-not $nextDev) {
       npm run dev:host
   }
   ```

3. **Hot reload gebruiken:**
   - Maak code changes
   - Wacht op Next.js Fast Refresh
   - Test direct

4. **Terminal reuse:**
   - Gebruik bestaande terminal
   - Geen nieuwe terminals aanmaken

---

**Last Updated:** December 2024  
**Status:** DevContainer is de primaire development omgeving
