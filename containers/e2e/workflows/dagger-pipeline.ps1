# Dagger Pipeline - Vervangt Dagger CI/CD workflows
# Run Dagger pipeline voor builds en deployments

$ErrorActionPreference = "Stop"

Write-Host "🗡️  Running Dagger Pipeline..." -ForegroundColor Cyan

# Check if Dagger is available
try {
    $null = Get-Command dagger -ErrorAction Stop
} catch {
    Write-Host "❌ Dagger CLI not found" -ForegroundColor Red
    exit 1
}

# Run Dagger pipeline
Write-Host "🚀 Executing Dagger pipeline..." -ForegroundColor Yellow
try {
    dagger run ./.dagger/pipeline.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Dagger pipeline failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Dagger pipeline failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dagger pipeline completed successfully!" -ForegroundColor Green

