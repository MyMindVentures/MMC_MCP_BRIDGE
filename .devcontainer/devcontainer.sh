#!/bin/bash
# Consolidated DevContainer Management Script
# All devcontainer automation in one script - no chain dependencies
# Usage: devcontainer.sh [command] [args...]

set -e

PROJECT_ROOT="/workspaces/MMC_MCP_BRIDGE"
PERSIST_DIR="/workspaces/.devcontainer-persist"
TODOS_FILE="$PROJECT_ROOT/Tasklist.prd"
CURRENT_FEATURE_FILE="$PERSIST_DIR/current-feature.txt"
GIT_CONFIG_FILE="$PERSIST_DIR/git-workflow-config.json"
LAST_COMMIT_FILE="$PERSIST_DIR/last-git-commit.txt"
SETTINGS_FILE="$PERSIST_DIR/settings.json"
DOPPLER_CONFIG="$PERSIST_DIR/doppler-config.json"
GITHUB_CONFIG="$PERSIST_DIR/github-config.json"
TODO_SYNC_DIR="$PERSIST_DIR/todos"

cd "$PROJECT_ROOT"
mkdir -p "$PERSIST_DIR" "$TODO_SYNC_DIR" 2>/dev/null || true

# ============================================================================
# GIT WORKFLOW FUNCTIONS
# ============================================================================

init_git_config() {
  if [ ! -f "$GIT_CONFIG_FILE" ]; then
    cat > "$GIT_CONFIG_FILE" <<EOF
{
  "autoCommit": true,
  "autoPush": true,
  "commitMessageTemplate": "feat: {description}",
  "branchPrefix": "feature"
}
EOF
  fi
}

load_git_config() {
  AUTO_COMMIT=$(jq -r '.autoCommit // true' "$GIT_CONFIG_FILE" 2>/dev/null || echo "true")
  AUTO_PUSH=$(jq -r '.autoPush // true' "$GIT_CONFIG_FILE" 2>/dev/null || echo "true")
  BRANCH_PREFIX=$(jq -r '.branchPrefix // "feature"' "$GIT_CONFIG_FILE" 2>/dev/null || echo "feature")
}

get_current_feature() {
  if [ -f "$CURRENT_FEATURE_FILE" ]; then
    local feature=$(cat "$CURRENT_FEATURE_FILE" | head -1 | tr -d '\n')
    if [ -n "$feature" ]; then
      echo "$feature"
      return
    fi
  fi
  
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [[ "$current_branch" =~ ^(feature|fix|hotfix)/ ]]; then
    echo "$current_branch"
    return
  fi
  
  echo "feature/auto-$(date +%Y%m%d-%H%M%S)"
}

sanitize_branch_name() {
  local name="$1"
  echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | cut -c1-50
}

ensure_feature_branch() {
  local feature_name="$1"
  load_git_config
  local branch_name="${BRANCH_PREFIX}/$(sanitize_branch_name "$feature_name")"
  
  if git show-ref --verify --quiet "refs/heads/$branch_name"; then
    echo "📌 Switching to existing branch: $branch_name"
    git checkout "$branch_name"
  else
    echo "🌿 Creating new feature branch: $branch_name"
    git checkout -b "$branch_name"
  fi
  
  echo "$feature_name" > "$CURRENT_FEATURE_FILE"
  echo "$branch_name"
}

git_commit_push() {
  local branch_name="$1"
  local description="${2:-Auto commit}"
  load_git_config
  
  echo "📦 Staging ALL changes..."
  git add -A
  
  if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
    return 0
  fi
  
  echo "📝 Changes to be committed:"
  git status --short | head -20
  
  local commit_msg="feat: $description"
  if [ -f "$TODOS_FILE" ] && [ -s "$TODOS_FILE" ]; then
    local context=$(head -5 "$TODOS_FILE" | tr '\n' ' ' | cut -c1-100)
    if [ -n "$context" ]; then
      commit_msg="feat: $description - $context"
    fi
  fi
  
  if [ "$AUTO_COMMIT" = "true" ]; then
    echo "💾 Committing: $commit_msg"
    git commit -m "$commit_msg" || {
      echo "⚠️  Commit failed"
      return 1
    }
  fi
  
  if [ "$AUTO_PUSH" = "true" ]; then
    echo "🚀 Pushing to remote: $branch_name"
    git push -u origin "$branch_name" || {
      echo "⚠️  Push failed"
      return 1
    }
  fi
  
  echo "✅ Commit & push completed"
}

