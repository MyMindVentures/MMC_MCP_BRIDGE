# ============================================================================
# Refresh PATH Environment Variable
# ============================================================================
# Refresht PATH variabele na installatie van tools
# Lost problemen op waarbij tools niet herkend worden na installatie
# ============================================================================

Write-Host "`n=== Refreshing PATH Environment Variable ===" -ForegroundColor Cyan

# Refresh PATH from registry
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Add Chocolatey to PATH if it exists
$chocoPath = "C:\ProgramData\chocolatey\bin"
if (Test-Path $chocoPath) {
    if ($env:Path -notlike "*$chocoPath*") {
        $env:Path = "$chocoPath;$env:Path"
        Write-Host "✅ Added Chocolatey to PATH" -ForegroundColor Green
    } else {
        Write-Host "✅ Chocolatey already in PATH" -ForegroundColor Green
    }
}

# Verify common tools
Write-Host "`n=== Verifying Tools ===" -ForegroundColor Cyan

function Test-Tool {
    param([string]$Name, [string]$Command, [string]$VersionArg = "--version")
    
    try {
        $result = & $Command $VersionArg 2>&1
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host "✅ $Name`: $($result | Select-Object -First 1)" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ $Name`: NOT FOUND" -ForegroundColor Red
        return $false
    }
    Write-Host "❌ $Name`: NOT FOUND" -ForegroundColor Red
    return $false
}

Test-Tool "Git" "git"
Test-Tool "Node.js" "node"
Test-Tool "npm" "npm"
Test-Tool "Docker" "docker"
Test-Tool "PowerShell Core" "pwsh"
Test-Tool "GitHub CLI" "gh"
Test-Tool "Chocolatey" "choco"
Test-Tool "winget" "winget"

Write-Host "`n=== PATH Refresh Complete ===" -ForegroundColor Green
Write-Host "`nIf tools are still not found, restart PowerShell." -ForegroundColor Yellow
