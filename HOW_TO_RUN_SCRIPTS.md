# 🚀 Hoe PowerShell Scripts Uitvoeren

**Complete gids voor het uitvoeren van PowerShell installatie scripts**

---

## ⚠️ Belangrijk: Execution Policy

PowerShell blokkeert standaard het uitvoeren van scripts om veiligheidsredenen. Je moet eerst de execution policy aanpassen.

### Stap 1: Check Current Execution Policy

```powershell
Get-ExecutionPolicy
```

**Mogelijke waarden:**

- `Restricted` - Scripts zijn geblokkeerd (standaard)
- `RemoteSigned` - Lokale scripts toegestaan, remote scripts moeten getekend zijn ✅ (aanbevolen)
- `Unrestricted` - Alles toegestaan (niet aanbevolen)

### Stap 2: Set Execution Policy (Als Administrator)

**Open PowerShell als Administrator:**

1. **Windows 11:**
   - Druk `Windows + X`
   - Klik op **"Windows PowerShell (Admin)"** of **"Terminal (Admin)"**

2. **Windows 10:**
   - Druk `Windows + X`
   - Klik op **"Windows PowerShell (Admin)"**

3. **Via Start Menu:**
   - Zoek "PowerShell"
   - Right-click → **"Run as Administrator"**

**Set Execution Policy:**

```powershell
# Voor huidige gebruiker (aanbevolen)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Of voor hele systeem (vereist Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

**Bevestig met `Y` (Yes)**

---

## 📋 Methoden om Scripts Uit te Voeren

### Methode 1: Direct Uitvoeren (Aanbevolen)

**Navigeer naar project folder:**

```powershell
# Navigate naar project folder
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE

# Run script (met .\ voor huidige directory)
.\install-all.ps1
```

**Of met parameters:**

```powershell
.\install-all.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com"
```

---

### Methode 2: Met Volledig Pad

```powershell
# Run script met volledig pad
& "D:\GitHub_Local_Repos\MMC_MCP_BRIDGE\install-all.ps1"
```

---

### Methode 3: Bypass Execution Policy (Tijdelijk)

**Als je execution policy niet wilt aanpassen:**

```powershell
# Bypass voor één keer (niet aanbevolen voor productie)
powershell -ExecutionPolicy Bypass -File .\install-all.ps1
```

**Of in PowerShell:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\install-all.ps1
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope Process -Force
```

---

### Methode 4: Via File Explorer

1. **Open File Explorer**
2. **Navigate naar:** `D:\GitHub_Local_Repos\MMC_MCP_BRIDGE`
3. **Right-click op:** `install-all.ps1`
4. **Klik op:** **"Run with PowerShell"**

**⚠️ Let op:** Dit werkt alleen als execution policy is aangepast!

---

## 🎯 Complete Workflow Voor Install Scripts

### Stap-voor-Stap Instructies

#### **Stap 1: Open PowerShell als Administrator**

```powershell
# Check of je Administrator bent
([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

**Als `False`:** Sluit PowerShell en open opnieuw als Administrator

#### **Stap 2: Set Execution Policy**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Bevestig met `Y`**

#### **Stap 3: Navigate naar Project Folder**

```powershell
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE
```

**Verify je in de juiste folder:**

```powershell
# Check huidige directory
pwd

# List bestanden (moet install-all.ps1 zien)
ls *.ps1
```

#### **Stap 4: Run Install Script**

**Complete installatie:**

```powershell
.\install-all.ps1
```

**Met Git configuratie:**

```powershell
.\install-all.ps1 -GitUserName "John Doe" -GitUserEmail "john@example.com"
```

**Quick installatie:**

```powershell
.\install-quick.ps1
```

#### **Stap 5: Wacht tot Installatie Compleet is**

Het script toont voortgang:

- ✅ = Succes
- ❌ = Fout
- ⚠️ = Waarschuwing
- ℹ️ = Informatie

#### **Stap 6: Restart PowerShell**

Na installatie:

1. **Sluit huidige PowerShell**
2. **Open nieuwe PowerShell als Administrator**
3. **Verify installaties:**

```powershell
git --version
node --version
docker --version
```

---

## 🔧 Troubleshooting

### Fout: "cannot be loaded because running scripts is disabled"

**Oplossing:**

```powershell
# Set execution policy (als Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Fout: "Access Denied" of "Requires Administrator"

