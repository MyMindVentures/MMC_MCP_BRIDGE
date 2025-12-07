# Docker Compose Watch Fallback Script for Windows
# Checks if docker compose watch is available, otherwise uses traditional up

# Debug logging
$logPath = ".cursor/debug.log"
function Write-DebugLog {
    param($message, $data = @{})
    $logEntry = @{
        timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        location = "docker-watch-fallback.ps1"
        message = $message
        data = $data
        sessionId = "debug-session"
        runId = "run1"
        hypothesisId = "F"
    } | ConvertTo-Json -Compress
    try {
        $logDir = Split-Path $logPath -Parent
        if (-not (Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        Add-Content -Path $logPath -Value $logEntry
    } catch {
        Write-Host "[Debug] Failed to write log: $_" -ForegroundColor Yellow
    }
    Write-Host "[Debug Log] $message" -ForegroundColor Gray
}

Write-DebugLog "Script started" @{psVersion = $PSVersionTable.PSVersion.ToString()}

Write-Host "🔍 Checking Docker Compose Watch availability..." -ForegroundColor Cyan

# Check Docker version first
Write-DebugLog "Checking Docker version"
try {
    $dockerVersion = docker --version 2>&1 | Out-String
    $dockerComposeVersion = docker compose version 2>&1 | Out-String
    Write-Host "Docker: $dockerVersion" -ForegroundColor Cyan
    Write-Host "Docker Compose: $dockerComposeVersion" -ForegroundColor Cyan
    Write-DebugLog "Docker versions" @{docker = $dockerVersion; compose = $dockerComposeVersion}
} catch {
    Write-Host "❌ Docker check failed: $_" -ForegroundColor Red
    Write-DebugLog "Docker check failed" @{error = $_.Exception.Message}
    exit 1
}

# Check if docker compose watch is available
$watchAvailable = $false
try {
    Write-DebugLog "Testing docker compose watch --help"
    Write-Host "Testing: docker compose watch --help" -ForegroundColor Gray
    $helpOutput = docker compose watch --help 2>&1 | Out-String
    $exitCode = $LASTEXITCODE
    Write-Host "Exit code: $exitCode" -ForegroundColor Gray
    Write-DebugLog "Watch help output" @{output = $helpOutput; exitCode = $exitCode}
    if ($exitCode -eq 0 -and $helpOutput -match "watch") {
        $watchAvailable = $true
        Write-Host "✅ Watch command recognized" -ForegroundColor Green
        Write-DebugLog "Watch available" @{available = $true}
    } else {
        Write-Host "❌ Watch command not available (exit code: $exitCode)" -ForegroundColor Yellow
        Write-DebugLog "Watch not available" @{available = $false; exitCode = $exitCode; error = $helpOutput}
    }
} catch {
    Write-Host "❌ Watch check exception: $_" -ForegroundColor Red
    Write-DebugLog "Watch check exception" @{error = $_.Exception.Message; available = $false}
    $watchAvailable = $false
}

if ($watchAvailable) {
    Write-DebugLog "Using Docker Compose Watch"
    Write-Host "✅ Docker Compose Watch is available" -ForegroundColor Green
    Write-Host "🚀 Starting with Docker Compose Watch (hot reload enabled)..." -ForegroundColor Green
    docker compose watch
    Write-DebugLog "Watch command completed" @{exitCode = $LASTEXITCODE}
} else {
    Write-DebugLog "Using fallback: docker compose up"
    Write-Host "⚠️ Docker Compose Watch not available (requires Docker Compose v2.22.0+)" -ForegroundColor Yellow
    Write-Host "📦 Using fallback: docker compose up (bind mounts provide hot reload)..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Note: Bind mounts (.:/workspaces/MMC_MCP_BRIDGE) still provide hot reload" -ForegroundColor Gray
    Write-Host "      Next.js Fast Refresh will work automatically" -ForegroundColor Gray
    Write-Host ""
    try {
        docker compose up -d --build app
        Write-DebugLog "Docker compose up completed" @{exitCode = $LASTEXITCODE}
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Container started. View logs with: npm run docker:logs" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Container start failed. Check logs with: npm run docker:logs" -ForegroundColor Red
            Write-DebugLog "Container start failed" @{exitCode = $LASTEXITCODE}
        }
    } catch {
        Write-DebugLog "Docker compose up exception" @{error = $_.Exception.Message}
        Write-Host "❌ Error starting container: $_" -ForegroundColor Red
    }
}
