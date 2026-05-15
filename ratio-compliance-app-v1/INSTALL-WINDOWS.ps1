Write-Host "Ratio Compliance App" -ForegroundColor Cyan
Write-Host "This script installs dependencies and prints package status." -ForegroundColor Cyan
npm install
npm run status
Write-Host "Run npm run dev to start the local app." -ForegroundColor Green
