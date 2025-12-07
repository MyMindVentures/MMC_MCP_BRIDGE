# 🤖 Agent Suite - Top-Down Per-Agent Architecture

**Purpose:** Centralized repository for all Agent-related files, organized per Agent in a top-down structure.

---

## 📁 Structure

```
Agent Suite/
├── README.md                          # This file
├── Agent Identification Process.md    # Shared agent identification process
│
├── {agent-name}/                      # Per-Agent folder (kebab-case)
│   ├── Role Description.md            # Agent role and responsibilities
│   ├── Instructions.md               # Detailed instructions (if exists)
│   ├── Rules.mdc                      # Cursor rules file (if exists)
│   ├── Docu Vault/                    # Agent-specific documentation
│   │   ├── README.md                  # Docu Vault index
│   │   ├── devops-tips-pitfalls.md   # DevOps knowledge
│   │   └── {other-docs}/             # Other documentation
│   └── Status Reports/                # Agent-specific status reports
│       └── {report-name}.md          # Status reports
│
└── {other-agents}/                    # Other agent folders...
```

---

## 🎯 Per-Agent Organization

Each Agent has its own folder containing **ALL** files related to that Agent:

### 1. **Role Description.md**

- Agent role and core responsibilities
- Technical skills required
- Common tasks and workflows
- Success criteria

### 2. **Instructions.md** (optional)

- Detailed instructions for specific tasks
- Step-by-step guides
- Advanced usage patterns

### 3. **Rules.mdc** (optional)

- Cursor IDE rules for this Agent
- Behavior constraints
- File system rules specific to this Agent

### 4. **Docu Vault/**

- MCP server research documentation
- DevOps tips and pitfalls
- Best practices
- Reference materials

### 5. **Status Reports/**

- Agent-specific status reports
- Audit reports
- Implementation summaries
- Validation reports

---

## 📋 Agent List

### Core Agents

- `mcp-bridge-specialist/` - MCP Bridge Orchestration & Protocol Specialist
- `docker-specialist/` - Docker & Container Management Specialist
- `docker-runtime-monitoring-and-debugging-specialist/` - Docker Runtime Monitoring
- `database-specialist/` - Multi-Database Management Specialist
- `git-github-specialist/` - Git & GitHub Specialist
- `ci-cd-specialist/` - CI/CD Specialist
- `api-testing-specialist/` - API Testing Specialist
- `n8n-integration-specialist/` - n8n Integration Specialist
- `mcp-specialist/` - MCP Specialist
- `doppler-credentials-specialist/` - Doppler Credentials Specialist
- `github-actions-specialist/` - GitHub Actions Specialist
- `status-report-specialist/` - Status Report Specialist
- `code-implementation-specialist/` - Code Implementation Specialist
- `frontend-pwa-mobile-specialist/` - Frontend PWA Mobile Specialist
- `ui-ux-mobile-app-specialist/` - UI/UX Mobile App Specialist
- `ai-role-instructions-specialist/` - AI Role Instructions Specialist
- `prd-tasklist-sync-specialist/` - PRD Tasklist Sync Specialist
- `repo-architecture-specialist/` - Repo Architecture Specialist
- `primary-development-agent/` - Primary Development Agent
- `architect-and-orchestrator/` - Architect & Orchestrator
- `agent-orchestrator/` - Agent Orchestrator
- `self-description-instruction/` - Self-Description Instruction
- `role-description-template/` - Role Description Template

---

## 🔍 Finding Agent Files

### To find all files for a specific Agent:

```bash
# Example: Find all files for Docker Specialist
ls -la "Agent Suite/docker-specialist/"
```

### To find a specific file type across all Agents:

```bash
# Example: Find all Role Description files
find "Agent Suite" -name "Role Description.md"

# Example: Find all Rules files
find "Agent Suite" -name "Rules.mdc"

# Example: Find all Status Reports
find "Agent Suite" -name "Status Reports" -type d
```

---

## 📚 Documentation Structure

### Docu Vault Requirements

Each Agent **MUST** maintain a Docu Vault with:

1. **MCP Research Documentation**
   - Thorough research of all MCP servers used
   - Official documentation references
   - Best practices and patterns
   - Real-world implementation examples

2. **DevOps Tips & Pitfalls**
   - Common deployment issues and solutions
   - Performance optimization strategies
   - Error handling patterns
   - Security best practices
   - Lessons learned from production

**Location:** `Agent Suite/{agent-name}/Docu Vault/`

---

## 🚀 Migration Notes

This structure was migrated from the previous organization:

- **Role Description files** → `Agent Suite/{agent-name}/Role Description.md`
- **Instructions files** → `Agent Suite/{agent-name}/Instructions.md`
- **Rules files** (from `.cursor/rules/`) → `Agent Suite/{agent-name}/Rules.mdc`
- **Docu Vault folders** (from `doc/`) → `Agent Suite/{agent-name}/Docu Vault/`
- **Status Reports** → `Agent Suite/{agent-name}/Status Reports/`

---

**Last Updated:** 2024-12-06  
**Maintained By:** All Agents
