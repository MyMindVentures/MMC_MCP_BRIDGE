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
  
  # ALWAYS stage ALL changes first (including untracked files)
  echo "📦 Staging ALL changes (including untracked files)..."
  git add -A
  
  # Check if there are changes after staging
  if [ -z "$(git status --porcelain)" ]; then
    return 0
  fi
  
  # Show what will be committed
  echo "📝 Changes to be committed:"
  git status --short | head -20
  
  # Check if enough time has passed since last commit
  local last_commit_time=0
  if [ -f "$LAST_COMMIT_FILE" ]; then
    last_commit_time=$(cat "$LAST_COMMIT_FILE" 2>/dev/null || echo "0")
  fi
  
  local current_time=$(date +%s)
  local time_diff=$((current_time - last_commit_time))
  
  if [ "$time_diff" -lt "$COMMIT_INTERVAL" ]; then
    echo "⏳ Waiting for commit interval (${time_diff}s / ${COMMIT_INTERVAL}s)..."
    return 0  # Too soon, skip
  fi
  
  # Get current branch
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  
  # Generate commit message
  local commit_msg="feat: Auto commit $(date +%Y-%m-%d\ %H:%M:%S)"
  local changed_files=$(git diff --cached --name-only | head -5 | tr '\n' ',' | sed 's/,$//')
  if [ -n "$changed_files" ]; then
    commit_msg="feat: Auto commit - $(echo $changed_files | cut -c1-80)"
  fi
  
  # Commit
  echo "💾 Committing changes: $commit_msg"
  if git commit -m "$commit_msg"; then
    echo "$current_time" > "$LAST_COMMIT_FILE"
    
    # Push to remote
    echo "🚀 Pushing to origin/$current_branch..."
    if git push -u origin "$current_branch" 2>&1; then
      echo "✅ Auto commit & push completed successfully"
    else
      echo "⚠️  Push failed (might need manual intervention)"
    fi
  else
    echo "⚠️  Commit failed (might be no changes or merge conflict)"
  fi
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

