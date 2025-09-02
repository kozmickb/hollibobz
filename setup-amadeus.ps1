# Amadeus API Setup Script
# This script helps you configure Amadeus API keys for your project

Write-Host "🚀 AMADEUS FLIGHT API SETUP" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
$envFile = ".env"
$envExists = Test-Path $envFile

if ($envExists) {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    New-Item -ItemType File -Path $envFile -Force
}

Write-Host ""
Write-Host "📋 API SETUP INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. AMADEUS API (Primary - 500 calls/month):" -ForegroundColor Cyan
Write-Host "   - Go to https://developers.amadeus.com/"
Write-Host "   - Create a free account"
Write-Host "   - Create a new app"
Write-Host "   - Copy your API Key and API Secret"
Write-Host ""
Write-Host "2. AVIATIONSTACK API (Fallback - 20 calls/month):" -ForegroundColor Cyan
Write-Host "   - Go to https://aviationstack.com/"
Write-Host "   - Sign up for free account"
Write-Host "   - Get your API access key"
Write-Host ""

# Get API credentials
$amadeusKey = Read-Host "Enter your Amadeus API Key (or press Enter to skip)"
$amadeusSecret = Read-Host "Enter your Amadeus API Secret (or press Enter to skip)"
$aviationStackKey = Read-Host "Enter your AviationStack API Key (or press Enter to skip)"

# Create .env content
$envContent = @"
# Amadeus API Keys (FREE TIER - 500 requests/month)
EXPO_PUBLIC_AMADEUS_API_KEY=$amadeusKey
EXPO_PUBLIC_AMADEUS_API_SECRET=$amadeusSecret

# AviationStack API (Fallback - 20 calls/month - VERY LIMITED)
EXPO_PUBLIC_AVIATIONSTACK_API_KEY=$aviationStackKey

# FlightAware API (Alternative/Backup - Optional)
EXPO_PUBLIC_FLIGHTAWARE_API_KEY=your_flightaware_api_key_here

# RapidAPI Flight Search (Alternative/Backup - Optional)
EXPO_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here

# Existing API keys
EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY=your_existing_deepseek_key
EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=your_existing_openai_key
EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=your_existing_anthropic_key
EXPO_PUBLIC_VIBECODE_XAI_API_KEY=your_existing_xai_key
EXPO_PUBLIC_PEXELS_API_KEY=your_existing_pexels_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
"@

# Write to .env file
$envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force

Write-Host ""
Write-Host "✅ Environment variables configured!" -ForegroundColor Green
Write-Host "📁 .env file created/updated with API keys" -ForegroundColor Green
Write-Host ""

# Show configured APIs
$configuredApis = @()
if ($amadeusKey -and $amadeusKey -ne "") {
    $configuredApis += "Amadeus (500 per month)"
}
if ($aviationStackKey -and $aviationStackKey -ne "") {
    $configuredApis += "AviationStack (20 per month)"
}

if ($configuredApis.Count -gt 0) {
    Write-Host "🔧 Configured APIs:" -ForegroundColor Green
    foreach ($api in $configuredApis) {
        Write-Host "   ✅ $api" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️ No API keys configured - using mock data only" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Restart your app: npx expo start --clear"
Write-Host "2. Test flight search in Profile → Airport Schedules"
Write-Host "3. Search for flights from LHR to AUH to test real data"
Write-Host ""

Write-Host "💡 API LIMITS & FALLBACK CHAIN:" -ForegroundColor Yellow
Write-Host "1. Amadeus API (Primary) - 500 calls/month"
Write-Host "   ↓ (if fails)"
Write-Host "2. AviationStack API (Fallback) - 20 calls/month"
Write-Host "   ↓ (if fails)"
Write-Host "3. AeroDataBox API (Backup)"
Write-Host "   ↓ (if fails)"
Write-Host "4. Mock Data (Always works)"
Write-Host ""

Write-Host "🧊 CACHING STRATEGY:" -ForegroundColor Cyan
Write-Host "- Amadeus: 24-hour cache (~90% cost reduction)"
Write-Host "- AviationStack: 7-day cache (due to low limits)"
Write-Host "- Automatic cache management and monitoring"
Write-Host ""

Write-Host "🎉 Setup complete! Your app now has multi-tier flight data with intelligent fallbacks." -ForegroundColor Green
