# ============================================================================
# MMC MCP Bridge - Complete Installation Script
# ============================================================================
# Installeert alle benodigde tools en configureert de development environment
# Vanaf kale laptop tot volledig werkende setup
# ============================================================================

#Requires -RunAsAdministrator

param(
    [switch]$SkipDocker,
    [switch]$SkipDoppler,
    [switch]$Skip1Password,
    [switch]$SkipRailway,
    [switch]$SkipRepository,
    [string]$InstallPath = "D:\GitHub_Local_Repos",
    [string]$GitUserName = "",
    [string]$GitUserEmail = ""
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($Message) {
    Write-ColorOutput Cyan "`n=== $Message ===" 
}

function Write-Success($Message) {
    Write-ColorOutput Green "✅ $Message"
}

function Write-Error($Message) {
    Write-ColorOutput Red "❌ $Message"
}

function Write-Warning($Message) {
    Write-ColorOutput Yellow "⚠️  $Message"
}

function Write-Info($Message) {
    Write-ColorOutput White "ℹ️  $Message"
}

# ============================================================================
# PREREQUISITES CHECK
# ============================================================================

Write-Step "Checking Prerequisites"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script requires Administrator privileges. Please run PowerShell as Administrator."
    exit 1
}

# Check Windows version
$windowsVersion = [System.Environment]::OSVersion.Version
Write-Info "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor)"

# Check if winget is available
$wingetAvailable = $false
try {
    $wingetVersion = winget --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $wingetAvailable = $true
        Write-Success "winget is available"
    }
} catch {
    Write-Warning "winget not found. Some installations may fail."
}

# ============================================================================
# INSTALLATION FUNCTIONS
# ============================================================================

function Install-WingetPackage {
    param(
        [string]$PackageId,
        [string]$PackageName,
        [string]$AlternativeUrl = ""
    )
    
    Write-Info "Installing $PackageName..."
    
    if ($wingetAvailable) {
        try {
            winget install --id $PackageId -e --source winget --accept-package-agreements --accept-source-agreements --silent
            if ($LASTEXITCODE -eq 0) {
                Write-Success "$PackageName installed successfully"
                return $true
            }
        } catch {
            Write-Warning "winget installation failed for $PackageName"
        }
    }
    
    if ($AlternativeUrl) {
        Write-Info "Attempting alternative installation method for $PackageName"
        Write-Warning "Please install manually from: $AlternativeUrl"
        return $false
    }
    
    return $false
}

function Test-Command {
    param([string]$Command, [string]$VersionArg = "--version")
    
    try {
        $result = & $Command $VersionArg 2>&1
        if ($LASTEXITCODE -eq 0 -or $result) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Wait-ForProcess {
    param([string]$ProcessName, [int]$TimeoutSeconds = 300)
    
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($process) {
            Start-Sleep -Seconds 2
            $elapsed += 2
        } else {
            return $true
        }
    }
    return $false
}

# ============================================================================
# 1. WINDOWS FEATURES
# ============================================================================

Write-Step "Enabling Windows Features"

# WSL2
Write-Info "Enabling WSL2..."
try {
    wsl --install --no-distribution 2>&1 | Out-Null
    Write-Success "WSL2 enabled"
} catch {
    Write-Warning "WSL2 installation may require restart. Continuing..."
}

# Virtual Machine Platform
Write-Info "Enabling Virtual Machine Platform..."
try {
    Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart -ErrorAction SilentlyContinue
    Write-Success "Virtual Machine Platform enabled"
} catch {
    Write-Warning "Virtual Machine Platform may require restart"
}

# Hyper-V (if available)
Write-Info "Checking Hyper-V..."
try {
    $hyperV = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -ErrorAction SilentlyContinue
    if ($hyperV.State -eq "Disabled") {
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All -NoRestart -ErrorAction SilentlyContinue
        Write-Success "Hyper-V enabled"
    } else {
        Write-Success "Hyper-V already enabled"
    }
} catch {
    Write-Info "Hyper-V not available (this is OK)"
}

# ============================================================================
# 2. POWERSHELL EXECUTION POLICY
# ============================================================================

Write-Step "Configuring PowerShell Execution Policy"

try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Success "PowerShell execution policy configured"
} catch {
    Write-Warning "Failed to set execution policy. You may need to run: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
}

