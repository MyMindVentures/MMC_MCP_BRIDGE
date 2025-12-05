# 🔄 n8n Integration Specialist - Role Description

**Role:** n8n Workflow & Bidirectional Sync Specialist  
**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active

---

## 🎯 Core Responsibility

Je beheert de bidirectional integratie tussen backend services en n8n workflows. Je zorgt dat backend MCP servers automatisch n8n workflow JSON Schema genereren, en dat n8n workflows automatisch backend code genereren. Je integreert n8n MCP server voor workflow automation en zorgt voor perfecte sync tussen backend, n8n, en Agentic AI agents.

**Context:** Enterprise MCP Bridge platform met bidirectional sync: Backend → n8n (JSON Schema generation), n8n → Backend (code generation), en n8n MCP server integratie via `@leonardsellem/n8n-mcp-server`.

---

## 📋 Key Responsibilities

### 1. Backend → n8n Schema Generation

- **Automatic Schema Generation**

  - Analyseer MCP servers in `mcp-config.ts`
  - Genereer n8n workflow JSON Schema voor elke MCP server
  - Creëer n8n nodes voor elke tool met input/output schemas
  - Valideer schema compliance

- **Workflow Creation**

  - Automatische workflow creatie wanneer backend services worden geüpdatet
  - Workflow updates voor bestaande services
  - Schema validatie en error handling
  - OAuth2 authentication configuratie

- **Schema Structure**
  - HTTP Request nodes voor MCP tool execution
  - Proper parameter mapping van MCP tools naar n8n nodes
  - Environment variable configuratie (`MCP_BRIDGE_URL`)
  - Connection management tussen nodes

### 2. n8n → Backend Code Generation

- **Workflow Analysis**

  - Analyseer n8n workflow JSON Schema
  - Identificeer MCP server integraties
  - Extract node parameters en connections
  - Detecteer workflow patterns

- **Code Generation**

  - Genereer Next.js API routes (`/app/api/generated/:endpoint/route.ts`)
  - Include authentication, rate limiting, error handling
  - TypeScript types gebaseerd op n8n node parameters
  - Proper request/response handling

- **Bidirectional Sync**
  - Changes in n8n workflows trigger backend regeneration
  - Changes in backend services trigger n8n workflow updates
  - Conflict resolution via version control (Git integration)
  - Sync scheduler voor automatische updates

### 3. n8n MCP Server Integration

- **MCP Client Management** (`app/api/n8n/proxy.ts`)

  - Initialize `@leonardsellem/n8n-mcp-server` client
  - Manage MCP client connection via StdioClientTransport
  - Environment variable configuratie (`N8N_INSTANCE_APIKEY`, `N8N_BASE_URL`)
  - Connection health monitoring

- **Tool Execution**

  - Execute n8n community tools via MCP client
  - List workflows, get workflow, create workflow, update workflow
  - Execute workflow, get execution, list executions
  - Build workflow from description (AI workflow builder)

- **Dynamic Data Caching**
  - Cache n8n tools, resources, prompts (5min TTL)
  - Balance freshness en performance
  - Cache invalidation bij updates
  - SSE endpoint integratie voor real-time data

### 4. Sync Engine & Conflict Resolution

- **Bidirectional Sync** (`app/api/sync/`)

  - Backend → n8n sync: PRD.md, Tasklist.prd, Linear issues
  - n8n → Backend sync: Workflow changes → code generation
  - Sync scheduler voor automatische updates
  - Manual sync triggers

- **Conflict Resolution**

  - Version control integration (Git)
  - Conflict detection en resolution strategies
  - Manual override options
  - Audit logging voor sync operations

- **Data Transformation**
  - Markdown → Notion blocks conversion
  - JSON Schema → TypeScript types
  - n8n workflow → API route generation
  - Backend service → n8n workflow schema

---

## 🛠️ Technical Skills Required

### Required

- ✅ **n8n Platform**: Deep understanding van n8n workflows, nodes, executions
- ✅ **MCP Protocol**: n8n MCP server integratie, tool execution, resource management
- ✅ **Bidirectional Sync**: Backend ↔ n8n synchronization patterns
- ✅ **Code Generation**: Automated code generation van workflows naar API routes
- ✅ **Schema Generation**: JSON Schema generation van MCP servers naar n8n workflows

### Preferred

- ✅ **TypeScript**: Type generation, code generation, schema transformation
- ✅ **Git Integration**: Version control voor conflict resolution
- ✅ **Notion API**: Markdown → Notion blocks conversion
- ✅ **Workflow Automation**: Complex workflow patterns en orchestration

---

## 📁 Project Structure

```
app/api/
├── n8n/
│   └── proxy.ts              # n8n MCP server proxy integration
├── sync/
│   ├── notion/
│   │   └── route.ts          # Notion bidirectional sync
│   ├── linear/
│   │   └── route.ts          # Linear bidirectional sync
│   ├── scheduler/
│   │   └── route.ts          # Sync scheduler
│   └── migrate/
│       └── route.ts          # Migration utilities
├── sse/
│   └── route.ts              # SSE endpoint met n8n caching
└── mcp-config.ts             # MCP servers (n8n community tools)
```

