# 🚀 Doppler Setup Guide - MMC MCP Bridge

**Doppler Credentials Specialist Guide**  
**Last Updated:** $(date +"%Y-%m-%d")

---

## 📋 Overview

Complete guide voor het opzetten van Doppler credentials management voor MMC MCP Bridge. Deze guide volgt de officiële Doppler documentatie en best practices.

---

## 🎯 Step 1: Doppler CLI Authentication

### In DevContainer

```bash
# Login to Doppler (interactive)
doppler login

# Verify authentication
doppler me
```

### Service Token Setup (for Railway)

```bash
# Create service token for production
doppler configs tokens create production --project mmc-mcp-bridge --config production

# Create service token for staging
doppler configs tokens create staging --project mmc-mcp-bridge --config staging

# Save tokens securely (will be used in Railway)
```

---

## 🎯 Step 2: Create Doppler Project

```bash
# Create project (if not exists)
doppler projects create mmc-mcp-bridge

# Verify project
doppler projects get mmc-mcp-bridge
```

---

## 🎯 Step 3: Create Configs

```bash
# Set project context
doppler setup --project mmc-mcp-bridge

# Create dev config
doppler configs create dev --project mmc-mcp-bridge

# Create staging config
doppler configs create staging --project mmc-mcp-bridge

# Create production config
doppler configs create production --project mmc-mcp-bridge

# Verify configs
doppler configs get --project mmc-mcp-bridge
```

---

## 🎯 Step 4: Add Credentials to Doppler

### Development Config

```bash
# Set dev config
doppler setup --project mmc-mcp-bridge --config dev

# Add all credentials (see DOPPLER_CREDENTIALS_AUDIT.md for complete list)
doppler secrets set OPENAI_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set ANTHROPIC_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set GITHUB_TOKEN="your-token" --project mmc-mcp-bridge --config dev
doppler secrets set LINEAR_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set MONGODB_CONNECTION_STRING="your-connection-string" --project mmc-mcp-bridge --config dev
doppler secrets set POSTGRES_CONNECTION_STRING="your-connection-string" --project mmc-mcp-bridge --config dev
doppler secrets set SQLITE_DB_PATH="/path/to/db.db" --project mmc-mcp-bridge --config dev
doppler secrets set NOTION_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set SLACK_BOT_TOKEN="your-token" --project mmc-mcp-bridge --config dev
doppler secrets set AIRTABLE_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set RAINDROP_TOKEN="your-token" --project mmc-mcp-bridge --config dev
doppler secrets set POSTMAN_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set GOOGLE_DRIVE_CREDENTIALS='{"type":"service_account",...}' --project mmc-mcp-bridge --config dev
doppler secrets set OLLAMA_BASE_URL="http://localhost:11434" --project mmc-mcp-bridge --config dev
doppler secrets set BRAVE_SEARCH_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set SENTRY_DSN="your-dsn" --project mmc-mcp-bridge --config dev
doppler secrets set STRAPI_URL="https://your-strapi.com" --project mmc-mcp-bridge --config dev
doppler secrets set STRAPI_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set STRIPE_SECRET_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set REDIS_URL="redis://..." --project mmc-mcp-bridge --config dev
doppler secrets set MCP_BRIDGE_API_KEY="your-key" --project mmc-mcp-bridge --config dev
doppler secrets set RAILWAY_TOKEN="your-token" --project mmc-mcp-bridge --config dev

# Add notes to each credential (via Doppler UI or CLI)
# Example: doppler secrets set OPENAI_API_KEY --note "Used for all 36 OpenAI tools. Tested via Postman on 2024-12-04"
```

### Staging Config

```bash
# Set staging config
doppler setup --project mmc-mcp-bridge --config staging

# Copy secrets from dev (or set production values)
doppler secrets download --project mmc-mcp-bridge --config staging --format env > .env.staging
# Edit .env.staging with staging values
doppler secrets set --project mmc-mcp-bridge --config staging < .env.staging
```

### Production Config

```bash
# Set production config
doppler setup --project mmc-mcp-bridge --config production

# Set production secrets (NEVER copy from dev!)
doppler secrets set OPENAI_API_KEY="prod-key" --project mmc-mcp-bridge --config production
# ... (set all production secrets)
```

---

## 🎯 Step 5: Add Notes to Credentials

### Via Doppler UI (Recommended)

1. Go to https://dashboard.doppler.com
2. Navigate to project `mmc-mcp-bridge`
3. Select config (dev/staging/production)
4. Click on each secret
5. Add note with:
   - Usage description
   - Test date and method (e.g., "Tested via Postman on 2024-12-04")
   - Rotation schedule
   - Related services

### Via CLI (Alternative)

```bash
# Note: Doppler CLI doesn't support notes directly
# Use Doppler UI for notes, or use --note flag if available in future versions
```

---

## 🎯 Step 6: Configure DevContainer

### Update devcontainer.sh

Add Doppler setup to devcontainer initialization:

```bash
# In .devcontainer/devcontainer.sh, add:
if command -v doppler &> /dev/null; then
  echo "🔐 Doppler CLI detected"
  # Check if already authenticated
  if ! doppler me &> /dev/null; then
    echo "⚠️  Doppler not authenticated. Run: doppler login"
  else
    echo "✅ Doppler authenticated"
    # Set project context if not set
    if [ -z "$DOPPLER_PROJECT" ]; then
      doppler setup --project mmc-mcp-bridge --config dev --no-interactive
    fi
  fi
fi
```

### Environment Variables in DevContainer

```bash
# Run app with Doppler
doppler run -- npm run dev

# Or export to environment
doppler secrets download --format env --no-file | source /dev/stdin
npm run dev
```

---

## 🎯 Step 7: Configure Railway

### Option A: Doppler Service Token (Recommended)

1. **Create Service Token in Doppler:**

   ```bash
   # Production
   doppler configs tokens create production --project mmc-mcp-bridge --config production

   # Staging
   doppler configs tokens create staging --project mmc-mcp-bridge --config staging
   ```

2. **Add to Railway Environment Variables:**

   - Go to Railway dashboard
   - Select service: `mmc-mcp-bridge`
   - Go to Variables tab
   - Add:
     - `DOPPLER_TOKEN` = `<service-token-from-step-1>`
     - `DOPPLER_PROJECT` = `mmc-mcp-bridge`
     - `DOPPLER_CONFIG` = `production` (or `staging` for preview)

3. **Update railway.json:**
   ```json
   {
     "build": {
       "builder": "RAILPACK",
       "buildCommand": "npm ci && doppler secrets download --no-file --format env > .env.production && npm run build"
     }
   }
   ```

### Option B: Sync Secrets to Railway (Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Sync secrets from Doppler to Railway
doppler secrets download --project mmc-mcp-bridge --config production --format env | railway variables set
```

---

## 🎯 Step 8: Update Code to Use Doppler

### Current Code (process.env)

```typescript
// Before
const apiKey = process.env.OPENAI_API_KEY;
```

### Updated Code (Doppler)

```typescript
// After - Doppler injects as environment variables
// No code changes needed! Doppler injects secrets as process.env
const apiKey = process.env.OPENAI_API_KEY; // Still works!
```

**Note:** Doppler injects secrets as environment variables, so no code changes are required! Just run with `doppler run`.

---

## 🎯 Step 9: Testing Credentials

### Via Postman

1. **Get secrets from Doppler:**

   ```bash
   doppler secrets download --format env --no-file > .env.test
   ```

2. **Test each credential:**

   - Import `.env.test` into Postman
   - Test each API endpoint
   - Document results in Doppler notes

3. **Update Doppler notes:**
   - Go to Doppler UI
   - Add note: "Tested via Postman on 2024-12-04 - All tools working correctly"

### Via Terminal

```bash
# Test OpenAI
doppler run -- env | grep OPENAI_API_KEY

# Test Anthropic
doppler run -- env | grep ANTHROPIC_API_KEY

# Test GitHub
doppler run -- curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

---

## 🎯 Step 10: OpenRouter Optimization

### Add OpenRouter Key

```bash
doppler secrets set OPENROUTER_API_KEY="your-key" --project mmc-mcp-bridge --config dev
```

### Update Code (Optional)

```typescript
// In openai-tools.ts and anthropic-tools.ts
// Add OpenRouter support as alternative endpoint
const useOpenRouter = process.env.USE_OPENROUTER === "true";
const apiKey = useOpenRouter
  ? process.env.OPENROUTER_API_KEY
  : process.env.OPENAI_API_KEY;
const baseURL = useOpenRouter ? "https://openrouter.ai/api/v1" : undefined;
```

---

## 🔄 Rotation Schedule

### Automatic Rotation (via Doppler)

- **API Keys (90 days):** OpenAI, Anthropic, Linear, Notion, Slack, Airtable, etc.
- **Database Passwords (30 days):** MongoDB, PostgreSQL, Redis
- **Tokens (60-90 days):** GitHub, Raindrop, Postman

### Manual Rotation

1. Generate new credential
2. Update in Doppler (dev → staging → production)
3. Test via Postman
4. Update note in Doppler
5. Deploy to Railway

---

## 📊 Monitoring & Alerts

### Doppler Audit Log

```bash
# View audit log
doppler activity --project mmc-mcp-bridge
```

### Credential Health Checks

```bash
# Check all secrets are set
doppler secrets get --project mmc-mcp-bridge --config production

# Verify no missing secrets
doppler secrets download --format env --no-file | grep -v "^#" | wc -l
```

---

## 🚨 Troubleshooting

### Doppler CLI Not Found

```bash
# Rebuild devcontainer
docker compose down
docker compose up -d --build dev
```

### Authentication Issues

```bash
# Re-authenticate
doppler login

# Verify
doppler me
```

### Secrets Not Loading

```bash
# Check project context
doppler setup --project mmc-mcp-bridge --config dev

# Verify secrets
doppler secrets get
```

---

## 📚 References

- **Doppler Documentation:** https://docs.doppler.com
- **Doppler CLI Reference:** https://docs.doppler.com/reference/cli
- **Railway + Doppler:** https://docs.doppler.com/docs/railway

---

**Last Updated:** $(date +"%Y-%m-%d")
