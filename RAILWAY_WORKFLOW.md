# 🚂 Railway CI/CD Workflow - MMC MCP Bridge

## 🎯 Waarom Railway CI/CD?

✅ **Out-of-the-box** - Geen configuratie nodig  
✅ **Preview Deployments** - Automatisch per branch/PR  
✅ **Build Checks** - Blokkeert merge als build faalt  
✅ **Zero Setup** - Werkt direct na push  
✅ **Geen GitHub Actions** - Alles in Railway  

---

## 🔄 Automatische Workflow

### **1. Feature Branch Push**

```bash
# Maak feature branch
git checkout -b feature/mcp-google-drive

# Maak changes
# ...

# Push naar GitHub
git push origin feature/mcp-google-drive
```

**Railway doet automatisch:**
1. 🔍 Detecteert nieuwe branch
2. 🏗️ Start build (`npm ci && npm run build`)
3. 🚀 Deploy naar preview environment
4. ✅ Health check (`/api/health`)
5. 🔗 Geeft preview URL

**Preview URL:**
```
https://mmc-mcp-bridge-pr-123.up.railway.app
```

### **2. Test Preview Deployment**

```bash
# Check health
curl https://mmc-mcp-bridge-pr-123.up.railway.app/api/health

# Test MCP tools
curl -X POST https://mmc-mcp-bridge-pr-123.up.railway.app/api/sse \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'
```

### **3. Merge naar Main (alleen als preview healthy is)**

```bash
# Run pre-merge check (checkt Railway preview)
./scripts/pre-merge-check.sh

# Als alles OK:
./scripts/merge-to-main.sh
```

**Railway doet automatisch:**
1. 🔍 Detecteert merge naar main
2. 🏗️ Build production
3. 🚀 Deploy naar production
4. ✅ Health check
5. 🗑️ Verwijdert preview deployment

---

## 🛠️ Railway Setup

### **Stap 1: Enable PR Deployments**

In Railway Dashboard:
1. Open je project
2. Ga naar **Settings** → **Deployments**
3. Enable **"PR Deployments"**
4. Enable **"Branch Deployments"** voor `feature/*`

### **Stap 2: Configure Branch Patterns**

```yaml
# Railway auto-detecteert:
main → Production
feature/* → Preview Deployments
```

### **Stap 3: Environment Variables**

Railway kopieert automatisch alle env vars naar preview deployments!

**Production (main):**
- DATABASE_URL
- MONGODB_URI
- REDIS_URL
- N8N_INSTANCE_APIKEY
- etc.

**Preview (feature branches):**
- Gebruikt dezelfde env vars (shared resources)
- Of maak aparte test databases

---

## 📊 Railway Dashboard

### **View Deployments**

```bash
# Via CLI
railway status

# Output:
# Branch: feature/mcp-google-drive
# Status: ✅ Healthy
# URL: https://mmc-mcp-bridge-pr-123.up.railway.app
# Build: ✅ Success (2m 34s)
# Health: ✅ Passing
```

### **View Logs**

```bash
# Preview deployment logs
railway logs

# Production logs
railway logs --environment production
```

### **View Build Status**

```bash
# Check if build succeeded
railway status --json | jq '.deployments[0].status'

# Output: "SUCCESS" or "FAILED"
```

---

## 🚀 Complete Workflow Example

### **Scenario: Upgrade Google Drive MCP**

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/mcp-google-drive

# 2. Make changes
# ... edit app/api/google-drive-tools.ts
# ... edit app/api/mcp-config.ts

# 3. Commit
git add .
git commit -m "feat: Add Google Drive MCP - 20 tools"

# 4. Push (Railway auto-deploys preview)
git push origin feature/mcp-google-drive

# 5. Wait for Railway preview (30-60 seconds)
railway status

# 6. Test preview deployment
curl https://mmc-mcp-bridge-pr-123.up.railway.app/api/health

# 7. Run pre-merge check
./scripts/pre-merge-check.sh
# ✅ Railway preview deployment is healthy

# 8. Merge to main (automated)
./scripts/merge-to-main.sh
# ✅ Merged to main
# ✅ Railway production deployed
# ✅ Preview deployment cleaned up
```

---

## 🔍 Build Failure Handling

### **Als Railway Build Faalt:**

```bash
# 1. Check Railway logs
railway logs