**Oplossing:**

1. Sluit PowerShell
2. Open PowerShell als Administrator
3. Run script opnieuw

**Check Administrator:**

```powershell
([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

### Fout: "The term '.\install-all.ps1' is not recognized"

**Oplossingen:**

1. **Check je bent in juiste folder:**

   ```powershell
   pwd
   ls *.ps1
   ```

2. **Gebruik volledig pad:**

   ```powershell
   & "D:\GitHub_Local_Repos\MMC_MCP_BRIDGE\install-all.ps1"
   ```

3. **Check bestand bestaat:**
   ```powershell
   Test-Path .\install-all.ps1
   ```

### Fout: "winget not found"

**Oplossing:**

1. **Windows 11:** winget is standaard geïnstalleerd
2. **Windows 10:** Installeer via Microsoft Store:
   - Open Microsoft Store
   - Zoek "App Installer"
   - Installeer "App Installer" (bevat winget)

**Verify:**

```powershell
winget --version
```

### Fout: "choco is not recognized" (Chocolatey)

**Oplossing:**

Chocolatey is geïnstalleerd maar niet in PATH. Fix dit:

```powershell
# Run als Administrator
.\fix-chocolatey.ps1
```

**Of handmatig:**

```powershell
# Refresh PATH
.\refresh-path.ps1

# Of restart PowerShell
```

**Verify:**

```powershell
choco --version
```

### Script stopt halverwege

**Oplossingen:**

1. **Check internet verbinding**
2. **Run script opnieuw** (sommige tools zijn mogelijk al geïnstalleerd)
3. **Check logs** in PowerShell output
4. **Installeer handmatig** tools die gefaald zijn (zie `SETUP_GUIDE.md`)

---

## 📝 Voorbeelden

### Voorbeeld 1: Complete Installatie

```powershell
# Open PowerShell als Administrator
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate naar project
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE

# Run script
.\install-all.ps1 -GitUserName "John Doe" -GitUserEmail "john@example.com"
```

### Voorbeeld 2: Quick Installatie

```powershell
# Open PowerShell als Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate en run
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE
.\install-quick.ps1
```

### Voorbeeld 3: Met Custom Path

```powershell
# Open PowerShell als Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run met custom install path
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE
.\install-all.ps1 -InstallPath "E:\Development"
```

### Voorbeeld 4: Skip Optionele Tools

```powershell
# Open PowerShell als Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run zonder Doppler, 1Password, Railway
cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE
.\install-all.ps1 -SkipDoppler -Skip1Password -SkipRailway
```

---

## ✅ Verification

**Na installatie, verify alles werkt:**

```powershell
# Check alle tools
git --version
node --version
npm --version
docker --version
pwsh --version
gh --version
doppler --version
dagger version
railway --version
```

**Als een tool niet werkt:**

1. **Restart PowerShell**
2. **Check PATH:** `$env:Path`
3. **Installeer handmatig** (zie `SETUP_GUIDE.md`)

---

## 🎯 Quick Reference

### Eén Commando (Copy-Paste Ready)

```powershell
# Complete setup in één keer
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE; .\install-all.ps1
```

### Met Git Configuratie

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE; .\install-all.ps1 -GitUserName "Your Name" -GitUserEmail "your@email.com"
```

### Quick Install

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; cd D:\GitHub_Local_Repos\MMC_MCP_BRIDGE; .\install-quick.ps1
```

---

## 📚 Meer Informatie

- **Install Scripts README:** `INSTALL_README.md`
- **Complete Setup Guide:** `SETUP_GUIDE.md`
- **Project README:** `README.md`

---

**Last Updated:** December 2024
**Version:** 1.0.0

**Powered by MyMind Ventures** 🚀


