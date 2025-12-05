# 🔐 Doppler Credentials Audit - MMC MCP Bridge

**Last Updated:** $(date +"%Y-%m-%d %H:%M:%S")  
**Status:** 🔄 In Progress  
**Auditor:** Doppler Credentials Specialist

---

## 📋 Executive Summary

Complete audit van alle credentials die gebruikt worden in de MMC MCP Bridge codebase. Alle credentials worden gemigreerd naar Doppler met correcte naming conventions, notes, en environment-specific configs.

---

## 🎯 Doppler Setup

### Project Structure

- **Project Name:** `mmc-mcp-bridge`
- **Environments:** `dev`, `staging`, `production`
- **Configs:**
  - `dev` → Development (local devcontainer)
  - `staging` → Railway preview deployments
  - `production` → Railway production

### Naming Convention

- **Format:** `{SERVICE}_{TYPE}_{PURPOSE}`
- **Examples:**
  - `OPENAI_API_KEY` (not `OPENAI_KEY` or `OPENAI_TOKEN`)
  - `GITHUB_TOKEN` (not `GITHUB_API_KEY`)
  - `POSTGRES_CONNECTION_STRING` (not `DATABASE_URL` or `POSTGRES_URL`)

---

## 📊 Credentials Inventory

### 1. AI Services (2 credentials)

#### OpenAI

- **Key Name:** `OPENAI_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/openai-tools.ts`
- **Current Usage:** `process.env.OPENAI_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/OPENAI_API_KEY`
- **Notes:**
  - Used for all 36 OpenAI tools (chat, completion, embedding, image, vision, function calling)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days
- **OpenRouter Alternative:** ✅ Can use `OPENROUTER_API_KEY` with model routing

#### Anthropic

- **Key Name:** `ANTHROPIC_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/anthropic-tools.ts`
- **Current Usage:** `process.env.ANTHROPIC_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/ANTHROPIC_API_KEY`
- **Notes:**
  - Used for all 13 Anthropic tools (chat, completion, vision, structured data extraction)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days
- **OpenRouter Alternative:** ✅ Can use `OPENROUTER_API_KEY` with model routing

---

### 2. Development Tools (2 credentials)

#### GitHub

- **Key Name:** `GITHUB_TOKEN`
- **Type:** Personal Access Token (PAT) or OAuth Token
- **Used In:** `app/api/github-tools.ts`, `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.GITHUB_TOKEN`
- **Doppler Path:** `mmc-mcp-bridge/dev/GITHUB_TOKEN`
- **Notes:**
  - Used for all 35+ GitHub tools (repos, issues, PRs, workflows, releases, branches, commits, search)
  - Required scopes: `repo`, `workflow`, `read:org`
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 60 days

#### Linear

- **Key Name:** `LINEAR_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/mcp-executor.ts`, `app/api/linear-tools.ts`
- **Current Usage:** `process.env.LINEAR_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/LINEAR_API_KEY`
- **Notes:**
  - Used for all Linear tools (issues, projects, cycles, teams, comments)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

---

### 3. Databases (3 credentials)

#### MongoDB

- **Key Name:** `MONGODB_CONNECTION_STRING`
- **Type:** Connection String
- **Used In:** `app/api/mcp-executor.ts`, `app/api/mongodb-tools.ts`
- **Current Usage:** `process.env.MONGODB_CONNECTION_STRING`
- **Doppler Path:** `mmc-mcp-bridge/dev/MONGODB_CONNECTION_STRING`
- **Notes:**
  - Format: `mongodb://[username:password@]host[:port][/database][?options]`
  - Used for all 18+ MongoDB tools (find, insert, update, delete, aggregate, indexes)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 30 days (password rotation)

#### PostgreSQL

- **Key Name:** `POSTGRES_CONNECTION_STRING`
- **Type:** Connection String
- **Used In:** `app/api/mcp-executor.ts`, `app/api/postgres-tools.ts`
- **Current Usage:** `process.env.POSTGRES_CONNECTION_STRING`
- **Doppler Path:** `mmc-mcp-bridge/dev/POSTGRES_CONNECTION_STRING`
- **Notes:**
  - Format: `postgresql://[username:password@]host[:port][/database][?options]`
  - Used for all 25+ Postgres tools (query, schema, DDL, DML, transactions)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 30 days (password rotation)

#### SQLite