git_set_feature() {
  local feature_name="$1"
  if [ -z "$feature_name" ]; then
    echo "Usage: $0 git set-feature <feature-name>"
    exit 1
  fi
  local branch_name=$(ensure_feature_branch "$feature_name")
  echo "✅ Feature set: $feature_name"
  echo "✅ Branch: $branch_name"
}

git_commit() {
  local description="${1:-Auto commit from devcontainer}"
  local current_feature=$(get_current_feature)
  local branch_name=$(ensure_feature_branch "$current_feature")
  git_commit_push "$branch_name" "$description"
}

git_force_commit() {
  local description="${1:-Force commit all changes}"
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  
  echo "🔥 FORCE COMMIT ALL..."
  git add -A
  
  local staged_count=$(git diff --cached --name-only | wc -l)
  if [ "$staged_count" -eq 0 ]; then
    echo "✅ No changes to commit"
    return 0
  fi
  
  echo "📝 Staged $staged_count file(s):"
  git status --short | head -20
  
  local commit_msg="feat: $description"
  local changed_files=$(git diff --cached --name-only | head -10 | tr '\n' ' ' | cut -c1-100)
  if [ -n "$changed_files" ]; then
    commit_msg="feat: $description - Files: $changed_files"
  fi
  
  echo "💾 Committing: $commit_msg"
  if ! git commit -m "$commit_msg"; then
    echo "❌ Commit failed!"
    return 1
  fi
  
  echo "🚀 Pushing to origin/$current_branch..."
  if git push -u origin "$current_branch"; then
    echo "✅ Force commit & push completed"
  else
    echo "⚠️  Push failed - but commit is local"
    return 1
  fi
}

git_status() {
  local current_feature=$(get_current_feature)
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  load_git_config
  
  git add -A 2>/dev/null || true
  local changes=$(git status --porcelain | wc -l)
  
  echo "📊 Git Workflow Status:"
  echo "  Current Feature: $current_feature"
  echo "  Current Branch: $current_branch"
  echo "  Uncommitted Changes: $changes"
  echo "  Auto-Commit: $AUTO_COMMIT"
  echo "  Auto-Push: $AUTO_PUSH"
  echo ""
  if [ "$changes" -gt 0 ]; then
    echo "📝 Uncommitted changes:"
    git status --short | head -20
  fi
}

# ============================================================================
# FEATURE TRACKER FUNCTIONS
# ============================================================================

detect_feature_from_todos() {
  if [ -f "$TODOS_FILE" ] && [ -s "$TODOS_FILE" ]; then
    local feature=$(grep -i "in_progress\|pending" "$TODOS_FILE" | head -1 | sed 's/.*"content":"\([^"]*\)".*/\1/' | cut -c1-50)
    if [ -n "$feature" ]; then
      echo "$feature"
      return
    fi
    
    local first_todo=$(head -20 "$TODOS_FILE" | grep -o '"content":"[^"]*"' | head -1 | sed 's/"content":"\([^"]*\)"/\1/' | cut -c1-50)
    if [ -n "$first_todo" ]; then
      echo "$first_todo"
      return
    fi
  fi
  
  echo "auto-work-$(date +%Y%m%d)"
}

feature_update() {
  local detected_feature=$(detect_feature_from_todos)
  local current_feature=""
  
  if [ -f "$CURRENT_FEATURE_FILE" ]; then
    current_feature=$(cat "$CURRENT_FEATURE_FILE" | head -1 | tr -d '\n')
  fi
  
  if [ "$detected_feature" != "$current_feature" ]; then
    echo "$detected_feature" > "$CURRENT_FEATURE_FILE"
    echo "🔄 Feature updated: $detected_feature"
    ensure_feature_branch "$detected_feature"
  fi
}

# ============================================================================
# SETTINGS PERSISTENCE FUNCTIONS
# ============================================================================

