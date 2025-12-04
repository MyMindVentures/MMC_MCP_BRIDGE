#!/bin/bash
# Auto-install extensions in devcontainer for VS Code / Cursor
# This script runs as postCreateCommand to ensure all extensions are installed
# Extensions are installed via the host editor CLI (VS Code Remote / Cursor Remote)
# If CLI is not available, extensions will be auto-installed by VS Code/Cursor via devcontainer.json

set +e  # Don't exit on errors - extensions will be installed automatically if CLI fails

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

echo "🔧 Installing VS Code / Cursor extensions..."

# Check for VS Code CLI (host-mounted or in PATH)
VSCODE_CLI="/usr/local/share/code-server/bin/code"
if [ -f "$VSCODE_CLI" ]; then
  CODE_CMD="$VSCODE_CLI"
elif command -v code &> /dev/null; then
  CODE_CMD="code"
else
  CODE_CMD=""
fi

# Check for Cursor CLI (host-mounted or in PATH)
CURSOR_CLI="/usr/local/bin/cursor"
if [ -f "$CURSOR_CLI" ]; then
  CURSOR_CMD="$CURSOR_CLI"
elif command -v cursor &> /dev/null; then
  CURSOR_CMD="cursor"
else
  CURSOR_CMD=""
fi

# Try VS Code CLI first
if [ -n "$CODE_CMD" ]; then
  echo "✅ Found VS Code CLI - attempting to install extensions..."
  INSTALLED=0
  FAILED=0
  for ext in "${EXTENSIONS[@]}"; do
    if $CODE_CMD --install-extension "$ext" --force >/dev/null 2>&1; then
      INSTALLED=$((INSTALLED + 1))
    else
      FAILED=$((FAILED + 1))
    fi
  done
  echo "   ✅ Installed: $INSTALLED | ⚠️  Failed: $FAILED (will be auto-installed by VS Code)"
  echo "✅ VS Code extensions installation attempt complete"
fi

# Try Cursor CLI
if [ -n "$CURSOR_CMD" ]; then
  echo "✅ Found Cursor CLI - attempting to install extensions..."
  INSTALLED=0
  FAILED=0
  for ext in "${EXTENSIONS[@]}"; do
    if $CURSOR_CMD --install-extension "$ext" --force >/dev/null 2>&1; then
      INSTALLED=$((INSTALLED + 1))
    else
      FAILED=$((FAILED + 1))
    fi
  done
  echo "   ✅ Installed: $INSTALLED | ⚠️  Failed: $FAILED (will be auto-installed by Cursor)"
  echo "✅ Cursor extensions installation attempt complete"
fi

# If neither CLI is available, the devcontainer customizations.vscode.extensions
# will handle it automatically when the container is opened in VS Code / Cursor
if [ -z "$CODE_CMD" ] && [ -z "$CURSOR_CMD" ]; then
  echo "ℹ️  CLI not found in container - this is normal"
  echo "   Extensions will be installed automatically by VS Code / Cursor"
  echo "   when you open this devcontainer (via customizations.vscode.extensions in devcontainer.json)"
  echo "📝 Total extensions to install: ${#EXTENSIONS[@]}"
fi

echo "🎉 Extension installation script completed"

