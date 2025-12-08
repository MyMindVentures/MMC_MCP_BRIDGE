#!/bin/bash
# Pre-Merge Check - Vervangt pre-merge-check.yml
# Type-check en build validatie voor merges
set -e

echo "🔍 Running Pre-Merge Checks..."

# Type check
echo "📝 TypeScript type check..."
npm run type-check || {
    echo "❌ Type check failed - Merge blocked"
    exit 1
}

# Build
echo "🔨 Build validation..."
npm run build || {
    echo "❌ Build failed - Merge blocked"
    exit 1
}

# Docker Compose validation
echo "🐳 Docker Compose validation..."
npm run docker:validate || {
    echo "❌ Docker Compose validation failed - Merge blocked"
    exit 1
}

echo "✅ All pre-merge checks passed!"

