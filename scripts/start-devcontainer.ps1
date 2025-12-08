# Start DevContainer with Hot Reload
# Fixes PowerShell output visibility issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MMC MCP Bridge - DevContainer Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location $PSScriptRoot\..
$projectRoot = Get-Location

Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Step 1: Stop existing containers
Write-Host "[1/5] Stopping existing containers..." -ForegroundColor Yellow
docker compose down
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Containers stopped" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Warning: Some containers may not have stopped" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Build container
Write-Host "[2/5] Building container..." -ForegroundColor Yellow
docker compose build app
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Container built successfully" -ForegroundColor Green
} else {
    Write-Host "  ✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Start container
Write-Host "[3/5] Starting container..." -ForegroundColor Yellow
docker compose up -d app
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Container started" -ForegroundColor Green
} else {
    Write-Host "  ✗ Start failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Wait for container to be ready
Write-Host "[4/5] Waiting for container to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Step 5: Check container status
Write-Host "[5/5] Checking container status..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=MMC_MCP_Bridge_App" --format "{{.Names}} - {{.Status}}"
Write-Host $containerStatus
if ($LASTEXITCODE -eq 0 -and $containerStatus -match "MMC_MCP_Bridge_App") {
    Write-Host "  ✓ Container is running" -ForegroundColor Green
} else {
    Write-Host "  ✗ Container is not running!" -ForegroundColor Red
    Write-Host "  Checking logs..." -ForegroundColor Yellow
    docker compose logs app --tail 30
    exit 1
}
Write-Host ""

# Show logs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Container Logs (last 20 lines):" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker compose logs app --tail 20
Write-Host ""

# Check if app is responding
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Health Check:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 5
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "  ✓ App is responding on http://localhost:3000" -ForegroundColor Green
        Write-Host "  Response: $($healthResponse.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠ App not responding yet (this is normal, may take 30-60 seconds)" -ForegroundColor Yellow
    Write-Host "  Check logs with: npm run docker:logs" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ DevContainer is running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  npm run docker:logs      - View logs" -ForegroundColor Gray
Write-Host "  npm run docker:restart   - Restart container" -ForegroundColor Gray
Write-Host "  npm run docker:down      - Stop container" -ForegroundColor Gray
Write-Host ""

