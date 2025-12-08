# Build and test the devcontainer Dockerfile
Write-Host "=== Building DevContainer ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$buildContext = "d:\GitHub_Local_Repos\MMC_MCP_BRIDGE"
$dockerfile = "$buildContext\.devcontainer\Dockerfile"
$imageName = "mmc-devcontainer:latest"

Set-Location $buildContext

Write-Host "Building image: $imageName" -ForegroundColor Yellow
Write-Host "Dockerfile: $dockerfile" -ForegroundColor Yellow
Write-Host "Context: $buildContext" -ForegroundColor Yellow
Write-Host ""

# Build with full output
docker build --progress=plain -f $dockerfile -t $imageName .

$buildExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "=== Build Result ===" -ForegroundColor Cyan

if ($buildExitCode -eq 0) {
    Write-Host "✓ Build SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    
    # Show image info
    Write-Host "Image created:" -ForegroundColor Yellow
    docker images $imageName --format "  {{.Repository}}:{{.Tag}} - {{.Size}} - Created: {{.CreatedAt}}"
    Write-Host ""
    
    # Test the container
    Write-Host "=== Testing Container ===" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Testing Node.js:" -ForegroundColor Yellow
    docker run --rm $imageName node --version
    
    Write-Host "Testing npm:" -ForegroundColor Yellow
    docker run --rm $imageName npm --version
    
    Write-Host "Testing scripts:" -ForegroundColor Yellow
    docker run --rm $imageName sh -c "ls -lh /usr/local/bin/devcontainer.sh /usr/local/bin/workflow* 2>&1"
    
    Write-Host "Testing Doppler:" -ForegroundColor Yellow
    docker run --rm $imageName doppler --version 2>&1 | Select-Object -First 1
    
    Write-Host ""
    Write-Host "✓ All tests completed!" -ForegroundColor Green
} else {
    Write-Host "✗ Build FAILED with exit code: $buildExitCode" -ForegroundColor Red
    exit 1
}
