# Git CLI Fix Plan

**Date:** 2024-12-06  
**Agent:** Git & GitHub Specialist  
**Status:** 🔴 Git Terminal Issues, ✅ Git MCP Available

---

## 🚨 Probleem

**Git terminal commando's falen:**

- `git status` ❌ (exit code -1)
- `git branch` ❌ (exit code -1)
- `git commit` ❌ (exit code -1)
- Alle git commando's falen zonder output

**Impact:**

- ⚠️ Kan geen branches beheren
- ⚠️ Kan geen commits maken
- ⚠️ Kan repository status niet checken
- ⚠️ Kan geen Git operaties uitvoeren via terminal

---

## ✅ Oplossing: Terminal First, MCP als Fallback

**Terminal First Approach:**

1. Probeer eerst terminal commando's (`git status`, `git branch`, etc.)
2. Als terminal niet werkt → Gebruik Git MCP Server als fallback

**Goed nieuws:** Git MCP server is volledig geconfigureerd met 17+ tools als backup!

### Git MCP Tools Beschikbaar

**Basic Operations:**

- `status` - Get git status
- `log` - Get commit log
- `commit` - Commit changes
- `push` - Push to remote
- `pull` - Pull from remote
- `clone` - Clone repository

**Branch Operations:**

- `branch` - Manage branches (list/create/delete/checkout/switch)

**Diff Operations:**

- `diff` - Show differences
- `diffSummary` - Get diff summary

**Stash Operations:**

- `stash` - Stash operations (save/pop/list/clear/drop)

**Tag Operations:**

- `tag` - Tag operations (list/create/delete)

**Remote Operations:**

- `remote` - Remote operations (list/add/remove/get-url)

**Merge & Rebase:**

- `merge` - Merge branches
- `rebase` - Rebase branches

**Reset:**

- `reset` - Reset to commit

**Advanced:**

- `blame` - Blame file
- `show` - Show commit

---

## 🛠️ Gebruik Git MCP

### API Endpoint

```
POST /api/mcp/git/{tool}
```

### Authentication

```bash
Authorization: Bearer $MCP_BRIDGE_API_KEY
```

### Voorbeelden

#### 1. Check Repository Status

```bash
curl -X POST http://localhost:3000/api/mcp/git/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{"path": "/workspaces/MMC_MCP_BRIDGE"}'
```

#### 2. List Branches

```bash
curl -X POST http://localhost:3000/api/mcp/git/branch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{"action": "list", "path": "/workspaces/MMC_MCP_BRIDGE"}'
```

#### 3. Create Branch

```bash
curl -X POST http://localhost:3000/api/mcp/git/branch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{"action": "create", "name": "feature/test", "path": "/workspaces/MMC_MCP_BRIDGE"}'
```

#### 4. Commit Changes

```bash
curl -X POST http://localhost:3000/api/mcp/git/commit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{
    "message": "feat: description",
    "files": ["file1.ts", "file2.ts"],
    "path": "/workspaces/MMC_MCP_BRIDGE"
  }'
```

#### 5. Push to Remote

```bash
curl -X POST http://localhost:3000/api/mcp/git/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{
    "remote": "origin",
    "branch": "main",
    "path": "/workspaces/MMC_MCP_BRIDGE"
  }'
```

#### 6. Get Commit Log

```bash
curl -X POST http://localhost:3000/api/mcp/git/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_BRIDGE_API_KEY" \
  -d '{"limit": 10, "path": "/workspaces/MMC_MCP_BRIDGE"}'
```

---

## 📋 Actie Plan

### Stap 1: Verifieer MCP Bridge

1. Check health endpoint: `GET /api/health`
2. Check available servers: `GET /api/servers`
3. Verifieer Git server is enabled

### Stap 2: Test Git MCP Tools

1. Test `git/status` - Check repository status
2. Test `git/branch` (list) - List branches
3. Test `git/log` - Get commit history

### Stap 3: Gebruik Git MCP voor Alle Operaties

**Vervang alle terminal git commando's met MCP API calls:**

- ❌ `git status` → ✅ `POST /api/mcp/git/status`
- ❌ `git branch -a` → ✅ `POST /api/mcp/git/branch` (action: list)
- ❌ `git checkout -b feature/name` → ✅ `POST /api/mcp/git/branch` (action: create)
- ❌ `git commit -m "message"` → ✅ `POST /api/mcp/git/commit`
- ❌ `git push origin main` → ✅ `POST /api/mcp/git/push`

### Stap 4: Update Workflow Documentatie

- Update Instructions.md met MCP-based Git workflow
- Update status reports met MCP usage examples
- Document alle Git operaties via MCP

---

## ✅ Voordelen van Git MCP

1. **Werkt zonder terminal** - HTTP API calls
2. **Alle Git operaties beschikbaar** - 17+ tools
3. **Al geconfigureerd** - Ready to use
4. **Geen shell issues** - Bypass terminal problems
5. **Consistent** - Zelfde API als andere MCP servers

---

## 🎯 Conclusie

**Git terminal werkt niet, maar Git MCP is volledig beschikbaar!**

**Gebruik Git MCP voor alle Git operaties:**

- Branches beheren
- Commits maken
- Repository status checken
- Alle Git operaties

**Status:** ✅ Git MCP Ready - Gebruik HTTP API in plaats van terminal

---

**Last Updated:** 2024-12-06  
**Next Action:** Test Git MCP tools en update workflow documentatie
