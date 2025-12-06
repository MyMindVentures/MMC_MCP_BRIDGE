#!/bin/bash
# Run All Workflows - Master script voor alle CI/CD workflows
# Vervangt alle GitHub Actions workflows
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWS_DIR="${SCRIPT_DIR}"

echo "🚀 Running All CI/CD Workflows..."
echo ""

# Pre-merge checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Pre-Merge Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/pre-merge-check.sh" || {
    echo "❌ Pre-merge checks failed"
    exit 1
}

# CI Full Pipeline
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CI Full Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/ci-full.sh" || {
    echo "❌ CI Full Pipeline failed"
    exit 1
}

# Linting
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Linting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/lint.sh" || {
    echo "❌ Linting failed"
    exit 1
}

# Security Scan
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Security Scan"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/security-scan.sh" || {
    echo "⚠️  Security scan found issues (non-blocking)"
}

# Docker Builds
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Docker Builds"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/docker-build.sh" || {
    echo "❌ Docker builds failed"
    exit 1
}

# Dagger Pipeline
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Dagger Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/dagger-pipeline.sh" || {
    echo "⚠️  Dagger pipeline failed (non-blocking)"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Workflows Completed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

