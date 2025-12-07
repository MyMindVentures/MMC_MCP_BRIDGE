# 🚀 Doppler Setup Instructions

**Date:** 2024-12-06  
**Status:** Ready for Execution  
**Priority:** High

---

## 🎯 Quick Start

### Option 1: Complete Setup (Recommended)

**Creates project, configs, AND service tokens in one go:**

```bash
.devcontainer/doppler-complete-setup-with-tokens.sh
```

This script will:

1. ✅ Create/verify project `mmc-mcp-bridge`
2. ✅ Create/verify configs: dev, staging, production
3. ✅ Create service tokens for all configs
4. ✅ Save tokens to `temp-doppler-service-tokens.txt` (gitignored)

---

### Option 2: Step-by-Step Setup

#### Step 1: Setup Project and Configs

```bash
.devcontainer/setup-doppler-project.sh
```

#### Step 2: Create Service Tokens

```bash
.devcontainer/create-doppler-service-tokens.sh
```

---

## 📋 What Gets Created

### Project

- **Name:** `mmc-mcp-bridge`
- **Description:** MMC MCP Bridge credentials management

### Configs

- `dev` - Development environment
- `staging` - Staging environment
- `production` - Production environment

### Service Tokens

- `dev-service-token` - For DevContainer/local development
- `staging-service-token` - For Railway staging deployments
- `production-service-token` - For Railway production deployments

---

## 🔐 Service Tokens

### Token File Location

Tokens are saved to: `temp-doppler-service-tokens.txt`

**⚠️ IMPORTANT:**

- This file is in `.gitignore` and will NOT be committed
- Keep tokens secure
- Never share tokens publicly

### Token Format

```
DOPPLER_TOKEN_DEV=<token>
DOPPLER_PROJECT=mmc-mcp-bridge
DOPPLER_CONFIG=dev

DOPPLER_TOKEN_STAGING=<token>
DOPPLER_PROJECT=mmc-mcp-bridge
DOPPLER_CONFIG=staging

DOPPLER_TOKEN_PRODUCTION=<token>
DOPPLER_PROJECT=mmc-mcp-bridge
DOPPLER_CONFIG=production
```

---

## 🚂 Railway Configuration

After creating service tokens, add them to Railway:

1. **Go to Railway Dashboard**
2. **Service: `mmc-mcp-bridge`**
3. **Variables tab**
4. **Add environment variables:**

   **For Production:**

   ```
   DOPPLER_TOKEN=<production-service-token>
   DOPPLER_PROJECT=mmc-mcp-bridge
   DOPPLER_CONFIG=production
   ```

   **For Staging:**

   ```
   DOPPLER_TOKEN=<staging-service-token>
   DOPPLER_PROJECT=mmc-mcp-bridge
   DOPPLER_CONFIG=staging
   ```

5. **Deploy and verify**

---

## 🔧 Adding Credentials

After setup, add credentials to Doppler:

```bash
# Add to dev config
doppler secrets set GITHUB_TOKEN="your-token" \
  --project mmc-mcp-bridge \
  --config dev

# Add to staging config
doppler secrets set GITHUB_TOKEN="your-token" \
  --project mmc-mcp-bridge \
  --config staging

# Add to production config
doppler secrets set GITHUB_TOKEN="your-token" \
  --project mmc-mcp-bridge \
  --config production
```

**Or add to all configs at once:**

```bash
for config in dev staging production; do
  doppler secrets set GITHUB_TOKEN="your-token" \
    --project mmc-mcp-bridge \
    --config $config
done
```

---

## ✅ Verification

### Check Project

```bash
doppler projects get mmc-mcp-bridge
```

### Check Configs

```bash
doppler configs get --project mmc-mcp-bridge
```

### Check Secrets

```bash
doppler secrets --project mmc-mcp-bridge --config dev
```

### Validate Credentials

```bash
.devcontainer/validate-credentials.sh
```

---

## 📝 Scripts Available

1. **`doppler-complete-setup-with-tokens.sh`** - Complete setup (project + configs + tokens)
2. **`setup-doppler-project.sh`** - Project and configs only
3. **`create-doppler-service-tokens.sh`** - Service tokens only
4. **`validate-credentials.sh`** - Validate all credentials

---

## 🎯 Next Steps After Setup

1. ✅ Project and configs created
2. ✅ Service tokens created
3. ⏳ Add credentials to Doppler
4. ⏳ Configure Railway with service tokens
5. ⏳ Test credentials
6. ⏳ Set up 1Password vault (optional)
7. ⏳ Sync 1Password → Doppler (optional)

---

## 📞 Troubleshooting

### Doppler not authenticated

```bash
doppler login
```

### Project already exists

The script will detect and skip creation if project already exists.

### Token already exists

The script will skip token creation if token already exists. Delete token first if you want to recreate:

```bash
doppler configs tokens delete <token-name> --project mmc-mcp-bridge --config <config>
```

### Permission errors

Make sure you're authenticated and have permissions to create projects/configs/tokens.

---

**Last Updated:** 2024-12-06  
**Ready to Execute:** ✅ Yes
