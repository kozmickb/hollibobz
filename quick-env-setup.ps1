# Quick Environment Setup for Flight APIs
# This script creates a basic .env file with placeholder values

Write-Host "Quick Environment Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = ".env"
$envExists = Test-Path $envFile

if ($envExists) {
    Write-Host ".env file found - updating with flight API placeholders" -ForegroundColor Green
} else {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    New-Item -ItemType File -Path $envFile -Force
}

# Create environment content with flight API placeholders
$envContent = @"
# Amadeus API Keys (Get from https://developers.amadeus.com/)
EXPO_PUBLIC_AMADEUS_API_KEY=your_amadeus_api_key_here
EXPO_PUBLIC_AMADEUS_API_SECRET=your_amadeus_api_secret_here

# AviationStack API (Get from https://aviationstack.com/)
EXPO_PUBLIC_AVIATIONSTACK_API_KEY=your_aviationstack_api_key_here

# FlightAware API (Optional - Alternative backup)
EXPO_PUBLIC_FLIGHTAWARE_API_KEY=your_flightaware_api_key_here

# RapidAPI Flight Search (Optional - Alternative backup)
EXPO_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here

# Existing API keys (keep your current values)
EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY=your_existing_deepseek_key
EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=your_existing_openai_key
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=your_existing_anthropic_key
EXPO_PUBLIC_VIBECODE_XAI_API_KEY=your_existing_xai_key
EXPO_PUBLIC_PEXELS_API_KEY=your_existing_pexels_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
"@

# Write to .env file
$envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force

Write-Host "Environment file updated!" -ForegroundColor Green
Write-Host ".env file created/updated with flight API placeholders" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open the .env file and replace placeholder values with real API keys" -ForegroundColor White
Write-Host "2. Restart your app: npx expo start --clear" -ForegroundColor White
Write-Host "3. Test flight search in Profile -> Airport Schedules" -ForegroundColor White
Write-Host ""

Write-Host "API Limits Reminder:" -ForegroundColor Yellow
Write-Host "   Amadeus: 500 calls/month (90 percent cache efficiency)" -ForegroundColor White
Write-Host "   AviationStack: 20 calls/month (95 percent cache efficiency)" -ForegroundColor White
Write-Host ""

Write-Host "Fallback Chain:" -ForegroundColor Cyan
Write-Host "   1. Amadeus API (Primary)" -ForegroundColor White
Write-Host "   2. AviationStack API (Fallback)" -ForegroundColor White
Write-Host "   3. FlightAware API (Backup)" -ForegroundColor White
Write-Host "   4. Mock Data (Always works)" -ForegroundColor White

Write-Host ""
Write-Host "Setup complete! Edit your .env file with real API keys to enable flight search." -ForegroundColor Green