settings_save() {
  echo "💾 Saving devcontainer settings..."
  
  if [ -f "$HOME/.config/doppler/config.json" ]; then
    cp "$HOME/.config/doppler/config.json" "$DOPPLER_CONFIG" 2>/dev/null || true
    echo "  ✅ Doppler config saved"
  fi
  
  if [ -f "$HOME/.config/gh/config.yml" ]; then
    mkdir -p "$(dirname "$GITHUB_CONFIG")"
    cp "$HOME/.config/gh/config.yml" "$GITHUB_CONFIG" 2>/dev/null || true
    echo "  ✅ GitHub CLI config saved"
  fi
  
  if [ -f "$HOME/.config/gh/hosts.yml" ]; then
    cp "$HOME/.config/gh/hosts.yml" "$PERSIST_DIR/github-hosts.yml" 2>/dev/null || true
    echo "  ✅ GitHub hosts saved"
  fi
  
  if [ -f "$HOME/.gitconfig" ]; then
    cp "$HOME/.gitconfig" "$PERSIST_DIR/gitconfig" 2>/dev/null || true
    echo "  ✅ Git config saved"
  fi
  
  if [ -f "$HOME/.npmrc" ]; then
    cp "$HOME/.npmrc" "$PERSIST_DIR/npmrc" 2>/dev/null || true
    echo "  ✅ NPM config saved"
  fi
  
  echo "✅ Settings saved to $PERSIST_DIR"
}

settings_restore() {
  echo "📥 Restoring devcontainer settings..."
  
  if [ -f "$DOPPLER_CONFIG" ]; then
    mkdir -p "$HOME/.config/doppler"
    cp "$DOPPLER_CONFIG" "$HOME/.config/doppler/config.json" 2>/dev/null || true
    echo "  ✅ Doppler config restored"
  fi
  
  if [ -f "$GITHUB_CONFIG" ]; then
    mkdir -p "$HOME/.config/gh"
    cp "$GITHUB_CONFIG" "$HOME/.config/gh/config.yml" 2>/dev/null || true
    echo "  ✅ GitHub CLI config restored"
  fi
  
  if [ -f "$PERSIST_DIR/github-hosts.yml" ]; then
    mkdir -p "$HOME/.config/gh"
    cp "$PERSIST_DIR/github-hosts.yml" "$HOME/.config/gh/hosts.yml" 2>/dev/null || true
    echo "  ✅ GitHub hosts restored"
  fi
  
  if [ -f "$PERSIST_DIR/gitconfig" ]; then
    cp "$PERSIST_DIR/gitconfig" "$HOME/.gitconfig" 2>/dev/null || true
    echo "  ✅ Git config restored"
  fi
  
  if [ -f "$PERSIST_DIR/npmrc" ]; then
    cp "$PERSIST_DIR/npmrc" "$HOME/.npmrc" 2>/dev/null || true
    echo "  ✅ NPM config restored"
  fi
  
  echo "✅ Settings restored from $PERSIST_DIR"
}

# ============================================================================
# DOCKER FUNCTIONS
# ============================================================================

docker_install() {
  echo "🔧 Installing Docker CLI..."
  
  if command -v docker &> /dev/null; then
    echo "✅ Docker CLI is already installed"
    docker --version
    return 0
  fi
  
  if ! command -v lsb_release &> /dev/null; then
    echo "📦 Installing lsb-release..."
    sudo apt-get update
    sudo apt-get install -y lsb-release
  fi
  
  echo "📦 Installing Docker CLI..."
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  
  sudo apt-get update
  sudo apt-get install -y docker-ce-cli docker-compose-plugin
  
  echo "✅ Docker CLI installed successfully!"
  docker --version
  docker compose version
  
  if [ -S /var/run/docker.sock ]; then
    echo "🔌 Testing Docker connection..."
    if docker info > /dev/null 2>&1; then
      echo "✅ Docker connection successful!"
    else
      echo "⚠️  Docker socket found but connection failed. Is Docker Desktop running?"
    fi
  else
    echo "⚠️  Docker socket not found. Please ensure Docker Desktop is running."
  fi
}

# ============================================================================
# EXTENSIONS FUNCTIONS
# ============================================================================

