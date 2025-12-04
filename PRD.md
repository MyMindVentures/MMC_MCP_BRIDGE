# 🚀 MMC MCP Bridge - Product Requirements Document

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active Development

---

## 📋 Executive Summary

**MMC MCP Bridge** is an enterprise-grade Model Context Protocol (MCP) orchestration platform that seamlessly integrates 26+ MCP servers into a unified, AI-powered automation ecosystem. The platform enables bidirectional synchronization between backend services, n8n workflows, and AI agents, creating a self-evolving fullstack application architecture.

### Core Value Proposition

- **Unified MCP Orchestration**: Single endpoint for 26+ MCP servers (databases, AI, dev tools, productivity apps)
- **Bidirectional n8n Integration**: Backend services automatically reflect in n8n workflows via JSON Schema
- **Agentic AI Architecture**: AI agents embedded in n8n workflows enable self-building applications
- **OpenWebUI Integration**: Visual workflow builder that syncs bidirectionally with backend
- **Production-Ready**: Enterprise authentication (OAuth2 + API keys), rate limiting, audit logging

---

## 🎯 Project Vision

**"A self-evolving fullstack application where backend services, n8n workflows, and AI agents work in perfect harmony, enabling bidirectional code generation and automation."**

### The Vision in Practice

1. **Backend → n8n**: Every MCP server and API endpoint automatically generates its corresponding n8n workflow JSON Schema
2. **n8n → Backend**: Workflows built in n8n (via OpenWebUI or n8n UI) automatically generate backend code
3. **AI Agent Orchestration**: Agentic agents embedded in n8n workflows execute complex multi-step operations across MCP servers
4. **Self-Building Applications**: The system continuously evolves as workflows are refined, generating optimized backend code

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MMC MCP Bridge Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │  Cursor IDE  │    │  OpenWebUI   │    │   n8n UI      │   │
│  │   (SSE)      │    │  (Visual)    │    │  (Workflows)  │   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
│         │                  │                   │            │
│         └──────────────────┼───────────────────┘            │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  MCP Bridge    │                        │
│                    │  (Next.js)     │                        │
│                    │                │                        │
│                    │  ┌──────────┐  │                        │
│                    │  │ /api/sse │  │  SSE MCP Protocol     │
│                    │  │ /api/mcp │  │  HTTP Direct Access   │
│                    │  │ /api/agent│ │  Agent Orchestration  │
│                    │  └──────────┘  │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│         ┌───────────────────┼───────────────────┐           │
│         │                   │                   │           │
│  ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼──────┐   │
│  │  26 MCP     │   │  n8n Workflow  │  │  Agentic    │   │
│  │  Servers    │   │  JSON Schema   │  │  Agent      │   │
│  │             │   │  Generator     │  │  Queue      │   │
│  └─────────────┘   └────────┬───────┘  └─────────────┘   │
│                              │                             │
│                    ┌─────────▼─────────┐                   │
│                    │  Bidirectional    │                   │
│                    │  Sync Engine     │                   │
│                    │  (Backend ↔ n8n) │                   │
│                    └──────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. **MCP Bridge Core** (`/app/api/`)

- **SSE Endpoint** (`/api/sse`): Server-Sent Events for real-time MCP protocol communication
- **HTTP Bridge** (`/api/mcp/:server/:tool`): Direct tool execution via REST API
- **Agent Orchestration** (`/api/agent`): Multi-step agent execution with queue management
- **Health & Observability** (`/api/health`): Service health, connection status, MCP server statistics

#### 2. **MCP Server Integration** (`/app/api/mcp-config.ts`)

- **26 MCP Servers** fully implemented with real SDKs (no mocks)
- **Agent Briefings**: Usage guides for each MCP server to optimize AI agent decisions
- **Tool Execution**: Centralized executor (`mcp-executor.ts`) with Redis audit logging

#### 3. **n8n Integration Layer** (`/app/api/n8n/`)

- **n8n MCP Proxy**: Integration with `@leonardsellem/n8n-mcp-server`
- **Workflow Schema Generator**: Automatic JSON Schema generation from backend services
- **Bidirectional Sync**: Backend changes → n8n workflow updates, n8n changes → backend code generation

#### 4. **Authentication & Security** (`/app/api/middleware/auth.ts`)

