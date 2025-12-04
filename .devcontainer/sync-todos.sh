#!/bin/bash
# Auto-sync todos from Tasklist.prd and internal todo system
# This runs periodically to keep todos in sync

TASKLIST_FILE="/workspaces/MMC_MCP_BRIDGE/Tasklist.prd"
TODO_SYNC_DIR="/workspaces/.devcontainer-persist/todos"

mkdir -p "$TODO_SYNC_DIR"

# Function to sync todos from Tasklist.prd
sync_todos() {
  if [ -f "$TASKLIST_FILE" ] && [ -s "$TASKLIST_FILE" ]; then
    echo "📋 Syncing todos from Tasklist.prd..."
    # Tasklist.prd can contain todo items that get synced
    # This is a placeholder for future todo sync logic
    cp "$TASKLIST_FILE" "$TODO_SYNC_DIR/last-sync-$(date +%Y%m%d-%H%M%S).prd"
    echo "✅ Todos synced"
  else
    echo "ℹ️  No Tasklist.prd found or empty"
  fi
}

# Run sync
sync_todos

# Schedule periodic sync (every 5 minutes)
while true; do
  sleep 300
  sync_todos
done &

echo "🔄 Todo sync daemon started (runs every 5 minutes)"

