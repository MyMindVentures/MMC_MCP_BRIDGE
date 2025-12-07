# Linting - Vervangt super-linter.yml
# Code linting en formatting checks

$ErrorActionPreference = "Stop"

Write-Host "🔍 Running Linting Checks..." -ForegroundColor Cyan

# Check if ESLint is available
$eslintAvailable = $false
try {
    $null = Get-Command eslint -ErrorAction SilentlyContinue
    $eslintAvailable = $true
} catch {
    try {
        $null = npm list eslint 2>&1
        $eslintAvailable = $true
    } catch {
        $eslintAvailable = $false
    }
}

if ($eslintAvailable) {
    Write-Host "📝 Running ESLint..." -ForegroundColor Yellow
    try {
        npx eslint . --ext .ts,.tsx,.js,.jsx
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ ESLint found issues" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ ESLint found issues" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  ESLint not configured, skipping..." -ForegroundColor Yellow
}

# Check if Prettier is available
$prettierAvailable = $false
try {
    $null = Get-Command prettier -ErrorAction SilentlyContinue
    $prettierAvailable = $true
} catch {
    try {
        $null = npm list prettier 2>&1
        $prettierAvailable = $true
    } catch {
        $prettierAvailable = $false
    }
}

if ($prettierAvailable) {
    Write-Host "💅 Running Prettier check..." -ForegroundColor Yellow
    try {
        npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Prettier found formatting issues" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Prettier found formatting issues" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Prettier not configured, skipping..." -ForegroundColor Yellow
}

# TypeScript strict checks
Write-Host "📝 Running TypeScript strict checks..." -ForegroundColor Yellow
try {
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ TypeScript strict checks failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ TypeScript strict checks failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All linting checks passed!" -ForegroundColor Green