- **API Key Authentication**: Simple bearer token for direct access
- **OAuth2 Support**: Full OAuth2 flow for n8n and other integrations
- **Rate Limiting**: Redis-based rate limiting with configurable limits per API key
- **Audit Logging**: All MCP tool executions logged to Redis for compliance

---

## 🔄 Bidirectional n8n Integration

### The Core Innovation

**Every backend service automatically generates its n8n workflow JSON Schema, and every n8n workflow can generate backend code.**

### How It Works

#### **Phase 1: Backend → n8n Schema Generation**

1. **MCP Server Registration**

   - When an MCP server is registered in `mcp-config.ts`, the system automatically:
     - Analyzes all tools, resources, and prompts
     - Generates a corresponding n8n workflow JSON Schema
     - Creates n8n nodes for each tool with proper input/output schemas

2. **Schema Structure**

   ```json
   {
     "name": "MMC MCP Bridge - OpenAI",
     "nodes": [
       {
         "name": "OpenAI Chat",
         "type": "n8n-nodes-base.httpRequest",
         "parameters": {
           "url": "{{ $env.MCP_BRIDGE_URL }}/api/mcp/openai/chat",
           "method": "POST",
           "authentication": "oAuth2",
           "bodyParameters": {
             "model": "gpt-4",
             "messages": "={{ $json.messages }}"
           }
         }
       }
     ],
     "connections": {}
   }
   ```

3. **Automatic Workflow Creation**
   - When backend services are updated, corresponding n8n workflows are automatically:
     - Created (if new)
     - Updated (if existing)
     - Validated (schema compliance)

#### **Phase 2: n8n → Backend Code Generation**

1. **Workflow Analysis**

   - When a workflow is created/updated in n8n (via OpenWebUI or n8n UI):
     - The system analyzes the workflow JSON Schema
     - Identifies MCP server integrations
     - Generates corresponding backend API routes

2. **Code Generation**

   - For each n8n node that uses MCP Bridge:
     - Generate Next.js API route (`/app/api/generated/:endpoint/route.ts`)
     - Include proper authentication, rate limiting, error handling
     - Add TypeScript types based on n8n node parameters

3. **Bidirectional Sync**
   - Changes in n8n workflows trigger backend regeneration
   - Changes in backend services trigger n8n workflow updates
   - Conflict resolution via version control (Git integration)

### Implementation Details

#### **n8n Schema Generator** (`/app/api/n8n/schema-generator.ts`)

```typescript
// Generate n8n workflow JSON from MCP server config
export async function generateN8NWorkflowFromMCP(
  serverName: string
): Promise<n8n.Workflow> {
  const server = MCP_SERVERS[serverName];

  const nodes = server.tools.map((tool) => ({
    name: `${serverName}_${tool.name}`,
    type: "n8n-nodes-base.httpRequest",
    parameters: {
      url: `{{ $env.MCP_BRIDGE_URL }}/api/mcp/${serverName}/${tool.name}`,
      method: "POST",
      authentication: "oAuth2",
      bodyParameters: tool.inputSchema.properties,
    },
  }));

  return {
    name: `MMC MCP Bridge - ${server.name}`,
    nodes,
    connections: {},
    settings: {},
    staticData: null,
    tags: [],
  };
}
```

#### **Backend Code Generator** (`/app/api/n8n/code-generator.ts`)

```typescript
// Generate Next.js API route from n8n workflow
export async function generateBackendFromN8NWorkflow(
  workflow: n8n.Workflow
): Promise<string> {
  // Analyze workflow nodes
  // Generate TypeScript API routes
  // Include authentication, rate limiting, error handling
  // Return generated code as string
}
```

---

## 🤖 Agentic AI Architecture

### Agent Integration in n8n Workflows

**Every n8n workflow can include an embedded Agentic AI agent that orchestrates complex multi-step operations.**

### How Agents Work

1. **Agent Node in n8n**

   - Special n8n node type: `MMC Agent`
   - Accepts natural language instructions
   - Executes multi-step plans across multiple MCP servers
   - Returns structured results

