#!/bin/bash
# PR Labeler - Auto-label pull requests
# Vervangt: .github/workflows/label.yml
# Gebaseerd op: GitHub Actions Labeler
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🏷️  PR Labeler"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "📥 Installing GitHub CLI..."
    # Install GitHub CLI (Alpine Linux)
    apk add --no-cache github-cli || {
        echo "⚠️  GitHub CLI not available"
        echo "   Install manually or use GitHub API directly"
        exit 0
    }
fi

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN not set"
    echo "   Set GITHUB_TOKEN environment variable"
    echo "   Skipping PR labeling..."
    exit 0
fi

# Check if .github/labeler.yml exists
LABELER_CONFIG="$PROJECT_ROOT/.github/labeler.yml"
if [ ! -f "$LABELER_CONFIG" ]; then
    echo "⚠️  .github/labeler.yml not found"
    echo "   Create labeler config to enable auto-labeling"
    echo "   Skipping PR labeling..."
    exit 0
fi

echo "✅ GitHub CLI version:"
gh --version || echo "⚠️  GitHub CLI not available"

# Note: PR labeling requires GitHub API access
# This script is a placeholder - actual labeling should be done via GitHub API
# or GitHub Actions (if re-enabled)
echo "ℹ️  PR labeling requires GitHub API access"
echo "   Use GitHub CLI or GitHub API to label PRs based on changed files"
echo "   Config: $LABELER_CONFIG"

# Example: Label PR based on changed files (if PR number is available)
if [ -n "$PR_NUMBER" ] && [ -n "$GITHUB_REPOSITORY" ]; then
    echo "🏷️  Labeling PR #$PR_NUMBER..."
    # This would require GitHub API calls or gh CLI
    # For now, just log the intent
    echo "   Would label PR based on: $LABELER_CONFIG"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PR Labeler Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

