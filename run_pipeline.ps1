# run_pipeline.ps1
Write-Host "Starting Travel Itinerary Backend FastAPI server..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -Command `"cd travel-itinerary-backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --port 8000`"" -PassThru -WindowStyle Minimized

Write-Host "Starting Travel Itinerary Frontend Next.js server..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -Command `"cd travel-frontend; npm run dev`"" -PassThru -WindowStyle Minimized

Write-Host "Waiting 15 seconds for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Running capture_screenshots.js in travel-frontend..." -ForegroundColor Cyan
Set-Location -Path "travel-frontend"
node capture_screenshots.js
Set-Location -Path ".."

Write-Host "Cleaning up server processes..." -ForegroundColor Red
# Force stop uvicorn and next processes that might have started
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue

# Clean up any leftover uvicorn/node dev processes on port 8000 or 3000
$ports = @(8000, 3000)
foreach ($port in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($proc) {
        $pidToKill = $proc.OwningProcess
        Write-Host "Killing leftover process on port $port (PID: $pidToKill)..." -ForegroundColor Yellow
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Pipeline execution complete!" -ForegroundColor Green
