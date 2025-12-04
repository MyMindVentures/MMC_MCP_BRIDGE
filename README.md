# 🚀 MMC MCP Bridge

**Enterprise MCP Orchestration Platform** - 26 MCP Servers + OAuth2 Authentication

Single SSE endpoint that orchestrates 26+ MCP servers for Cursor IDE and n8n workflows.

---

## 📋 Architecture

```
Cursor IDE / n8n
       ↓ (SSE)
  MCP Bridge (Next.js)
       ↓
  26 MCP Servers
  ├─ Databases: Postgres, MongoDB, SQLite
  ├─ AI: OpenAI, Anthropic
  ├─ Dev Tools: Git, GitHub, Railway, Playwright
  ├─ Productivity: Notion, Slack, Linear, n8n
  ├─ Integration: Stripe, Airtable, Google Drive
  └─ Search: Brave, Puppeteer, Ollama
```

---

## 🎯 Quick Start

### **1. Deploy to Railway**

```bash
# Clone repo
git clone https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git
cd MMC_MCP_BRIDGE

# Deploy
railway up
```

### **2. Configure Cursor IDE**

`.cursor/settings.json`:
```json
{
  "mcpServers": {
    "MMC-MCP-Bridge": {
      "type": "sse",
      "url": "https://your-bridge.railway.app/api/sse"
    }
  }
}
```

### **3. Use in n8n**

**HTTP Request Node:**
- URL: `https://your-bridge.railway.app/api/sse`
- Method: POST
- Body: `{"method":"tools/list"}`

---

## 🔐 Authentication

### **API Key (Simple)**

```bash
# Set in Railway
MCP_BRIDGE_API_KEY=your-secret-key

# Use in requests
curl -H "Authorization: Bearer your-secret-key" \
  https://your-bridge.railway.app/api/sse
```

### **OAuth2 (n8n Integration)**

**1. Create OAuth2 Client (via PostgreSQL):**

```sql
INSERT INTO oauth2_clients (
  client_id, client_secret, name, redirect_uris, grants, scopes
) VALUES (
  'mmc_oauth2_client_n8n',
  'your-secret-here',
  'n8n AI Agent',
  ARRAY['https://your-n8n.railway.app/rest/oauth2-credential/callback'],
  ARRAY['authorization_code', 'refresh_token'],
  ARRAY['*']
);
```

**2. Configure in n8n:**
- Credential Type: OAuth2 API
- Authorization URL: `https://your-bridge.railway.app/api/oauth/authorize`
- Access Token URL: `https://your-bridge.railway.app/api/oauth/token`
- Client ID: `mmc_oauth2_client_n8n`
- Client Secret: `your-secret-here`
- Scope: `*`

---

## 🛠️ Environment Variables

### **Required**

```bash
# Databases
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
MONGODB_URI=mongodb://...

# Redis (optional but recommended)
REDIS_URL=redis://...

# Authentication
MCP_BRIDGE_API_KEY=your-admin-key
```

### **Optional (per MCP server)**

```bash
# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Dev Tools
GITHUB_TOKEN=ghp_...
RAILWAY_API_TOKEN=...

# Productivity
NOTION_API_KEY=secret_...
SLACK_BOT_TOKEN=xoxb-...
LINEAR_API_KEY=lin_api_...

# Integration
STRIPE_SECRET_KEY=sk_...
AIRTABLE_API_KEY=key...
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}

# Search
BRAVE_API_KEY=...
DOPPLER_TOKEN=...

# n8n
N8N_BASE_URL=https://your-n8n.railway.app
N8N_INSTANCE_APIKEY=...
```

---

## 🚂 Railway CI/CD

### **Automatic Workflow**

1. **Push feature branch** → Railway auto-deploys preview
2. **Test preview** → `https://mmc-mcp-bridge-pr-123.up.railway.app`
3. **Merge to main** → Railway auto-deploys production

### **Configuration**

`railway.json`:
```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ALWAYS",
    "predeployCommand": "npm run build"
  },
  "github": {
    "deployOnPush": true,
    "deployOnPullRequest": true,
    "deployOnMerge": true
  }
}
```

**Railway Dashboard Setup (REQUIRED):**
1. **Connect GitHub Repository:**
   - Go to Railway Dashboard → Project → Settings → GitHub
   - Connect your GitHub repository
   - Enable "Deploy on Push" ✅
   - Enable "Deploy on Pull Request" ✅ (for preview deployments)

