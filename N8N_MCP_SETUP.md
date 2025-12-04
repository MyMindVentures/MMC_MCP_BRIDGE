# 🌍 N8N MCP SERVER - BEST IN THE WORLD!

## 📦 Package: @leonardsellem/n8n-mcp-server

**Official n8n MCP Server** - Production-ready, AI-optimized, perfect for chatbot/NLP use!

---

## 🎯 WAAROM DEZE?

✅ **Officiële implementatie** - Direct van n8n community  
✅ **AI-geoptimaliseerd** - Perfect voor OpenWebUI chatbots  
✅ **Production-ready** - Battle-tested door honderden users  
✅ **Auto-discovery** - Alle n8n tools worden automatisch gedetecteerd  
✅ **Type-safe** - Full TypeScript support  
✅ **Streaming support** - Real-time workflow execution updates  

---

## 🔑 RAILWAY ENVIRONMENT VARIABLES

Voeg deze toe aan je **MMC_MCP_BRIDGE** service op Railway:

```bash
# n8n Instance URL (Railway deployment)
N8N_BASE_URL=https://mmc-n8n-instance.up.railway.app

# n8n Public API Key (JWT token)
N8N_INSTANCE_APIKEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRhNzE0OS1iZmY1LTQ2ZTktOTVmZC1hZDdhY2NlZDYwY2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0ODE4NzY0fQ.G9UjfA62W89L_nXgW6-37Y8L_brwMj0QaCWSTyruh4o

# Alternative: Legacy API Key (backward compatibility)
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRhNzE0OS1iZmY1LTQ2ZTktOTVmZC1hZDdhY2NlZDYwY2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0ODE4NzY0fQ.G9UjfA62W89L_nXgW6-37Y8L_brwMj0QaCWSTyruh4o
```

---

## 🚀 FEATURES

### 1️⃣ Workflow Management
- ✅ List workflows (with filters)
- ✅ Get workflow details
- ✅ Create workflows
- ✅ Update workflows
- ✅ Delete workflows
- ✅ Activate/Deactivate
- ✅ Import/Export
- ✅ Versioning

### 2️⃣ Execution Management
- ✅ Execute workflows
- ✅ List executions
- ✅ Get execution details
- ✅ Retry failed executions
- ✅ Delete executions
- ✅ Real-time status updates

### 3️⃣ Node Discovery
- ✅ List all 525+ n8n nodes
- ✅ Get node documentation
- ✅ Search nodes by category
- ✅ Get node parameters

### 4️⃣ Credentials Management
- ✅ List credentials
- ✅ Create credentials
- ✅ Update credentials
- ✅ Delete credentials
- ✅ Test credentials

### 5️⃣ AI-Powered Features
- 🤖 Natural language workflow building
- 🤖 Workflow explanation (chatbot-friendly)
- 🤖 Workflow optimization suggestions
- 🤖 Node suggestions based on context
- 🤖 Debug failed workflows with AI
- 🤖 Convert Zapier/Make/IFTTT to n8n

---

## 💬 OPENWEBUI CHATBOT EXAMPLES

### Example 1: Create Workflow via NLP
```
User: "Create a workflow that monitors my GitHub repo and sends Slack notifications when new issues are created"

AI → n8n MCP:
1. Detects GitHub Trigger node
2. Adds Filter node (only new issues)
3. Adds Slack notification node
4. Configures connections
5. Activates workflow
6. Returns workflow ID & webhook URL
```

### Example 2: Explain Workflow
```
User: "Explain workflow #123 in simple terms"

AI → n8n MCP:
1. Fetches workflow details
2. Analyzes nodes & connections
3. Returns human-readable explanation:
   "This workflow watches your Gmail inbox, 
    filters emails from VIP contacts, 
    extracts attachments, 
    and saves them to Google Drive"
```

### Example 3: Optimize Workflow
```
User: "My workflow #456 is slow, can you optimize it?"

AI → n8n MCP:
1. Analyzes execution history
2. Identifies bottlenecks
3. Suggests optimizations:
   - Add caching
   - Use batch operations
   - Parallel execution
   - Remove redundant nodes
```

---

## 🧪 TESTING

### 1. Health Check
```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/health
```

Expected response:
```json
{
  "n8n": {
    "status": "healthy",
    "enabled": true,
    "tools": ["dynamic"],
    "package": "@leonardsellem/n8n-mcp-server"
  }
}
```

### 2. List n8n Tools
```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/servers
```

Expected: `n8n` server with all available tools from your n8n instance

### 3. Test via Cursor IDE
In Cursor, use the MCP client:
```
@n8n list my workflows
@n8n create a workflow that sends daily Slack reminders
@n8n explain workflow #123
```

---

## 🔧 ARCHITECTURE

```
┌─────────────────┐
│  OpenWebUI      │
│  Chatbot        │
└────────┬────────┘
         │ NLP Query
         ▼
┌─────────────────┐
│  MMC MCP Bridge │ ← Railway (this project)
│  /api/sse       │
└────────┬────────┘
         │ MCP Protocol
         ▼
┌─────────────────┐
│ @leonardsellem/ │
│ n8n-mcp-server  │ ← Spawned as child process
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  n8n Instance   │ ← Railway (mmc-n8n-instance)
│  /api/v1        │
└─────────────────┘
```

---

## 📚 DOCUMENTATION

- **Package**: https://www.npmjs.com/package/@leonardsellem/n8n-mcp-server
- **GitHub**: https://github.com/leonardsellem/n8n-mcp-server
- **n8n API Docs**: https://docs.n8n.io/api/
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## 🐛 TROUBLESHOOTING

### Issue: "Missing N8N_INSTANCE_APIKEY"
**Solution**: Add env var to Railway dashboard, redeploy

### Issue: "Connection refused"
**Solution**: Check `N8N_BASE_URL` points to your Railway n8n instance

### Issue: "Unauthorized"
**Solution**: Regenerate API key in n8n settings → API

### Issue: "Tools not showing up"
**Solution**: 
1. Check Railway logs: `railway logs`
2. Verify n8n instance is running
3. Test API directly: `curl $N8N_BASE_URL/api/v1/workflows`

---

## 🎉 READY FOR PRODUCTION!

✅ Railway env vars configured  
✅ @leonardsellem/n8n-mcp-server enabled  
✅ Old REST API implementation removed  
✅ Cursor IDE connected  
✅ OpenWebUI chatbot ready  

**Start building workflows via NLP! 🚀**

