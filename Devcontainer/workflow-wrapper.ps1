# Workflow Wrapper - Makes workflow scripts accessible from anywhere
# Usage: workflow-wrapper.ps1 <workflow-name> [args...]

param(
    [Parameter(Mandatory=$false)]
    [string]$WorkflowName,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$WorkflowsDir = Join-Path $ProjectRoot "containers\e2e\workflows"

if ([string]::IsNullOrEmpty($WorkflowName)) {
    Write-Host "Usage: $($MyInvocation.MyCommand.Name) <workflow-name> [args...]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available workflows:" -ForegroundColor Cyan
    
    $workflows = Get-ChildItem -Path $WorkflowsDir -Filter "*.ps1" | ForEach-Object { $_.BaseName }
    foreach ($workflow in $workflows) {
        Write-Host "  - $workflow" -ForegroundColor Gray
    }
    exit 1
}

$WorkflowScript = Join-Path $WorkflowsDir "$WorkflowName.ps1"

if (-not (Test-Path $WorkflowScript)) {
    Write-Host "❌ Workflow not found: $WorkflowName" -ForegroundColor Red
    Write-Host ""
    Write-Host "Available workflows:" -ForegroundColor Cyan
    
    $workflows = Get-ChildItem -Path $WorkflowsDir -Filter "*.ps1" | ForEach-Object { $_.BaseName }
    foreach ($workflow in $workflows) {
        Write-Host "  - $workflow" -ForegroundColor Gray
    }
    exit 1
}

# Change to project root
Set-Location $ProjectRoot

# Execute workflow script
& $WorkflowScript @Args

