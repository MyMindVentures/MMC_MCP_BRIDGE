# 🧪 Real Data API Testing Plan

**Specialist in API Testing met Real Data** - Geen prototypes, mock-ups, fantasy, maar echte functionerende apps met database en realtime UI/UX Frontend user experience.

---

## 📋 Test Strategie

### Core Principles

1. **Real Data Only** - Geen mocks, geen prototypes
2. **Database Connections** - Echte Postgres, MongoDB, Redis connections
3. **Realtime UI/UX** - Frontend dashboard met live data updates
4. **End-to-End Testing** - Volledige workflows van API tot database tot frontend

### Test Environment

- **Railway Production**: `https://your-bridge.railway.app` (vervang met echte URL)
- **Local Development**: `http://localhost:3000`
- **API Key**: Set `MCP_BRIDGE_API_KEY` environment variable

---

## 🚀 Quick Start Testing

### 1. Health Endpoint Test (Real Database Connections)

```bash
# Test health endpoint met real database connections
curl -X GET "https://your-bridge.railway.app/api/health" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  | jq '.'

# Expected: Real connection status voor Postgres, MongoDB, Redis
# {
#   "status": "healthy",
#   "connections": {
#     "postgres": { "status": "connected", "configured": true },
#     "mongodb": { "status": "connected", "configured": true },
#     "redis": { "status": "connected", "configured": true }
#   }
# }
```

### 2. MCP Servers List Test

```bash
# List alle enabled MCP servers met real configuratie
curl -X GET "https://your-bridge.railway.app/api/servers" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  | jq '.servers[] | {name, category, tools: (.tools | length), enabled}'
```

### 3. Postgres Real Data Test

```bash
# Test Postgres query met echte database
curl -X POST "https://your-bridge.railway.app/api/mcp/postgres/query" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT version(), current_database(), current_user"
  }' | jq '.'

# Test create table
curl -X POST "https://your-bridge.railway.app/api/mcp/postgres/createTable" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "test_users",
    "columns": {
      "id": "SERIAL PRIMARY KEY",
      "name": "VARCHAR(255) NOT NULL",
      "email": "VARCHAR(255) UNIQUE",
      "created_at": "TIMESTAMP DEFAULT NOW()"
    }
  }' | jq '.'

# Test insert
curl -X POST "https://your-bridge.railway.app/api/mcp/postgres/insert" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tableName": "test_users",
    "data": {
      "name": "Test User",
      "email": "test@example.com"
    }
  }' | jq '.'

# Test query inserted data
curl -X POST "https://your-bridge.railway.app/api/mcp/postgres/query" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM test_users WHERE email = '\''test@example.com'\''"
  }' | jq '.'
```

### 4. MongoDB Real Data Test

```bash
# Test MongoDB find met echte database
curl -X POST "https://your-bridge.railway.app/api/mcp/mongodb/find" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "database": "test_db",
    "collection": "test_collection",
    "filter": {},
    "limit": 10
  }' | jq '.'

# Test MongoDB insert
curl -X POST "https://your-bridge.railway.app/api/mcp/mongodb/insert" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "database": "test_db",
    "collection": "test_collection",
    "documents": [
      {
        "name": "Test Document",
        "value": 123,
        "created_at": "2024-12-04T12:00:00Z"
      }
    ]
  }' | jq '.'

# Test MongoDB aggregate
curl -X POST "https://your-bridge.railway.app/api/mcp/mongodb/aggregate" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "database": "test_db",
    "collection": "test_collection",
    "pipeline": [
      { "$match": { "value": { "$gt": 100 } } },
      { "$group": { "_id": null, "avg": { "$avg": "$value" } } }
    ]
  }' | jq '.'
```

### 5. Git Real Operations Test

```bash
# Test Git clone (echte repository)
curl -X POST "https://your-bridge.railway.app/api/mcp/git/clone" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git",
    "path": "/tmp/test-repo"
  }' | jq '.'

# Test Git status
curl -X POST "https://your-bridge.railway.app/api/mcp/git/status" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/tmp/test-repo"
  }' | jq '.'
```

### 6. GitHub Real API Test