extensions_install() {
  echo "🔧 Installing VS Code / Cursor extensions..."
  
  EXTENSIONS=(
    "Anthropic.claude-code"
    "streetsidesoftware.code-spell-checker"
    "ms-azuretools.vscode-containers"
    "ms-azuretools.vscode-docker"
    "docker.docker"
    "doppler.doppler-vscode"
    "EditorConfig.EditorConfig"
    "dbaeumer.vscode-eslint"
    "mhutchie.git-graph"
    "github.vscode-github-actions"
    "GitHub.vscode-pull-request-github"
    "eamodio.gitlens"
    "ms-vscode.vscode-typescript-next"
    "Orta.vscode-jest"
    "christian-kohler.npm-intellisense"
    "christian-kohler.path-intellisense"
    "ms-playwright.playwright"
    "esbenp.prettier-vscode"
    "cweijan.vscode-redis-client"
    "humao.rest-client"
    "bradlc.vscode-tailwindcss"
    "anysphere.remote-containers"
    "Postman.postman-for-vscode"
    "usernamehw.errorlens"
    "mongodb.mongodb-vscode"
    "ms-vscode.powershell"
    "GitHub.copilot"
    "GitHub.copilot-chat"
    "ms-vscode-remote.remote-containers"
    "shaharkazaz.git-merger"
  )
  
  VSCODE_CLI="/usr/local/share/code-server/bin/code"
  if [ -f "$VSCODE_CLI" ]; then
    CODE_CMD="$VSCODE_CLI"
  elif command -v code &> /dev/null; then
    CODE_CMD="code"
  else
    CODE_CMD=""
  fi
  
  CURSOR_CLI="/usr/local/bin/cursor"
  if [ -f "$CURSOR_CLI" ]; then
    CURSOR_CMD="$CURSOR_CLI"
  elif command -v cursor &> /dev/null; then
    CURSOR_CMD="cursor"
  else
    CURSOR_CMD=""
  fi
  
  if [ -n "$CODE_CMD" ]; then
    echo "✅ Found VS Code CLI - installing extensions..."
    INSTALLED=0
    FAILED=0
    for ext in "${EXTENSIONS[@]}"; do
      if $CODE_CMD --install-extension "$ext" --force >/dev/null 2>&1; then
        INSTALLED=$((INSTALLED + 1))
      else
        FAILED=$((FAILED + 1))
      fi
    done
    echo "   ✅ Installed: $INSTALLED | ⚠️  Failed: $FAILED"
  fi
  
  if [ -n "$CURSOR_CMD" ]; then
    echo "✅ Found Cursor CLI - installing extensions..."
    INSTALLED=0
    FAILED=0
    for ext in "${EXTENSIONS[@]}"; do
      if $CURSOR_CMD --install-extension "$ext" --force >/dev/null 2>&1; then
        INSTALLED=$((INSTALLED + 1))
      else
        FAILED=$((FAILED + 1))
      fi
    done
    echo "   ✅ Installed: $INSTALLED | ⚠️  Failed: $FAILED"
  fi
  
  if [ -z "$CODE_CMD" ] && [ -z "$CURSOR_CMD" ]; then
    echo "ℹ️  CLI not found - extensions will be auto-installed by VS Code / Cursor"
    echo "📝 Total extensions: ${#EXTENSIONS[@]}"
  fi
  
  echo "🎉 Extension installation completed"
}

# ============================================================================
# TODO SYNC FUNCTIONS
# ============================================================================

todos_sync() {
  if [ -f "$TODOS_FILE" ] && [ -s "$TODOS_FILE" ]; then
    echo "📋 Syncing todos from Tasklist.prd..."
    cp "$TODOS_FILE" "$TODO_SYNC_DIR/last-sync-$(date +%Y%m%d-%H%M%S).prd"
    echo "✅ Todos synced"
  else
    echo "ℹ️  No Tasklist.prd found or empty"
  fi
}

# ============================================================================
# DEV SERVER FUNCTIONS
# ============================================================================

