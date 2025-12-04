#!/bin/bash
# Feature tracker: automatically detect and set feature branch based on active work
# Integrates with todo system and AI agent work

PROJECT_ROOT="/workspaces/MMC_MCP_BRIDGE"
TODOS_FILE="$PROJECT_ROOT/Tasklist.prd"
CURRENT_FEATURE_FILE="/workspaces/.devcontainer-persist/current-feature.txt"
GIT_STATUS_FILE="/workspaces/.devcontainer-persist/git-status.json"

cd "$PROJECT_ROOT"

# Function to detect current feature from active todos
detect_feature_from_todos() {
  if [ -f "$TODOS_FILE" ] && [ -s "$TODOS_FILE" ]; then
    # Try to extract first in-progress or pending todo
    local feature=$(grep -i "in_progress\|pending" "$TODOS_FILE" | head -1 | sed 's/.*"content":"\([^"]*\)".*/\1/' | cut -c1-50)
    if [ -n "$feature" ]; then
      echo "$feature"
      return
    fi
    
    # Fallback: extract first todo item
    local first_todo=$(head -20 "$TODOS_FILE" | grep -o '"content":"[^"]*"' | head -1 | sed 's/"content":"\([^"]*\)"/\1/' | cut -c1-50)
    if [ -n "$first_todo" ]; then
      echo "$first_todo"
      return
    fi
  fi
  
  # Default: use timestamp-based feature
  echo "auto-work-$(date +%Y%m%d)"
}

# Function to update feature based on current work
update_feature() {
  local detected_feature=$(detect_feature_from_todos)
  local current_feature=""
  
  if [ -f "$CURRENT_FEATURE_FILE" ]; then
    current_feature=$(cat "$CURRENT_FEATURE_FILE" | head -1 | tr -d '\n')
  fi
  
  # Only update if different
  if [ "$detected_feature" != "$current_feature" ]; then
    echo "$detected_feature" > "$CURRENT_FEATURE_FILE"
    echo "🔄 Feature updated: $detected_feature"
    
    # Ensure branch exists and is checked out
    /usr/local/bin/auto-git-workflow.sh set-feature "$detected_feature"
  fi
}

# Function to track git status
track_git_status() {
  local status_json=$(cat > "$GIT_STATUS_FILE" <<EOF
{
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "uncommitted": $(git status --porcelain | wc -l),
  "last_commit": "$(git log -1 --format=%H 2>/dev/null || echo 'none')",
  "timestamp": "$(date -Iseconds)"
}
EOF
)
}

# Main execution
case "${1:-update}" in
  update)
    update_feature
    track_git_status
    ;;
  detect)
    detect_feature_from_todos
    ;;
  *)
    echo "Usage: $0 [update|detect]"
    exit 1
    ;;
esac

