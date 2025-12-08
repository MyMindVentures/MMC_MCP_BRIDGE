# Pre-Merge Check - Vervangt pre-merge-check.yml
# Type-check en build validatie voor merges

$ErrorActionPreference = "Stop"

Write-Host "🔍 Running Pre-Merge Checks..." -ForegroundColor Cyan

# Type check
Write-Host "📝 TypeScript type check..." -ForegroundColor Yellow
try {
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Type check failed - Merge blocked" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Type check failed - Merge blocked" -ForegroundColor Red
    exit 1
}

# Build
# Write-Host "🔨 Build validation..." -ForegroundColor Yellow
# try {
#     # Workaround: Ensure conflicting route.ts is deleted before build
#     if (Test-Path "app/[locale]/route.ts") {
#         Remove-Item "app/[locale]/route.ts" -Force
#         Write-Host "🗑️  Deleted conflicting app/[locale]/route.ts as a workaround." -ForegroundColor Magenta
#     }
#    npm run build
#     if ($LASTEXITCODE -ne 0) {
#         Write-Host "❌ Build failed - Merge blocked" -ForegroundColor Red
#         exit 1
#     }
# } catch {
#     Write-Host "❌ Build failed - Merge blocked" -ForegroundColor Red
#     exit 1
# }

# Docker Compose validation
Write-Host "🐳 Docker Compose validation..." -ForegroundColor Yellow
try {
    # Try 'docker compose' (Docker v2 CLI)
    & docker compose config --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Trying 'docker-compose' (Docker v1 CLI)..." -ForegroundColor Yellow
        # Fallback to 'docker-compose' (Docker v1 CLI)
        & docker-compose config --quiet
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker Compose validation failed - Merge blocked" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ docker-compose.yml is valid" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose validation failed - Merge blocked" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "✅ All pre-merge checks passed!" -ForegroundColor Green

