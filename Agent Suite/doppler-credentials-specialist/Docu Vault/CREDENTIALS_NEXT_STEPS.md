# 🎯 CREDENTIALS - NEXT STEPS

**Date:** 2024-12-06  
**Status:** ✅ Doppler Project Created - Ready for Next Phase  
**Current:** Doppler CLI connected, project `mmc-mcp-bridge` exists with configs (dev, stg, prd)

---

## ✅ Completed

- ✅ Doppler CLI installed and authenticated
- ✅ Doppler project `mmc-mcp-bridge` created
- ✅ Configs created: dev, staging, production
- ✅ Connection verified

---

## 🎯 Next Steps (Priority Order)

### Step 1: Verify 1Password CLI (5 min)

```bash
# Check if 1Password CLI is installed
op --version

# Authenticate if needed
op signin

# Verify authentication
op whoami
```

**Status:** ⏳ **TODO**

---

### Step 2: Create 1Password Vault (5 min)

**Option A: Via 1Password Desktop App**

1. Open 1Password app
2. Create new vault: `MMC MCP Bridge`
3. Set as personal vault (or shared if needed)

**Option B: Verify Existing Vault**

```bash
# List all vaults
op vault list

# Check if vault exists
op vault get "MMC MCP Bridge"
```

**Status:** ⏳ **TODO**

---

### Step 3: Collect Credentials (15-30 min)

**Sources to check:**

1. **Railway Dashboard** (5 min)
   - Go to Railway → Service → Variables
   - Export all environment variables
   - Document in temporary file

2. **Airtable** (5 min)
   - Access credentials table
   - Export all credentials
   - Document source

3. **Existing Doppler Projects** (10 min)

   ```bash
   # List all projects
   doppler projects list

   # For each project, download secrets
   doppler secrets download --project <project-name> --format json > temp-<project>.json
   ```

4. **Local Environment** (5 min)
   - Check for any `.env` files (shouldn't exist, but verify)
   - Check Railway CLI if available

**Status:** ⏳ **TODO**

---

### Step 4: Add Credentials to 1Password (20-30 min)

**For each credential (26+ total):**

1. **Create item in 1Password vault: `MMC MCP Bridge`**
2. **Use correct category:**
   - **Login** - For user accounts (GitHub, Linear, Notion, etc.)
   - **API Credential** - For API keys and tokens
   - **Subscription** - For billing/subscription info
   - **Database** - For database connection strings
3. **Add all fields:**
   - Username/Email
   - Password/Token
   - API Key
   - Connection String
   - Any other relevant fields
4. **Add notes:**
   - Purpose: "Used for [service/feature]"
   - Source: "Railway/Airtable/Doppler"
   - Last updated: Date
5. **Add tags:**
   - Service name (e.g., `github`, `linear`, `mongodb`)
   - Category (e.g., `api-key`, `database`, `oauth`)

**Example Items:**

- `GitHub Personal Access Token` (API Credential)
- `Linear API Key` (API Credential)
- `MongoDB Connection String` (Database)
- `Notion Integration Token` (API Credential)
- `OpenAI API Key` (API Credential)
- etc.

**Status:** ⏳ **TODO**

---

### Step 5: Sync 1Password → Doppler (5 min)

**Create sync script or use manual sync:**

**Manual Sync (Recommended for first time):**

```bash
# For each credential in 1Password, add to Doppler
# Example:
doppler secrets set GITHUB_TOKEN="<value>" --project mmc-mcp-bridge --config dev

# Or use bulk import
doppler secrets set --project mmc-mcp-bridge --config dev < secrets.json
```

**Automated Sync (After initial setup):**

- Create script: `.devcontainer/sync-onepassword-to-doppler.sh`
- Maps 1Password items to Doppler keys
- Syncs to dev config first, then staging/production

**Status:** ⏳ **TODO**

---

### Step 6: Create Service Tokens (5 min)

**For Railway Production:**

```bash
doppler configs tokens create production \
  --project mmc-mcp-bridge \
  --config production \
  --name railway-production
```

**For Railway Staging:**

```bash
doppler configs tokens create staging \
  --project mmc-mcp-bridge \
  --config staging \
  --name railway-staging
```

**For DevContainer:**

```bash
doppler configs tokens create dev \
  --project mmc-mcp-bridge \
  --config dev \
  --name devcontainer-dev
```

**⚠️ IMPORTANT:** Save all tokens securely! You'll need them for Railway configuration.

**Status:** ⏳ **TODO**

---

### Step 7: Configure Railway (10 min)

1. **Go to Railway Dashboard**
2. **Service: `mmc-mcp-bridge`**
3. **Variables tab**
4. **Add environment variables:**
   - `DOPPLER_TOKEN` = [production-service-token]
   - `DOPPLER_PROJECT` = `mmc-mcp-bridge`
   - `DOPPLER_CONFIG` = `production`
5. **Deploy and verify**

**Status:** ⏳ **TODO**

---

### Step 8: Test Credentials (10-15 min)

**Test each credential:**

```bash
# Test via API calls where applicable
# Document SUCCESS/FAIL
# Update notes in Doppler
```

**Create test script:**

- `.devcontainer/test-credentials.sh`
- Tests each credential via API
- Outputs results to `temp-credentials-test-results.json`

**Status:** ⏳ **TODO**

---

## 📋 Quick Checklist

- [ ] Verify 1Password CLI: `op --version` and `op signin`
- [ ] Create 1Password vault: `MMC MCP Bridge`
- [ ] Collect credentials from Railway
- [ ] Collect credentials from Airtable
- [ ] Collect credentials from existing Doppler projects
- [ ] Add all credentials to 1Password (26+ items)
- [ ] Sync 1Password → Doppler (dev config)
- [ ] Create service tokens (dev/staging/production)
- [ ] Configure Railway with service tokens
- [ ] Test all credentials
- [ ] Update notes in Doppler

---

## 🎯 Success Criteria

After completion:

- ✅ 1Password vault `MMC MCP Bridge` exists
- ✅ All 26+ credentials in 1Password
- ✅ All credentials synced to Doppler dev config
- ✅ Service tokens created and saved
- ✅ Railway configured with service tokens
- ✅ All credentials tested (SUCCESS)
- ✅ No credential errors in any environment

---

## 📞 Quick Commands

```bash
# 1Password
op signin
op whoami
op vault list

# Doppler
doppler me
doppler projects get mmc-mcp-bridge
doppler configs get --project mmc-mcp-bridge
doppler secrets --project mmc-mcp-bridge --config dev
```

---

**Last Updated:** 2024-12-06  
**Next Action:** Verify 1Password CLI and create vault
