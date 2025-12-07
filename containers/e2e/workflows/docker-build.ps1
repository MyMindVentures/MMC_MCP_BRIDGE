# Docker Build & Publish - Vervangt docker-hub-publish.yml
# Build en push Docker images naar registries

$ErrorActionPreference = "Stop"

# Only e2e container remains - dev and app were removed (replaced by devcontainer)
$Containers = @("e2e")
$RegistryHub = "mymindventures"
$RegistryGHCR = "ghcr.io/mymindventures"

# Get version from package.json
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $Version = $packageJson.version
} catch {
    $Version = "latest"
}

$PushHub = if ($env:PUSH_HUB -eq "true") { $true } else { $false }
$PushGHCR = if ($env:PUSH_GHCR -eq "true") { $true } else { $false }

Write-Host "🐳 Building Docker Images..." -ForegroundColor Cyan
Write-Host "   Version: $Version" -ForegroundColor Gray

foreach ($container in $Containers) {
    Write-Host ""
    Write-Host "🔨 Building $container container..." -ForegroundColor Yellow
    
    # Get build date and git commit
    $BuildDate = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    $VcsRef = try {
        git rev-parse --short HEAD 2>$null
        if ($LASTEXITCODE -ne 0) { "unknown" }
    } catch {
        "unknown"
    }
    
    # Build container
    try {
        docker compose build `
            --build-arg VERSION="$Version" `
            --build-arg BUILD_DATE="$BuildDate" `
            --build-arg VCS_REF="$VcsRef" `
            $container
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to build $container container" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Failed to build $container container" -ForegroundColor Red
        exit 1
    }
    
    # Tag for Docker Hub
    if ($PushHub) {
        Write-Host "🏷️  Tagging for Docker Hub..." -ForegroundColor Yellow
        docker tag "mmc-mcp-bridge-$container`:latest" "$RegistryHub/mmc-mcp-bridge-$container`:latest"
        docker tag "mmc-mcp-bridge-$container`:latest" "$RegistryHub/mmc-mcp-bridge-$container`:$Version"
        
        Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow
        try {
            docker push "$RegistryHub/mmc-mcp-bridge-$container`:latest"
        } catch {
            Write-Host "⚠️  Failed to push to Docker Hub (non-blocking)" -ForegroundColor Yellow
        }
        try {
            docker push "$RegistryHub/mmc-mcp-bridge-$container`:$Version"
        } catch {
            Write-Host "⚠️  Failed to push to Docker Hub (non-blocking)" -ForegroundColor Yellow
        }
    }
    
    # Tag for GHCR
    if ($PushGHCR) {
        Write-Host "🏷️  Tagging for GHCR..." -ForegroundColor Yellow
        docker tag "mmc-mcp-bridge-$container`:latest" "$RegistryGHCR/mmc-mcp-bridge-$container`:latest"
        docker tag "mmc-mcp-bridge-$container`:latest" "$RegistryGHCR/mmc-mcp-bridge-$container`:$Version"
        
        Write-Host "📤 Pushing to GHCR..." -ForegroundColor Yellow
        try {
            docker push "$RegistryGHCR/mmc-mcp-bridge-$container`:latest"
        } catch {
            Write-Host "⚠️  Failed to push to GHCR (non-blocking)" -ForegroundColor Yellow
        }
        try {
            docker push "$RegistryGHCR/mmc-mcp-bridge-$container`:$Version"
        } catch {
            Write-Host "⚠️  Failed to push to GHCR (non-blocking)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ $container container built successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All Docker images built successfully!" -ForegroundColor Green

