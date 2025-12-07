# 🔐 Add Secrets to Doppler via API

**Date:** 2024-12-06  
**Status:** Ready for Execution

---

## 🎯 Quick Start

### Option 1: Add from Environment Variables via API

**Set environment variables and run:**

```bash
# Set all credentials as environment variables
export OPENAI_API_KEY="your-key"
export GITHUB_TOKEN="your-token"
# ... etc for all 26 credentials

# Get Doppler API token
export DOPPLER_TOKEN=$(doppler configure get token --plain)

# Run API script
.devcontainer/add-secrets-via-api.sh
```

---

### Option 2: Add from Railway via API

**Fetch from Railway and add to Doppler:**

```bash
# Set Railway token
export RAILWAY_TOKEN="your-railway-token"

# Set Doppler token
export DOPPLER_TOKEN=$(doppler configure get token --plain)

# Run Railway migration script
.devcontainer/add-secrets-from-railway.sh dev
```

The script will:

- ✅ Fetch all variables from Railway
- ✅ Add them to Doppler (skipping Doppler-specific vars)
- ✅ Skip variables that already exist

---

## 🔑 Getting API Tokens

### Doppler API Token

**Option 1: From CLI**

```bash
doppler configure get token --plain
```

**Option 2: From Dashboard**

1. Go to https://dashboard.doppler.com/workplace
2. Settings → Access → Tokens
3. Create new token or use existing

**Option 3: From Service Token**
If you have a service token, use that:

```bash
export DOPPLER_TOKEN="your-service-token"
```

### Railway API Token

1. Go to https://railway.app/account/tokens
2. Create new token
3. Copy token
4. Set: `export RAILWAY_TOKEN="your-token"`

---

## 📋 API Script Details

### `add-secrets-via-api.sh`

**What it does:**

- ✅ Reads credentials from environment variables
- ✅ Uses Doppler REST API to add secrets
- ✅ Adds to all configs: dev, staging, production
- ✅ Skips existing secrets
- ✅ Shows progress and summary

**Requirements:**

- `DOPPLER_TOKEN` environment variable
- All credential values in environment variables
- `jq` installed (for JSON parsing)
- `curl` installed (for API calls)

**Usage:**

```bash
# Set all environment variables
export OPENAI_API_KEY="sk-..."
export GITHUB_TOKEN="ghp_..."
# ... etc

# Set Doppler token
export DOPPLER_TOKEN=$(doppler configure get token --plain)

# Run script
.devcontainer/add-secrets-via-api.sh
```

---

### `add-secrets-from-railway.sh`

**What it does:**

- ✅ Fetches variables from Railway API
- ✅ Adds them to Doppler
- ✅ Skips Doppler-specific variables
- ✅ Interactive project/service selection

**Requirements:**

- `RAILWAY_TOKEN` environment variable
- `DOPPLER_TOKEN` environment variable
- `jq` installed
- `curl` installed

**Usage:**

```bash
export RAILWAY_TOKEN="your-token"
export DOPPLER_TOKEN=$(doppler configure get token --plain)

.devcontainer/add-secrets-from-railway.sh dev
```

---

## 🔧 Manual API Usage

### Using curl directly

**Add single secret:**

```bash
curl -X POST "https://api.doppler.com/v3/configs/config/secrets" \
  -H "Authorization: Bearer $DOPPLER_TOKEN" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode "project=mmc-mcp-bridge" \
  --data-urlencode "config=dev" \
  -d '{
    "name": "OPENAI_API_KEY",
    "value": "sk-..."
  }'
```

**Update multiple secrets:**

```bash
curl -X PATCH "https://api.doppler.com/v3/configs/config/secrets" \
  -H "Authorization: Bearer $DOPPLER_TOKEN" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode "project=mmc-mcp-bridge" \
  --data-urlencode "config=dev" \
  -d '{
    "secrets": {
      "OPENAI_API_KEY": "sk-...",
      "GITHUB_TOKEN": "ghp_..."
    }
  }'
```

---

## 📊 API Endpoints

### Doppler API

**Base URL:** `https://api.doppler.com/v3`

**Add Secret:**

```
POST /configs/config/secrets
```

**Update Secrets:**

```
PATCH /configs/config/secrets
```

**Get Secrets:**

```
GET /configs/config/secrets
```

**Documentation:** https://docs.doppler.com/reference

---

## ✅ Verification

After adding secrets via API:

```bash
# Check secrets in dev
doppler secrets --project mmc-mcp-bridge --config dev

# Validate all credentials
.devcontainer/validate-credentials.sh
```

---

## 🚨 Important Notes

1. **API Rate Limits:** Doppler API has rate limits. The script handles this gracefully.
2. **Token Security:** Never commit API tokens to git. Use environment variables.
3. **Existing Secrets:** Scripts skip secrets that already exist to prevent overwriting.
4. **Error Handling:** Scripts show clear error messages if API calls fail.

---

## 🎯 Next Steps

After adding secrets via API:

1. ✅ Secrets added to Doppler
2. ⏳ Verify secrets: `doppler secrets --project mmc-mcp-bridge --config dev`
3. ⏳ Test credentials: `.devcontainer/validate-credentials.sh`
4. ⏳ Create service tokens: `.devcontainer/create-doppler-service-tokens.sh`

---

**Last Updated:** 2024-12-06  
**Ready to Execute:** ✅ Yes
