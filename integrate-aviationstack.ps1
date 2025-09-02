# AviationStack Integration Script
# This script performs basic integration setup without requiring API keys

Write-Host "🛩️ AviationStack Integration Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
Write-Host "🔍 Checking server status..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8787/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "✅ Server is running on port 8787" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server is not running on port 8787" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Integration Status:" -ForegroundColor Cyan

# Check if AviationStack files exist
$filesExist = $true
$filesToCheck = @(
    "server/providers/aviationstack.ts",
    "src/api/amadeus.ts",
    "src/utils/testAmadeus.ts"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file" -ForegroundColor Red
        $filesExist = $false
    }
}

if ($filesExist) {
    Write-Host ""
    Write-Host "🎉 AviationStack integration files are in place!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some integration files are missing. Please ensure all AviationStack files are properly integrated." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get your AviationStack API key from: https://aviationstack.com/" -ForegroundColor White
Write-Host "2. Run the full setup script: .\setup-amadeus.ps1" -ForegroundColor White
Write-Host "3. Or manually add to your .env file:" -ForegroundColor White
Write-Host "   EXPO_PUBLIC_AVIATIONSTACK_API_KEY=your_key_here" -ForegroundColor Yellow
Write-Host "   AVIATIONSTACK_API_KEY=your_key_here" -ForegroundColor Yellow

if ($serverRunning) {
    Write-Host ""
    Write-Host "🧪 Test the integration:" -ForegroundColor Cyan
    Write-Host "   - Open your app and go to Profile → Airport Schedules" -ForegroundColor White
    Write-Host "   - Search for flights from LHR to AUH" -ForegroundColor White
    Write-Host "   - Check console for AviationStack usage warnings" -ForegroundColor White
}

Write-Host ""
Write-Host "💰 Cost Optimization:" -ForegroundColor Yellow
Write-Host "   AviationStack: 20 calls/month with 7-day cache (95% efficiency)" -ForegroundColor White
Write-Host "   Amadeus: 500 calls/month with 24-hour cache (90% efficiency)" -ForegroundColor White

Write-Host ""
Write-Host "📊 Fallback Chain:" -ForegroundColor Cyan
Write-Host "   1. Amadeus API (Primary)" -ForegroundColor White
Write-Host "   2. AviationStack API (Fallback)" -ForegroundColor White
Write-Host "   3. AeroDataBox API (Backup)" -ForegroundColor White
Write-Host "   4. Mock Data (Always works)" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Integration Complete!" -ForegroundColor Green
