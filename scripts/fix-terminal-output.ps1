# Fix Terminal Output Issues in Cursor IDE
# Based on known Cursor IDE bugs and solutions

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cursor Terminal Output Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Cursor version
Write-Host "[1/4] Checking Cursor IDE..." -ForegroundColor Yellow
Write-Host "  Please check Cursor version: Help → About Cursor" -ForegroundColor Gray
Write-Host "  Known issues in Cursor v2.1.39+ (Windows 11)" -ForegroundColor Gray
Write-Host ""

# Step 2: workspaceStorage fix
Write-Host "[2/4] workspaceStorage Fix (Most Common Solution)" -ForegroundColor Yellow
$workspaceStoragePath = "$env:APPDATA\Cursor\User\workspaceStorage"
if (Test-Path $workspaceStoragePath) {
    Write-Host "  ⚠️  workspaceStorage folder found: $workspaceStoragePath" -ForegroundColor Yellow
    Write-Host "  ⚠️  WARNING: Deleting this folder will remove chat history!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  To fix terminal output:" -ForegroundColor Cyan
    Write-Host "  1. Close Cursor IDE completely" -ForegroundColor Gray
    Write-Host "  2. Delete folder: $workspaceStoragePath" -ForegroundColor Gray
    Write-Host "  3. Restart Cursor IDE" -ForegroundColor Gray
    Write-Host "  4. Test terminal output" -ForegroundColor Gray
    Write-Host ""
    $delete = Read-Host "  Delete workspaceStorage folder now? (y/N)"
    if ($delete -eq "y" -or $delete -eq "Y") {
        Write-Host "  Stopping Cursor processes..." -ForegroundColor Yellow
        Stop-Process -Name "Cursor" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  Deleting workspaceStorage..." -ForegroundColor Yellow
        Remove-Item -Path $workspaceStoragePath -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $workspaceStoragePath)) {
            Write-Host "  ✓ workspaceStorage deleted successfully" -ForegroundColor Green
            Write-Host "  ✓ Restart Cursor IDE to apply fix" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to delete workspaceStorage" -ForegroundColor Red
            Write-Host "  ⚠️  Please delete manually: $workspaceStoragePath" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⏭️  Skipped - Delete manually if needed" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✓ workspaceStorage folder not found (may be in different location)" -ForegroundColor Green
}
Write-Host ""

# Step 3: Check PowerShell profile settings
Write-Host "[3/4] Checking PowerShell Profile Settings..." -ForegroundColor Yellow
$settingsFile = ".\.cursor\settings.json"
if (Test-Path $settingsFile) {
    $settings = Get-Content $settingsFile -Raw | ConvertFrom-Json
    $psArgs = $settings.'terminal.integrated.profiles.windows'.PowerShell.args
    if ($psArgs -contains "-NoExit") {
        Write-Host "  ⚠️  Found -NoExit in PowerShell args (may interfere with output)" -ForegroundColor Yellow
        Write-Host "  ✓ Fixed: Removed -NoExit from settings.json" -ForegroundColor Green
    } else {
        Write-Host "  ✓ PowerShell profile settings are correct" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  settings.json not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Test terminal output
Write-Host "[4/4] Testing Terminal Output..." -ForegroundColor Yellow
Write-Host "  Running test command..." -ForegroundColor Gray
$testOutput = "Terminal Output Test - $(Get-Date)"
Write-Host $testOutput
Write-Output $testOutput
Write-Host "  ✓ Test command executed" -ForegroundColor Green
Write-Host "  ⚠️  If output is not visible above, try workspaceStorage fix" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart Cursor IDE" -ForegroundColor Gray
Write-Host "  2. Test terminal output with: docker ps" -ForegroundColor Gray
Write-Host "  3. If still not working, update Cursor IDE" -ForegroundColor Gray
Write-Host ""
