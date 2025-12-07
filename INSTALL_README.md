# 🚀 Installation Scripts - Quick Start

**Automatische installatie van alle benodigde tools voor MMC MCP Bridge**

---

## 📋 Beschikbare Scripts

### 1. `install-all.ps1` - Complete Installation

**Installeert ALLES:**

- ✅ Windows Features (WSL2, Hyper-V)
- ✅ Git + configuratie
- ✅ Node.js 20+ LTS
- ✅ Docker Desktop
- ✅ Cursor IDE
- ✅ PowerShell Core
- ✅ GitHub CLI
- ✅ Doppler CLI
- ✅ 1Password CLI
- ✅ Dagger CLI
- ✅ Railway CLI
- ✅ Repository clone

**Gebruik:**

```powershell
# Run as Administrator
.\install-all.ps1

# Met opties
.\install-all.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com" -InstallPath "D:\Dev"

# Skip optionele tools
.\install-all.ps1 -SkipDoppler -Skip1Password -SkipRailway
```

**Parameters:**

- `-SkipDocker` - Skip Docker Desktop installatie
- `-SkipDoppler` - Skip Doppler CLI installatie
- `-Skip1Password` - Skip 1Password CLI installatie
- `-SkipRailway` - Skip Railway CLI installatie
- `-SkipRepository` - Skip repository clone
- `-InstallPath` - Installatie pad voor repository (default: `D:\GitHub_Local_Repos`)
- `-GitUserName` - Git user.name configuratie
- `-GitUserEmail` - Git user.email configuratie

---

### 2. `install-quick.ps1` - Quick Installation

**Installeert alleen essentiële tools:**

- ✅ Git
- ✅ Node.js LTS
- ✅ Docker Desktop
- ✅ Cursor IDE
- ✅ PowerShell Core
- ✅ Repository clone

**Gebruik:**

```powershell
# Run as Administrator
.\install-quick.ps1

# Met custom path
.\install-quick.ps1 -InstallPath "D:\Dev"
```

**Sneller, maar minder compleet dan `install-all.ps1`**

---

## 🎯 Aanbevolen Workflow

### Optie 1: Complete Setup (Aanbevolen)

```powershell
# 1. Run complete installation
.\install-all.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com"

# 2. Restart PowerShell (of computer als WSL2 geïnstalleerd werd)

# 3. Start Docker Desktop en wacht tot het volledig opgestart is

# 4. Authenticate tools
gh auth login
doppler login

# 5. Open Cursor IDE
# 6. Open project folder
# 7. F1 → Dev Containers: Reopen in Container
```

### Optie 2: Quick Setup

```powershell
# 1. Run quick installation
.\install-quick.ps1

# 2. Restart PowerShell

# 3. Start Docker Desktop

# 4. Open Cursor IDE en project
# 5. F1 → Dev Containers: Reopen in Container
```

---

## ⚠️ Vereisten

### Voor beide scripts:

1. **Windows 10/11** (64-bit)
2. **Administrator privileges** (Run PowerShell as Administrator)
3. **Internet verbinding** (voor downloads)
4. **Windows Package Manager (winget)** - Automatisch geïnstalleerd op Windows 11, optioneel op Windows 10

### Check winget:

```powershell
winget --version
```

Als winget niet beschikbaar is:

- **Windows 11:** Automatisch geïnstalleerd
- **Windows 10:** Installeer via Microsoft Store: "App Installer"

---

## 📝 Na Installatie

### 1. Restart PowerShell

```powershell
# Sluit huidige PowerShell en open nieuwe (als Administrator)
```

### 2. Verify Installations

```powershell
# Check alle tools
git --version
node --version
npm --version
docker --version
pwsh --version
gh --version
```

### 3. Start Docker Desktop

- Start Docker Desktop applicatie
- Wacht tot Docker volledig opgestart is (groen icoon in systray)
- Verify: `docker ps`

### 4. Authenticate Tools

```powershell
# GitHub CLI
gh auth login

# Doppler CLI
doppler login

# Railway CLI (optioneel)
railway login
```

### 5. Open Project in Cursor

1. Open Cursor IDE
2. `File → Open Folder`
3. Selecteer: `D:\GitHub_Local_Repos\MMC_MCP_BRIDGE`
4. Cursor detecteert automatisch `.devcontainer/devcontainer.json`
5. Klik: **"Reopen in Container"**
6. Wacht 5-10 minuten voor eerste build

### 6. Start Development

```bash
# In DevContainer terminal
npm run dev:host
```

---

## 🔧 Troubleshooting

### Script fails met "winget not found"

**Oplossing:**

1. Installeer Windows Package Manager via Microsoft Store
2. Of gebruik handmatige installatie (zie `SETUP_GUIDE.md`)

### Docker Desktop start niet

**Oplossing:**

1. Check of WSL2 geïnstalleerd is: `wsl --status`
2. Enable Virtual Machine Platform in Windows Features
3. Restart computer
4. Start Docker Desktop opnieuw

### Tools niet in PATH na installatie

**Oplossing:**

1. Restart PowerShell (of computer)
2. Check PATH: `$env:Path`
3. Als nog steeds niet werkt, installeer handmatig (zie `SETUP_GUIDE.md`)

### Repository clone fails

**Oplossing:**

1. Clone handmatig:
   ```powershell
   cd D:\GitHub_Local_Repos
   git clone https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git
   ```

### DevContainer build fails

**Oplossing:**

1. Check Docker Desktop is running: `docker ps`
2. Clean Docker cache: `docker system prune -a`
3. Rebuild DevContainer: `F1 → Dev Containers: Rebuild Container`

---

## 📚 Meer Informatie

- **Complete Setup Guide:** `SETUP_GUIDE.md`
- **Project README:** `README.md`
- **PRD:** `PRD.md`

---

## ✅ Verification Checklist

Na installatie, verify alles werkt:

- [ ] Git: `git --version`
- [ ] Node.js: `node --version` (moet >= 20.0.0 zijn)
- [ ] npm: `npm --version`
- [ ] Docker: `docker --version` en `docker ps`
- [ ] PowerShell Core: `pwsh --version`
- [ ] GitHub CLI: `gh --version`
- [ ] Doppler CLI: `doppler --version` (als geïnstalleerd)
- [ ] Dagger CLI: `dagger version` (als geïnstalleerd)
- [ ] Cursor IDE opent zonder errors
- [ ] Repository gecloned in: `D:\GitHub_Local_Repos\MMC_MCP_BRIDGE`
- [ ] DevContainer build succesvol
- [ ] Development server start: `npm run dev:host`

---

**Last Updated:** December 2024
**Version:** 1.0.0

**Powered by MyMind Ventures** 🚀
