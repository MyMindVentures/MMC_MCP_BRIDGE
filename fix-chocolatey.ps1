# ============================================================================
# Fix Chocolatey PATH Issue
# ============================================================================
# Lost Chocolatey PATH problemen op
# ============================================================================

#Requires -RunAsAdministrator

Write-Host "`n=== Fixing Chocolatey PATH ===" -ForegroundColor Cyan

# Check if Chocolatey is installed
$chocoPath = "C:\ProgramData\chocolatey"
if (-not (Test-Path $chocoPath)) {
    Write-Host "❌ Chocolatey not found at: $chocoPath" -ForegroundColor Red
    Write-Host "`nInstalling Chocolatey..." -ForegroundColor Yellow
    
    # Install Chocolatey
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    Write-Host "✅ Chocolatey installed" -ForegroundColor Green
}

# Add Chocolatey to PATH for current session
$chocoBinPath = "$chocoPath\bin"
if (Test-Path $chocoBinPath) {
    if ($env:Path -notlike "*$chocoBinPath*") {
        $env:Path = "$chocoBinPath;$env:Path"
        Write-Host "✅ Added Chocolatey to current session PATH" -ForegroundColor Green
    }
}

# Add Chocolatey to system PATH permanently
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
if ($machinePath -notlike "*$chocoBinPath*") {
    [System.Environment]::SetEnvironmentVariable("Path", "$machinePath;$chocoBinPath", "Machine")
    Write-Host "✅ Added Chocolatey to system PATH permanently" -ForegroundColor Green
}

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify Chocolatey
Write-Host "`n=== Verifying Chocolatey ===" -ForegroundColor Cyan
try {
    $chocoVersion = choco --version
    Write-Host "✅ Chocolatey working: $chocoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Chocolatey still not working. Please restart PowerShell." -ForegroundColor Red
    Write-Host "`nAfter restart, run: choco --version" -ForegroundColor Yellow
}

Write-Host "`n=== Chocolatey Fix Complete ===" -ForegroundColor Green
Write-Host "`nYou can now use Chocolatey commands:" -ForegroundColor Yellow
Write-Host "  choco install azure-cli -y" -ForegroundColor White
Write-Host "  choco install git -y" -ForegroundColor White
Write-Host "  etc." -ForegroundColor White


