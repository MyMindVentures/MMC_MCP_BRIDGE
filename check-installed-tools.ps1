# ============================================================================
# Check Installed Tools - Verification Script
# ============================================================================
# Check welke tools al geïnstalleerd zijn
# ============================================================================

Write-Host "`n=== Checking Installed Tools ===" -ForegroundColor Cyan
Write-Host ""

function Test-Tool {
    param(
        [string]$Name,
        [string]$Command,
        [string]$VersionArg = "--version"
    )
    
    try {
        $result = & $Command $VersionArg 2>&1 | Select-Object -First 1
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host "✅ $Name`: " -NoNewline -ForegroundColor Green
            Write-Host $result -ForegroundColor White
            return $true
        }
    } catch {
        # Try alternative method
        try {
            $result = Invoke-Expression "$Command $VersionArg" 2>&1 | Select-Object -First 1
            if ($result) {
                Write-Host "✅ $Name`: " -NoNewline -ForegroundColor Green
                Write-Host $result -ForegroundColor White
                return $true
            }
        } catch {
            Write-Host "❌ $Name`: NOT INSTALLED" -ForegroundColor Red
            return $false
        }
    }
    Write-Host "❌ $Name`: NOT INSTALLED" -ForegroundColor Red
    return $false
}

# Check tools
$tools = @()

Write-Host "Core Tools:" -ForegroundColor Yellow
$tools += @{Name="Git"; Installed=(Test-Tool "Git" "git")}
$tools += @{Name="Node.js"; Installed=(Test-Tool "Node.js" "node")}
$tools += @{Name="npm"; Installed=(Test-Tool "npm" "npm")}
$tools += @{Name="Docker"; Installed=(Test-Tool "Docker" "docker")}

Write-Host "`nPackage Managers:" -ForegroundColor Yellow
$tools += @{Name="winget"; Installed=(Test-Tool "winget" "winget")}
$tools += @{Name="Chocolatey"; Installed=(Test-Tool "Chocolatey" "choco")}

Write-Host "`nCLI Tools:" -ForegroundColor Yellow
$tools += @{Name="PowerShell Core"; Installed=(Test-Tool "PowerShell Core" "pwsh")}
$tools += @{Name="GitHub CLI"; Installed=(Test-Tool "GitHub CLI" "gh")}
$tools += @{Name="Doppler CLI"; Installed=(Test-Tool "Doppler CLI" "doppler")}
$tools += @{Name="1Password CLI"; Installed=(Test-Tool "1Password CLI" "op")}
$tools += @{Name="Dagger CLI"; Installed=(Test-Tool "Dagger CLI" "dagger" "version")}
$tools += @{Name="Railway CLI"; Installed=(Test-Tool "Railway CLI" "railway")}

Write-Host "`nIDE:" -ForegroundColor Yellow
$cursorPath = "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe"
if (Test-Path $cursorPath) {
    Write-Host "✅ Cursor IDE: INSTALLED" -ForegroundColor Green
    $tools += @{Name="Cursor IDE"; Installed=$true}
} else {
    Write-Host "❌ Cursor IDE: NOT INSTALLED" -ForegroundColor Red
    $tools += @{Name="Cursor IDE"; Installed=$false}
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$installed = ($tools | Where-Object { $_.Installed -eq $true }).Count
$total = $tools.Count
Write-Host "Installed: $installed / $total" -ForegroundColor $(if ($installed -eq $total) { "Green" } else { "Yellow" })

Write-Host "`nMissing Tools:" -ForegroundColor Yellow
$missing = $tools | Where-Object { $_.Installed -eq $false }
if ($missing.Count -eq 0) {
    Write-Host "  None! All tools are installed." -ForegroundColor Green
} else {
    foreach ($tool in $missing) {
        Write-Host "  - $($tool.Name)" -ForegroundColor Red
    }
}

Write-Host "`n=== Check Complete ===" -ForegroundColor Cyan


