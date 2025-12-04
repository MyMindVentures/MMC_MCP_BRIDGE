#!/bin/bash
# Git file watcher: automatically commit changes when files are modified
# Runs in background and watches for file changes

PROJECT_ROOT="/workspaces/MMC_MCP_BRIDGE"
LAST_COMMIT_FILE="/workspaces/.devcontainer-persist/last-git-commit.txt"
COMMIT_INTERVAL=300  # Commit every 5 minutes if there are changes

cd "$PROJECT_ROOT"

# Function to check and commit if needed
check_and_commit() {
  # Check if git repo is initialized
  if [ ! -d ".git" ]; then
    return 0
  fi
  
  # Check if there are uncommitted changes
  if [ -z "$(git status --porcelain)" ]; then
    return 0
  fi
  
  # Check if enough time has passed since last commit
  local last_commit_time=0
  if [ -f "$LAST_COMMIT_FILE" ]; then
    last_commit_time=$(cat "$LAST_COMMIT_FILE" 2>/dev/null || echo "0")
  fi
  
  local current_time=$(date +%s)
  local time_diff=$((current_time - last_commit_time))
  
  if [ "$time_diff" -lt "$COMMIT_INTERVAL" ]; then
    return 0  # Too soon, skip
  fi
  
  # Auto commit
  echo "🔄 Auto-committing changes..."
  /usr/local/bin/auto-git-workflow.sh commit "Auto commit: $(date +%Y-%m-%d\ %H:%M:%S)"
  echo "$current_time" > "$LAST_COMMIT_FILE"
}

# Main watcher loop
echo "👀 Git watcher started (checks every 60s, commits every ${COMMIT_INTERVAL}s if changes)"
while true; do
  sleep 60
  
  # Update feature tracking
  /usr/local/bin/feature-tracker.sh update 2>/dev/null || true
  
  # Check and commit if needed
  check_and_commit
done