dev_start() {
  cd "$PROJECT_ROOT" || exit 1
  
  if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js dev server is already running"
    return 0
  fi
  
  echo "🚀 Starting Next.js dev server in background..."
  nohup npm run dev > /tmp/nextjs-dev.log 2>&1 &
  DEV_PID=$!
  echo $DEV_PID > /tmp/nextjs-dev.pid
  
  echo "📝 Dev server PID: $DEV_PID"
  echo "📝 Logs: tail -f /tmp/nextjs-dev.log"
  echo "🌐 Server: http://localhost:3000"
  echo "🛑 Stop: kill $DEV_PID"
  
  sleep 5
  
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Dev server is running and healthy!"
  elif pgrep -f "next dev" > /dev/null; then
    echo "⏳ Dev server is starting... (check logs: tail -f /tmp/nextjs-dev.log)"
  else
    echo "⚠️  Dev server may have failed. Check logs: tail -f /tmp/nextjs-dev.log"
  fi
}

# ============================================================================
# DOCKER CONTAINER FUNCTIONS
# ============================================================================

container_dev_start() {
  cd "$PROJECT_ROOT"
  
  echo "🐳 Starting MCP Bridge dev container..."
  
  # Docker Compose naming: project name "mmc-mcp-bridge" + service "dev" = "mmc-mcp-bridge-dev-1"
  # Use pattern matching with hyphens (not underscores) to find containers
  # Check if any container matching the pattern is running
  if docker ps --format '{{.Names}}' | grep -qE "^mmc-mcp-bridge-dev"; then
    echo "✅ Container is already running"
    echo "💡 Code changes will hot reload automatically"
    return 0
  fi
  
  # Check if container exists but is stopped
  if docker ps -a --format '{{.Names}}' | grep -qE "^mmc-mcp-bridge-dev"; then
    echo "📦 Starting existing container..."
    docker compose start dev
  else
    # Check if image exists (using docker compose to check service image)
    if docker images --format '{{.Repository}}:{{.Tag}}' | grep -qE "mmc-mcp-bridge.*dev|.*dev.*latest"; then
      echo "🖼️  Reusing existing image..."
      docker compose up -d --no-build dev
    else
      echo "🏗️  Building image..."
      docker compose build dev
      docker compose up -d dev
    fi
  fi
  
  echo "⏳ Waiting for dev server to start..."
  sleep 5
  
  MAX_RETRIES=30
  RETRY_COUNT=0
  
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
      echo ""
      echo "✅ MCP Bridge is running!"
      echo ""
      echo "📍 Local endpoints:"
      echo "   - Health: http://localhost:3000/api/health"
      echo "   - SSE:    http://localhost:3000/api/sse"
      echo "   - Frontend: http://localhost:3000"
      echo ""
      echo "🔧 MCP Client: http://localhost:3000/api/sse"
      echo ""
      echo "📝 View logs: docker compose logs -f dev"
      echo "🛑 Stop: docker compose stop dev"
      return 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 1
  done
  
  echo ""
  echo "⚠️  Server did not start within $MAX_RETRIES seconds"
  echo "📝 Check logs: docker compose logs dev"
  return 1
}

# ============================================================================
# BACKGROUND WATCHERS (run as daemons)
# ============================================================================

git_watcher_daemon() {
  COMMIT_INTERVAL=300
  
  echo "👀 Git watcher started (checks every 60s, commits every ${COMMIT_INTERVAL}s)"
  while true; do
    sleep 60
    
    feature_update 2>/dev/null || true
    
    if [ ! -d ".git" ]; then
      continue
    fi
    
    git add -A 2>/dev/null || true
    
    if [ -z "$(git status --porcelain)" ]; then
      continue
    fi
    
    local last_commit_time=0
    if [ -f "$LAST_COMMIT_FILE" ]; then
      last_commit_time=$(cat "$LAST_COMMIT_FILE" 2>/dev/null || echo "0")
    fi
    
    local current_time=$(date +%s)
    local time_diff=$((current_time - last_commit_time))
    
    if [ "$time_diff" -lt "$COMMIT_INTERVAL" ]; then
      continue
    fi
    
    local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    local commit_msg="feat: Auto commit $(date +%Y-%m-%d\ %H:%M:%S)"
    local changed_files=$(git diff --cached --name-only | head -5 | tr '\n' ',' | sed 's/,$//')
    if [ -n "$changed_files" ]; then
      commit_msg="feat: Auto commit - $(echo $changed_files | cut -c1-80)"
    fi
    
    if git commit -m "$commit_msg" 2>/dev/null; then
      echo "$current_time" > "$LAST_COMMIT_FILE"
      git push -u origin "$current_branch" 2>&1 >/dev/null || true
    fi
  done
}

