#!/bin/bash
# Automatic Git workflow: branch creation, staging, commit, push per feature
# This script automatically manages git branches based on current feature/todo work

set -e

PROJECT_ROOT="/workspaces/MMC_MCP_BRIDGE"
TODOS_FILE="$PROJECT_ROOT/Tasklist.prd"
CURRENT_FEATURE_FILE="/workspaces/.devcontainer-persist/current-feature.txt"
GIT_CONFIG_FILE="/workspaces/.devcontainer-persist/git-workflow-config.json"

cd "$PROJECT_ROOT"

# Initialize git config if not exists
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

# Load config
AUTO_COMMIT=$(jq -r '.autoCommit // true' "$GIT_CONFIG_FILE" 2>/dev/null || echo "true")
AUTO_PUSH=$(jq -r '.autoPush // true' "$GIT_CONFIG_FILE" 2>/dev/null || echo "true")
BRANCH_PREFIX=$(jq -r '.branchPrefix // "feature"' "$GIT_CONFIG_FILE" 2>/dev/null || echo "feature")

# Function to get current feature from todos or active work
get_current_feature() {
  # Try to get from persistent file first
  if [ -f "$CURRENT_FEATURE_FILE" ]; then
    local feature=$(cat "$CURRENT_FEATURE_FILE" | head -1 | tr -d '\n')
    if [ -n "$feature" ]; then
      echo "$feature"
      return
    fi
  fi
  
  # Try to detect from git branch name
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  if [[ "$current_branch" =~ ^(feature|fix|hotfix)/ ]]; then
    echo "$current_branch"
    return
  fi
  
  # Default: generate from timestamp or use main
  echo "feature/auto-$(date +%Y%m%d-%H%M%S)"
}

# Function to sanitize branch name
sanitize_branch_name() {
  local name="$1"
  # Convert to lowercase, replace spaces/special chars with hyphens
  echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | cut -c1-50
}

# Function to create/switch to feature branch
ensure_feature_branch() {
  local feature_name="$1"
  local branch_name="${BRANCH_PREFIX}/$(sanitize_branch_name "$feature_name")"
  
  # Check if branch exists
  if git show-ref --verify --quiet "refs/heads/$branch_name"; then
    echo "📌 Switching to existing branch: $branch_name"
    git checkout "$branch_name"
  else
    echo "🌿 Creating new feature branch: $branch_name"
    git checkout -b "$branch_name"
  fi
  
  # Save current feature
  echo "$feature_name" > "$CURRENT_FEATURE_FILE"
  echo "$branch_name"
}

# Function to auto-stage, commit and push
auto_commit_push() {
  local branch_name="$1"
  local description="${2:-Auto commit}"
  
  # Check if there are changes
  if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
    return 0
  fi
  
  # Stage all changes
  echo "📦 Staging all changes..."
  git add -A
  
  # Generate commit message
  local commit_msg="feat: $description"
  if [ -f "$TODOS_FILE" ] && [ -s "$TODOS_FILE" ]; then
    # Try to extract context from Tasklist.prd
    local context=$(head -5 "$TODOS_FILE" | tr '\n' ' ' | cut -c1-100)
    if [ -n "$context" ]; then
      commit_msg="feat: $description - $context"
    fi
  fi
  
  # Commit
  if [ "$AUTO_COMMIT" = "true" ]; then
    echo "💾 Committing changes: $commit_msg"
    git commit -m "$commit_msg" || {
      echo "⚠️  Commit failed (might be no changes or merge conflict)"
      return 1
    }
  else
    echo "⏸️  Auto-commit disabled, skipping commit"
    return 0
  fi
  
  # Push
  if [ "$AUTO_PUSH" = "true" ]; then
    echo "🚀 Pushing to remote: $branch_name"
    git push -u origin "$branch_name" || {
      echo "⚠️  Push failed (might need to set upstream or resolve conflicts)"
      return 1
    }
  else
    echo "⏸️  Auto-push disabled, skipping push"
  fi
  
  echo "✅ Auto commit & push completed"
}

# Function to set current feature
set_feature() {
  local feature_name="$1"
  if [ -z "$feature_name" ]; then
    echo "Usage: $0 set-feature <feature-name>"
    echo "Example: $0 set-feature 'SSE MCP Bridge improvements'"
    exit 1
  fi
  
  local branch_name=$(ensure_feature_branch "$feature_name")
  echo "✅ Feature set: $feature_name"
  echo "✅ Branch: $branch_name"
}

# Function to commit current work
commit_work() {
  local description="${1:-Auto commit from devcontainer}"
  local current_feature=$(get_current_feature)
  local branch_name=$(ensure_feature_branch "$current_feature")
  
  auto_commit_push "$branch_name" "$description"
}

# Function to show status
show_status() {
  local current_feature=$(get_current_feature)
  local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
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
    git status --short | head -10
  fi
}

# Main command handler
case "${1:-status}" in
  set-feature)
    set_feature "$2"
    ;;
  commit)
    commit_work "$2"
    ;;
  status)
    show_status
    ;;
  ensure-branch)
    local feature=$(get_current_feature)
    ensure_feature_branch "$feature"
    ;;
  *)
    echo "Usage: $0 [set-feature|commit|status|ensure-branch]"
    echo ""
    echo "Commands:"
    echo "  set-feature <name>  - Set current feature and create/switch branch"
    echo "  commit [message]     - Auto commit and push current changes"
    echo "  status              - Show current git workflow status"
    echo "  ensure-branch        - Ensure feature branch exists and is checked out"
    exit 1
    ;;
esac