# 2. Fix errors lokaal
npm run build

# 3. Commit fix
git add .
git commit -m "fix: Build errors"

# 4. Push (Railway auto-retries)
git push origin feature/mcp-google-drive

# 5. Check status
railway status
```

### **Als Health Check Faalt:**

```bash
# 1. Check Railway logs
railway logs

# 2. Check health endpoint
curl https://mmc-mcp-bridge-pr-123.up.railway.app/api/health

# 3. Fix runtime errors
# 4. Push fix
# 5. Railway auto-redeploys
```

---

## 📝 Railway Configuration Files

### **railway.json** (Primary)

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ALWAYS"
  }
}
```

### **railway.toml** (Advanced)

```toml
[build]
builder = "RAILPACK"
buildCommand = "npm ci && npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300

[environments.production]
branch = "main"

[environments.staging]
branch = "feature/*"

[pr]
enabled = true
```

---

## 🎯 Best Practices

### **1. Always Check Preview Before Merge**

```bash
# DON'T:
git merge feature/mcp-x  # ❌ No check

# DO:
./scripts/pre-merge-check.sh  # ✅ Checks Railway preview
./scripts/merge-to-main.sh    # ✅ Automated merge
```

### **2. Monitor Railway Status**

```bash
# After push
railway status

# After merge
railway logs --environment production
```

### **3. Use Preview URLs for Testing**

```bash
# Get preview URL
PREVIEW_URL=$(railway status --json | jq -r '.deployments[0].url')

# Test with Cursor IDE
# Update .cursor/settings.json:
{
  "mcpServers": {
    "MMC-MCP-Bridge-Preview": {
      "type": "sse",
      "url": "${PREVIEW_URL}/api/sse"
    }
  }
}
```

### **4. Clean Up Old Branches**

Railway auto-deletes preview deployments when:
- Branch is deleted
- PR is closed/merged
- 7 days of inactivity

---

## 🆘 Troubleshooting

### **Problem: Preview not deploying**

```bash
# Check Railway project settings
railway open

# Verify PR Deployments are enabled
# Settings → Deployments → PR Deployments: ON
```

### **Problem: Build succeeds but health check fails**

```bash
# Check logs
railway logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port binding issue

# Fix: Add missing env vars in Railway dashboard
```

### **Problem: Can't find preview URL**

```bash
# Via CLI
railway status --json | jq -r '.deployments[0].url'

# Via Dashboard
railway open
# Click on deployment → Copy URL
```

---

## 📊 Comparison: Railway vs GitHub Actions

| Feature | Railway | GitHub Actions |
|---------|---------|----------------|
| Setup | ✅ Zero config | ❌ YAML files |
| Preview URLs | ✅ Automatic | ❌ Manual |
| Build Logs | ✅ Integrated | ❌ Separate |
| Environment | ✅ Real production | ❌ Mock/Test |
| Cost | ✅ Included | ✅ Free (limited) |
| Speed | ✅ Fast (2-3 min) | ⚠️ Slower (5-10 min) |
| Maintenance | ✅ Zero | ❌ YAML updates |

**Winner: Railway** 🚂

---

## ✅ Checklist

Voor elke feature branch:

- [ ] Branch pushed naar GitHub
- [ ] Railway preview deployment started
- [ ] Build succeeded (check `railway status`)
- [ ] Health check passing
- [ ] Preview URL tested
- [ ] Pre-merge check passed
- [ ] Merged to main via script
- [ ] Production deployment verified
- [ ] Preview deployment cleaned up

---

## 🔗 Useful Commands

```bash
# Check Railway status
railway status

# View logs
railway logs

# Open Railway dashboard
railway open

# Link to Railway project (first time)
railway link

# Deploy manually (if needed)
railway up

# Rollback (if needed)
railway rollback
```

---

## 🎉 Summary

**Railway CI/CD = Zero Config + Full Power**

1. Push branch → Railway auto-deploys preview
2. Test preview → Verify everything works
3. Run pre-merge check → Validates Railway preview
4. Merge to main → Railway auto-deploys production
5. Done! 🚀

**No GitHub Actions, No YAML, No Hassle!** 💪

