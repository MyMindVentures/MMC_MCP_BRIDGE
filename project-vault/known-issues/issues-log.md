# 🐛 Known Issues & Solutions Log

**Purpose:** Document known issues, their solutions, and workarounds for the project.

---

## 📋 How to Use

### Before Troubleshooting

1. **Check this log FIRST** when encountering a problem
2. Search for similar issues
3. If found, use the documented solution
4. If not found, document the new issue after solving it

### After Solving a Problem

1. Document the issue in this log
2. Include: Problem description, solution, prevention
3. Update with date and Agent who solved it

---

## 🔍 Issues Log

### Entry Template

```markdown
## [YYYY-MM-DD] - {Issue Title}

**Date:** YYYY-MM-DD  
**Agent:** {Agent Name}  
**Status:** ✅ Resolved / 🔄 Workaround / ⚠️ Known Issue

### Problem

[Description of the issue]

### Solution

[How it was solved]

### Prevention

[How to avoid this in the future]

### Related

[Links to related issues or documentation]

---
```

---

## 📚 Issues

### [2024-12-06] - Terminal Output Not Visible in PowerShell Commands

**Date:** 2024-12-06  
**Agent:** Primary Development Agent  
**Status:** ⚠️ Known Issue - Workaround Documented

#### Problem

When executing PowerShell commands via `run_terminal_cmd` tool:
- Commands execute successfully (exit code 0)
- No output is visible in terminal responses
- Makes it difficult to see what commands are doing
- Affects all PowerShell commands, not just specific ones

**Symptoms:**
- `git status` executes but no output shown
- `git branch` executes but no output shown
- PowerShell commands work but output is not visible
- Bash commands in devcontainer work better

#### Solution

**Workaround:** Use explicit output redirection methods:

1. **Use `Out-String` for command output:**
   ```powershell
   git status | Out-String
   ```

2. **Use `Write-Output` for displaying results:**
   ```powershell
   $result = git status 2>&1; Write-Output $result
   ```

3. **Use `Write-Host` for status messages:**
   ```powershell
   Write-Host "Executing git status..." -ForegroundColor Cyan
   ```

4. **Use bash in devcontainer where possible:**
   ```bash
   git status  # Bash works directly
   ```

**Note:** ⚠️ **CRITICAL UPDATE:** Testing shows that even with all workarounds, terminal output is **still not visible**. This is a **fundamental limitation** of the `run_terminal_cmd` tool in this environment, not just PowerShell-specific.

**Alternative Solution:** Use file-based verification instead:
- Read files directly with `read_file`
- List directories with `list_dir`
- Write command output to files, then read files
- Use exit codes for success/failure verification

#### Prevention

- Always use explicit output methods for PowerShell commands
- Prefer bash commands in devcontainer when possible
- Use `Write-Host` for important status messages
- Capture output in variables and display explicitly

#### Related

- **Full Documentation:** `project-vault/TERMINAL_OUTPUT_FIX.md`
- **Cursor Rules:** `.cursor/rules/primary-development-agent.mdc`
- **Status Report:** `Agent Suite/git-github-specialist/Status Reports/TERMINAL_ISSUES_DIAGNOSIS.md`

### [2024-12-06] - GitHub Extension "Insufficient Funds" Error

**Date:** 2024-12-06  
**Agent:** Primary Development Agent  
**Status:** ⚠️ Known Issue - Workarounds Available

#### Problem

GitHub Extension "Review/Find Issues" functionaliteit faalt met error:
```
Failed to run review: insufficient funds (request ID: ...)
```

**Symptoms:**
- Review features werken niet
- Find Issues features werken niet
- Error suggereert funding/credits probleem
- Mogelijk gerelateerd aan GitHub Copilot abonnement

#### Solution

**Workarounds:**

1. **Check GitHub Copilot Status:**
   - Ga naar: https://github.com/settings/copilot
   - Verifieer abonnement en credits

2. **Configure Valid GitHub Extension Settings:**
   ```json
   {
     "githubPullRequests.remotes": ["origin", "upstream"],
     "githubPullRequests.defaultMergeMethod": "merge",
     "githubIssues.useBranchForIssues": true
   }
   ```
   **Note:** There is NO `enabled` setting. To disable, uninstall the extension.

3. **Use Alternatives:**
   - GitLens (gratis, al geïnstalleerd)
   - GitHub CLI (`gh` command)
   - GitHub web interface

4. **Re-authenticate:**
   - Sign out en sign in opnieuw
   - Verifieer GitHub permissions

#### Prevention

- Monitor GitHub Copilot usage
- Use free alternatives (GitLens, GitHub CLI)
- Keep extensions updated
- Document authentication setup

#### Related

- **Full Documentation:** `project-vault/known-issues/GITHUB_EXTENSION_INSUFFICIENT_FUNDS.md`
- **GitHub Copilot:** https://github.com/settings/copilot
- **GitLens:** Already installed, free alternative

### [2024-12-07] - MCP SSE Connection Error (NGHTTP2_REFUSED_STREAM)

**Date:** 2024-12-07  
**Agent:** Primary Development Agent  
**Status:** ⚠️ Known Issue - Solution Documented

#### Problem

MCP Bridge SSE connection faalt met error:
```
Error: ConnectError: [internal] Stream closed with error code NGHTTP2_REFUSED_STREAM
```

**Symptoms:**
- Cursor kan niet verbinden met MCP Bridge
- MCP servers niet beschikbaar
- Error: `NGHTTP2_REFUSED_STREAM`
- Server weigert HTTP/2 stream connection

#### Solution

**PRIMARY FIX: Disable Cloud Agents (This is the main cause!):**

```json
// In .cursor/settings.json
{
  "cursor.general.enableCloudAgents": false
}
```

**Then reload Cursor:**
- Command Palette: `Ctrl+Shift+P` → "Developer: Reload Window"

**If still not working, start Next.js server:**

```powershell
# Start development server
npm run dev

# Or for devcontainer
npm run dev:host

# Or with Docker
npm run docker:up:watch
```

**Verification:**
1. Cloud Agents disabled in settings
2. Check server responds: `curl http://localhost:3000/api/health`
3. Should return: `{"status":"ok",...}`
4. Reload Cursor window
5. MCP should connect automatically

**Alternative:** Use Railway production as fallback (already configured)

#### Prevention

- Always start server before using MCP
- Use health check endpoint to verify server
- Keep server running during development
- Monitor server logs for errors

#### Related

- **Full Documentation:** `project-vault/known-issues/MCP_SSE_CONNECTION_ERROR.md`
- **SSE Endpoint:** `app/api/sse/route.ts`
- **Health Endpoint:** `app/api/health/route.ts`

---

**Last Updated:** 2024-12-07  
**Maintained By:** All Agents
