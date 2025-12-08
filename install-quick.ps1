# ============================================================================
# MMC MCP Bridge - Quick Installation Script
# ============================================================================
# Installeert alleen de essentiële tools (Git, Node.js, Docker, Cursor)
# Sneller dan install-all.ps1, maar minder compleet
# ============================================================================

#Requires -RunAsAdministrator

param(
    [string]$InstallPath = "D:\GitHub_Local_Repos"
)

$ErrorActionPreference = "Stop"

function Write-Step($Message) {
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Success($Message) {
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info($Message) {
    Write-Host "ℹ️  $Message" -ForegroundColor White
}

Write-Step "Quick Installation - Essential Tools Only"

# Check winget
try {
    winget --version | Out-Null
    $wingetAvailable = $true
} catch {
    Write-Host "❌ winget not available. Please install Windows Package Manager first." -ForegroundColor Red
    exit 1
}

# 1. Git
Write-Step "Installing Git"
winget install --id Git.Git -e --source winget --silent --accept-package-agreements --accept-source-agreements
Write-Success "Git installed"

# 2. Node.js LTS
Write-Step "Installing Node.js LTS"
winget install --id OpenJS.NodeJS.LTS -e --source winget --silent --accept-package-agreements --accept-source-agreements
Write-Success "Node.js installed"

# 3. Docker Desktop
Write-Step "Installing Docker Desktop"
winget install --id Docker.DockerDesktop -e --source winget --silent --accept-package-agreements --accept-source-agreements
Write-Success "Docker Desktop installed (start manually)"

# 4. Cursor IDE
Write-Step "Installing Cursor IDE"
winget install --id Cursor.Cursor -e --source winget --silent --accept-package-agreements --accept-source-agreements
Write-Success "Cursor IDE installed"

# 5. PowerShell Core
Write-Step "Installing PowerShell Core"
winget install --id Microsoft.PowerShell -e --source winget --silent --accept-package-agreements --accept-source-agreements
Write-Success "PowerShell Core installed"

# 6. Clone Repository
Write-Step "Cloning Repository"
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

$repoPath = Join-Path $InstallPath "MMC_MCP_BRIDGE"
if (-not (Test-Path $repoPath)) {
    Push-Location $InstallPath
    git clone https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git
    Pop-Location
    Write-Success "Repository cloned to: $repoPath"
} else {
    Write-Info "Repository already exists at: $repoPath"
}

Write-Step "Quick Installation Complete"
Write-Success "Essential tools installed!"
Write-Info "`nNext Steps:"
Write-Info "1. Restart PowerShell"
Write-Info "2. Start Docker Desktop"
Write-Info "3. Open Cursor IDE"
Write-Info "4. Open project: $repoPath"
Write-Info "5. F1 → Dev Containers: Reopen in Container"