# ============================================================================
# 3. GIT
# ============================================================================

Write-Step "Installing Git"

if (Test-Command "git") {
    Write-Success "Git already installed: $(git --version)"
} else {
    $gitInstalled = Install-WingetPackage -PackageId "Git.Git" -PackageName "Git" -AlternativeUrl "https://git-scm.com/download/win"
    
    if ($gitInstalled) {
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Wait for Git to be available
        Start-Sleep -Seconds 5
        
        if (Test-Command "git") {
            Write-Success "Git installed successfully"
        } else {
            Write-Warning "Git installed but not in PATH. Please restart PowerShell."
        }
    }
}

# Configure Git
if (Test-Command "git") {
    Write-Info "Configuring Git..."
    
    if ($GitUserName) {
        git config --global user.name $GitUserName
        Write-Success "Git user.name set to: $GitUserName"
    }
    
    if ($GitUserEmail) {
        git config --global user.email $GitUserEmail
        Write-Success "Git user.email set to: $GitUserEmail"
    }
    
    git config --global init.defaultBranch main
    git config --global core.autocrlf true
    git config --global core.editor "code --wait"
    
    Write-Success "Git configured"
}

# ============================================================================
# 4. NODE.JS
# ============================================================================

Write-Step "Installing Node.js"

if (Test-Command "node") {
    $nodeVersion = node --version
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -ge 20) {
        Write-Success "Node.js already installed: $nodeVersion"
    } else {
        Write-Warning "Node.js version $nodeVersion is too old. Need >= 20.0.0"
        $nodeInstalled = Install-WingetPackage -PackageId "OpenJS.NodeJS.LTS" -PackageName "Node.js LTS" -AlternativeUrl "https://nodejs.org/"
    }
} else {
    $nodeInstalled = Install-WingetPackage -PackageId "OpenJS.NodeJS.LTS" -PackageName "Node.js LTS" -AlternativeUrl "https://nodejs.org/"
    
    if ($nodeInstalled) {
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        # Wait for Node.js to be available
        Start-Sleep -Seconds 5
        
        if (Test-Command "node") {
            Write-Success "Node.js installed successfully: $(node --version)"
        } else {
            Write-Warning "Node.js installed but not in PATH. Please restart PowerShell."
        }
    }
}

# Configure npm
if (Test-Command "npm") {
    Write-Info "Configuring npm..."
    npm config set save-exact true
    npm config set engine-strict true
    Write-Success "npm configured"
}

# ============================================================================
# 5. DOCKER DESKTOP
# ============================================================================

Write-Step "Installing Docker Desktop"

if ($SkipDocker) {
    Write-Info "Skipping Docker Desktop installation"
} else {
    if (Test-Command "docker") {
        Write-Success "Docker already installed: $(docker --version)"
    } else {
        Write-Info "Installing Docker Desktop (this may take several minutes)..."
        $dockerInstalled = Install-WingetPackage -PackageId "Docker.DockerDesktop" -PackageName "Docker Desktop" -AlternativeUrl "https://www.docker.com/products/docker-desktop"
        
        if ($dockerInstalled) {
            Write-Warning "Docker Desktop installed. Please start Docker Desktop manually and wait for it to fully start."
            Write-Info "After Docker Desktop is running, verify with: docker ps"
        }
    }
}

# ============================================================================
# 6. CURSOR IDE
# ============================================================================

Write-Step "Installing Cursor IDE"

$cursorPath = "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe"
if (Test-Path $cursorPath) {
    Write-Success "Cursor IDE already installed"
} else {
    Write-Info "Installing Cursor IDE..."
    $cursorInstalled = Install-WingetPackage -PackageId "Cursor.Cursor" -PackageName "Cursor IDE" -AlternativeUrl "https://cursor.sh/"
    
    if ($cursorInstalled) {
        Write-Success "Cursor IDE installed successfully"
    }
}

# ============================================================================
# 7. POWERSHELL CORE
# ============================================================================

Write-Step "Installing PowerShell Core"

if (Test-Command "pwsh") {
    Write-Success "PowerShell Core already installed: $(pwsh --version)"
} else {
    $pwshInstalled = Install-WingetPackage -PackageId "Microsoft.PowerShell" -PackageName "PowerShell Core" -AlternativeUrl "https://github.com/PowerShell/PowerShell/releases"
    
    if ($pwshInstalled) {
        Write-Success "PowerShell Core installed successfully"
    }
}

