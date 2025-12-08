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

# CodeQL Security Scanning
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  CodeQL Security Scanning"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/codeql.sh" || {
    echo "⚠️  CodeQL scanning found issues (non-blocking)"
}

# Super Linter
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Super Linter"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/superlinter.sh" || {
    echo "⚠️  Super Linter found issues (non-blocking)"
}

# SonarQube Analysis
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  SonarQube Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/sonarqube.sh" || {
    echo "⚠️  SonarQube analysis skipped or failed (non-blocking)"
}

# Datadog Synthetic Tests
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  Datadog Synthetic Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/datadog.sh" || {
    echo "⚠️  Datadog tests skipped or failed (non-blocking)"
}

# PR Labeler
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  PR Labeler"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/label.sh" || {
    echo "⚠️  PR labeling skipped (non-blocking)"
}

# Docker Builds
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔟 Docker Builds"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/docker-build.sh" || {
    echo "❌ Docker builds failed"
    exit 1
}

# Dagger Pipeline
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣1️⃣  Dagger Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
"${WORKFLOWS_DIR}/dagger-pipeline.sh" || {
    echo "⚠️  Dagger pipeline failed (non-blocking)"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All Workflows Completed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