2. **Service Settings:**
   - Go to Service → Settings → Source
   - Ensure "Auto Deploy" is enabled ✅
   - Set branch to `main` for production
   - Enable "PR Deployments" for preview branches

3. **Environment Variables:**
   - Add all required env vars in Railway Dashboard
   - Use Railway's secret management (not `.env` files)

**Railway auto-enables:**
- ✅ PR deployments (preview per branch) - **Requires dashboard setup**
- ✅ Build checks (blocks merge if build fails)
- ✅ Health checks (`/api/health`)
- ✅ Auto-cleanup (deletes preview after merge)
- ✅ Predeploy checks (runs `npm run build` before deploy)

---

## 🌿 Branching Strategy

### **Feature Branch Workflow**

```bash
# 1. Create feature branch
git checkout -b feature/mcp-google-drive

# 2. Make changes
# ... edit app/api/google-drive-tools.ts

# 3. Push (Railway auto-deploys preview)
git push origin feature/mcp-google-drive

# 4. Test preview deployment
curl https://mmc-mcp-bridge-pr-123.up.railway.app/api/health

# 5. Merge to main (only if preview is healthy!)
git checkout main
git merge feature/mcp-google-drive --no-ff
git push origin main

# 6. Cleanup
git branch -d feature/mcp-google-drive
git push origin --delete feature/mcp-google-drive
```

### **Rules**

- ✅ **Always** work on feature branches
- ✅ **Always** test Railway preview before merge
- ✅ **Always** use `--no-ff` for merges
- ❌ **Never** commit directly to main (except hotfixes)
- ❌ **Never** merge if preview deployment fails

---

## 📊 MCP Servers Status

**18/26 Complete (69%)**

### **✅ Tier 1: Databases (3/3)**
- ✅ Postgres (25 tools)
- ✅ SQLite (22 tools)
- ✅ MongoDB (17 tools)

### **✅ Tier 2: Productivity (3/3)**
- ✅ Notion (25 tools)
- ✅ Slack (20 tools)
- ✅ Linear (30 tools)

### **✅ Tier 3: AI (2/2)**
- ✅ OpenAI (36 tools)
- ✅ Anthropic (14 tools)

### **✅ Tier 4: Dev Tools (2/2)**
- ✅ GitHub (35 tools)
- ✅ Git (17 tools)

### **✅ Tier 5: Infrastructure (3/3)**
- ✅ Railway (22 tools)
- ✅ Playwright (24 tools)
- ✅ n8n (via @leonardsellem/n8n-mcp-server)

### **✅ Tier 6: Integration (3/3)**
- ✅ Airtable (18 tools)
- ✅ Doppler (38 tools)
- ✅ Brave Search (7 tools)

### **⏳ Tier 7: Remaining (8/8)**
- ⏳ Google Drive (1→20 tools)
- ⏳ Stripe (1→25 tools)
- ⏳ Raindrop (1→10 tools)
- ⏳ Postman (1→10 tools)
- ⏳ Ollama (1→8 tools)
- ⏳ Puppeteer (1→10 tools)
- ⏳ Sentry (1→15 tools)
- ⏳ Strapi (1→15 tools)

**Target:** 350+ total tools across all 26 servers

---

## 🔧 Development

### **Local Setup**

```bash
# Install dependencies
npm ci

# Run dev server
npm run dev

# Build
npm run build

# Start production
npm start
```

### **Testing**

```bash
# Health check
curl http://localhost:3000/api/health

# List all MCP servers
curl http://localhost:3000/api/servers

# Test specific tool
curl -X POST http://localhost:3000/api/mcp/postgres/query \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT version()"}'
```

---

## 📁 Repository Structure

```
MMC_MCP_BRIDGE/
├── package.json              # Dependencies
├── railway.json              # Railway config
├── app/
│   ├── page.tsx             # Frontend UI
│   └── api/                 # Backend routes
│       ├── sse/             # Main SSE endpoint
│       ├── health/          # Health check
│       ├── servers/         # List servers
│       ├── mcp/             # Direct tool execution
│       ├── oauth/           # OAuth2 endpoints
│       ├── middleware/      # Auth middleware
│       ├── mcp-config.ts    # MCP server configs
│       ├── mcp-executor.ts  # Tool execution logic
│       └── *-tools.ts       # Individual MCP tool implementations
│           ├── postgres-tools.ts
│           ├── mongodb-tools.ts
│           ├── openai-tools.ts
│           ├── github-tools.ts
│           └── ...
```

