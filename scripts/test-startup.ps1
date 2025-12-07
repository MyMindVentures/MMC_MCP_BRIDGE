# Startup Test Script - Tests all critical components
# Usage: pwsh -File ./scripts/test-startup.ps1

Write-Host "🚀 MMC MCP Bridge - Startup Test" -ForegroundColor Cyan
Write-Host ""

# Test 1: Node.js
Write-Host "1. Testing Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Test 2: npm
Write-Host "2. Testing npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    exit 1
}

# Test 3: Docker
Write-Host "3. Testing Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "   ✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker not found or not running" -ForegroundColor Red
    Write-Host "   ⚠️  Docker is optional for local development" -ForegroundColor Yellow
}

# Test 4: Docker Compose
Write-Host "4. Testing Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version 2>&1
    Write-Host "   ✅ Docker Compose: $composeVersion" -ForegroundColor Green
    
    # Check for watch support
    $watchTest = docker compose watch --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker Compose Watch: Available" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Docker Compose Watch: Not available (requires v2.22.0+)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Docker Compose not found" -ForegroundColor Red
}

# Test 5: TypeScript
Write-Host "5. Testing TypeScript..." -ForegroundColor Yellow
try {
    $tscVersion = npx tsc --version 2>&1
    Write-Host "   ✅ TypeScript: $tscVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  TypeScript check failed (may need npm install)" -ForegroundColor Yellow
}

# Test 6: Dependencies
Write-Host "6. Testing dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules not found - run: npm install" -ForegroundColor Yellow
}

# Test 7: Build
Write-Host "7. Testing build..." -ForegroundColor Yellow
try {
    npm run type-check 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ TypeScript type-check passed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ TypeScript type-check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Type-check failed: $_" -ForegroundColor Yellow
}

# Test 8: Docker Container
Write-Host "8. Testing Docker container..." -ForegroundColor Yellow
try {
    $containers = docker ps -a --filter "name=MMC" --format "{{.Names}}" 2>&1
    if ($containers) {
        Write-Host "   ✅ Containers found: $containers" -ForegroundColor Green
        
        # Check if running
        $running = docker ps --filter "name=MMC" --format "{{.Names}}" 2>&1
        if ($running) {
            Write-Host "   ✅ Container running: $running" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Container exists but not running" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  No containers found - start with: npm run docker:up" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Docker check failed: $_" -ForegroundColor Yellow
}

# Test 9: Port 3000
Write-Host "9. Testing port 3000..." -ForegroundColor Yellow
try {
    $portCheck = netstat -ano | Select-String ":3000"
    if ($portCheck) {
        Write-Host "   ✅ Port 3000 is in use" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Port 3000 is not in use (server not running)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Port check failed: $_" -ForegroundColor Yellow
}

# Test 10: Health Endpoint
Write-Host "10. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Health endpoint responding" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Cyan
        Write-Host "   Servers: $($healthData.servers.enabled) enabled" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Health endpoint not responding (server not running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Startup test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - Start server: npm run dev" -ForegroundColor White
Write-Host "  - Or with Docker: npm run docker:up:watch" -ForegroundColor White
Write-Host "  - View logs: npm run docker:logs" -ForegroundColor White
