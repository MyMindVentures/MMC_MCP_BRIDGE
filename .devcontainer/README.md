# DevContainer Script - Geconsolideerd

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
