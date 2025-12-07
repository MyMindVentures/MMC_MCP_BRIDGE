# PowerShell Script: Add All Secrets to Doppler
# Adds all 26 credentials to dev, staging, and production configs with placeholder values

$project = "mmc-mcp-bridge"
$placeholder = "PLACEHOLDER_REPLACE_ME"

$keys = @(
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "GITHUB_TOKEN",
    "LINEAR_API_KEY",
    "MONGODB_CONNECTION_STRING",
    "POSTGRES_CONNECTION_STRING",
    "SQLITE_DB_PATH",
    "NOTION_API_KEY",
    "SLACK_BOT_TOKEN",
    "AIRTABLE_API_KEY",
    "RAINDROP_TOKEN",
    "POSTMAN_API_KEY",
    "GOOGLE_DRIVE_CREDENTIALS",
    "STRAPI_URL",
    "STRAPI_API_KEY",
    "STRIPE_SECRET_KEY",
    "REDIS_URL",
    "SENTRY_DSN",
    "OLLAMA_BASE_URL",
    "BRAVE_SEARCH_API_KEY",
    "MCP_BRIDGE_API_KEY",
    "RAILWAY_TOKEN",
    "N8N_INSTANCE_APIKEY",
    "N8N_API_KEY",
    "N8N_BASE_URL"
)

$configs = @("dev", "staging", "production")

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Adding Secrets to Doppler" -ForegroundColor Cyan
Write-Host "Project: $project" -ForegroundColor Cyan
Write-Host "Total Keys: $($keys.Count)" -ForegroundColor Cyan
Write-Host "Configs: $($configs -join ', ')" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$totalSuccess = 0
$totalFailed = 0

foreach ($config in $configs) {
    Write-Host "=== Config: $config ===" -ForegroundColor Yellow
    $success = 0
    $failed = 0
    
    foreach ($key in $keys) {
        Write-Host "Adding $key to $config..." -NoNewline
        $result = doppler secrets set "$key=$placeholder" --project $project --config $config --no-interactive 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✓" -ForegroundColor Green
            $success++
            $totalSuccess++
        } else {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "  Error: $result" -ForegroundColor Red
            $failed++
            $totalFailed++
        }
    }
    
    Write-Host ""
    Write-Host "Summary for $config :" -ForegroundColor Cyan
    Write-Host "  Success: $success" -ForegroundColor Green
    Write-Host "  Failed: $failed" -ForegroundColor Red
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Final Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total Success: $totalSuccess" -ForegroundColor Green
Write-Host "Total Failed: $totalFailed" -ForegroundColor Red
Write-Host ""

# Verification
Write-Host "=== Verification ===" -ForegroundColor Yellow
foreach ($config in $configs) {
    Write-Host "`n--- $config config ---" -ForegroundColor Cyan
    try {
        $secrets = doppler secrets --project $project --config $config --format json | ConvertFrom-Json
        $count = $secrets.PSObject.Properties.Count
        Write-Host "Total secrets: $count" -ForegroundColor Green
        
        if ($count -ge $keys.Count) {
            Write-Host "✓ All keys present" -ForegroundColor Green
        } else {
            Write-Host "⚠ Missing keys (expected $($keys.Count), found $count)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Failed to verify: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Replace PLACEHOLDER_REPLACE_ME with actual values in Doppler dashboard." -ForegroundColor Yellow