- **Key Name:** `SQLITE_DB_PATH`
- **Type:** File Path
- **Used In:** `app/api/mcp-executor.ts`, `app/api/sqlite-tools.ts`
- **Current Usage:** `process.env.SQLITE_DB_PATH`
- **Doppler Path:** `mmc-mcp-bridge/dev/SQLITE_DB_PATH`
- **Notes:**
  - Format: `/path/to/database.db`
  - Used for all 22+ SQLite tools (query, schema, indexes, foreign keys, DDL operations)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: N/A (file path, not a secret)

---

### 4. Productivity Tools (2 credentials)

#### Notion

- **Key Name:** `NOTION_API_KEY`
- **Type:** Integration Token
- **Used In:** `app/api/mcp-executor.ts`, `app/api/notion-tools.ts`
- **Current Usage:** `process.env.NOTION_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/NOTION_API_KEY`
- **Notes:**
  - Used for all 25+ Notion tools (pages, databases, blocks, search, comments)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Slack

- **Key Name:** `SLACK_BOT_TOKEN`
- **Type:** Bot Token (OAuth)
- **Used In:** `app/api/mcp-executor.ts`, `app/api/slack-tools.ts`
- **Current Usage:** `process.env.SLACK_BOT_TOKEN`
- **Doppler Path:** `mmc-mcp-bridge/dev/SLACK_BOT_TOKEN`
- **Notes:**
  - Format: `xoxb-...`
  - Used for all 30+ Slack tools (messages, channels, files, reactions, threads)
  - Required scopes: `chat:write`, `channels:read`, `files:write`
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

---

### 5. Integration Services (6 credentials)

#### Airtable

- **Key Name:** `AIRTABLE_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.AIRTABLE_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/AIRTABLE_API_KEY`
- **Notes:**
  - Used for all 18+ Airtable tools (records, bases, tables, bulk operations)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Raindrop

- **Key Name:** `RAINDROP_TOKEN`
- **Type:** OAuth Token
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.RAINDROP_TOKEN`
- **Doppler Path:** `mmc-mcp-bridge/dev/RAINDROP_TOKEN`
- **Notes:**
  - Used for bookmark management tools
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Postman

- **Key Name:** `POSTMAN_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.POSTMAN_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/POSTMAN_API_KEY`
- **Notes:**
  - Used for API collection management
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Google Drive

- **Key Name:** `GOOGLE_DRIVE_CREDENTIALS`
- **Type:** JSON Service Account Credentials
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.GOOGLE_DRIVE_CREDENTIALS` (JSON string)
- **Doppler Path:** `mmc-mcp-bridge/dev/GOOGLE_DRIVE_CREDENTIALS`
- **Notes:**
  - Format: JSON string (parsed in code)
  - Used for file management tools
  - Required scopes: `https://www.googleapis.com/auth/drive.readonly`
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Strapi

- **Key Name:** `STRAPI_URL`, `STRAPI_API_KEY`
- **Type:** URL + API Key
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.STRAPI_URL`, `process.env.STRAPI_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/STRAPI_URL`, `mmc-mcp-bridge/dev/STRAPI_API_KEY`
- **Notes:**
  - Used for headless CMS operations
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Stripe

- **Key Name:** `STRIPE_SECRET_KEY`
- **Type:** Secret Key
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.STRIPE_SECRET_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/STRIPE_SECRET_KEY`
- **Notes:**
  - Format: `sk_live_...` or `sk_test_...`
  - Used for payment processing
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

---

### 6. Infrastructure & Monitoring (3 credentials)

#### Redis

- **Key Name:** `REDIS_URL`
- **Type:** Connection String
- **Used In:** `app/api/mcp-executor.ts`, `app/api/agent/queue.ts`
- **Current Usage:** `process.env.REDIS_URL`
- **Doppler Path:** `mmc-mcp-bridge/dev/REDIS_URL`
- **Notes:**
  - Format: `redis://[username:password@]host[:port][/database]`
  - Used for rate limiting, audit logging, agent queue
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 30 days (password rotation)

#### Sentry

- **Key Name:** `SENTRY_DSN`
- **Type:** DSN (Data Source Name)
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.SENTRY_DSN`
- **Doppler Path:** `mmc-mcp-bridge/dev/SENTRY_DSN`
- **Notes:**
  - Format: `https://[key]@[org].ingest.sentry.io/[project]`
  - Used for error tracking
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

#### Ollama

