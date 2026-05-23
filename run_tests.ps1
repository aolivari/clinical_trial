Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Running Backend Tests (Pytest) in Docker..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
docker exec -e PYTHONPATH=. laboratorio-backend-1 pytest

$backendExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Running Frontend Tests (Jest) in Docker..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
docker exec laboratorio-frontend-1 npm run test

$frontendExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
if ($backendExitCode -eq 0 -and $frontendExitCode -eq 0) {
    Write-Host "All tests completed successfully! (Pytest: PASS, Jest: PASS)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Test failures detected! (Pytest Exit Code: $backendExitCode, Jest Exit Code: $frontendExitCode)" -ForegroundColor Red
    exit 1
}