---

## 🚨 Troubleshooting

### **Build Fails on Railway**

```bash
# Check Railway logs
railway logs

# Common issues:
# - Missing devDependencies → Fixed in railway.json
# - TypeScript errors → Fix locally with npm run build
# - Missing env vars → Add in Railway dashboard
```

### **502 Error (Application failed to respond)**

```bash
# Check health endpoint
curl https://your-bridge.railway.app/api/health

# Common causes:
# - Database connection failed (check DATABASE_URL)
# - Missing required env vars
# - Application crashed (check railway logs)
```

### **OAuth2 Not Working**

```bash
# 1. Check if oauth2_clients table exists
# Run in Railway PostgreSQL:
SELECT * FROM oauth2_clients;

# 2. If table doesn't exist, it will auto-create on first request
# Or manually run: see app/api/oauth/model.ts (initializeOAuth2Tables)

# 3. Verify client credentials
SELECT client_id, name, redirect_uris FROM oauth2_clients;
```

---

## 📚 API Endpoints

### **Core Endpoints**

```bash
# Health check
GET /api/health

# List all MCP servers
GET /api/servers

# SSE endpoint (MCP protocol)
POST /api/sse
Body: {"method":"tools/list"}

# Direct tool execution
POST /api/mcp/{server}/{tool}
Body: {"param1":"value1"}
```

### **OAuth2 Endpoints**

```bash
# Authorization
GET /api/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=*

# Token exchange
POST /api/oauth/token
Body: grant_type=authorization_code&code=...&client_id=...&client_secret=...

# Refresh token
POST /api/oauth/token
Body: grant_type=refresh_token&refresh_token=...&client_id=...&client_secret=...

# Manage clients (admin only)
GET /api/oauth/clients
POST /api/oauth/clients
DELETE /api/oauth/clients?client_id=...
```

---

## 🎯 Use Cases

### **1. Cursor IDE - AI Code Assistant**

```json
// .cursor/settings.json
{
  "mcpServers": {
    "MMC-MCP-Bridge": {
      "type": "sse",
      "url": "https://your-bridge.railway.app/api/sse"
    }
  }
}
```

**Available in Cursor:**
- Query databases (Postgres, MongoDB, SQLite)
- Manage GitHub repos (issues, PRs, workflows)
- Deploy to Railway
- Search with Brave
- Manage secrets with Doppler
- And 350+ more tools!

### **2. n8n - Workflow Automation**

**Example: AI Agent with MCP Tools**

```
Trigger (Webhook)
  ↓
AI Agent (OpenAI)
  ↓
MCP Tool: Postgres Query
  ↓
MCP Tool: Slack Post Message
  ↓
Response
```

### **3. OpenWebUI - NLP Workflow Builder**

Connect OpenWebUI to n8n MCP for natural language workflow building.

---

## 🔒 Security

- ✅ API Key authentication (Bearer token)
- ✅ OAuth2 2.0 (Authorization Code + Refresh Token)
- ✅ Rate limiting (Redis-based)
- ✅ Scope-based permissions
- ✅ Audit logging
- ✅ PostgreSQL + Redis for token storage

---

## 📈 Monitoring

```bash
# Health check
curl https://your-bridge.railway.app/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-12-04T...",
  "servers": {
    "enabled": 26,
    "total": 26
  },
  "connections": {
    "postgres": "connected",
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

---

## 🤝 Contributing

### **Adding New MCP Server**

1. Create `app/api/{server}-tools.ts`
2. Implement `execute{Server}Tool(toolName, params)`
3. Update `app/api/mcp-config.ts` (add server config)
4. Update `app/api/mcp-executor.ts` (import & use)
5. Test on feature branch (Railway preview)
6. Merge to main

### **Branch Naming**

```bash
feature/mcp-{server-name}  # New MCP server
fix/{description}          # Bug fixes
hotfix/{critical}          # Critical production fixes
```

---

## 📄 License

**PROPRIETARY** - MyMind Ventures

---

## 🆘 Support

- **Issues:** GitHub Issues
- **Docs:** This README
- **Railway:** https://railway.app
- **MCP Spec:** https://modelcontextprotocol.io

---

## 🎉 Credits

Built with:
- Next.js 15
- Railway (deployment + CI/CD)
- PostgreSQL (data + OAuth2)
- MongoDB (NoSQL)
- Redis (caching + rate limiting)
- 26 MCP Servers

**Powered by MyMind Ventures** 🚀

