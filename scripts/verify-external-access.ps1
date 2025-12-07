# Verify External Access - CLI Tools & MCP Servers
# Usage: pwsh -File ./scripts/verify-external-access.ps1

Write-Host "🔍 MMC MCP Bridge - External Access Verification" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# ========== CLI TOOLS ==========
Write-Host "1. CLI Tools Verification" -ForegroundColor Yellow
Write-Host ""

# Docker CLI
Write-Host "   Docker CLI..." -NoNewline
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "      Version: $dockerVersion" -ForegroundColor Gray
        
        # Test Docker socket
        Write-Host "   Docker Socket..." -NoNewline
        if (Test-Path "/var/run/docker.sock") {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Not found (may be in devcontainer)" -ForegroundColor Yellow
        }
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allPassed = $false
}

# Docker Compose
Write-Host "   Docker Compose..." -NoNewline
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "      Version: $composeVersion" -ForegroundColor Gray
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allPassed = $false
}

# Dagger CLI
Write-Host "   Dagger CLI..." -NoNewline
try {
    $daggerVersion = dagger version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "      Version: $daggerVersion" -ForegroundColor Gray
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allPassed = $false
}

# Doppler CLI
Write-Host "   Doppler CLI..." -NoNewline
try {
    $dopplerVersion = doppler --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "      Version: $dopplerVersion" -ForegroundColor Gray
        
        # Test Doppler token
        Write-Host "   Doppler Token..." -NoNewline
        if ($env:DOPPLER_TOKEN) {
            Write-Host " ✅ Configured" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Not set" -ForegroundColor Yellow
        }
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allPassed = $false
}

# 1Password CLI
Write-Host "   1Password CLI..." -NoNewline
try {
    $opVersion = op --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "      Version: $opVersion" -ForegroundColor Gray
        
        # Test 1Password token
        Write-Host "   1Password Token..." -NoNewline
        if ($env:OP_SERVICE_ACCOUNT_TOKEN) {
            Write-Host " ✅ Configured" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Not set (optional)" -ForegroundColor Yellow
        }
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allPassed = $false
}

# PowerShell
Write-Host "   PowerShell..." -NoNewline
try {
    $pwshVersion = pwsh --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        Write-Host "      Version: $pwshVersion" -ForegroundColor Gray
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# ========== ENVIRONMENT VARIABLES ==========
Write-Host "2. Environment Variables Verification" -ForegroundColor Yellow
Write-Host ""

$requiredEnvVars = @(
    @{Name="MCP_BRIDGE_API_KEY"; Category="Core"; Required=$true},
    @{Name="REDIS_URL"; Category="Core"; Required=$true},
    @{Name="POSTGRES_CONNECTION_STRING"; Category="Database"; Required=$false},
    @{Name="MONGODB_CONNECTION_STRING"; Category="Database"; Required=$false},
    @{Name="SQLITE_DB_PATH"; Category="Database"; Required=$false},
    @{Name="OPENAI_API_KEY"; Category="AI"; Required=$false},
    @{Name="ANTHROPIC_API_KEY"; Category="AI"; Required=$false},
    @{Name="GITHUB_TOKEN"; Category="Dev Tools"; Required=$false},
    @{Name="RAILWAY_TOKEN"; Category="Dev Tools"; Required=$false},
    @{Name="NOTION_API_KEY"; Category="Productivity"; Required=$false},
    @{Name="SLACK_BOT_TOKEN"; Category="Productivity"; Required=$false},
    @{Name="LINEAR_API_KEY"; Category="Productivity"; Required=$false},
    @{Name="AIRTABLE_API_KEY"; Category="Productivity"; Required=$false},
    @{Name="BRAVE_SEARCH_API_KEY"; Category="Automation"; Required=$false},
    @{Name="N8N_INSTANCE_APIKEY"; Category="Integration"; Required=$false},
    @{Name="N8N_API_KEY"; Category="Integration"; Required=$false},
    @{Name="STRIPE_SECRET_KEY"; Category="Integration"; Required=$false},
    @{Name="GOOGLE_CLIENT_ID"; Category="Integration"; Required=$false},
    @{Name="GOOGLE_CLIENT_SECRET"; Category="Integration"; Required=$false},
    @{Name="GOOGLE_REFRESH_TOKEN"; Category="Integration"; Required=$false},
    @{Name="DOPPLER_TOKEN"; Category="CLI Tools"; Required=$false},
    @{Name="OP_SERVICE_ACCOUNT_TOKEN"; Category="CLI Tools"; Required=$false}
)

$categories = @{}
foreach ($var in $requiredEnvVars) {
    if (-not $categories.ContainsKey($var.Category)) {
        $categories[$var.Category] = @()
    }
    $categories[$var.Category] += $var
}

foreach ($category in $categories.Keys | Sort-Object) {
    Write-Host "   $category" -ForegroundColor Cyan
    foreach ($var in $categories[$category]) {
        $value = [Environment]::GetEnvironmentVariable($var.Name)
        if ($value) {
            $masked = if ($var.Name -match "TOKEN|KEY|SECRET|PASSWORD") {
                $value.Substring(0, [Math]::Min(8, $value.Length)) + "***"
            } else {
                $value
            }
            Write-Host "      ✅ $($var.Name): $masked" -ForegroundColor Green
        } else {
            if ($var.Required) {
                Write-Host "      ❌ $($var.Name): NOT SET (REQUIRED)" -ForegroundColor Red
                $allPassed = $false
            } else {
                Write-Host "      ⚠️  $($var.Name): Not set (optional)" -ForegroundColor Yellow
            }
        }
    }
    Write-Host ""
}

# ========== MCP SERVER CONNECTIONS ==========
Write-Host "3. MCP Server External Connections" -ForegroundColor Yellow
Write-Host ""

# Test health endpoint
Write-Host "   Health Endpoint..." -NoNewline
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "      Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "      Servers: $($healthData.servers.enabled) enabled" -ForegroundColor Gray
    }
} catch {
    Write-Host " ⚠️  Not responding (server may not be running)" -ForegroundColor Yellow
}

# Test diagnostic endpoint
Write-Host "   Diagnostic Endpoint..." -NoNewline
try {
    $diagResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/debug/diagnostic" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($diagResponse.StatusCode -eq 200) {
        Write-Host " ✅" -ForegroundColor Green
        $diagData = $diagResponse.Content | ConvertFrom-Json
        Write-Host "      Connections:" -ForegroundColor Gray
        foreach ($conn in $diagData.connections.PSObject.Properties) {
            $status = if ($conn.Value.connected -or $conn.Value.accessible) { "✅" } else { "❌" }
            Write-Host "         $status $($conn.Name): $($conn.Value.configured)" -ForegroundColor $(if ($conn.Value.connected -or $conn.Value.accessible) { "Green" } else { "Yellow" })
        }
    }
} catch {
    Write-Host " ⚠️  Not responding (server may not be running)" -ForegroundColor Yellow
}

Write-Host ""

# ========== SUMMARY ==========
Write-Host "4. Summary" -ForegroundColor Yellow
Write-Host ""

if ($allPassed) {
    Write-Host "   ✅ All required CLI tools and environment variables are configured!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Some required components are missing or not configured." -ForegroundColor Yellow
    Write-Host "   Please check the output above and configure missing components." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  - Configure missing environment variables via Doppler or Railway" -ForegroundColor White
Write-Host "  - Test MCP servers: curl http://localhost:3000/api/debug/diagnostic" -ForegroundColor White
Write-Host "  - Start server: npm run docker:up:watch" -ForegroundColor White