2. **Agent Execution Flow**

   ```
   User Input (Natural Language)
        ↓
   Agent Node (n8n Workflow)
        ↓
   MCP Bridge Agent Orchestration (/api/agent)
        ↓
   Multi-Step Plan Execution
   ├─ Step 1: Execute MCP Tool A
   ├─ Step 2: Execute MCP Tool B (using result from Step 1)
   ├─ Step 3: Execute MCP Tool C (using results from Steps 1 & 2)
   └─ Step N: Final result
        ↓
   Return to n8n Workflow
        ↓
   Continue Workflow Execution
   ```

3. **Agent Queue Management**
   - Redis-based queue for agent jobs
   - Status polling endpoint (`/api/agent/:jobId/status`)
   - Real-time progress updates via SSE

### Example: Agent in n8n Workflow

```json
{
  "name": "Create GitHub Issue and Notify Slack",
  "nodes": [
    {
      "name": "Agent: Create Issue",
      "type": "mmc-agent",
      "parameters": {
        "instruction": "Create a GitHub issue titled 'Fix bug' in repo MyMindVentures/MMC_MCP_BRIDGE, then post a Slack message in #dev channel with the issue URL"
      }
    },
    {
      "name": "Continue Workflow",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "issueUrl": "={{ $json.agentResult.issueUrl }}"
        }
      }
    }
  ]
}
```

The agent will:

1. Use GitHub MCP to create the issue
2. Get the issue URL from the response
3. Use Slack MCP to post the message
4. Return the result to the n8n workflow

---

## 🎨 OpenWebUI Integration

### Visual Workflow Builder

**OpenWebUI provides a visual interface for building n8n workflows that sync bidirectionally with the backend.**

### Integration Flow

1. **OpenWebUI → n8n Schema**

   - User builds workflow visually in OpenWebUI
   - Workflow is saved as n8n JSON Schema
   - Schema is sent to MCP Bridge

2. **Schema → Backend Generation**

   - MCP Bridge analyzes the n8n schema
   - Generates corresponding backend API routes
   - Commits code to Git (via Git MCP)

3. **Backend → n8n Sync**
   - Backend changes trigger n8n workflow updates
   - Workflow nodes are automatically updated
   - OpenWebUI reflects the changes

### Future: Agentic Frontend Generation

**The ultimate vision: An agentic agent that builds a new frontend based on n8n workflows.**

1. **n8n Workflow Analysis**

   - Agent analyzes all n8n workflows
   - Identifies data flows, user interactions, API endpoints

2. **Frontend Generation**

   - Generates React/Next.js components
   - Creates forms, tables, dashboards based on workflow structure
   - Implements real-time updates via SSE

3. **Fullstack Application**
   - Backend: MCP Bridge + Generated API routes
   - Middleware: n8n workflows
   - Frontend: Agent-generated React components
   - All synced bidirectionally

---

## 📊 MCP Server Catalog

### Current Implementation (26 Servers)

#### **Databases** (3 servers)

- **Postgres**: 25+ tools (query, schema, DDL, DML, transactions)
- **SQLite**: 22+ tools (query, schema, indexes, foreign keys)
- **MongoDB**: 18+ tools (collections, documents, aggregations)

#### **AI Services** (2 servers)

- **OpenAI**: 36+ tools (chat, completion, embedding, image, vision, function calling)
- **Anthropic**: 13+ tools (chat, completion, vision, structured data extraction)

#### **Development Tools** (4 servers)

- **Git**: 17+ tools (clone, commit, push, pull, branch, stash, tag, merge, rebase)
- **GitHub**: 35+ tools (repos, issues, PRs, workflows, releases, branches, commits, search)
- **Railway**: 25+ tools (projects, services, deployments, logs, metrics, domains, volumes)
- **Filesystem**: 6 tools (readFile, writeFile, listDir, deleteFile, createDir, fileInfo)

#### **Productivity** (4 servers)

- **Notion**: 25+ tools (pages, databases, blocks, search, comments)
- **Slack**: 30+ tools (messages, channels, files, reactions, threads)
- **Linear**: 20+ tools (issues, projects, cycles, teams, comments)
- **n8n**: Dynamic tools via `@leonardsellem/n8n-mcp-server`

#### **Automation & Search** (4 servers)

- **Playwright**: 24+ tools (navigate, screenshot, scrape, click, interact, form filling)
- **Puppeteer**: Browser automation tools
- **Brave Search**: 7 tools (webSearch, imageSearch, videoSearch, newsSearch, localSearch, suggest, spellcheck)
- **Ollama**: Chat with local LLM models

