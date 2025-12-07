# Bulk delete all GitHub Actions workflow runs
$repo = "MyMindVentures/MMC_MCP_BRIDGE"
$page = 1
$deleted = 0
$totalDeleted = 0

Write-Host "Starting bulk deletion of workflow runs for $repo..." -ForegroundColor Yellow

do {
    Write-Host "Fetching page $page..." -ForegroundColor Cyan
    $response = gh api "/repos/$repo/actions/runs?per_page=100&page=$page" | ConvertFrom-Json
    
    if (-not $response -or $response.workflow_runs.Count -eq 0) {
        Write-Host "No more runs found on page $page" -ForegroundColor Gray
        break
    }
    
    $runs = $response.workflow_runs
    Write-Host "Found $($runs.Count) runs on page $page" -ForegroundColor Green
    
    foreach ($run in $runs) {
        $runId = $run.id
        $runName = $run.name
        $runStatus = $run.status
        
        Write-Host "  Deleting run $runId - $runName ($runStatus)..." -ForegroundColor Yellow
        $result = gh api -X DELETE "/repos/$repo/actions/runs/$runId" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $deleted++
            $totalDeleted++
            Write-Host "    ✓ Deleted successfully" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Failed to delete: $result" -ForegroundColor Red
        }
    }
    
    $page++
    
    # Safety check to prevent infinite loops
    if ($page -gt 100) {
        Write-Host "Reached maximum page limit (100). Stopping." -ForegroundColor Red
        break
    }
    
} while ($runs.Count -eq 100)

Write-Host "`nBulk deletion complete! Total deleted: $totalDeleted workflow runs" -ForegroundColor Green