```bash
# Test GitHub list repos (echte GitHub account)
curl -X POST "https://your-bridge.railway.app/api/mcp/github/listRepos" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "MyMindVentures"
  }' | jq '.'

# Test GitHub create issue
curl -X POST "https://your-bridge.railway.app/api/mcp/github/createIssue" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "MyMindVentures",
    "repo": "MMC_MCP_BRIDGE",
    "title": "Test Issue from Real Data Testing",
    "body": "This is a test issue created via MCP Bridge API with real data"
  }' | jq '.'
```

### 7. OpenAI Real Chat Test

```bash
# Test OpenAI chat (echte API key)
curl -X POST "https://your-bridge.railway.app/api/mcp/openai/chat" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Hello, this is a real data test. Please respond with a short message."
      }
    ]
  }' | jq '.'
```

### 8. Frontend Realtime UI/UX Test

```bash
# Open frontend in browser
open "https://your-bridge.railway.app"

# Test realtime updates:
# 1. Health status updates elke 5 seconden
# 2. Agent execution met realtime polling
# 3. MCP server status met live tool counts
# 4. Resources en prompts met live data

# Test agent execution via frontend:
# - Enter instruction: "Query Postgres database for all users"
# - Watch realtime status updates
# - Verify result display
```

---

## 📊 Comprehensive Test Matrix

### Database Servers (Real Data Required)

| Server   | Tool        | Test Case               | Real Data Required    |
| -------- | ----------- | ----------------------- | --------------------- |
| Postgres | query       | SELECT version()        | ✅ Real DB connection |
| Postgres | createTable | Create test table       | ✅ Real DB write      |
| Postgres | insert      | Insert test record      | ✅ Real DB write      |
| Postgres | update      | Update test record      | ✅ Real DB write      |
| Postgres | delete      | Delete test record      | ✅ Real DB write      |
| MongoDB  | find        | Find documents          | ✅ Real DB connection |
| MongoDB  | insert      | Insert document         | ✅ Real DB write      |
| MongoDB  | aggregate   | Aggregate pipeline      | ✅ Real DB query      |
| SQLite   | query       | SELECT sqlite_version() | ✅ Real DB file       |

### AI Services (Real API Keys Required)

| Server    | Tool      | Test Case       | Real Data Required |
| --------- | --------- | --------------- | ------------------ |
| OpenAI    | chat      | Chat completion | ✅ Real API key    |
| OpenAI    | embedding | Text embedding  | ✅ Real API key    |
| Anthropic | chat      | Claude chat     | ✅ Real API key    |

### Development Tools (Real Operations)

| Server | Tool        | Test Case         | Real Data Required     |
| ------ | ----------- | ----------------- | ---------------------- |
| Git    | clone       | Clone repo        | ✅ Real repository     |
| Git    | commit      | Commit changes    | ✅ Real git repo       |
| GitHub | listRepos   | List repositories | ✅ Real GitHub account |
| GitHub | createIssue | Create issue      | ✅ Real GitHub repo    |

---

## 🔍 Test Validation Checklist

Voor elke test:

- [ ] **Real Database Connection** - Geen mocks, echte database
- [ ] **Real API Keys** - Echte service credentials
- [ ] **Real Data Operations** - CREATE, READ, UPDATE, DELETE
- [ ] **Realtime Updates** - Frontend toont live data
- [ ] **Error Handling** - Test error scenarios met real data
- [ ] **Performance** - Response times met real data volumes
- [ ] **Data Integrity** - Verify data persistence

---

## 🎯 Next Steps

1. **Set Railway Endpoint URL** in environment
2. **Configure Real Database Connections** (Postgres, MongoDB, Redis)
3. **Set Real API Keys** (OpenAI, GitHub, etc.)
4. **Run Test Suite** tegen Railway production
5. **Verify Frontend** realtime updates
6. **Document Results** in test report

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Health Endpoint

- ✅ Postgres connection: Connected
- ✅ MongoDB connection: Connected
- ✅ Redis connection: Connected

### Postgres MCP

- ✅ Query: Success (response time: 45ms)
- ✅ CreateTable: Success
- ✅ Insert: Success
- ✅ Update: Success
- ✅ Delete: Success

### Frontend UI/UX

- ✅ Health status updates: Real-time
- ✅ Agent execution: Real-time polling
- ✅ Server status: Live tool counts
```

---

**Last Updated:** 2024-12-04  
**Status:** Ready for Real Data Testing
