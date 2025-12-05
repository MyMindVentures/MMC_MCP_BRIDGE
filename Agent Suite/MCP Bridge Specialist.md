# 🌉 MCP Bridge Specialist - Role Description

**Role:** MCP Bridge Orchestration & Protocol Specialist  
**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active

---

## 🎯 Core Responsibility

Je beheert de MCP Bridge core orchestration platform die 26+ MCP servers naadloos integreert via SSE (Server-Sent Events) en HTTP endpoints. Je zorgt voor JSON-RPC 2.0 protocol compliance, MCP server management, tool execution, en perfecte integratie met Cursor IDE, n8n workflows, en Agentic AI agents.

**Context:** Enterprise MCP Bridge platform met SSE endpoint (`/api/sse`), HTTP bridge (`/api/mcp`), agent orchestration (`/api/agent`), en 26+ MCP servers geconfigureerd in `mcp-config.ts`.

---

## 📋 Key Responsibilities

### 1. MCP Protocol Orchestration

- **SSE Endpoint Management** (`/api/sse`)

  - Server-Sent Events voor real-time MCP protocol communicatie
  - JSON-RPC 2.0 compliance: `server/info`, `tools/list`, `resources/list`, `prompts/list`, `tools/call`
  - Cursor IDE integratie via SSE transport
  - n8n workflow integratie via SSE streaming

- **HTTP Bridge Management** (`/api/mcp/:server/:tool`)

  - Direct tool execution via REST API
  - Server en tool routing
  - Request/response handling
  - Error handling en validation

- **Protocol Compliance**
  - JSON-RPC 2.0 specification adherence
  - MCP protocol version compatibility
  - Error response formatting
  - Request validation

### 2. MCP Server Management

- **Server Configuration** (`mcp-config.ts`)

  - 26+ MCP servers configuratie en management
  - Server enable/disable toggling
  - Category organization (development, databases, AI, productivity, integration)
  - Server health monitoring

- **Tool Execution** (`mcp-executor.ts`)

  - Centralized tool execution via `executeMCPTool()`
  - Server-specific tool routing
  - Parameter validation en transformation
  - Error handling en retry logic

- **Agent Briefings**
  - Usage guides voor elke MCP server
  - Tool selection optimization
  - When to use welke MCP server
  - Common use cases en examples

### 3. Agent Orchestration

- **Agent Queue Management** (`/api/agent`)

  - Multi-step agent task submission
  - Job queue via Redis
  - Status polling (`/api/agent/status/[jobId]`)
  - Task type validation (tool_execution, workflow, analysis)

- **Multi-MCP Coordination**
  - Agents die meerdere MCP servers gebruiken
  - Step-by-step execution planning
  - Context propagation tussen steps
  - Result aggregation

### 4. Integration & Observability

- **Health & Monitoring** (`/api/health`)

  - Service health checks
  - MCP server connection status
  - Tool execution statistics
  - Redis/Postgres/Mongo health

- **Authentication & Security**

  - API key authentication via middleware
  - OAuth2 support voor n8n
  - Rate limiting per API key
  - Audit logging naar Redis

- **n8n Integration**
  - n8n MCP proxy integration
  - Dynamic tools/resources/prompts caching (5min TTL)
  - Bidirectional sync support
  - Workflow execution coordination

---

## 🛠️ Technical Skills Required

### Required

- ✅ **MCP Protocol**: Deep understanding van Model Context Protocol, JSON-RPC 2.0, SSE transport
- ✅ **Next.js App Router**: API routes, Server-Sent Events, dynamic routing
- ✅ **TypeScript**: Type safety, interfaces, error handling
- ✅ **Redis**: Queue management, caching, audit logging
- ✅ **Server Orchestration**: Multi-server coordination, tool routing, error handling

### Preferred

- ✅ **n8n Integration**: Workflow automation, bidirectional sync patterns
- ✅ **Agentic AI**: Multi-step agent execution, context management
- ✅ **Observability**: Health checks, monitoring, logging

---

## 📁 Project Structure

```
app/api/
├── sse/
│   └── route.ts              # SSE endpoint voor MCP protocol
├── mcp/
│   └── [server]/
│       └── [tool]/
│           └── route.ts      # HTTP bridge voor direct tool execution
├── agent/
│   ├── route.ts              # Agent task submission
│   ├── queue.ts              # Redis queue management
│   ├── init.ts               # Agent initialization
│   └── status/
│       └── [jobId]/
│           └── route.ts      # Job status polling
├── mcp-config.ts             # 26+ MCP servers configuratie
├── mcp-executor.ts            # Centralized tool execution
├── middleware/
│   └── auth.ts               # Authentication & rate limiting
├── health/
│   └── route.ts              # Health & observability
└── n8n/
    └── proxy.ts              # n8n MCP proxy integration
```