# ============================================================================
# 8. GITHUB CLI
# ============================================================================

Write-Step "Installing GitHub CLI"

if (Test-Command "gh") {
    Write-Success "GitHub CLI already installed: $(gh --version | Select-Object -First 1)"
} else {
    $ghInstalled = Install-WingetPackage -PackageId "GitHub.cli" -PackageName "GitHub CLI" -AlternativeUrl "https://cli.github.com/"
    
    if ($ghInstalled) {
        Write-Success "GitHub CLI installed successfully"
        Write-Info "Run 'gh auth login' to authenticate"
    }
}

# ============================================================================
# 9. DOPPLER CLI
# ============================================================================

Write-Step "Installing Doppler CLI"

if ($SkipDoppler) {
    Write-Info "Skipping Doppler CLI installation"
} else {
    if (Test-Command "doppler") {
        Write-Success "Doppler CLI already installed: $(doppler --version)"
    } else {
        Write-Info "Installing Doppler CLI..."
        try {
            # Official Doppler installation script
            $dopplerScript = Invoke-WebRequest -Uri "https://cli.doppler.com/install.ps1" -UseBasicParsing
            Invoke-Expression $dopplerScript.Content
            Write-Success "Doppler CLI installed successfully"
            Write-Info "Run 'doppler login' to authenticate"
        } catch {
            Write-Warning "Doppler CLI installation failed. Install manually from: https://docs.doppler.com/docs/install-cli"
        }
    }
}

# ============================================================================
# 10. 1PASSWORD CLI
# ============================================================================

Write-Step "Installing 1Password CLI"

if ($Skip1Password) {
    Write-Info "Skipping 1Password CLI installation"
} else {
    if (Test-Command "op") {
        Write-Success "1Password CLI already installed: $(op --version)"
    } else {
        $opInstalled = Install-WingetPackage -PackageId "AgileBits.1PasswordCLI" -PackageName "1Password CLI" -AlternativeUrl "https://developer.1password.com/docs/cli/get-started"
        
        if ($opInstalled) {
            Write-Success "1Password CLI installed successfully"
            Write-Info "Run 'op signin' to authenticate"
        }
    }
}

# ============================================================================
# 11. DAGGER CLI
# ============================================================================

Write-Step "Installing Dagger CLI"

if (Test-Command "dagger") {
    Write-Success "Dagger CLI already installed: $(dagger version)"
} else {
    Write-Info "Installing Dagger CLI..."
    try {
        $daggerVersion = "0.19.7"
        $installScript = Invoke-WebRequest -Uri "https://dl.dagger.io/dagger/install.ps1" -UseBasicParsing
        $tempScript = "$env:TEMP\install-dagger.ps1"
        $installScript.Content | Out-File -FilePath $tempScript -Encoding UTF8
        
        # Run installation script
        & pwsh -File $tempScript -Version $daggerVersion
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Start-Sleep -Seconds 3
        
        if (Test-Command "dagger") {
            Write-Success "Dagger CLI installed successfully"
        } else {
            Write-Warning "Dagger CLI installed but not in PATH. Please restart PowerShell."
        }
    } catch {
        Write-Warning "Dagger CLI installation failed. Install manually from: https://docs.dagger.io/install"
    }
}

# ============================================================================
# 12. RAILWAY CLI
# ============================================================================

Write-Step "Installing Railway CLI"

if ($SkipRailway) {
    Write-Info "Skipping Railway CLI installation"
} else {
    if (Test-Command "railway") {
        Write-Success "Railway CLI already installed: $(railway --version)"
    } else {
        if (Test-Command "npm") {
            Write-Info "Installing Railway CLI via npm..."
            try {
                npm install -g @railway/cli
                if (Test-Command "railway") {
                    Write-Success "Railway CLI installed successfully"
                    Write-Info "Run 'railway login' to authenticate"
                } else {
                    Write-Warning "Railway CLI installed but not in PATH. Please restart PowerShell."
                }
            } catch {
                Write-Warning "Railway CLI installation failed"
            }
        } else {
            Write-Warning "npm not available. Cannot install Railway CLI."
        }
    }
}