#### **Integration Services** (5 servers)

- **Stripe**: Payment processing (customers, payments, subscriptions)
- **Airtable**: 18+ tools (records, bases, tables, bulk operations)
- **Google Drive**: File management (list, upload, download, share)
- **Raindrop**: Bookmark management
- **Postman**: API collection management

#### **Infrastructure** (4 servers)

- **Doppler**: 38+ tools (projects, configs, secrets, environments, service tokens, integrations)
- **Sentry**: Error tracking and monitoring
- **Strapi**: Headless CMS (entries, content types, media)

---

## 🔐 Security & Authentication

### Authentication Methods

1. **API Key (Simple)**

   - Bearer token in `Authorization` header
   - Single key for all operations
   - Suitable for server-to-server communication

2. **OAuth2 (Enterprise)**
   - Full OAuth2 authorization code flow
   - Refresh token support
   - Per-client scopes and permissions
   - PostgreSQL-backed client management

### Rate Limiting

- **Redis-based rate limiting**
- Configurable limits per API key
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Audit Logging

- **All MCP tool executions logged to Redis**
- Includes: server, tool, parameters, result, duration, error (if any)
- Retention: Configurable (default: 30 days)

---

## 🚀 Deployment & Infrastructure

### Railway Deployment

- **Auto-deploy on push to main**
- **PR preview deployments** for feature branches
- **Health checks** via `/api/health`
- **Environment variables** managed via Railway dashboard

### Environment Variables

See `README.md` for complete list. Key variables:

- `MCP_BRIDGE_API_KEY`: Admin API key
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection (optional but recommended)
- Per-MCP-server API keys (OpenAI, Anthropic, GitHub, etc.)

---

## 📈 Roadmap & Future Enhancements

### Phase 1: Core n8n Integration ✅

- [x] n8n MCP server integration
- [x] Basic workflow execution
- [x] Agent orchestration

### Phase 2: Bidirectional Sync (Current)

- [ ] Backend → n8n schema generator
- [ ] n8n → backend code generator
- [ ] Automatic workflow creation/updates
- [ ] Conflict resolution

### Phase 3: OpenWebUI Integration

- [ ] OpenWebUI connector
- [ ] Visual workflow builder
- [ ] Real-time sync with backend

### Phase 4: Agentic Frontend Generation

- [ ] n8n workflow analysis
- [ ] React component generation
- [ ] Fullstack application builder

### Phase 5: Advanced Features

- [ ] Workflow versioning
- [ ] A/B testing for workflows
- [ ] Performance optimization
- [ ] Multi-tenant support

---

## 📝 Development Guidelines

### File System Rules

**See `.cursor/rules/6filesystemrule.mdc` for complete guidelines.**

Key principles:

- **Radical Minimalism**: Every file must be justified
- **No config files** unless explicitly requested
- **Use Railway** for CI/CD (no GitHub Actions)
- **Feature branches** for all changes
- **Test builds** before committing

### Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes
3. Test: `npm run build`
4. Commit and push
5. Test Railway preview
6. Merge to main (only if healthy)

### Task Management

- **Tasklist.prd**: Single source of truth for todos
- Auto-synced in devcontainer
- Status indicators: ✅ (completed), 🔄 (in_progress), ⏳ (pending)

---

## 🎯 Success Metrics

### Technical Metrics

- **Uptime**: 99.9%+
- **Response Time**: < 200ms (p95)
- **MCP Tool Execution**: < 500ms (p95)
- **Agent Job Completion**: < 5s (p95)

### Business Metrics

- **n8n Workflows Created**: Track automatic workflow generation
- **Backend Code Generated**: Lines of code generated from n8n workflows
- **Agent Executions**: Number of agent jobs executed
- **API Usage**: Requests per MCP server

---

## 📚 References

- **MCP Protocol**: [Model Context Protocol Specification](https://modelcontextprotocol.io)
- **n8n Documentation**: [n8n.io/docs](https://docs.n8n.io)
- **OpenWebUI**: [OpenWebUI GitHub](https://github.com/open-webui/open-webui)
- **Railway**: [Railway Documentation](https://docs.railway.app)

---

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the development team.

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** Active Development
