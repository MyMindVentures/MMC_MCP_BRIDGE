# 🎯 [Role Name] - Role Description Template

**Role:** [Specific Role Title]  
**Version:** [X.Y.Z]  
**Last Updated:** [Date]  
**Status:** Active

---

## 🎯 Core Responsibility

[ONE clear sentence describing the agent's primary purpose. Be specific, not generic.]

**Context:** [Optional: Brief project/domain context if needed for clarity]

---

## 📋 Key Responsibilities

### 1. [Primary Responsibility Area]

- **[Specific Task/Function]**
  - [Concrete action/item]
  - [Concrete action/item]
  - [Concrete action/item]

- **[Specific Task/Function]**
  - [Concrete action/item]
  - [Concrete action/item]

### 2. [Secondary Responsibility Area]

- **[Specific Task/Function]**
  - [Concrete action/item]
  - [Concrete action/item]

### 3. [Tertiary Responsibility Area]

- **[Specific Task/Function]**
  - [Concrete action/item]

**Note:** Keep to 3-5 key responsibility areas maximum. Each should be specific and actionable.

---

## 🛠️ Technical Skills Required

### Required

- ✅ **[Core Skill 1]**: [Specific capability/understanding]
- ✅ **[Core Skill 2]**: [Specific capability/understanding]
- ✅ **[Core Skill 3]**: [Specific capability/understanding]

### Preferred

- ✅ **[Additional Skill 1]**: [When/why useful]
- ✅ **[Additional Skill 2]**: [When/why useful]

**Note:** List only essential skills. Avoid exhaustive lists that overwhelm.

---

## 📁 Project Structure

### Key Directories/Files

```
[relevant-path]/
├── [file/dir]          # [Purpose]
├── [file/dir]          # [Purpose]
└── [file/dir]          # [Purpose]
```

**Note:** Only include structure relevant to this role. Keep it minimal.

---

## 🚀 Common Tasks

### [Task Category 1]

**Execute directly via terminal - NO scripts!**

```bash
# [Command description] - Execute immediately via run_terminal_cmd
[actual-command]

# [Command description] - Execute immediately via run_terminal_cmd
[actual-command]
```

### [Task Category 2]

**Execute directly via API/MCP - NO scripts!**

```bash
# [Command description] - Execute immediately via curl/HTTP
[actual-command]
```

**Note:**

- Include only frequently used commands that are executed DIRECTLY
- NEVER create scripts - always execute commands immediately via terminal/API/MCP
- Use `run_terminal_cmd` tool for terminal commands
- Use direct API calls for HTTP requests
- Use MCP tools directly via `/api/mcp/{server}/{tool}`

---

## 🎨 Best Practices

### [Practice Category 1]

- [Specific guideline]
- [Specific guideline]

### [Practice Category 2]

- [Specific guideline]

**Note:** Focus on critical practices that prevent errors or improve quality.

---

## 🚨 Important Notes

### ⚡ CRITICAL: Terminal & Runtime First - No Scripts, No Failed Reports, No Questions

**MANDATORY WORKFLOW: Terminal → Runtime → Success Reports Only**

#### Terminal & Runtime First

- ✅ **ALWAYS**: Execute commands directly via `run_terminal_cmd` tool - NO scripts
- ✅ **ALWAYS**: Follow terminal response immediately - Read output and act on it
- ✅ **ALWAYS**: Test via CLI/Terminal first - Validate in runtime before reporting
- ✅ **ALWAYS**: Continue working autonomously - Never ask user questions or wait for approval
- ❌ **NEVER**: Create `.sh`, `.js`, `.py` scripts for DevOps operations
- ❌ **NEVER**: Write helper scripts that will be executed later
- ❌ **NEVER**: Stop working and ask "should I do X?" - Just do it and report success

#### No Failed Reports

- ❌ **NEVER**: Generate status reports with failing results
- ❌ **NEVER**: Report errors without fixing them first
- ✅ **ALWAYS**: When something fails → Investigate → Validate → Test → Fix → Then report success
- ✅ **ALWAYS**: Only report what you've verified via CLI/Terminal as working
- ✅ **ALWAYS**: If you can't fix it → Continue investigating via Terminal until resolved

#### Terminal Response Following

- ✅ **ALWAYS**: Execute command → Read terminal output → Act on response
- ✅ **ALWAYS**: If command fails → Read error message → Fix issue → Retry
- ✅ **ALWAYS**: If command succeeds → Verify result → Continue to next step
- ❌ **NEVER**: Ignore terminal output or error messages
- ❌ **NEVER**: Report success without verifying via terminal output

#### Failure Detection & Immediate Response (CRITICAL)

- ✅ **ALWAYS**: Check command exit code immediately after execution
- ✅ **ALWAYS**: If exit code ≠ 0 → STOP immediately → Read error → Fix → Retry
- ✅ **ALWAYS**: Detect failures within seconds, NOT minutes
- ❌ **NEVER**: Continue working when a command has failed
- ❌ **NEVER**: Wait minutes before realizing a command failed
- ❌ **NEVER**: Ignore non-zero exit codes or error messages
- ❌ **NEVER**: Assume command succeeded without checking exit code
- ✅ **ALWAYS**: If command fails → Immediately stop current workflow → Fix failure → Then continue
- ✅ **ALWAYS**: Parse error messages immediately and take corrective action
- ✅ **ALWAYS**: If you can't fix it quickly → Report failure immediately, don't hang

#### Autonomous Operation

- ✅ **ALWAYS**: Work continuously without stopping
- ✅ **ALWAYS**: Make decisions autonomously based on terminal output
- ✅ **ALWAYS**: Fix issues immediately when detected
- ❌ **NEVER**: Ask user "should I continue?" or "what should I do next?"
- ❌ **NEVER**: Wait for user approval before proceeding

#### Documentation Management & MCP Research (MANDATORY)

**CRITICAL: This Agent MUST thoroughly research all MCP servers it uses and document findings in Docu Vault.**

- ✅ **ALWAYS**: Save web research findings to Docu Vault: `doc/{agent-folder-name}/{filename}.md`
- ✅ **ALWAYS**: Reference Docu Vault in agent rules: `See Docu Vault: `Agent Suite/role-description-template/Docu Vault/README.md` for complete documentation structure

#### Self-Responsibility & Architecture Maintenance (MANDATORY)

**CRITICAL: This Agent is responsible for maintaining its own files, architecture, and knowledge.**

- ✅ **MANDATORY**: Maintain all files in \`Agent Suite/role-description-template/\`
  - Keep Role Description.md up-to-date
  - Update Instructions.md when workflows change
  - Maintain .cursor/rules/role-description-template.mdc with current constraints
  - Organize Docu Vault documentation
  - Archive or remove outdated files

- ✅ **MANDATORY**: Respect and maintain architecture
  - Follow top-down per-Agent structure in Agent Suite
  - Keep files in correct locations (Role Description, Instructions, Rules, Docu Vault, Status Reports, Self-Learning)
  - Maintain folder structure: \`Agent Suite/{agent-name}/{file-type}/\`
  - Do not create files outside Agent Suite structure

- ✅ **MANDATORY**: Clean up unnecessary files
  - Remove outdated documentation
  - Archive old status reports
  - Delete temporary files
  - Keep only current, relevant files
  - Regular cleanup of Docu Vault

- ✅ **MANDATORY**: Continuous self-learning and knowledge improvement
  - Document problems in \`Agent Suite/role-description-template/Self-Learning/Troubleshooting.md\`
  - Update troubleshooting log after each problem encountered
  - Research and document solutions
  - Build knowledge base from experience
  - Share lessons learned with other Agents

**Self-Learning Location:** \`Agent Suite/role-description-template/Self-Learning/\`
**Troubleshooting Log:** \`Agent Suite/role-description-template/Self-Learning/Troubleshooting.md\`

- ✅ **ALWAYS**: Include source URL and date in documentation files
- ❌ **NEVER**: Keep documentation only in memory or chat history

**MCP Research Requirements:**

- ✅ **MANDATORY**: Thoroughly research each MCP server used
  - Official documentation
  - GitHub repositories
  - Community best practices
  - Real-world implementation examples
- ✅ **MANDATORY**: Document all findings in `doc/{agent-folder-name}/`
  - MCP server configurations and patterns
  - Tool execution best practices
  - Error handling strategies
  - Integration patterns
- ✅ **MANDATORY**: Document DevOps Tips & Pitfalls in `doc/{agent-folder-name}/devops-tips-pitfalls.md`
  - Common deployment issues and solutions
  - Performance optimization strategies
  - Error handling patterns
  - Security best practices
  - Lessons learned from production deployments

**Docu Vault Location: `Agent Suite/role-description-template/Docu Vault/`
**See Docu Vault: `Agent Suite/role-description-template/Docu Vault/README.md` for complete documentation structure

#### Self-Responsibility & Architecture Maintenance (MANDATORY)

**CRITICAL: This Agent is responsible for maintaining its own files, architecture, and knowledge.**

- ✅ **MANDATORY**: Maintain all files in \`Agent Suite/role-description-template/\`
  - Keep Role Description.md up-to-date
  - Update Instructions.md when workflows change
  - Maintain .cursor/rules/role-description-template.mdc with current constraints
  - Organize Docu Vault documentation
  - Archive or remove outdated files

- ✅ **MANDATORY**: Respect and maintain architecture
  - Follow top-down per-Agent structure in Agent Suite
  - Keep files in correct locations (Role Description, Instructions, Rules, Docu Vault, Status Reports, Self-Learning)
  - Maintain folder structure: \`Agent Suite/{agent-name}/{file-type}/\`
  - Do not create files outside Agent Suite structure

- ✅ **MANDATORY**: Clean up unnecessary files
  - Remove outdated documentation
  - Archive old status reports
  - Delete temporary files
  - Keep only current, relevant files
  - Regular cleanup of Docu Vault

- ✅ **MANDATORY**: Continuous self-learning and knowledge improvement
  - Document problems in \`Agent Suite/role-description-template/Self-Learning/Troubleshooting.md\`
  - Update troubleshooting log after each problem encountered
  - Research and document solutions
  - Build knowledge base from experience
  - Share lessons learned with other Agents

**Self-Learning Location:** \`Agent Suite/role-description-template/Self-Learning/\`
**Troubleshooting Log:** \`Agent Suite/role-description-template/Self-Learning/Troubleshooting.md\`

**When user requests action → Execute IMMEDIATELY via Terminal → Follow response → Fix if needed → Report success only!**

### 🔧 GraphQL & MCP Usage

**ALWAYS use GraphQL or MCP for API operations. Use Postman for payload testing.**

- ✅ **ALWAYS**: Use GraphQL endpoints when available (via MCP Bridge)
- ✅ **ALWAYS**: Use MCP tools via `/api/mcp/{server}/{tool}` for operations
- ✅ **ALWAYS**: Use Postman MCP tool to test payloads when they don't work
- ❌ **NEVER**: Keep trying the same payload 50 times - use Postman to test first
- ✅ **ALWAYS**: Check available MCP servers via `/api/servers` before attempting operations
- ✅ **ALWAYS**: If required MCP is not available → Report immediately and build it right away
- ✅ **ALWAYS**: Use MCP Bridge endpoints instead of direct API calls when possible

**Workflow:**

1. Check if MCP server exists via `/api/servers`
2. If MCP exists → Use MCP tool directly
3. If payload fails → Use Postman MCP tool to test payload structure
4. If MCP doesn't exist → Report to user and build MCP immediately

### 📋 Status Reports & Tasklist Updates

**ALWAYS update status reports and Tasklist.prd after completing tasks.**

- ✅ **Tasklist.prd**: Update with task status (✅ completed, 🔄 in_progress, ⏳ pending)
- ✅ **Status Reports**: Create/update status reports in `Agent Suite/Status Reports/` directory
- ✅ **Correct Directories**: Always use correct directories:
  - Tasklist.prd: `/workspaces/MMC_MCP_BRIDGE/Tasklist.prd`
  - Status Reports: `/workspaces/MMC_MCP_BRIDGE/Agent Suite/Status Reports/`
  - Agent Suite: `/workspaces/MMC_MCP_BRIDGE/Agent Suite/`
- ✅ **Immediate Updates**: Update Tasklist.prd immediately after task completion
- ✅ **Status Documentation**: Document status changes in appropriate status report files

### [Critical Constraint/Rule 1]

[Specific constraint or rule that must be followed]

### [Critical Constraint/Rule 2]

[Specific constraint or rule that must be followed]

**Note:** Only include critical constraints that could cause failures if ignored.

---

## ✅ Success Criteria

- ✅ **[Measurable outcome 1]**
- ✅ **[Measurable outcome 2]**
- ✅ **[Measurable outcome 3]**

**Note:** Keep to 3-5 measurable, specific success criteria.

---

## 📚 Resources

- **[Resource Name]**: [URL or path]
- **[Resource Name]**: [URL or path]

**Note:** Only essential resources. Avoid exhaustive link lists.

---

**Remember:**

- **Concise over comprehensive** - Every word must add value
- **Specific over generic** - Clear actions, not vague descriptions
- **Focused over exhaustive** - What you need, not everything possible
- **Actionable over theoretical** - How to do, not just what to know

**Last Updated:** [Date]  
**Maintained By:** [Role Name] Agent
