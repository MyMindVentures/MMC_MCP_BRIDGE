# 🔐 Add Secrets to Doppler - Instructions

**Date:** 2024-12-06  
**Status:** Ready for Execution

---

## 🎯 Quick Start

### Option 1: Interactive Migration (Recommended)

**Prompts for each credential value:**

```bash
.devcontainer/migrate-all-secrets-to-doppler.sh
```

This script will:

- ✅ Prompt for each of 26+ credentials
- ✅ Add to dev, staging, and production configs
- ✅ Skip credentials that already exist
- ✅ Show progress and summary

---

### Option 2: Bulk Add from Environment Variables

**If you have credentials in environment variables:**

```bash
# Set environment variables first
export OPENAI_API_KEY="your-key"
export GITHUB_TOKEN="your-token"
# ... etc

# Then run bulk add
.devcontainer/add-secrets-bulk.sh dev
```

**Or add to all configs:**

```bash
for config in dev staging production; do
  .devcontainer/add-secrets-bulk.sh $config
done
```

---

### Option 3: Manual Addition

**Add secrets one by one:**

```bash
# Add to dev config
doppler secrets set OPENAI_API_KEY="your-key" \
  --project mmc-mcp-bridge \
  --config dev

# Add to staging
doppler secrets set OPENAI_API_KEY="your-key" \
  --project mmc-mcp-bridge \
  --config staging

# Add to production
doppler secrets set OPENAI_API_KEY="your-key" \
  --project mmc-mcp-bridge \
  --config production
```

---

## 📋 Complete List of Credentials

### AI Services

- `OPENAI_API_KEY` - OpenAI API Key
- `ANTHROPIC_API_KEY` - Anthropic API Key

### Development Tools

- `GITHUB_TOKEN` - GitHub Personal Access Token
- `LINEAR_API_KEY` - Linear API Key

### Databases

- `MONGODB_CONNECTION_STRING` - MongoDB Connection String
- `POSTGRES_CONNECTION_STRING` - PostgreSQL Connection String
- `SQLITE_DB_PATH` - SQLite Database Path

### Productivity

- `NOTION_API_KEY` - Notion Integration Token
- `SLACK_BOT_TOKEN` - Slack Bot Token

### Integration Services

- `AIRTABLE_API_KEY` - Airtable API Key
- `RAINDROP_TOKEN` - Raindrop OAuth Token
- `POSTMAN_API_KEY` - Postman API Key
- `GOOGLE_DRIVE_CREDENTIALS` - Google Drive Service Account JSON
- `STRAPI_URL` - Strapi Base URL
- `STRAPI_API_KEY` - Strapi API Key
- `STRIPE_SECRET_KEY` - Stripe Secret Key

### Infrastructure

- `REDIS_URL` - Redis Connection String
- `SENTRY_DSN` - Sentry DSN
- `OLLAMA_BASE_URL` - Ollama Base URL

### Search & Automation

- `BRAVE_SEARCH_API_KEY` - Brave Search API Key

### Application

- `MCP_BRIDGE_API_KEY` - MCP Bridge API Key
- `RAILWAY_TOKEN` - Railway API Token

### n8n

- `N8N_INSTANCE_APIKEY` - n8n Instance API Key
- `N8N_API_KEY` - n8n API Key (legacy)
- `N8N_BASE_URL` - n8n Base URL

**Total: 26 credentials**

---

## 🔍 Where to Get Credentials

### From Railway

1. Go to Railway Dashboard
2. Service → Variables
3. Copy all environment variables

### From Airtable

1. Access Airtable credentials table
2. Export credentials

### From Existing Doppler Projects

```bash
# List all projects
doppler projects list

# Download secrets from each project
doppler secrets download --project <project-name> --format json
```

### From Local Environment

```bash
# Check current environment variables
env | grep -E "(API_KEY|TOKEN|SECRET|PASSWORD)"
```

---

## ✅ Verification

### Check All Secrets

```bash
# Dev config
doppler secrets --project mmc-mcp-bridge --config dev

# Staging config
doppler secrets --project mmc-mcp-bridge --config staging

# Production config
doppler secrets --project mmc-mcp-bridge --config production
```

### Validate Credentials

```bash
.devcontainer/validate-credentials.sh
```

---

## 📝 Adding to Multiple Configs

### Add to All Configs at Once

```bash
for config in dev staging production; do
  doppler secrets set KEY="value" \
    --project mmc-mcp-bridge \
    --config $config
done
```

### Copy from Dev to Staging/Production

```bash
# Get value from dev
VALUE=$(doppler secrets get KEY --project mmc-mcp-bridge --config dev --plain)

# Set in staging
doppler secrets set KEY="$VALUE" --project mmc-mcp-bridge --config staging

# Set in production
doppler secrets set KEY="$VALUE" --project mmc-mcp-bridge --config production
```

---

## 🚨 Important Notes

1. **Never commit secrets to git** - All secrets are in Doppler
2. **Use different values per environment** - Dev, staging, and production should have different credentials
3. **Rotate credentials regularly** - Update secrets in Doppler when rotating
4. **Test after adding** - Use validation script to verify

---

## 🎯 Next Steps After Adding Secrets

1. ✅ All secrets added to Doppler
2. ⏳ Create service tokens: `.devcontainer/create-doppler-service-tokens.sh`
3. ⏳ Configure Railway with service tokens
4. ⏳ Test credentials: `.devcontainer/validate-credentials.sh`

---

**Last Updated:** 2024-12-06  
**Ready to Execute:** ✅ Yes
