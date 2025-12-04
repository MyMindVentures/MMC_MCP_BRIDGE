# 🎯 Cursor IDE - MCP Bridge Setup

## Railway Production Endpoint

**URL:** `https://mmcmcphttpbridge-production.up.railway.app/api/sse`

## Cursor Configuration

### Option 1: Global Cursor Settings

Open Cursor Settings (`Cmd/Ctrl + ,`) → Search for "MCP" → Add:

```json
{
  "mcp": {
    "mcpServers": {
      "MMC-MCP-Bridge-Railway": {
        "type": "sse",
        "url": "https://mmcmcphttpbridge-production.up.railway.app/api/sse",
        "description": "Production MCP Bridge - ALL 26 servers"
      }
    }
  }
}
```

### Option 2: Workspace Settings (Already Configured!)

This repo already has `.vscode/settings.json` and `.devcontainer/devcontainer.json` configured with the Railway SSE endpoint.

**You don't need to do anything!** Just open this workspace in Cursor.

---

## 🎉 What You Get

When Cursor connects to this MCP Bridge, you get access to **26 MCP servers**:

### 🗄️ **Databases** (3)
- **postgres** - PostgreSQL with 25+ tools (schema, transactions, bulk ops)
- **sqlite** - SQLite with 22+ tools (DDL/DML, transactions, backup)
- **mongodb** - MongoDB with 17+ tools (aggregation, indexes, transactions)

### 🤖 **AI** (3)
- **openai** - GPT-4, embeddings, DALL-E
- **anthropic** - Claude (Sonnet/Opus)
- **ollama** - Local LLMs

### 📝 **Productivity** (4)
- **notion** - Pages, databases, blocks, search
- **slack** - Messages, channels, files, reactions
- **linear** - Issues, projects, cycles
- **airtable** - Records, bases, tables

### 💻 **Development** (4)
- **git** - Clone, commit, push, pull, branches
- **github** - Repos, issues, PRs, workflows
- **filesystem** - Read/write files, directories
- **railway** - Projects, services, deployments

### 🌐 **Automation** (3)
- **n8n** - 525+ workflow nodes, AI workflow builder
- **n8n-community** - Community MCP server
- **playwright** - Browser automation, screenshots, scraping
- **puppeteer** - Headless Chrome automation

### 🔧 **Integration** (9)
- **stripe** - Payments, customers, subscriptions
- **google-drive** - Files, folders, sharing
- **doppler** - Secrets management
- **raindrop** - Bookmarks
- **postman** - API collections
- **brave-search** - Web search
- **sentry** - Error tracking
- **strapi** - CMS content
- **puppeteer** - Browser automation

---

## 🧪 Test the Connection

### 1. Check Health
```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/health
```

### 2. List All Servers
```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/servers
```

### 3. Test SSE Connection
```bash
curl -N https://mmcmcphttpbridge-production.up.railway.app/api/sse
```

You should see SSE events streaming back.

---

## 🔑 Environment Variables

The MCP Bridge on Railway needs these env vars (already configured in Railway):

- `MONGODB_CONNECTION_STRING`
- `LINEAR_API_KEY`
- `RAILWAY_TOKEN`
- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `POSTGRES_CONNECTION_STRING`
- `SQLITE_DB_PATH`
- `NOTION_API_KEY`
- `SLACK_BOT_TOKEN`
- `AIRTABLE_API_KEY`
- `DOPPLER_TOKEN`
- `RAINDROP_TOKEN`
- `POSTMAN_API_KEY`
- `GOOGLE_DRIVE_CREDENTIALS`
- `BRAVE_SEARCH_API_KEY`
- `SENTRY_DSN`
- `STRAPI_URL` + `STRAPI_API_KEY`
- `STRIPE_SECRET_KEY`
- `N8N_API_KEY` + `N8N_BASE_URL`

---

## 🚀 Usage in Cursor

Once connected, you can:

### Ask Cursor to use MCP tools:
```
"Use the postgres server to list all tables in the production database"
```

```
"Use the github server to create an issue in MyMindVentures/MMC_MCP_BRIDGE"
```

```
"Use the openai server to generate embeddings for this text"
```

```
"Use the n8n server to create a workflow that sends Slack notifications"
```

### Cursor will automatically:
1. Connect to Railway MCP Bridge via SSE
2. Discover all 26 servers and 350+ tools
3. Execute tools on Railway (not locally!)
4. Return results to you

---

## 🔄 Development Workflow

### For Local Development:
- Railway is always running (production)
- Devcontainer connects to Railway SSE (not local Docker)
- Make code changes → Push to GitHub → Railway auto-deploys

### For Testing:
```bash
# Test locally (optional)
npm run dev

# But Cursor ALWAYS uses Railway SSE endpoint
```

---

## 📊 Monitoring

### Check Railway Logs:
```bash
railway logs --service mmcmcphttpbridge-production
```

### Check All Servers Status:
```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/health | jq .
```

---

## ⚠️ Important Notes

1. **DO NOT run local MCP server** - Cursor connects to Railway!
2. **DO NOT configure localhost:3000** - Always use Railway URL!
3. **Environment variables** - Managed in Railway dashboard, not locally
4. **Auto-deploy** - Every push to `main` triggers Railway deployment

---

## 🎯 Next Steps

1. ✅ Open this workspace in Cursor
2. ✅ Settings are already configured (`.vscode/settings.json`)
3. ✅ Devcontainer is configured (`.devcontainer/devcontainer.json`)
4. ✅ Start using MCP tools via Cursor!

**That's it! You're connected to all 26 MCP servers on Railway!** 🎉

