# n8n Instance Setup for MCP Bridge

## 🎯 Your n8n Instance

**Instance URL:** `https://mmc-n8n-instance.up.railway.app`

## 🔑 Required Environment Variables

Add these to your **Railway** project (MMC_MCP_BRIDGE service):

### Option 1: Public API (Recommended)
```bash
N8N_INSTANCE_APIKEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRhNzE0OS1iZmY1LTQ2ZTktOTVmZC1hZDdhY2NlZDYwY2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0ODE4NzY0fQ.G9UjfA62W89L_nXgW6-37Y8L_brwMj0QaCWSTyruh4o

N8N_BASE_URL=https://mmc-n8n-instance.up.railway.app
```

### Option 2: MCP Server (Alternative)
```bash
N8N_Instance_Server_URL=https://mmc-n8n-instance.up.railway.app/mcp-server/http

N8N_Instance_Server_AccessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRhNzE0OS1iZmY1LTQ2ZTktOTVmZC1hZDdhY2NlZDYwY2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjFmMGJmZWE4LThlZjItNDVlNy1hMzFmLWJlZTMwNmMxZGI2NCIsImlhdCI6MTc2NDgxODYyOX0.aAP00Ul2kwuEPXMcEMpgWlIvo2CEBMHx2Wfg76iOj38
```

## 📝 How to Add to Railway

### Via Railway CLI:
```bash
railway variables set N8N_INSTANCE_APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRhNzE0OS1iZmY1LTQ2ZTktOTVmZC1hZDdhY2NlZDYwY2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0ODE4NzY0fQ.G9UjfA62W89L_nXgW6-37Y8L_brwMj0QaCWSTyruh4o"

railway variables set N8N_BASE_URL="https://mmc-n8n-instance.up.railway.app"
```

### Via Railway Dashboard:
1. Go to: https://railway.app/project/your-project
2. Select **MMC_MCP_BRIDGE** service
3. Click **Variables** tab
4. Add:
   - `N8N_INSTANCE_APIKEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZGRhNzE0OS1iZmY1LTQ2ZTktOTVmZC1hZDdhY2NlZDYwY2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0ODE4NzY0fQ.G9UjfA62W89L_nXgW6-37Y8L_brwMj0QaCWSTyruh4o`
   - `N8N_BASE_URL` = `https://mmc-n8n-instance.up.railway.app`
5. Railway will auto-redeploy

## ✅ Verify Setup

After Railway redeploys, test the connection:

```bash
curl https://mmcmcphttpbridge-production.up.railway.app/api/health
```

Should show `n8n` in the enabled servers list.

## 🤖 Test AI Workflow Building

### Via Cursor MCP:
```
"Use n8n to create a workflow that sends me a Slack message every morning at 9am"
```

### Via OpenWebUI:
```
Create an n8n workflow that:
- Monitors my GitHub repo for new issues
- Enriches the issue data with OpenAI
- Sends a summary to Slack
```

## 🎯 Available n8n Tools (39 total)

### Core Workflow Management (7 tools):
- listWorkflows, getWorkflow, createWorkflow
- updateWorkflow, deleteWorkflow
- activateWorkflow, deactivateWorkflow

### Execution (4 tools):
- executeWorkflow, getExecution
- listExecutions, deleteExecution
- retryExecution

### Nodes & Discovery (2 tools):
- listNodes (525+ nodes!)
- getNodeInfo

### Credentials (3 tools):
- listCredentials, createCredential
- updateCredential, deleteCredential

### Tags (3 tools):
- listTags, createTag
- updateTag, deleteTag

### Import/Export (2 tools):
- exportWorkflow, importWorkflow

### Sharing (2 tools):
- shareWorkflow, getWorkflowSharing

### Versioning (2 tools):
- getWorkflowVersions, restoreWorkflowVersion

### Bulk Operations (3 tools):
- bulkActivateWorkflows
- bulkDeactivateWorkflows
- bulkDeleteWorkflows

### 🤖 AI-POWERED TOOLS (6 tools):
- **buildWorkflowFromDescription** - NLP → n8n workflow
- **explainWorkflow** - Workflow → plain English
- **optimizeWorkflow** - AI optimization
- **suggestNodes** - Context-aware suggestions
- **debugWorkflowWithAI** - AI debugging
- **convertToWorkflow** - Zapier/Make → n8n

### Webhooks (1 tool):
- testWebhook

## 🚀 Production Ready!

Your n8n MCP is now:
- ✅ Connected to your Railway n8n instance
- ✅ AI-powered for chatbot use
- ✅ 39 tools available
- ✅ 525+ n8n nodes accessible
- ✅ OpenWebUI compatible
- ✅ Full NLP support

## 📚 Example Workflows

### 1. GitHub → Slack Notifications
```
"Create a workflow that monitors MyMindVentures/MMC_MCP_BRIDGE for new issues and sends Slack notifications"
```

### 2. Automated Data Enrichment
```
"Build a workflow that:
1. Gets new Airtable records
2. Enriches with OpenAI
3. Updates the record
4. Sends summary to Slack"
```

### 3. Website Monitoring
```
"Create a workflow that checks if my website is down every 5 minutes and alerts me on Slack"
```

## 🔧 Troubleshooting

### n8n not showing in health check?
```bash
# Check Railway logs
railway logs

# Verify env vars
railway variables
```

### API Key not working?
- Make sure you're using the **Public API** key (not MCP Server token)
- Check that n8n instance is running: https://mmc-n8n-instance.up.railway.app

### AI tools not working?
- Ensure `OPENAI_API_KEY` is set in Railway
- Check Railway logs for OpenAI errors

## 🎉 Ready to Build!

Your n8n MCP Bridge is now fully configured and ready for AI-powered workflow building via OpenWebUI! 🚀