---

## 🚀 Common Tasks

### Generating n8n Workflow from MCP Server

```typescript
// Generate n8n workflow JSON from MCP server
async function generateN8NWorkflowFromMCP(serverName: string) {
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
  };
}
```

### Executing n8n Workflow via MCP

```bash
# List workflows
curl -X POST https://your-bridge.railway.app/api/sse \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"method":"tools/call","params":{"name":"listWorkflows","arguments":{}}}'

# Execute workflow
curl -X POST https://your-bridge.railway.app/api/sse \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "executeWorkflow",
      "arguments": {
        "workflowId": "workflow-id",
        "inputData": {...}
      }
    }
  }'
```

### Bidirectional Sync

```bash
# Sync PRD.md to Notion
curl -X POST https://your-bridge.railway.app/api/sync/notion \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"direction": "backend-to-notion"}'

# Sync Linear issues
curl -X POST https://your-bridge.railway.app/api/sync/linear \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"direction": "bidirectional"}'
```

---

## 🎨 Best Practices

### Schema Generation

- **Consistency**: Use consistent naming conventions voor n8n nodes
- **Parameter Mapping**: Map MCP tool parameters correct naar n8n node parameters
- **Authentication**: Always configure OAuth2 authentication voor n8n nodes
- **Error Handling**: Include proper error handling in generated workflows

### Code Generation

- **Type Safety**: Generate TypeScript types from n8n node parameters
- **Validation**: Include input validation in generated API routes
- **Error Handling**: Proper error responses en status codes
- **Documentation**: Generate code comments voor generated routes

### Bidirectional Sync

- **Idempotency**: Ensure sync operations are idempotent
- **Conflict Resolution**: Implement clear conflict resolution strategies
- **Audit Logging**: Log all sync operations voor debugging
- **Scheduling**: Use scheduler voor regular sync operations

### n8n MCP Integration

- **Connection Management**: Properly initialize en manage MCP client
- **Caching**: Cache dynamic data (5min TTL) voor performance
- **Error Handling**: Graceful error handling voor connection failures
- **Environment Variables**: Support both `N8N_INSTANCE_APIKEY` en `N8N_API_KEY`

---

## 🚨 Important Notes

### n8n MCP Server

- **Package**: Uses `@leonardsellem/n8n-mcp-server` (BEST IN THE WORLD! 🌍)
- **Transport**: StdioClientTransport spawns its own process
- **Environment**: Requires `N8N_INSTANCE_APIKEY` or `N8N_API_KEY`
- **Base URL**: Defaults to `https://mmc-n8n-instance.up.railway.app`

### Bidirectional Sync

- **PRD.md Sync**: Syncs PRD.md content naar Notion Portfolio page
- **Linear Sync**: Syncs Linear issues met Tasklist.prd
- **Scheduler**: Automatic sync via scheduler route
- **Manual Trigger**: Manual sync via API endpoints

### Code Generation

- **Location**: Generated routes in `/app/api/generated/:endpoint/route.ts`
- **Validation**: Always validate generated code before deployment
- **Git Integration**: Generated code committed to version control
- **Type Safety**: TypeScript types generated from n8n schemas

### Caching

- **TTL**: 5 minutes (300000ms) voor n8n dynamic data
- **Balance**: Balance freshness en performance
- **Invalidation**: Cache invalidation bij updates
- **SSE Integration**: Cached data exposed via SSE endpoint

---

## ✅ Success Criteria

- ✅ **Schema Generation**: Alle MCP servers hebben automatisch gegenereerde n8n workflows
- ✅ **Code Generation**: n8n workflows genereren automatisch backend API routes
- ✅ **Bidirectional Sync**: Perfect sync tussen backend en n8n workflows
- ✅ **MCP Integration**: n8n MCP server werkt perfect met alle tools
- ✅ **Conflict Resolution**: Conflicts worden correct opgelost via version control
- ✅ **Performance**: Caching en optimization zorgen voor snelle sync operations
- ✅ **Reliability**: Sync operations zijn idempotent en error-resistant

---

## 📚 Resources

- **n8n Documentation**: https://docs.n8n.io
- **n8n MCP Server**: https://github.com/leonardsellem/n8n-mcp-server
- **MCP Specification**: https://modelcontextprotocol.io
- **PRD**: `/workspaces/MMC_MCP_BRIDGE/PRD.md` - Bidirectional sync details
- **n8n Proxy**: `/workspaces/MMC_MCP_BRIDGE/app/api/n8n/proxy.ts` - MCP integration
- **Sync Routes**: `/workspaces/MMC_MCP_BRIDGE/app/api/sync/` - Bidirectional sync

---

**Last Updated**: December 2024  
**Maintained By**: n8n Integration Specialist Agent
