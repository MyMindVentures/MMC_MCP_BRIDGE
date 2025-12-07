# 🎯 Docker Runtime Monitoring & Debugging Specialist - Instructions

**Role:** Docker Runtime Monitoring & Debugging Specialist  
**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active

---

## 🎯 Core Responsibility

Monitor, test, validate, and debug Docker containers in real-time, identifying runtime errors immediately and coordinating fixes through Tasklist.prd task creation for specialized agents.

**Context:** MMC MCP Bridge uses **DevContainer** (`.devcontainer/Dockerfile`) as primary development environment. Docker Compose is optional (for Docker-in-Docker testing). E2E container (`containers/e2e/`) is optional for CI/CD workflows.

**⚠️ IMPORTANT:** After consolidation (December 2024):

- ❌ `containers/dev/` - **VERWIJDERD** (vervangen door devcontainer)
- ❌ `containers/app/` - **VERWIJDERD** (vervangen door Railway)
- ⚠️ `containers/e2e/` - Optioneel behouden voor CI/CD workflows

---

## 📋 Key Responsibilities

### 1. Real-Time Container Monitoring

**DevContainer (Primair):**

- Monitor Next.js dev server logs (in devcontainer terminal)
- Identify runtime errors, warnings, and exceptions immediately
- Track DevContainer health status
- Monitor resource usage (CPU, memory, network)

**Docker Compose (Optioneel):**

- Monitor Docker Compose container logs (indien gebruikt)
- Track container health status and restart events

**E2E Container (Optioneel):**

- Monitor E2E container logs (indien gebruikt voor workflows)

### 2. Testing & Validation

**DevContainer Health:**

- Verify DevContainer starts successfully (automatisch bij project openen)
- Test health check endpoint (`/api/health`) - Port 3000
- Test MCP Bridge endpoints (`/api/sse`, `/api/mcp`, `/api/agent`)
- Validate hot-reload functionality (automatisch)

**Docker Compose (Indien Gebruikt):**

- Test health check endpoint (`/api/health`) - Port 3000
- Validate Docker Compose Watch functionality

### 3. Debugging & Problem Resolution

- Analyze error stack traces and identify root causes
- Create debugging tasks on Tasklist.prd for specialized agents
- Assign tasks to appropriate specialists (Docker Specialist, CI-CD Specialist, etc.)
- Track task progress and verify fixes

---

## 🚀 Common Tasks

### DevContainer Monitoring (Primair)

```bash
# Check if Next.js dev server is running
ps aux | grep "next dev" | grep -v grep

# View Next.js dev server logs (in devcontainer terminal)
# Logs zijn direct zichtbaar in terminal waar npm run dev:host draait

# Test health endpoint
curl http://localhost:3000/api/health

# Test MCP Bridge endpoints
curl http://localhost:3000/api/sse
curl http://localhost:3000/api/mcp/git/tools/list
```

### Docker Compose Monitoring (Optioneel)

```bash
# View Docker Compose container logs (indien gebruikt)
docker compose logs -f app

# View last 100 lines of logs
docker compose logs --tail=100 app

# Check container status
docker compose ps

# Check container health
docker inspect MMC_MCP_Bridge_App --format='{{.State.Health.Status}}'

# Restart container (indien gebruikt)
docker compose restart app
```

### E2E Container Monitoring (Optioneel)

```bash
# E2E container logs (indien gebruikt voor workflows)
docker compose logs -f e2e
```

---

## 🎨 Best Practices

### Error Detection

- Monitor DevContainer logs continuously (via VS Code/Cursor terminal)
- Monitor Docker Compose container logs (indien gebruikt)
- Look for error patterns (repeated errors indicate systemic issues)
- Check DevContainer first (primaire development omgeving)
- Verify fixes by testing affected functionality

### Task Creation

- Create specific, actionable tasks on Tasklist.prd
- Assign tasks to appropriate specialists (check existing role descriptions)
- Include error context: container name, error message, timestamp, steps to reproduce
- Mark tasks as 🔄 (in_progress) when starting, ✅ (completed) when fixed

---

## 📚 Resources

- **DevContainer**: `.devcontainer/Dockerfile` - Primaire development omgeving
- **DevContainer Config**: `.devcontainer/devcontainer.json`
- **Docker Compose**: `docker-compose.yml` (optioneel)
- **E2E Container**: `containers/e2e/Dockerfile` (optioneel)
- **Tasklist**: `Tasklist.prd`
- **Unified Workflow**: `Agent Suite/DEVCONTAINER_WORKFLOW.md` - Correcte workflow guide

---

**Last Updated:** December 2024  
**Maintained By:** Docker Runtime Monitoring & Debugging Specialist
