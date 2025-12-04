# 🤖 AGENTIC WORKER - Autonomous Task Execution

## Wat is dit?

De **Agentic Worker** is een autonome AI agent die volledige tasklists kan uitvoeren over alle 25 MCP servers. Hij gebruikt BullMQ + Redis voor queue management en GPT-4 voor intelligente task planning.

## Features

- ✅ **Autonomous Execution**: Voert multi-step workflows volledig autonoom uit
- ✅ **AI Planning**: GPT-4 plant automatisch de stappen als je alleen een beschrijving geeft
- ✅ **Progress Tracking**: Real-time voortgang per stap
- ✅ **Error Handling**: Automatische retry met exponential backoff
- ✅ **All 25 Servers**: Toegang tot git, filesystem, playwright, n8n, mongodb, linear, railway, github, openai, anthropic, postgres, sqlite, notion, slack, airtable, doppler, raindrop, postman, google-drive, ollama, brave-search, puppeteer, sentry, strapi, stripe

## Setup (Railway)

1. **Add Redis addon** in Railway dashboard
2. **Set environment variable**: `REDIS_URL` (auto-set by Railway)
3. **Set OpenAI key**: `OPENAI_API_KEY` (voor AI planning)
4. Deploy - worker start automatisch!

## API Endpoints

### 1. Submit Task

```bash
POST https://mmcmcphttpbridge-production.up.railway.app/api/agent/submit
```

**Body (AI Planning - alleen beschrijving):**
```json
{
  "description": "Clone the MMC_MCP_BRIDGE repo, read package.json, and create a Linear issue with the dependencies"
}
```

**Body (Manual Steps):**
```json
{
  "type": "workflow",
  "description": "Backup database to Google Drive",
  "steps": [
    {
      "server": "mongodb",
      "tool": "find",
      "params": {
        "database": "production",
        "collection": "users",
        "limit": 1000
      },
      "description": "Export users from MongoDB"
    },
    {
      "server": "filesystem",
      "tool": "writeFile",
      "params": {
        "path": "/tmp/users-backup.json",
        "content": "{{previous_result}}"
      },
      "description": "Write to temp file"
    },
    {
      "server": "google-drive",
      "tool": "uploadFile",
      "params": {
        "path": "/tmp/users-backup.json",
        "folderId": "backup-folder-id"
      },
      "description": "Upload to Google Drive"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "task_1234567890_abc123",
  "message": "Task submitted to agent queue"
}
```

### 2. Check Status

```bash
GET https://mmcmcphttpbridge-production.up.railway.app/api/agent/status/{jobId}
```

**Response:**
```json
{
  "id": "task_1234567890_abc123",
  "state": "completed",
  "progress": 100,
  "result": {
    "taskId": "task_1234567890_abc123",
    "status": "completed",
    "results": [
      {
        "step": 1,
        "server": "mongodb",
        "tool": "find",
        "success": true,
        "result": [...],
        "duration": 234
      },
      {
        "step": 2,
        "server": "filesystem",
        "tool": "writeFile",
        "success": true,
        "result": "File written",
        "duration": 45
      }
    ],
    "summary": "Task completed: 2/2 steps completed in 279ms",
    "duration": 279
  }
}
```

## Use Cases

### 1. Automated Deployments
```json
{
  "description": "Deploy latest commit from main branch to Railway production"
}
```

### 2. Data Pipelines
```json
{
  "description": "Fetch data from MongoDB, transform it, and sync to Airtable"
}
```

### 3. Monitoring & Alerts
```json
{
  "description": "Check Sentry for new errors and post summary to Slack"
}
```

### 4. Content Management
```json
{
  "description": "Scrape blog posts with Playwright and save to Notion database"
}
```

### 5. AI Workflows
```json
{
  "description": "Generate product descriptions with OpenAI and update Strapi CMS"
}
```

## Advanced: Manual Step Control

Voor complexe workflows kun je exact specificeren welke stappen uitgevoerd moeten worden:

```json
{
  "type": "workflow",
  "description": "Multi-platform sync workflow",
  "steps": [
    {
      "server": "github",
      "tool": "listRepos",
      "params": { "owner": "MyMindVentures" },
      "description": "Get all repos"
    },
    {
      "server": "linear",
      "tool": "listIssues",
      "params": { "teamId": "TEAM_ID" },
      "description": "Get Linear issues"
    },
    {
      "server": "slack",
      "tool": "postMessage",
      "params": {
        "channel": "#dev",
        "text": "Sync completed: {{step1_count}} repos, {{step2_count}} issues"
      },
      "description": "Send summary to Slack"
    }
  ],
  "context": {
    "critical": true,
    "notify_on_completion": true
  }
}
```

## Error Handling

De agent heeft intelligente error handling:

- **Critical steps**: Als een critical step faalt, stopt de hele task
- **Non-critical steps**: Worden overgeslagen bij errors, rest gaat door
- **Auto-retry**: 3 pogingen met exponential backoff (2s, 4s, 8s)
- **Detailed errors**: Exacte error messages per stap

```json
{
  "step": 2,
  "server": "mongodb",
  "tool": "find",
  "success": false,
  "error": "MONGODB_CONNECTION_STRING not configured",
  "duration": 12
}
```

## Monitoring

Check health endpoint voor agent status:

```bash
GET https://mmcmcphttpbridge-production.up.railway.app/api/health
```

```json
{
  "status": "healthy",
  "agent": {
    "enabled": true,
    "status": "running"
  },
  "features": {
    "autonomous_agent": true
  }
}
```

## 🚀 Nu Gebruiken!

1. **Voeg Redis toe** aan Railway
2. **Submit een task** met alleen een beschrijving
3. **AI plant de stappen** automatisch
4. **Agent voert uit** over alle 25 servers
5. **Check status** voor real-time progress

**Geen Cursor coding agent meer nodig - de Agentic Worker doet alles!** 🎯





