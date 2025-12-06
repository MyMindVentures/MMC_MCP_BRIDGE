#!/bin/bash
# Linting - Vervangt super-linter.yml
# Code linting en formatting checks
set -e

echo "🔍 Running Linting Checks..."

# Check if ESLint is available
if command -v eslint &> /dev/null || npm list eslint &> /dev/null; then
    echo "📝 Running ESLint..."
    npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0 || {
        echo "❌ ESLint found issues"
        exit 1
    }
else
    echo "⚠️  ESLint not configured, skipping..."
fi

# Check if Prettier is available
if command -v prettier &> /dev/null || npm list prettier &> /dev/null; then
    echo "💅 Running Prettier check..."
    npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}" || {
        echo "❌ Prettier found formatting issues"
        exit 1
    }
else
    echo "⚠️  Prettier not configured, skipping..."
fi

# TypeScript strict checks
echo "📝 Running TypeScript strict checks..."
npm run type-check || {
    echo "❌ TypeScript strict checks failed"
    exit 1
}

echo "✅ All linting checks passed!"