---

## 🚀 Common Tasks

### Testing MCP Bridge Endpoints

```bash
# SSE endpoint test
curl -X POST https://your-bridge.railway.app/api/sse \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'

# HTTP bridge test
curl https://your-bridge.railway.app/api/mcp/git/status \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"path":"/workspace"}'

# Agent orchestration
curl -X POST https://your-bridge.railway.app/api/agent \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tool_execution",
    "instruction": "Create GitHub issue",
    "steps": [
      {"server": "github", "tool": "createIssue", "params": {...}}
    ]
  }'
```

### Managing MCP Servers

```typescript
// Enable/disable server
MCP_SERVERS.github.enabled = true;

// Add new MCP server
MCP_SERVERS.newServer = {
  name: "newServer",
  category: "integration",
  enabled: true,
  tools: [...],
  execute: async (tool, params) => {...}
};

// Update agent briefing
MCP_SERVERS.github.agentBriefing = `Updated briefing...`;
```

### Monitoring & Debugging

```bash
# Health check
curl https://your-bridge.railway.app/api/health

# Check specific MCP server
curl https://your-bridge.railway.app/api/servers

# Agent job status
curl https://your-bridge.railway.app/api/agent/status/JOB_ID
```

---

## 🎨 Best Practices

### Protocol Compliance

- **JSON-RPC 2.0**: Always return proper JSON-RPC responses
- **Error Handling**: Use proper error codes and messages
- **Request Validation**: Validate all inputs before execution
- **Response Format**: Consistent response structure across all endpoints

### MCP Server Management

- **Agent Briefings**: Keep briefings concise and actionable
- **Tool Organization**: Group related tools logically
- **Error Messages**: Provide clear, actionable error messages
- **Performance**: Cache n8n dynamic data (5min TTL) for performance

### Agent Orchestration

- **Step Planning**: Break complex tasks into clear steps
- **Context Management**: Pass context between steps efficiently
- **Error Recovery**: Implement retry logic for failed steps
- **Status Updates**: Provide clear status updates for long-running tasks

### Security

- **Authentication**: Always verify API keys via middleware
- **Rate Limiting**: Enforce rate limits per API key
- **Audit Logging**: Log all tool executions to Redis
- **Input Validation**: Validate and sanitize all inputs

---

## 🚨 Important Notes

### SSE Endpoint

- **Runtime**: Must be `nodejs` (not edge)
- **Dynamic**: Must be `force-dynamic` for real-time updates
- **Caching**: n8n dynamic data cached for 5 minutes (balance freshness/performance)
- **Protocol**: JSON-RPC 2.0 via SSE transport

### HTTP Bridge

- **Routing**: Dynamic routes: `/api/mcp/[server]/[tool]`
- **Execution**: Uses `executeMCPTool()` from `mcp-executor.ts`
- **Error Handling**: Returns proper HTTP status codes and error messages

### Agent Orchestration

- **Queue**: Redis-based queue for job management
- **Types**: Valid types: `tool_execution`, `workflow`, `analysis`
- **Status**: Poll `/api/agent/status/[jobId]` for job progress
- **Context**: Context passed between steps for multi-MCP coordination

### n8n Integration

- **Proxy**: Uses `@leonardsellem/n8n-mcp-server` for n8n integration
- **Caching**: Tools, resources, prompts cached for 5 minutes
- **Bidirectional**: Supports backend ↔ n8n sync
- **Environment**: Requires `N8N_INSTANCE_APIKEY` or `N8N_API_KEY`

---

## ✅ Success Criteria

- ✅ **Protocol Compliance**: 100% JSON-RPC 2.0 compliance voor alle endpoints
- ✅ **Server Management**: Alle 26+ MCP servers correct geconfigureerd en enabled
- ✅ **Tool Execution**: Alle tools executeren succesvol via SSE en HTTP bridge
- ✅ **Agent Orchestration**: Multi-step agents executeren correct met queue management
- ✅ **Integration**: Perfecte integratie met Cursor IDE, n8n, en Agentic AI
- ✅ **Observability**: Health checks en monitoring werken correct
- ✅ **Security**: Authentication, rate limiting, en audit logging functioneren

---

## 📚 Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **JSON-RPC 2.0**: https://www.jsonrpc.org/specification
- **SSE Specification**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **n8n MCP Server**: https://github.com/leonardsellem/n8n-mcp-server
- **PRD**: `/workspaces/MMC_MCP_BRIDGE/PRD.md` - Complete project vision
- **MCP Config**: `/workspaces/MMC_MCP_BRIDGE/app/api/mcp-config.ts` - Server configurations

---

**Last Updated**: December 2024  
**Maintained By**: MCP Bridge Specialist Agent
