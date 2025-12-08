# Test Doppler API connectivity and project/config existence
# PowerShell script to test Doppler API

$DEV_TOKEN = "dp.st.dev.4qcLlbkTamPF5CRVv39Bg5RiZt4SPzIsXfR2ZqrZxLG"
$PROJECT = "mmc-mcp-bridge"
$CONFIG = "dev"

Write-Host "=== Testing Doppler API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if we can access the API
Write-Host "1. Testing API access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.doppler.com/v3/projects" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $DEV_TOKEN"
        } `
        -ErrorAction Stop
    
    Write-Host "✅ API access successful" -ForegroundColor Green
    $project = $response.projects | Where-Object { $_.name -eq $PROJECT }
    if ($project) {
        Write-Host "✅ Project '$PROJECT' found" -ForegroundColor Green
        $project | ConvertTo-Json -Depth 3
    } else {
        Write-Host "❌ Project '$PROJECT' not found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API access failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 2: Check if config exists
Write-Host "2. Testing config access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.doppler.com/v3/configs/config?project=$PROJECT&config=$CONFIG" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $DEV_TOKEN"
        } `
        -ErrorAction Stop
    
    Write-Host "✅ Config exists" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Config check failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Try to add a single secret
Write-Host "3. Testing secret addition..." -ForegroundColor Yellow
try {
    $body = @{
        project = $PROJECT
        config = $CONFIG
        secrets = @{
            TEST_SECRET = "test_value_123"
        }
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "https://api.doppler.com/v3/configs/config/secrets" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $DEV_TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ Secret addition successful" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Secret addition failed" -ForegroundColor Red
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

# Test 4: Verify the secret was added
Write-Host "4. Verifying secret was added..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.doppler.com/v3/configs/config/secrets?project=$PROJECT&config=$CONFIG" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $DEV_TOKEN"
        } `
        -ErrorAction Stop
    
    if ($response.secrets.PSObject.Properties.Name -contains "TEST_SECRET") {
        Write-Host "✅ TEST_SECRET found in secrets" -ForegroundColor Green
        $response.secrets.TEST_SECRET | ConvertTo-Json -Depth 3
    } else {
        Write-Host "❌ TEST_SECRET not found" -ForegroundColor Red
        Write-Host "Available secrets:" -ForegroundColor Yellow
        $response.secrets.PSObject.Properties.Name | ForEach-Object { Write-Host "  - $_" }
    }
} catch {
    Write-Host "❌ Verification failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
