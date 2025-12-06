#!/bin/bash
# Dagger Pipeline - Vervangt Dagger CI/CD workflows
# Run Dagger pipeline voor builds en deployments
set -e

echo "🗡️  Running Dagger Pipeline..."

# Check if Dagger is available
if ! command -v dagger &> /dev/null; then
    echo "❌ Dagger CLI not found"
    exit 1
fi

# Run Dagger pipeline
echo "🚀 Executing Dagger pipeline..."
dagger run ./.dagger/pipeline.ts || {
    echo "❌ Dagger pipeline failed"
    exit 1
}

echo "✅ Dagger pipeline completed successfully!"

