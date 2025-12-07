# 🚀 Complete Setup Guide - MMC MCP Bridge

**Vanaf kale laptop tot volledig werkende Fullstack Development Environment**

---

## 📋 Inhoudsopgave

1. [Kale Laptop Setup](#1-kale-laptop-setup)
2. [Project-Specifieke Requirements](#2-project-specifieke-requirements)
3. [DevContainer Setup](#3-devcontainer-setup)
4. [Vibe Coding & Top Performance](#4-vibe-coding--top-performance)
5. [Verification & Testing](#5-verification--testing)

---

## 1. Kale Laptop Setup

### 1.1 Windows 10/11 Basis Setup

#### PowerShell Execution Policy (Admin PowerShell)

```powershell
# Set execution policy voor scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Windows Features Enable

```powershell
# Enable WSL2 (Windows Subsystem for Linux)
wsl --install

# Enable Virtual Machine Platform
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform

# Enable Hyper-V (als beschikbaar)
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
```

**Na installatie:** Herstart laptop

---

### 1.2 Git Installation

```powershell
# Download Git for Windows
# https://git-scm.com/download/win

# Of via winget (Windows Package Manager)
winget install --id Git.Git -e --source winget

# Verify
git --version
```

**Configure Git:**

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf true
git config --global core.editor "code --wait"
```

---

### 1.3 Node.js Installation

**Download:** https://nodejs.org/ (LTS versie - Node.js 20.x of hoger)

**Of via winget:**

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

**Verify:**

```powershell
node --version  # Moet >= 20.0.0 zijn
npm --version
```

**Configure npm:**

```powershell
npm config set save-exact true
npm config set engine-strict true
```

---

### 1.4 Docker Desktop Installation

**Download:** https://www.docker.com/products/docker-desktop/

**Of via winget:**

```powershell
winget install --id Docker.DockerDesktop -e --source winget
```

**Na installatie:**

1. Start Docker Desktop
2. Wacht tot Docker volledig opgestart is
3. Verify:

```powershell
docker --version
docker compose version
docker ps
```

**Docker Desktop Settings:**

- ✅ Enable WSL 2 integration
- ✅ Enable "Use Docker Compose V2"
- ✅ Resources: Minimaal 4GB RAM, 2 CPU cores
- ✅ Enable "Start Docker Desktop when you log in"

---

### 1.5 VS Code / Cursor IDE Installation

**Cursor IDE (Aanbevolen):**

```powershell
# Download: https://cursor.sh/
# Of via winget
winget install --id Cursor.Cursor -e --source winget
```

**VS Code (Alternatief):**

```powershell
winget install --id Microsoft.VisualStudioCode -e --source winget
```

**Required Extensions (automatisch geïnstalleerd via devcontainer):**

- Remote - Containers
- Docker
- GitHub Copilot
- Prettier
- ESLint
- TypeScript

---

### 1.6 PowerShell Core (pwsh)

**Voor cross-platform scripts:**

```powershell
winget install --id Microsoft.PowerShell -e --source winget
```

**Verify:**

```powershell
pwsh --version
```

---

### 1.7 GitHub CLI (gh)

```powershell
winget install --id GitHub.cli -e --source winget
```

**Authenticate:**

```powershell
gh auth login
```

---

### 1.8 Doppler CLI (Credentials Management)

```powershell
# Download installer
# https://docs.doppler.com/docs/install-cli

# Of via PowerShell
(New-Object Net.WebClient).DownloadString("https://cli.doppler.com/install.ps1") | pwsh

# Verify
doppler --version
```

**Authenticate:**

```powershell
doppler login
```

---

### 1.9 1Password CLI (Alternatief voor credentials)

```powershell
# Download: https://developer.1password.com/docs/cli/get-started
# Of via winget
winget install --id AgileBits.1PasswordCLI -e --source winget
```

**Authenticate:**

```powershell
op signin
```

---

### 1.10 Dagger CLI (CI/CD Pipeline Testing)

```powershell
# Download: https://docs.dagger.io/install
# Via PowerShell
$daggerVersion = "0.19.7"
Invoke-WebRequest -Uri "https://dl.dagger.io/dagger/install.ps1" -OutFile "$env:TEMP\install-dagger.ps1"
pwsh -File "$env:TEMP\install-dagger.ps1" -Version $daggerVersion

# Verify
dagger version
```

---

### 1.11 Railway CLI (Optional - voor deployment)

```powershell
# Via npm
npm install -g @railway/cli

# Verify
railway --version
```

**Authenticate:**

```powershell
railway login
```

---

## 2. Project-Specifieke Requirements

### 2.1 Clone Repository

```powershell
# Navigate naar je development directory
cd D:\GitHub_Local_Repos

# Clone repository
git clone https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git
cd MMC_MCP_BRIDGE
```

---

### 2.2 Environment Variables Setup

**Option 1: Doppler (Aanbevolen)**

```powershell
# Authenticate met Doppler
doppler login

# Link project
doppler setup

# Pull secrets naar .env.local (voor lokale development)
doppler secrets download --no-file --format env > .env.local
```

**Option 2: Manual .env.local**

Maak `.env.local` in project root:

```bash
# Core (Required)
MCP_BRIDGE_API_KEY=your-api-key-here
REDIS_URL=redis://localhost:6379

# Databases (Optional)
POSTGRES_CONNECTION_STRING=postgresql://user:pass@localhost:5432/dbname
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/dbname
SQLITE_DB_PATH=./data/db.sqlite

# AI Services (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Dev Tools (Optional)
GITHUB_TOKEN=ghp_...
RAILWAY_TOKEN=...

# Productivity (Optional)
NOTION_API_KEY=secret_...
SLACK_BOT_TOKEN=xoxb-...
LINEAR_API_KEY=lin_api_...
AIRTABLE_API_KEY=pat_...

# Integration (Optional)
BRAVE_SEARCH_API_KEY=...
N8N_INSTANCE_APIKEY=...
N8N_BASE_URL=https://your-n8n.railway.app
STRIPE_SECRET_KEY=sk_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...

# CLI Tools (Optional)
DOPPLER_TOKEN=dp.st....
OP_SERVICE_ACCOUNT_TOKEN=op://...
```

**⚠️ BELANGRIJK:** `.env.local` staat in `.gitignore` - commit dit bestand NOOIT!

---

### 2.3 Local Database Setup (Optional)

**PostgreSQL (via Docker):**

```powershell
docker run -d `
  --name postgres-dev `
  -e POSTGRES_PASSWORD=devpassword `
  -e POSTGRES_DB=mmc_mcp_bridge `
  -p 5432:5432 `
  postgres:15-alpine
```

**MongoDB (via Docker):**

```powershell
docker run -d `
  --name mongodb-dev `
  -e MONGO_INITDB_ROOT_USERNAME=devuser `
  -e MONGO_INITDB_ROOT_PASSWORD=devpassword `
  -p 27017:27017 `
  mongo:7
```

**Redis (via Docker):**

```powershell
docker run -d `
  --name redis-dev `
  -p 6379:6379 `
  redis:7-alpine
```

---

### 2.4 Install Dependencies (Lokaal - zonder DevContainer)

```powershell
# Install Node.js dependencies
npm ci

# Verify installation
npm run type-check
npm run build
```

---

## 3. DevContainer Setup

### 3.1 Prerequisites Check

```powershell
# Verify Docker Desktop is running
docker ps

# Verify VS Code/Cursor Remote Containers extension is installed
# In Cursor: Extensions → Search "Remote - Containers" → Install
```

---

### 3.2 Open Project in DevContainer

**In Cursor IDE:**

1. Open project folder: `File → Open Folder → Select MMC_MCP_BRIDGE`
2. Cursor detecteert automatisch `.devcontainer/devcontainer.json`
3. Klik op popup: **"Reopen in Container"**
4. Of: `F1` → `Dev Containers: Reopen in Container`

**Via Command Palette:**

```
F1 → Dev Containers: Reopen in Container
```

---

### 3.3 DevContainer First-Time Setup

**Automatisch uitgevoerd bij eerste start:**

1. **Build Docker Image** (`.devcontainer/Dockerfile`)
   - Installeert Node.js 20
   - Installeert Docker CLI, GitHub CLI, Dagger CLI
   - Installeert Doppler CLI, 1Password CLI
   - Installeert PowerShell Core
   - Installeert Python + build tools
   - Installeert Playwright dependencies

2. **Post-Create Commands:**
   - `npm ci` - Installeert dependencies
   - `devcontainer.sh setup` - Initialiseert devcontainer scripts

3. **Post-Start Commands:**
   - Restore settings
   - Start git-watcher daemon
   - Start todos-sync daemon

**Wachttijd:** 5-10 minuten bij eerste build

---

### 3.4 DevContainer Verification

**In DevContainer terminal:**

```bash
# Verify Node.js
node --version  # Moet >= 20.0.0 zijn

# Verify npm
npm --version

# Verify Docker CLI (Docker-in-Docker)
docker --version
docker ps

# Verify GitHub CLI
gh --version

# Verify Dagger CLI
dagger version

# Verify Doppler CLI
doppler --version

# Verify 1Password CLI
op --version

# Verify PowerShell Core
pwsh --version

# Verify Python
python3 --version

# Verify Git
git --version
```

---

### 3.5 DevContainer Environment Variables

**Doppler Setup in DevContainer:**

```bash
# Authenticate
doppler login

# Link project
doppler setup

# Verify secrets zijn beschikbaar
doppler secrets
```

**Of gebruik `.env.local` (lokaal bestand):**

```bash
# .env.local wordt automatisch geladen door Next.js
# Zie: 2.2 Environment Variables Setup
```

---

### 3.6 Start Development Server

**In DevContainer terminal:**

```bash
# Option 1: Direct npm run dev (hot reload)
npm run dev:host

# Option 2: Via Docker Compose Watch (aanbevolen - automatische sync)
npm run docker:up:watch

# Option 3: Via Docker Compose (traditioneel)
npm run docker:up
```

**Verify server draait:**

```bash
# Health check
curl http://localhost:3000/api/health

# Of in browser
# http://localhost:3000
```

---

## 4. Vibe Coding & Top Performance

### 4.1 Cursor IDE Optimalisaties

**Settings (`.cursor/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/.next/**": true
  },
  "mcp": {
    "mcpServers": {
      "MMC-MCP-Bridge-Local": {
        "type": "sse",
        "url": "http://localhost:3000/api/sse"
      }
    }
  }
}
```

**Extensions (automatisch geïnstalleerd via devcontainer):**

- ✅ GitHub Copilot
- ✅ GitHub Copilot Chat
- ✅ Prettier
- ✅ ESLint
- ✅ TypeScript
- ✅ Docker
- ✅ Remote - Containers
- ✅ GitLens
- ✅ Error Lens
- ✅ Path IntelliSense
- ✅ npm IntelliSense

---

### 4.2 Git Workflow Optimalisaties

**DevContainer Git Config:**

```bash
# In DevContainer terminal
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
```

**Feature Branch Workflow:**

```bash
# Create feature branch
git checkout -b feature/my-feature

# Work on feature...
# ... make changes ...

# Test before commit
npm run type-check
npm run build

# Commit
git add .
git commit -m "feat: description"

# Push (Railway auto-deploys preview)
git push origin feature/my-feature

# Test Railway preview
# https://mmc-mcp-bridge-pr-123.up.railway.app/api/health

# Merge to main (only if preview works!)
git checkout main
git merge feature/my-feature --no-ff
git push origin main
```

---

### 4.3 Performance Optimalisaties

**Node.js Memory:**

```bash
# In DevContainer terminal
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Docker Resources:**

- **RAM:** Minimaal 8GB (16GB aanbevolen)
- **CPU:** Minimaal 4 cores
- **Disk:** Minimaal 50GB vrije ruimte

**Docker Desktop Settings:**

- ✅ Enable "Use Docker Compose V2"
- ✅ Enable "Use WSL 2 based engine"
- ✅ Resources: 8GB RAM, 4 CPU cores
- ✅ Enable "Start Docker Desktop when you log in"

---

### 4.4 Hot Reload Optimalisaties

**Docker Compose Watch (Aanbevolen):**

```bash
# Start met Docker Watch (automatische file sync)
npm run docker:up:watch
```

**Features:**

- ✅ Automatische file sync (geen rebuilds)
- ✅ Hot reload voor code changes
- ✅ Rebuild alleen bij dependency changes

**Manual Hot Reload:**

```bash
# In DevContainer terminal
npm run dev:host
```

**Environment Variables voor Hot Reload:**

```bash
# Automatisch gezet in docker-compose.yml
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
WATCHPACK_WATCHER_LIMIT=10000
```

---

### 4.5 MCP Bridge Connection

**Cursor IDE MCP Config:**

De MCP Bridge is automatisch geconfigureerd in `.devcontainer/devcontainer.json`:

```json
{
  "mcp": {
    "mcpServers": {
      "MMC-MCP-Bridge-Local": {
        "type": "sse",
        "url": "http://localhost:3000/api/sse"
      },
      "MMC-MCP-Bridge-Railway": {
        "type": "sse",
        "url": "https://mmcmcphttpbridge-production.up.railway.app/api/sse"
      }
    }
  }
}
```

**Verify MCP Connection:**

1. Start development server: `npm run dev:host`
2. In Cursor: `F1` → `MCP: List Servers`
3. Verify "MMC-MCP-Bridge-Local" is connected

---

### 4.6 AI Agent Performance

**GitHub Copilot Settings:**

```json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": true,
    "markdown": true
  },
  "github.copilot.editor.enableAutoCompletions": true
}
```

**Cursor AI Settings:**

- ✅ Enable "Auto-complete"
- ✅ Enable "Inline suggestions"
- ✅ Enable "Chat suggestions"

---

## 5. Verification & Testing

### 5.1 Complete System Check

**PowerShell Script (Run in project root):**

```powershell
# Verify all tools
Write-Host "=== System Verification ===" -ForegroundColor Cyan

Write-Host "`n1. Node.js:" -ForegroundColor Yellow
node --version
npm --version

Write-Host "`n2. Docker:" -ForegroundColor Yellow
docker --version
docker compose version
docker ps

Write-Host "`n3. Git:" -ForegroundColor Yellow
git --version

Write-Host "`n4. GitHub CLI:" -ForegroundColor Yellow
gh --version

Write-Host "`n5. Doppler CLI:" -ForegroundColor Yellow
doppler --version

Write-Host "`n6. Dagger CLI:" -ForegroundColor Yellow
dagger version

Write-Host "`n7. PowerShell Core:" -ForegroundColor Yellow
pwsh --version

Write-Host "`n=== Verification Complete ===" -ForegroundColor Green
```

---

### 5.2 Project Verification

**In DevContainer terminal:**

```bash
# Type check
npm run type-check

# Build
npm run build

# Docker validation
npm run docker:validate

# CI/CD validation (all checks)
npm run cicd:validate
```

---

### 5.3 Health Check

**Local Development Server:**

```bash
# Start server
npm run dev:host

# In andere terminal
curl http://localhost:3000/api/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-12-04T...",
  "servers": {
    "enabled": 26,
    "total": 26
  },
  "connections": {
    "postgres": "connected",
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

---

### 5.4 MCP Server Verification

**List All MCP Servers:**

```bash
curl http://localhost:3000/api/servers
```

**Test Specific Tool:**

```bash
# Example: Postgres query
curl -X POST http://localhost:3000/api/mcp/postgres/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{"query":"SELECT version()"}'
```

---

### 5.5 Railway Preview Deployment

**Push Feature Branch:**

```bash
git push origin feature/my-feature
```

**Railway auto-deploys preview:**

- URL: `https://mmc-mcp-bridge-pr-123.up.railway.app`
- Health: `https://mmc-mcp-bridge-pr-123.up.railway.app/api/health`

**Verify:**

```bash
curl https://mmc-mcp-bridge-pr-123.up.railway.app/api/health
```

---

## 📝 Quick Reference Commands

### Daily Development

```bash
# Start DevContainer
# Cursor: F1 → Dev Containers: Reopen in Container

# Start dev server
npm run dev:host

# Or with Docker Watch
npm run docker:up:watch

# Type check
npm run type-check

# Build
npm run build

# Test
npm run docker:test
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Test before commit
npm run type-check && npm run build

# Commit
git add .
git commit -m "feat: description"

# Push (Railway auto-deploys)
git push origin feature/my-feature

# Merge to main (only if preview works!)
git checkout main
git merge feature/my-feature --no-ff
git push origin main
```

### Docker Management

```bash
# Start with watch
npm run docker:up:watch

# Stop
npm run docker:down

# Logs
npm run docker:logs

# Restart
npm run docker:restart

# Clean all
npm run docker:clean:all
```

---

## 🆘 Troubleshooting

### Docker Desktop niet opgestart

```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait 30 seconds, then verify
docker ps
```

### DevContainer build fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild DevContainer
# Cursor: F1 → Dev Containers: Rebuild Container
```

### Port 3000 already in use

```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in .env.local
PORT=3001
```

### npm install fails

```bash
# Clean npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm ci
```

### MCP Bridge niet verbonden

```bash
# Verify server draait
curl http://localhost:3000/api/health

# Check MCP config in Cursor
# F1 → MCP: List Servers

# Restart Cursor IDE
```

---

## ✅ Setup Checklist

### Kale Laptop Setup

- [ ] Windows 10/11 geïnstalleerd
- [ ] WSL2 geïnstalleerd en geconfigureerd
- [ ] Git geïnstalleerd en geconfigureerd
- [ ] Node.js 20+ geïnstalleerd
- [ ] Docker Desktop geïnstalleerd en draaiend
- [ ] Cursor IDE geïnstalleerd
- [ ] PowerShell Core geïnstalleerd
- [ ] GitHub CLI geïnstalleerd en geauthenticeerd
- [ ] Doppler CLI geïnstalleerd en geauthenticeerd
- [ ] 1Password CLI geïnstalleerd (optioneel)
- [ ] Dagger CLI geïnstalleerd
- [ ] Railway CLI geïnstalleerd (optioneel)

### Project Setup

- [ ] Repository gecloned
- [ ] Environment variables geconfigureerd (Doppler of .env.local)
- [ ] Local databases opgestart (PostgreSQL, MongoDB, Redis)
- [ ] Dependencies geïnstalleerd (`npm ci`)

### DevContainer Setup

- [ ] DevContainer succesvol gebouwd
- [ ] Alle tools geverifieerd (Node.js, Docker, GitHub CLI, etc.)
- [ ] Doppler geauthenticeerd in DevContainer
- [ ] Development server draait (`npm run dev:host`)
- [ ] Health check werkt (`curl http://localhost:3000/api/health`)

### Vibe Coding Setup

- [ ] Cursor IDE extensions geïnstalleerd
- [ ] Git workflow geconfigureerd
- [ ] MCP Bridge verbonden in Cursor
- [ ] Hot reload werkt
- [ ] GitHub Copilot actief

### Verification

- [ ] System verification script draait zonder errors
- [ ] Type check slaagt (`npm run type-check`)
- [ ] Build slaagt (`npm run build`)
- [ ] Docker validation slaagt (`npm run docker:validate`)
- [ ] CI/CD validation slaagt (`npm run cicd:validate`)
- [ ] Health endpoint reageert correct
- [ ] MCP servers zijn beschikbaar

---

## 🎉 Klaar!

Je bent nu volledig klaar om te ontwikkelen aan MMC MCP Bridge!

**Next Steps:**

1. Start development: `npm run dev:host`
2. Open Cursor IDE
3. Begin coden! 🚀

**Support:**

- **Documentation:** `README.md`
- **PRD:** `PRD.md`
- **Tasklist:** `Tasklist.prd`
- **Issues:** GitHub Issues

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Complete Setup Guide

**Powered by MyMind Ventures** 🚀