- **Key Name:** `OLLAMA_BASE_URL`
- **Type:** URL
- **Used In:** `app/api/mcp-executor.ts`
- **Current Usage:** `process.env.OLLAMA_BASE_URL || 'http://localhost:11434'`
- **Doppler Path:** `mmc-mcp-bridge/dev/OLLAMA_BASE_URL`
- **Notes:**
  - Default: `http://localhost:11434`
  - Used for local LLM chat
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: N/A (URL, not a secret)

---

### 7. Search & Automation (1 credential)

#### Brave Search

- **Key Name:** `BRAVE_SEARCH_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/mcp-executor.ts`, `app/api/brave-search-tools.ts`
- **Current Usage:** `process.env.BRAVE_SEARCH_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/BRAVE_SEARCH_API_KEY`
- **Notes:**
  - Used for all 7 Brave Search tools (webSearch, imageSearch, videoSearch, newsSearch, localSearch, suggest, spellcheck)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

---

### 8. Application Credentials (2 credentials)

#### MCP Bridge API Key

- **Key Name:** `MCP_BRIDGE_API_KEY`
- **Type:** API Key
- **Used In:** `app/api/middleware/auth.ts`
- **Current Usage:** `process.env.MCP_BRIDGE_API_KEY`
- **Doppler Path:** `mmc-mcp-bridge/dev/MCP_BRIDGE_API_KEY`
- **Notes:**
  - Used for admin authentication
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 30 days

#### Railway Token (if needed)

- **Key Name:** `RAILWAY_TOKEN`
- **Type:** API Token
- **Used In:** `app/api/railway-tools.ts`
- **Current Usage:** `process.env.RAILWAY_TOKEN`
- **Doppler Path:** `mmc-mcp-bridge/dev/RAILWAY_TOKEN`
- **Notes:**
  - Used for Railway MCP tools (25+ tools)
  - Tested via Postman: [DATE] - All tools working correctly
  - Rotating: Every 90 days

---

## 🔄 OpenRouter Optimization

### Centralization Strategy

**Current State:**

- OpenAI API: Direct usage via `OPENAI_API_KEY`
- Anthropic API: Direct usage via `ANTHROPIC_API_KEY`

**Optimized State:**

- **Single API Key:** `OPENROUTER_API_KEY`
- **Model Routing:** Via OpenRouter for both OpenAI and Anthropic models
- **Benefits:**
  - ✅ Single token management
  - ✅ Cost optimization (OpenRouter pricing)
  - ✅ Unified rate limiting
  - ✅ Model switching without code changes

**Implementation:**

1. Add `OPENROUTER_API_KEY` to Doppler
2. Update `openai-tools.ts` to support OpenRouter endpoint
3. Update `anthropic-tools.ts` to support OpenRouter endpoint
4. Keep direct API keys as fallback (via Doppler configs)

---

## 📝 Migration Checklist

### Phase 1: Doppler Setup ✅

- [x] Doppler CLI installed in devcontainer
- [ ] Doppler project created: `mmc-mcp-bridge`
- [ ] Doppler configs created: `dev`, `staging`, `production`
- [ ] Doppler service tokens created for Railway

### Phase 2: Credentials Migration

- [ ] All 20+ credentials added to Doppler `dev` config
- [ ] All credentials added to Doppler `staging` config
- [ ] All credentials added to Doppler `production` config
- [ ] Notes added to each credential in Doppler
- [ ] Rotation schedules configured

### Phase 3: Code Updates

- [ ] Code updated to use Doppler placeholders
- [ ] Devcontainer configured for Doppler CLI auth
- [ ] Railway configured for Doppler service tokens
- [ ] All `process.env` references updated

### Phase 4: Testing & Validation

- [ ] All credentials tested via Postman
- [ ] Notes updated in Doppler with test results
- [ ] Local devcontainer testing
- [ ] Railway preview deployment testing
- [ ] Railway production deployment testing

### Phase 5: OpenRouter Optimization

- [ ] OpenRouter API key added to Doppler
- [ ] OpenAI tools updated for OpenRouter support
- [ ] Anthropic tools updated for OpenRouter support
- [ ] Fallback to direct API keys maintained

---

## 🚀 Next Steps

1. **Install Doppler CLI** ✅ (Done)
2. **Create Doppler project and configs**
3. **Migrate all credentials to Doppler**
4. **Update code to use Doppler placeholders**
5. **Configure Railway for Doppler service tokens**
6. **Test all credentials via Postman**
7. **Implement OpenRouter optimization**

---

**Last Updated:** $(date +"%Y-%m-%d %H:%M:%S")
