#!/bin/bash
# Super Linter - Multi-language linting
# Vervangt: .github/workflows/super-linter.yml
# Gebaseerd op: GitHub Super Linter
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 Super Linter - Multi-Language Linting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is available (Super Linter runs in Docker)
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required for Super Linter"
    exit 1
fi

# Run Super Linter in Docker
echo "🐳 Running Super Linter in Docker container..."
docker run \
    --rm \
    --workdir /workspaces/MMC_MCP_BRIDGE \
    -e VALIDATE_ALL_CODEBASE=false \
    -e DEFAULT_BRANCH=main \
    -e GITHUB_TOKEN="${GITHUB_TOKEN:-}" \
    -e RUN_LOCAL=true \
    -v "$PROJECT_ROOT:/workspaces/MMC_MCP_BRIDGE" \
    ghcr.io/github/super-linter:latest || {
    echo "⚠️  Super Linter found issues (check output above)"
    exit 1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Super Linter Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

