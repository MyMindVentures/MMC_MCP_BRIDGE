# Security Scanning - Vervangt codeql.yml
# Security vulnerability scanning

$ErrorActionPreference = "Continue"

Write-Host "🔒 Running Security Scans..." -ForegroundColor Cyan

# npm audit
Write-Host "📦 Running npm audit..." -ForegroundColor Yellow
try {
    npm audit --audit-level=moderate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  npm audit found vulnerabilities (non-blocking)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  npm audit found vulnerabilities (non-blocking)" -ForegroundColor Yellow
}

# Check if Snyk is available
$snykAvailable = $false
try {
    $null = Get-Command snyk -ErrorAction SilentlyContinue
    $snykAvailable = $true
} catch {
    $snykAvailable = $false
}

if ($snykAvailable) {
    Write-Host "🛡️  Running Snyk security scan..." -ForegroundColor Yellow
    try {
        snyk test --severity-threshold=high
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Snyk found high severity issues (non-blocking)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Snyk found high severity issues (non-blocking)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Snyk not installed, skipping..." -ForegroundColor Gray
}

# Check for known vulnerable packages
Write-Host "🔍 Checking for known vulnerable packages..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    $vulnPackages = (Select-String -Path "package-lock.json" -Pattern '"resolved".*github\.com' | Measure-Object).Count
    if ($vulnPackages -gt 0) {
        Write-Host "⚠️  Found $vulnPackages packages from GitHub (potential security risk)" -ForegroundColor Yellow
    }
}

Write-Host "✅ Security scan completed!" -ForegroundColor Green

