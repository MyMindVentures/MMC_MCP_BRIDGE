# DevContainer - Full Stack Integrated App

**MMC MCP Bridge** is een Full Stack Integrated App - alle features geïntegreerd in één container:

- **26+ MCP Servers** (databases, AI, dev tools, productivity)
- **n8n bidirectional integration** (backend ↔ n8n workflows)
- **Agentic AI orchestration** (multi-step agent execution)
- **Frontend met i18n** (10 talen support)
- **Agent Suite** (specialisten voor alle aspecten)

Alle devcontainer automatisering is geconsolideerd in één script: `devcontainer.sh`

## Gebruik

```bash
# Help
devcontainer.sh help

# Setup (runs all setup tasks)
devcontainer.sh setup

# Git workflow
devcontainer.sh git set-feature "feature-name"
devcontainer.sh git commit "message"
devcontainer.sh git force-commit "message"
devcontainer.sh git status
devcontainer.sh git ensure-branch

# Feature tracking
devcontainer.sh feature update
devcontainer.sh feature detect

# Settings
devcontainer.sh settings save
devcontainer.sh settings restore

# Docker
devcontainer.sh docker-install

# Extensions
devcontainer.sh extensions

# Todos
devcontainer.sh todos

# Dev server
devcontainer.sh dev-start

# Container management
devcontainer.sh container dev-start

# Background daemons
devcontainer.sh daemon git-watcher &
devcontainer.sh daemon todos-sync &
```

## Voordelen

- ✅ **Geen kettingeffecten** - Alles in één script
- ✅ **Eenvoudig onderhoud** - Alle logica op één plek
- ✅ **Geen dependencies** - Scripts roepen elkaar niet meer aan
- ✅ **Duidelijke structuur** - Commando's georganiseerd per categorie

## Full Stack App Features

Deze devcontainer bevat alle tools en dependencies voor de Full Stack Integrated App:

### MCP Servers (26+)

- **Databases**: PostgreSQL, MongoDB, SQLite
- **AI Services**: OpenAI, Anthropic
- **Dev Tools**: Git, GitHub, Railway, Filesystem
- **Productivity**: Notion, Slack, Linear, n8n
- **Automation**: Playwright, Puppeteer, Brave Search, Ollama
- **Integration**: Stripe, Airtable, Google Drive, Raindrop, Postman
- **Infrastructure**: Doppler, Sentry, Strapi

### App Components

- **Backend**: Next.js API routes (`/app/api/`)
- **Frontend**: Next.js met i18n (`/app/[locale]/`)
- **MCP Bridge**: SSE endpoint (`/api/sse`), HTTP bridge (`/api/mcp`), Agent orchestration (`/api/agent`)
- **n8n Integration**: Workflow schema generator, bidirectional sync
- **Agent Suite**: Specialisten voor alle aspecten van de app

### Development Tools

- **Hot Reload**: Docker Compose Watch voor automatische file sync
- **TypeScript**: Full type checking
- **Docker CLI**: Voor container management
- **Dagger CLI**: Voor CI/CD pipelines
- **Doppler CLI**: Voor credentials management
- **1Password CLI**: Voor secrets
- **Playwright**: Voor E2E testing

## Oude Scripts

Alle oude scripts zijn verwijderd en geconsolideerd:

- ~~auto-git-workflow.sh~~ → `devcontainer.sh git`
- ~~feature-tracker.sh~~ → `devcontainer.sh feature`
- ~~git-watcher.sh~~ → `devcontainer.sh daemon git-watcher`
- ~~sync-todos.sh~~ → `devcontainer.sh daemon todos-sync`
- ~~install-docker-cli.sh~~ → `devcontainer.sh docker-install`
- ~~install-extensions.sh~~ → `devcontainer.sh extensions`
- ~~persist-settings.sh~~ → `devcontainer.sh settings`
- ~~start-dev.sh~~ → `devcontainer.sh dev-start`
- ~~start-local-dev.sh~~ → `devcontainer.sh container dev-start`
