# 🔧 Doppler CLI Installation

**Date:** 2024-12-06  
**Status:** Installation Required

---

## ❌ Problem

Doppler CLI is niet geïnstalleerd in de huidige terminal context. Installatie vereist root/sudo toegang.

---

## ✅ Installation Methods

### Method 1: Official Install Script (Recommended)

```bash
curl -Ls --tlsv1.2 --proto "=https" https://cli.doppler.com/install.sh | sh
```

Of met sudo:

```bash
curl -Ls --tlsv1.2 --proto "=https" https://cli.doppler.com/install.sh | sudo sh
```

### Method 2: APT Package Manager

```bash
# Add GPG key
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg

# Add repository
echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list

# Install
sudo apt-get update && sudo apt-get install -y doppler
```

### Method 3: Manual Binary Download

```bash
# Download binary
curl -Ls https://cli.doppler.com/install.sh | sh

# Add to PATH
export PATH="$PATH:$HOME/.local/bin"
```

---

## ✅ Verification

After installation:

```bash
doppler --version
doppler me
```

---

## 🔐 Authentication

After installation, authenticate:

```bash
doppler login
```

---

## 📝 Next Steps

After Doppler CLI is installed and authenticated:

1. Verify project exists: `doppler projects get mmc-mcp-bridge`
2. Add secrets: `doppler secrets set KEY="VALUE" --project mmc-mcp-bridge --config dev`
3. Verify secrets: `doppler secrets --project mmc-mcp-bridge --config dev`

---

**Note:** Installation requires root/sudo access. Run in your terminal where you have appropriate permissions.
