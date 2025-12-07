# Run All Workflows - Master script voor alle CI/CD workflows
# Vervangt alle GitHub Actions workflows

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkflowsDir = $ScriptDir

Write-Host "🚀 Running All CI/CD Workflows..." -ForegroundColor Cyan
Write-Host ""

# Pre-merge checks
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1️⃣  Pre-Merge Checks" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\pre-merge-check.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Pre-merge checks failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Pre-merge checks failed" -ForegroundColor Red
    exit 1
}

# CI Full Pipeline
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "2️⃣  CI Full Pipeline" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\ci-full.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ CI Full Pipeline failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ CI Full Pipeline failed" -ForegroundColor Red
    exit 1
}

# Linting
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "3️⃣  Linting" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\lint.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Linting failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Linting failed" -ForegroundColor Red
    exit 1
}

# Security Scan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "4️⃣  Security Scan" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\security-scan.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Security scan found issues (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Security scan found issues (non-blocking)" -ForegroundColor Yellow
}

# CodeQL Security Scanning
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "5️⃣  CodeQL Security Scanning" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\codeql.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  CodeQL scanning found issues (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  CodeQL scanning found issues (non-blocking)" -ForegroundColor Yellow
}

# Super Linter
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "6️⃣  Super Linter" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\superlinter.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Super Linter found issues (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Super Linter found issues (non-blocking)" -ForegroundColor Yellow
}

# SonarQube Analysis
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "7️⃣  SonarQube Analysis" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\sonarqube.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  SonarQube analysis skipped or failed (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  SonarQube analysis skipped or failed (non-blocking)" -ForegroundColor Yellow
}

# Datadog Synthetic Tests
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "8️⃣  Datadog Synthetic Tests" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\datadog.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Datadog tests skipped or failed (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Datadog tests skipped or failed (non-blocking)" -ForegroundColor Yellow
}

# PR Labeler
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "9️⃣  PR Labeler" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\label.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  PR labeling skipped (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  PR labeling skipped (non-blocking)" -ForegroundColor Yellow
}

# Docker Builds
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔟 Docker Builds" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\docker-build.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker builds failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker builds failed" -ForegroundColor Red
    exit 1
}

# Dagger Pipeline
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1️⃣1️⃣  Dagger Pipeline" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
try {
    & "$WorkflowsDir\dagger-pipeline.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Dagger pipeline failed (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Dagger pipeline failed (non-blocking)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ All Workflows Completed Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

