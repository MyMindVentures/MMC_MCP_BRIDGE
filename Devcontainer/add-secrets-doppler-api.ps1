# Add all secrets to Doppler via API
# PowerShell script to add all 26 secrets to dev/staging/production configs

$DEV_TOKEN = "dp.st.dev.4qcLlbkTamPF5CRVv39Bg5RiZt4SPzIsXfR2ZqrZxLG"
$STG_TOKEN = "dp.st.stg.dtqBETZUHcWYNCFGwJhWGKUcDGy8OeM32P60ZQkQdbH"
$PRD_TOKEN = "dp.st.prd.BB961UL7JH92m0dNXCxQohwqsLE1zo5DoFIDfCvrzbG"

$PROJECT = "mmc-mcp-bridge"

# All 26 secrets with placeholder values
$SECRETS = @{
    "OPENAI_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE OPENAI API KEY"
    "ANTHROPIC_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE ANTHROPIC API KEY"
    "GITHUB_TOKEN" = "⚠️ VERVANG DIT MET JE ECHTE GITHUB TOKEN"
    "LINEAR_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE LINEAR API KEY"
    "MONGODB_CONNECTION_STRING" = "⚠️ VERVANG DIT MET JE ECHTE MONGODB CONNECTION STRING"
    "POSTGRES_CONNECTION_STRING" = "⚠️ VERVANG DIT MET JE ECHTE POSTGRES CONNECTION STRING"
    "SQLITE_DB_PATH" = "⚠️ VERVANG DIT MET JE ECHTE SQLITE DB PATH"
    "NOTION_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE NOTION API KEY"
    "SLACK_BOT_TOKEN" = "⚠️ VERVANG DIT MET JE ECHTE SLACK BOT TOKEN"
    "AIRTABLE_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE AIRTABLE API KEY"
    "RAINDROP_TOKEN" = "⚠️ VERVANG DIT MET JE ECHTE RAINDROP TOKEN"
    "POSTMAN_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE POSTMAN API KEY"
    "GOOGLE_DRIVE_CREDENTIALS" = "⚠️ VERVANG DIT MET JE ECHTE GOOGLE DRIVE CREDENTIALS JSON"
    "STRAPI_URL" = "⚠️ VERVANG DIT MET JE ECHTE STRAPI URL"
    "STRAPI_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE STRAPI API KEY"
    "STRIPE_SECRET_KEY" = "⚠️ VERVANG DIT MET JE ECHTE STRIPE SECRET KEY"
    "REDIS_URL" = "⚠️ VERVANG DIT MET JE ECHTE REDIS URL"
    "SENTRY_DSN" = "⚠️ VERVANG DIT MET JE ECHTE SENTRY DSN"
    "OLLAMA_BASE_URL" = "⚠️ VERVANG DIT MET JE ECHTE OLLAMA BASE URL"
    "BRAVE_SEARCH_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE BRAVE SEARCH API KEY"
    "MCP_BRIDGE_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE MCP BRIDGE API KEY"
    "RAILWAY_TOKEN" = "⚠️ VERVANG DIT MET JE ECHTE RAILWAY TOKEN"
    "N8N_INSTANCE_APIKEY" = "⚠️ VERVANG DIT MET JE ECHTE N8N INSTANCE API KEY"
    "N8N_API_KEY" = "⚠️ VERVANG DIT MET JE ECHTE N8N API KEY"
    "N8N_BASE_URL" = "⚠️ VERVANG DIT MET JE ECHTE N8N BASE URL"
}

# Function to add secrets to a config
function Add-SecretsToConfig {
    param(
        [string]$Config,
        [string]$Token
    )
    
    Write-Host "=== Adding secrets to $Config config ===" -ForegroundColor Cyan
    
    # Build request body
    $body = @{
        project = $PROJECT
        config = $Config
        secrets = $SECRETS
    } | ConvertTo-Json -Depth 3
    
    Write-Host "Payload size: $($body.Length) characters" -ForegroundColor Yellow
    Write-Host "Making API call..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.doppler.com/v3/configs/config/secrets" `
            -Method Post `
            -Headers @{
                "Authorization" = "Bearer $Token"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "✅ Successfully added secrets to $Config" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3
        
        # Verify
        Write-Host "Verifying secrets in $Config..." -ForegroundColor Yellow
        $verifyResponse = Invoke-RestMethod -Uri "https://api.doppler.com/v3/configs/config/secrets?project=$PROJECT&config=$Config" `
            -Method Get `
            -Headers @{
                "Authorization" = "Bearer $Token"
            } `
            -ErrorAction Stop
        
        $secretCount = ($verifyResponse.secrets.PSObject.Properties.Name | Measure-Object).Count
        Write-Host "Secrets count: $secretCount" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to add secrets to $Config" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Add secrets to all configs
Add-SecretsToConfig -Config "dev" -Token $DEV_TOKEN
Add-SecretsToConfig -Config "staging" -Token $STG_TOKEN
Add-SecretsToConfig -Config "production" -Token $PRD_TOKEN

# Final verification
Write-Host "=== Final Verification ===" -ForegroundColor Cyan
$configs = @(
    @{ Name = "dev"; Token = $DEV_TOKEN },
    @{ Name = "staging"; Token = $STG_TOKEN },
    @{ Name = "production"; Token = $PRD_TOKEN }
)

foreach ($configInfo in $configs) {
    $config = $configInfo.Name
    $token = $configInfo.Token
    
    Write-Host "--- $config config ---" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://api.doppler.com/v3/configs/config/secrets?project=$PROJECT&config=$config" `
            -Method Get `
            -Headers @{
                "Authorization" = "Bearer $token"
            } `
            -ErrorAction Stop
        
        $count = ($response.secrets.PSObject.Properties.Name | Measure-Object).Count
        Write-Host "Total secrets: $count" -ForegroundColor Green
        
        # Check for errors
        if ($response.error) {
            Write-Host "Error: $($response.error)" -ForegroundColor Red
        }
        if ($response.message) {
            Write-Host "Message: $($response.message)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to verify $config" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}
