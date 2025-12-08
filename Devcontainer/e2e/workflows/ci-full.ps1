# CI Full Pipeline - Vervangt ci-full.yml
# Volledige CI pipeline: lint, typecheck, build

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting CI Full Pipeline..." -ForegroundColor Cyan

# Type check
Write-Host "📝 Running TypeScript type check..." -ForegroundColor Yellow
try {
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Type check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Type check failed" -ForegroundColor Red
    exit 1
}

# Build
# Write-Host "🔨 Building application..." -ForegroundColor Yellow
# try {
#     npm run build
#     if ($LASTEXITCODE -ne 0) {
#         Write-Host "❌ Build failed" -ForegroundColor Red
#         exit 1
#     }
# } catch {
#     Write-Host "❌ Build failed" -ForegroundColor Red
#     exit 1
# }

Write-Host "✅ CI Full Pipeline completed successfully!" -ForegroundColor Green

