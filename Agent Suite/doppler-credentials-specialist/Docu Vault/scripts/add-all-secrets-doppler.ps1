# PowerShell Script: Add All Secrets to Doppler
# Installs Doppler CLI if needed, then adds all 26 secrets to dev, staging, and production

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Doppler Secrets Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Doppler CLI is installed
Write-Host "Checking Doppler CLI..." -ForegroundColor Yellow
try {
    $dopplerVersion = doppler --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Doppler CLI found: $dopplerVersion" -ForegroundColor Green
    } else {
        throw "Doppler not found"
    }
} catch {
    Write-Host "✗ Doppler CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Installing Doppler CLI..." -ForegroundColor Yellow
    curl -Ls --tlsv1.2 --proto "=https" https://cli.doppler.com/install.sh | sh
    $env:PATH += ";$HOME/.local/bin"
    
    # Verify installation
    try {
        $dopplerVersion = doppler --version 2>&1
        Write-Host "✓ Doppler CLI installed: $dopplerVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Installation failed. Please install manually:" -ForegroundColor Red
        Write-Host "  curl -Ls --tlsv1.2 --proto '=https' https://cli.doppler.com/install.sh | sh" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Yellow
try {
    $me = doppler me 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Authenticated" -ForegroundColor Green
    } else {
        Write-Host "✗ Not authenticated. Run: doppler login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Authentication check failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verify project exists
$project = "mmc-mcp-bridge"
Write-Host "Verifying project: $project" -ForegroundColor Yellow
try {
    $projectInfo = doppler projects get $project 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Project exists" -ForegroundColor Green
    } else {
        Write-Host "✗ Project not found. Creating..." -ForegroundColor Yellow
        doppler projects create $project
        Write-Host "✓ Project created" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Project verification failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# All 26 credentials
$allSecrets = @{
    "OPENAI_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "ANTHROPIC_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "GITHUB_TOKEN" = "PLACEHOLDER_REPLACE_ME"
    "LINEAR_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "MONGODB_CONNECTION_STRING" = "PLACEHOLDER_REPLACE_ME"
    "POSTGRES_CONNECTION_STRING" = "PLACEHOLDER_REPLACE_ME"
    "SQLITE_DB_PATH" = "PLACEHOLDER_REPLACE_ME"
    "NOTION_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "SLACK_BOT_TOKEN" = "PLACEHOLDER_REPLACE_ME"
    "AIRTABLE_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "RAINDROP_TOKEN" = "PLACEHOLDER_REPLACE_ME"
    "POSTMAN_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "GOOGLE_DRIVE_CREDENTIALS" = "PLACEHOLDER_REPLACE_ME"
    "STRAPI_URL" = "PLACEHOLDER_REPLACE_ME"
    "STRAPI_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "STRIPE_SECRET_KEY" = "PLACEHOLDER_REPLACE_ME"
    "REDIS_URL" = "PLACEHOLDER_REPLACE_ME"
    "SENTRY_DSN" = "PLACEHOLDER_REPLACE_ME"
    "OLLAMA_BASE_URL" = "PLACEHOLDER_REPLACE_ME"
    "BRAVE_SEARCH_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "MCP_BRIDGE_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "RAILWAY_TOKEN" = "PLACEHOLDER_REPLACE_ME"
    "N8N_INSTANCE_APIKEY" = "PLACEHOLDER_REPLACE_ME"
    "N8N_API_KEY" = "PLACEHOLDER_REPLACE_ME"
    "N8N_BASE_URL" = "PLACEHOLDER_REPLACE_ME"
}

$configs = @("dev", "staging", "production")

# Add secrets to each config
foreach ($config in $configs) {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Adding secrets to: $config" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verify config exists
    try {
        $configInfo = doppler configs get $config --project $project 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Creating config: $config" -ForegroundColor Yellow
            doppler configs create $config --project $project
            Write-Host "✓ Config created" -ForegroundColor Green
        } else {
            Write-Host "✓ Config exists" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Config check failed, continuing..." -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Build command with all secrets
    $secretArgs = @()
    foreach ($key in $allSecrets.Keys) {
        $value = $allSecrets[$key]
        $secretArgs += "$key=$value"
    }
    
    $secretString = $secretArgs -join " "
    
    Write-Host "Adding all 26 secrets..." -ForegroundColor Yellow
    $result = doppler secrets set $secretString --project $project --config $config 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All secrets added to $config" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add secrets to $config" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Verification
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$expectedCount = 26
$allSuccess = $true

foreach ($config in $configs) {
    Write-Host "--- $config config ---" -ForegroundColor Yellow
    
    try {
        $secretsJson = doppler secrets --project $project --config $config --format json 2>&1
        if ($LASTEXITCODE -eq 0) {
            $secrets = $secretsJson | ConvertFrom-Json
            $count = $secrets.PSObject.Properties.Count
            
            Write-Host "  Secrets count: $count" -ForegroundColor $(if ($count -ge $expectedCount) { "Green" } else { "Red" })
            
            # Check for missing keys
            $missing = @()
            foreach ($key in $allSecrets.Keys) {
                if (-not $secrets.PSObject.Properties.Name -contains $key) {
                    $missing += $key
                }
            }
            
            if ($missing.Count -eq 0) {
                Write-Host "  ✓ All 26 keys present" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Missing keys: $($missing.Count)" -ForegroundColor Red
                $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
                $allSuccess = $false
            }
        } else {
            Write-Host "  ✗ Failed to retrieve secrets" -ForegroundColor Red
            $allSuccess = $false
        }
    } catch {
        Write-Host "  ✗ Verification failed: $_" -ForegroundColor Red
        $allSuccess = $false
    }
    
    Write-Host ""
}

# Final summary
Write-Host "==========================================" -ForegroundColor Cyan
if ($allSuccess) {
    Write-Host "✅ SUCCESS: All secrets added!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some secrets may be missing" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Replace PLACEHOLDER_REPLACE_ME with actual values in Doppler dashboard" -ForegroundColor Yellow
Write-Host ""
