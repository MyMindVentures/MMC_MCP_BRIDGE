# 🍫 Chocolatey Installation Guide

**Complete gids voor het installeren en configureren van Chocolatey**

---

## 📋 Wat is Chocolatey?

Chocolatey is een Windows package manager (zoals apt voor Linux of brew voor macOS). Het maakt het installeren van software via command line eenvoudig.

**Voorbeeld:**

```powershell
choco install git -y
choco install nodejs -y
choco install docker-desktop -y
```

---

## ✅ Check of Chocolatey al geïnstalleerd is

**In PowerShell (als Administrator):**

```powershell
# Check of Chocolatey al bestaat
Test-Path "C:\ProgramData\chocolatey"

# Of probeer choco commando
choco --version
```

**Als `choco --version` werkt:** ✅ Chocolatey is al geïnstalleerd!

**Als je fout krijgt:** Chocolatey moet geïnstalleerd worden (zie hieronder).

---

## 🚀 Chocolatey Installeren

### Methode 1: Officiële Installatie (Aanbevolen)

**Open PowerShell als Administrator:**

1. **Windows 11:**
   - Druk `Windows + X`
   - Klik op **"Terminal (Admin)"** of **"Windows PowerShell (Admin)"**

2. **Windows 10:**
   - Druk `Windows + X`
   - Klik op **"Windows PowerShell (Admin)"**

**Run installatie commando:**

```powershell
# Set execution policy (éénmalig)
Set-ExecutionPolicy Bypass -Scope Process -Force

# Download en installeer Chocolatey
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Wacht tot installatie compleet is** (30-60 seconden)

**Verify installatie:**

```powershell
choco --version
```

**Expected output:** `2.x.x` (versie nummer)

---

### Methode 2: Via ons Fix Script

**Als Chocolatey al geïnstalleerd is maar niet werkt:**

```powershell
# Run als Administrator
.\fix-chocolatey.ps1
```

Dit script:

- ✅ Checkt of Chocolatey geïnstalleerd is
- ✅ Installeert het als het niet bestaat
- ✅ Fixt PATH problemen
- ✅ Verifieert dat het werkt

---

## 🔧 Chocolatey PATH Probleem Oplossen

**Als je fout krijgt: "choco is not recognized"**

Dit betekent dat Chocolatey geïnstalleerd is, maar niet in PATH staat.

### Quick Fix (Huidige Sessie):

```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Add Chocolatey to PATH
$chocoPath = "C:\ProgramData\chocolatey\bin"
if (Test-Path $chocoPath) {
    $env:Path = "$chocoPath;$env:Path"
}

# Verify
choco --version
```

### Permanent Fix (Als Administrator):

```powershell
# Add Chocolatey to system PATH permanently
$chocoBinPath = "C:\ProgramData\chocolatey\bin"
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")

if ($machinePath -notlike "*$chocoBinPath*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$machinePath;$chocoBinPath", "Machine")
    Write-Host "✅ Chocolatey added to system PATH" -ForegroundColor Green
}

# Refresh PATH in current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify
choco --version
```

**Of gebruik ons script:**

```powershell
.\fix-chocolatey.ps1
```

---

## ✅ Verificatie

**Na installatie, verify alles werkt:**

```powershell
# Check Chocolatey versie
choco --version

# Check Chocolatey configuratie
choco config list

# Test installatie (optioneel - installeert een test package)
choco install chocolatey -y
```

---

## 📦 Veelgebruikte Chocolatey Commando's

### Installeren

```powershell
# Install één package
choco install git -y

# Install meerdere packages
choco install git nodejs docker-desktop -y

# Install specifieke versie
choco install nodejs --version=20.10.0 -y
```

### Updaten

```powershell
# Update alle packages
choco upgrade all -y

# Update specifieke package
choco upgrade git -y
```

### Zoeken

```powershell
# Zoek packages
choco search git

# Zoek met details
choco search git --detailed
```

### Lijst geïnstalleerde packages

```powershell
# Lijst alle geïnstalleerde packages
choco list --local-only

# Lijst met details
choco list --local-only --detailed
```

### Verwijderen

```powershell
# Uninstall package
choco uninstall git -y
```

---

## 🎯 Voorbeelden voor MMC MCP Bridge Project

### Install alle benodigde tools met Chocolatey:

```powershell
# Core tools
choco install git -y
choco install nodejs-lts -y
choco install docker-desktop -y

# CLI tools
choco install gh -y                    # GitHub CLI
choco install powershell-core -y       # PowerShell Core
choco install azure-cli -y             # Azure CLI

# Development tools
choco install vscode -y                 # VS Code (alternatief voor Cursor)
choco install postman -y               # Postman
```

**Let op:** Onze install scripts gebruiken `winget`, niet Chocolatey. Je kunt kiezen:

- **Optie 1:** Gebruik onze scripts met `winget` (aanbevolen)
- **Optie 2:** Gebruik Chocolatey handmatig

---

## 🔧 Troubleshooting

### Fout: "Execution Policy"

**Oplossing:**

```powershell
# Set execution policy voor huidige sessie
Set-ExecutionPolicy Bypass -Scope Process -Force

# Of permanent (als Administrator)
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Fout: "choco is not recognized" na installatie

**Oplossing:**

1. **Restart PowerShell** (sluit en open opnieuw als Administrator)
2. **Of refresh PATH:**
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   $env:Path = "C:\ProgramData\chocolatey\bin;$env:Path"
   choco --version
   ```

### Fout: "An existing Chocolatey installation was detected"

**Dit betekent:** Chocolatey is al geïnstalleerd!

**Oplossing:**

1. **Refresh PATH** (zie hierboven)
2. **Of restart PowerShell**
3. **Of gebruik:** `.\fix-chocolatey.ps1`

### Fout: "Access Denied"

**Oplossing:**

- Run PowerShell **als Administrator**
- Check of je admin rechten hebt:
  ```powershell
  ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  ```

### Installatie faalt

**Oplossingen:**

1. **Check internet verbinding**
2. **Run als Administrator**
3. **Check firewall/antivirus** (sommige blokkeren downloads)
4. **Try opnieuw:**
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
   iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

---

## 📚 Meer Informatie

- **Chocolatey Website:** https://chocolatey.org/
- **Documentation:** https://docs.chocolatey.org/
- **Package Gallery:** https://community.chocolatey.org/packages

---

## 🎯 Quick Reference

### Install Chocolatey (Copy-Paste Ready):

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Fix PATH (Copy-Paste Ready):

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); $env:Path = "C:\ProgramData\chocolatey\bin;$env:Path"; choco --version
```

---

**Last Updated:** December 2024
**Version:** 1.0.0

**Powered by MyMind Ventures** 🚀
