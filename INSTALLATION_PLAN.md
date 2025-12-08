# 🚀 Installation Plan - Automated Setup

**Stap-voor-stap plan om alle tools te installeren**

---

## ⚠️ Belangrijk: AI Agent Limitaties

Als AI agent kan ik **niet direct software installeren** op jouw systeem omdat:

- Installaties vereisen **Administrator rechten**
- Sommige installaties vereisen **gebruikersinteractie**
- Installaties kunnen **lang duren** (5-30 minuten)

**Wat ik WEL kan doen:**

- ✅ Scripts voorbereiden en valideren
- ✅ Verificatie scripts maken
- ✅ Duidelijke instructies geven
- ✅ Troubleshooting helpen

---

## 📋 Huidige Status Check

**Run eerst dit om te zien wat al geïnstalleerd is:**

```powershell
.\check-installed-tools.ps1
```

Dit script checkt:

- ✅ Git
- ✅ Node.js
- ✅ Docker
- ✅ winget
- ✅ Chocolatey
- ✅ PowerShell Core
- ✅ GitHub CLI
- ✅ Doppler CLI
- ✅ 1Password CLI
- ✅ Dagger CLI
- ✅ Railway CLI
- ✅ Cursor IDE

---

## 🎯 Installatie Opties

### Optie 1: Automatische Installatie (Aanbevolen)

**Run het complete install script:**

```powershell
# Open PowerShell als Administrator
# Navigate naar project folder
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Run install script
.\install-all.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com"
```

**Dit script installeert:**

- ✅ Alle Windows Features (WSL2, Hyper-V)
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
- ✅ Clone repository

**Tijd:** 15-30 minuten (afhankelijk van internet snelheid)

---

### Optie 2: Quick Installatie

**Alleen essentiële tools:**

```powershell
# Open PowerShell als Administrator
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Run quick install
.\install-quick.ps1
```

**Dit script installeert:**

- ✅ Git
- ✅ Node.js LTS
- ✅ Docker Desktop
- ✅ Cursor IDE
- ✅ PowerShell Core
- ✅ Clone repository

**Tijd:** 5-10 minuten

---

### Optie 3: Handmatige Installatie

**Volg de complete setup guide:**

Zie `SETUP_GUIDE.md` voor handmatige installatie instructies voor elke tool.

---

## ✅ Na Installatie: Verificatie

**Run verificatie script:**

```powershell
.\check-installed-tools.ps1
```

**Of check handmatig:**

```powershell
git --version
node --version
npm --version
docker --version
winget --version
choco --version
pwsh --version
gh --version
```

---

## 🔧 Troubleshooting

### Script werkt niet

**Check:**

1. ✅ Run PowerShell **als Administrator**
2. ✅ Execution policy is aangepast: `Get-ExecutionPolicy` (moet `RemoteSigned` zijn)
3. ✅ Je bent in juiste folder: `pwd` (moet `D:\GitHub_Local_Repos\MMC_MCP_BRIDGE` zijn)
4. ✅ Script bestaat: `Test-Path .\install-all.ps1`

### Tools niet in PATH na installatie

**Oplossing:**

```powershell
# Refresh PATH
.\refresh-path.ps1

# Of restart PowerShell
```

### Chocolatey problemen

**Oplossing:**

```powershell
# Fix Chocolatey PATH
.\fix-chocolatey.ps1
```

---

## 📝 Installatie Log

**Tijdens installatie, noteer:**

1. Welke tools succesvol geïnstalleerd zijn
2. Welke tools gefaald zijn
3. Eventuele foutmeldingen
4. Tijd die installatie duurde

**Dit helpt bij troubleshooting!**

---

## 🎯 Volgende Stappen

**Na succesvolle installatie:**

1. ✅ **Restart PowerShell** (of computer als WSL2 geïnstalleerd werd)
2. ✅ **Start Docker Desktop** en wacht tot het volledig opgestart is
3. ✅ **Authenticate tools:**
   ```powershell
   gh auth login
   doppler login
   railway login
   ```
4. ✅ **Open Cursor IDE**
5. ✅ **Open project folder:** `D:\GitHub_Local_Repos\MMC_MCP_BRIDGE`
6. ✅ **F1 → Dev Containers: Reopen in Container**
7. ✅ **Wacht 5-10 minuten** voor eerste DevContainer build
8. ✅ **In DevContainer terminal:** `npm run dev:host`

---

## 📚 Meer Informatie

- **Install Scripts README:** `INSTALL_README.md`
- **How to Run Scripts:** `HOW_TO_RUN_SCRIPTS.md`
- **Complete Setup Guide:** `SETUP_GUIDE.md`
- **Chocolatey Guide:** `INSTALL_CHOCOLATEY.md`

---

**Last Updated:** December 2024
**Version:** 1.0.0

**Powered by MyMind Ventures** 🚀


