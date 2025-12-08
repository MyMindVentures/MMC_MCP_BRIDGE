#!/bin/bash
# CI Full Pipeline - Vervangt ci-full.yml
# Volledige CI pipeline: lint, typecheck, build
set -e

echo "🚀 Starting CI Full Pipeline..."

# Type check
echo "📝 Running TypeScript type check..."
npm run type-check || {
    echo "❌ Type check failed"
    exit 1
}

# Build
echo "🔨 Building application..."
npm run build || {
    echo "❌ Build failed"
    exit 1
}

echo "✅ CI Full Pipeline completed successfully!"

