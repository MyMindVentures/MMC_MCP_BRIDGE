# Test script to build and validate the devcontainer Dockerfile
Write-Host "Testing devcontainer Dockerfile build..." -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$buildContext = "d:\GitHub_Local_Repos\MMC_MCP_BRIDGE"
$dockerfile = "$buildContext\.devcontainer\Dockerfile"
$imageName = "mmc-devcontainer-test"

# Check if required files exist
Write-Host "`nChecking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "$buildContext\.devcontainer\devcontainer.sh",
    "$buildContext\.devcontainer\workflow-wrapper.sh",
    "$buildContext\.devcontainer\workflow-wrapper.ps1"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $($file.Split('\')[-1]) exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Split('\')[-1]) MISSING!" -ForegroundColor Red
        exit 1
    }
}

# Build the image
Write-Host "`nBuilding Docker image..." -ForegroundColor Yellow
Set-Location $buildContext
$buildOutput = docker build -f $dockerfile -t $imageName . 2>&1
$buildExitCode = $LASTEXITCODE

if ($buildExitCode -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    
    # Test the image
    Write-Host "`nTesting image..." -ForegroundColor Yellow
    $testOutput = docker run --rm $imageName node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Node.js version: $testOutput" -ForegroundColor Green
    }
    
    $testOutput2 = docker run --rm $imageName which devcontainer.sh 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ devcontainer.sh found" -ForegroundColor Green
    }
    
    Write-Host "`n✓ All tests passed!" -ForegroundColor Green
    Write-Host "Image name: $imageName" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Build failed with exit code: $buildExitCode" -ForegroundColor Red
    Write-Host "`nBuild output:" -ForegroundColor Yellow
    $buildOutput | ForEach-Object { Write-Host $_ }
    exit 1
}