# ============================================================================
# 13. REPOSITORY CLONE
# ============================================================================

Write-Step "Cloning Repository"

if ($SkipRepository) {
    Write-Info "Skipping repository clone"
} else {
    $repoPath = Join-Path $InstallPath "MMC_MCP_BRIDGE"
    
    if (Test-Path $repoPath) {
        Write-Success "Repository already exists at: $repoPath"
    } else {
        if (-not (Test-Path $InstallPath)) {
            Write-Info "Creating directory: $InstallPath"
            New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        }
        
        if (Test-Command "git") {
            Write-Info "Cloning repository to: $repoPath"
            try {
                Push-Location $InstallPath
                git clone https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git
                Write-Success "Repository cloned successfully"
            } catch {
                Write-Warning "Repository clone failed. Clone manually: git clone https://github.com/MyMindVentures/MMC_MCP_BRIDGE.git"
            } finally {
                Pop-Location
            }
        } else {
            Write-Warning "Git not available. Cannot clone repository."
        }
    }
}

# ============================================================================
# 14. VERIFICATION
# ============================================================================

Write-Step "Verifying Installations"

$verificationResults = @()

function Test-AndRecord {
    param([string]$Name, [string]$Command, [string]$VersionArg = "--version")
    
    if (Test-Command $Command $VersionArg) {
        $version = try { & $Command $VersionArg 2>&1 | Select-Object -First 1 } catch { "installed" }
        Write-Success "$Name`: $version"
        $verificationResults += @{Name=$Name; Status="✅"; Version=$version}
        return $true
    } else {
        Write-Error "$Name`: NOT INSTALLED"
        $verificationResults += @{Name=$Name; Status="❌"; Version="Not installed"}
        return $false
    }
}

Write-Info "`nVerification Results:"
Write-Info "===================="

$allInstalled = $true

$allInstalled = (Test-AndRecord "Git" "git") -and $allInstalled
$allInstalled = (Test-AndRecord "Node.js" "node") -and $allInstalled
$allInstalled = (Test-AndRecord "npm" "npm") -and $allInstalled
$allInstalled = (Test-AndRecord "Docker" "docker") -and $allInstalled
$allInstalled = (Test-AndRecord "PowerShell Core" "pwsh") -and $allInstalled
$allInstalled = (Test-AndRecord "GitHub CLI" "gh") -and $allInstalled

if (-not $SkipDoppler) {
    $allInstalled = (Test-AndRecord "Doppler CLI" "doppler") -and $allInstalled
}

if (-not $Skip1Password) {
    $allInstalled = (Test-AndRecord "1Password CLI" "op") -and $allInstalled
}

$allInstalled = (Test-AndRecord "Dagger CLI" "dagger" "version") -and $allInstalled

if (-not $SkipRailway) {
    $allInstalled = (Test-AndRecord "Railway CLI" "railway") -and $allInstalled
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Step "Installation Summary"

Write-Info "`nInstallation completed!"
Write-Info "======================"

if ($allInstalled) {
    Write-Success "All core tools installed successfully!"
} else {
    Write-Warning "Some tools failed to install. Please install them manually."
}

Write-Info "`nNext Steps:"
Write-Info "==========="
Write-Info "1. Restart PowerShell (or your computer if WSL2 was installed)"
Write-Info "2. Start Docker Desktop and wait for it to fully start"
Write-Info "3. Authenticate with GitHub: gh auth login"
Write-Info "4. Authenticate with Doppler: doppler login"
Write-Info "5. Open Cursor IDE and open the project folder"
Write-Info "6. In Cursor: F1 → Dev Containers: Reopen in Container"
Write-Info "7. Wait for DevContainer to build (5-10 minutes first time)"
Write-Info "8. In DevContainer terminal: npm run dev:host"
Write-Info "`nFor detailed setup instructions, see: SETUP_GUIDE.md"

Write-Info "`nRepository Location:"
if (-not $SkipRepository) {
    $repoPath = Join-Path $InstallPath "MMC_MCP_BRIDGE"
    Write-Info "  $repoPath"
} else {
    Write-Info "  (Skipped - clone manually)"
}

Write-Info "`nInstallation script completed!"
Write-Info "=============================="

# Return exit code
if ($allInstalled) {
    exit 0
} else {
    exit 1
}