todos_sync_daemon() {
  echo "🔄 Todo sync daemon started (runs every 5 minutes)"
  while true; do
    sleep 300
    todos_sync
  done
}

# ============================================================================
# MAIN COMMAND HANDLER
# ============================================================================

init_git_config

case "${1:-help}" in
  # Git commands
  git)
    case "${2:-status}" in
      set-feature)
        git_set_feature "$3"
        ;;
      commit)
        git_commit "$3"
        ;;
      force-commit)
        git_force_commit "$3"
        ;;
      status)
        git_status
        ;;
      ensure-branch)
        local feature=$(get_current_feature)
        ensure_feature_branch "$feature"
        ;;
      *)
        echo "Git commands:"
        echo "  set-feature <name>  - Set feature and create/switch branch"
        echo "  commit [message]    - Auto commit and push"
        echo "  force-commit [msg] - Force commit ALL changes immediately"
        echo "  status             - Show git workflow status"
        echo "  ensure-branch      - Ensure feature branch exists"
        ;;
    esac
    ;;
  
  # Feature tracking
  feature)
    case "${2:-update}" in
      update)
        feature_update
        ;;
      detect)
        detect_feature_from_todos
        ;;
      *)
        echo "Feature commands:"
        echo "  update  - Update feature from todos"
        echo "  detect  - Detect feature from todos"
        ;;
    esac
    ;;
  
  # Settings
  settings)
    case "${2:-restore}" in
      save)
        settings_save
        ;;
      restore)
        settings_restore
        ;;
      *)
        echo "Settings commands:"
        echo "  save     - Save current settings"
        echo "  restore  - Restore saved settings"
        ;;
    esac
    ;;
  
  # Docker
  docker-install)
    docker_install
    ;;
  
  # Extensions
  extensions)
    extensions_install
    ;;
  
  # Todos
  todos)
    todos_sync
    ;;
  
  # Dev server
  dev-start)
    dev_start
    ;;
  
  # Container management
  container)
    case "${2:-dev-start}" in
      dev-start)
        container_dev_start
        ;;
      *)
        echo "Container commands:"
        echo "  dev-start  - Start dev container"
        ;;
    esac
    ;;
  
  # Background daemons
  daemon)
    case "${2}" in
      git-watcher)
        git_watcher_daemon
        ;;
      todos-sync)
        todos_sync_daemon
        ;;
      *)
        echo "Daemon commands:"
        echo "  git-watcher  - Start git auto-commit watcher"
        echo "  todos-sync   - Start todo sync daemon"
        ;;
    esac
    ;;
  
  # Setup (runs all setup tasks)
  setup)
    echo "🚀 Running devcontainer setup..."
    settings_restore
    extensions_install
    init_git_config
    local feature=$(get_current_feature)
    ensure_feature_branch "$feature"
    echo "✅ Setup completed"
    ;;
  
  # Help
  help|*)
    echo "DevContainer Management Script"
    echo ""
    echo "Usage: $0 [command] [subcommand] [args...]"
    echo ""
    echo "Commands:"
    echo "  git [cmd]              - Git workflow (set-feature, commit, force-commit, status, ensure-branch)"
    echo "  feature [cmd]          - Feature tracking (update, detect)"
    echo "  settings [cmd]         - Settings persistence (save, restore)"
    echo "  docker-install        - Install Docker CLI"
    echo "  extensions            - Install VS Code/Cursor extensions"
    echo "  todos                 - Sync todos from Tasklist.prd"
    echo "  dev-start             - Start Next.js dev server in devcontainer"
    echo "  container [cmd]       - Container management (dev-start)"
    echo "  daemon [cmd]          - Background daemons (git-watcher, todos-sync)"
    echo "  setup                 - Run all setup tasks"
    echo ""
    echo "Examples:"
    echo "  $0 setup                    # Run full setup"
    echo "  $0 git set-feature 'test'  # Set feature branch"
    echo "  $0 git commit 'fix bug'     # Commit changes"
    echo "  $0 container dev-start     # Start dev container"
    echo "  $0 daemon git-watcher &    # Start git watcher in background"
    ;;
esac
