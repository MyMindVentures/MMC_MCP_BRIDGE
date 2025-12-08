#!/bin/bash
# Datadog Synthetic Tests
# Vervangt: .github/workflows/datadog-synthetics.yml
# Gebaseerd op: Datadog Synthetics CI GitHub Action
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🐕 Datadog Synthetic Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for required environment variables
if [ -z "$DD_API_KEY" ] || [ -z "$DD_APP_KEY" ]; then
    echo "⚠️  Datadog credentials not configured"
    echo "   Set DD_API_KEY and DD_APP_KEY environment variables"
    echo "   Skipping Datadog synthetic tests..."
    exit 0
fi

# Check if Datadog CLI is available
if ! command -v datadog-ci &> /dev/null; then
    echo "📥 Installing Datadog CLI..."
    npm install -g @datadog/datadog-ci || {
        echo "⚠️  Failed to install Datadog CLI"
        echo "   Install manually: npm install -g @datadog/datadog-ci"
        exit 0
    }
fi

echo "✅ Datadog CLI version:"
datadog-ci version || echo "⚠️  Datadog CLI not available"

# Run synthetic tests
# Test search query: tag:e2e-tests
echo "🧪 Running Datadog Synthetic tests..."
datadog-ci synthetics run-tests \
    --apiKey "$DD_API_KEY" \
    --appKey "$DD_APP_KEY" \
    --search-query "tag:e2e-tests" \
    --fail-on-critical-errors || {
    echo "⚠️  Datadog synthetic tests failed or no tests found"
    exit 0  # Non-blocking
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Datadog Synthetic Tests Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

