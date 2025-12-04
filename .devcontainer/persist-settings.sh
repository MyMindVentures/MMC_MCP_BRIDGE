#!/bin/bash
# Persist devcontainer settings (Doppler, GitHub, etc.) across rebuilds
# This script saves and restores settings from a persistent volume

PERSIST_DIR="/workspaces/.devcontainer-persist"
SETTINGS_FILE="$PERSIST_DIR/settings.json"
DOPPLER_CONFIG="$PERSIST_DIR/doppler-config.json"
GITHUB_CONFIG="$PERSIST_DIR/github-config.json"

# Create persistent directory if it doesn't exist (suppress errors if already exists or permission issues)
mkdir -p "$PERSIST_DIR" 2>/dev/null || true

# Function to save current settings
save_settings() {
  echo "💾 Saving devcontainer settings..."
  
  # Save Doppler config if exists
  if [ -f "$HOME/.config/doppler/config.json" ]; then
    cp "$HOME/.config/doppler/config.json" "$DOPPLER_CONFIG" 2>/dev/null || true
    echo "  ✅ Doppler config saved"
  fi
  
  # Save GitHub CLI config if exists
  if [ -f "$HOME/.config/gh/config.yml" ]; then
    mkdir -p "$(dirname "$GITHUB_CONFIG")"
    cp "$HOME/.config/gh/config.yml" "$GITHUB_CONFIG" 2>/dev/null || true
    echo "  ✅ GitHub CLI config saved"
  fi
  
  # Save GitHub credentials if exists
  if [ -f "$HOME/.config/gh/hosts.yml" ]; then
    cp "$HOME/.config/gh/hosts.yml" "$PERSIST_DIR/github-hosts.yml" 2>/dev/null || true
    echo "  ✅ GitHub hosts saved"
  fi
  
  # Save git config
  if [ -f "$HOME/.gitconfig" ]; then
    cp "$HOME/.gitconfig" "$PERSIST_DIR/gitconfig" 2>/dev/null || true
    echo "  ✅ Git config saved"
  fi
  
  # Save npm config
  if [ -f "$HOME/.npmrc" ]; then
    cp "$HOME/.npmrc" "$PERSIST_DIR/npmrc" 2>/dev/null || true
    echo "  ✅ NPM config saved"
  fi
  
  # Save VS Code/Cursor settings
  if [ -d "$HOME/.vscode-server" ] || [ -d "$HOME/.cursor-server" ]; then
    mkdir -p "$PERSIST_DIR" 2>/dev/null || true
    [ -d "$HOME/.vscode-server" ] && cp -r "$HOME/.vscode-server" "$PERSIST_DIR/.vscode-server" 2>/dev/null || true
    [ -d "$HOME/.cursor-server" ] && cp -r "$HOME/.cursor-server" "$PERSIST_DIR/.cursor-server" 2>/dev/null || true
    echo "  ✅ VS Code/Cursor server settings saved"
  fi
  
  echo "✅ Settings saved to $PERSIST_DIR"
}

# Function to restore settings
restore_settings() {
  echo "📥 Restoring devcontainer settings..."
  
  # Restore Doppler config
  if [ -f "$DOPPLER_CONFIG" ]; then
    mkdir -p "$HOME/.config/doppler"
    cp "$DOPPLER_CONFIG" "$HOME/.config/doppler/config.json" 2>/dev/null || true
    echo "  ✅ Doppler config restored"
  fi
  
  # Restore GitHub CLI config
  if [ -f "$GITHUB_CONFIG" ]; then
    mkdir -p "$HOME/.config/gh"
    cp "$GITHUB_CONFIG" "$HOME/.config/gh/config.yml" 2>/dev/null || true
    echo "  ✅ GitHub CLI config restored"
  fi
  
  # Restore GitHub hosts
  if [ -f "$PERSIST_DIR/github-hosts.yml" ]; then
    mkdir -p "$HOME/.config/gh"
    cp "$PERSIST_DIR/github-hosts.yml" "$HOME/.config/gh/hosts.yml" 2>/dev/null || true
    echo "  ✅ GitHub hosts restored"
  fi
  
  # Restore git config
  if [ -f "$PERSIST_DIR/gitconfig" ]; then
    cp "$PERSIST_DIR/gitconfig" "$HOME/.gitconfig" 2>/dev/null || true
    echo "  ✅ Git config restored"
  fi
  
  # Restore npm config
  if [ -f "$PERSIST_DIR/npmrc" ]; then
    cp "$PERSIST_DIR/npmrc" "$HOME/.npmrc" 2>/dev/null || true
    echo "  ✅ NPM config restored"
  fi
  
  # Restore VS Code/Cursor server settings
  if [ -d "$PERSIST_DIR/.vscode-server" ] || [ -d "$PERSIST_DIR/.cursor-server" ]; then
    [ -d "$PERSIST_DIR/.vscode-server" ] && cp -r "$PERSIST_DIR/.vscode-server" "$HOME/" 2>/dev/null || true
    [ -d "$PERSIST_DIR/.cursor-server" ] && cp -r "$PERSIST_DIR/.cursor-server" "$HOME/" 2>/dev/null || true
    echo "  ✅ VS Code/Cursor server settings restored"
  fi
  
  echo "✅ Settings restored from $PERSIST_DIR"
}

# Auto-save on exit (trap)
trap 'save_settings' EXIT INT TERM

# Main logic
case "${1:-restore}" in
  save)
    save_settings
    ;;
  restore)
    restore_settings
    ;;
  *)
    echo "Usage: $0 [save|restore]"
    exit 1
    ;;
esac

