# TripTick Environment Setup Script
# This script helps you set up the required environment variables

Write-Host "🚀 TripTick Environment Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create it manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Current Configuration:" -ForegroundColor Cyan

# Read and display current values
$envContent = Get-Content ".env" -Raw
$lines = $envContent -split "`n"

foreach ($line in $lines) {
    if ($line -match "^([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        Write-Host "  $key = $value" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🔧 Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Replace <your-expo-username> with your actual Expo username" -ForegroundColor White
Write-Host "2. Run 'npx eas init' to generate a real PROJECT_ID" -ForegroundColor White
Write-Host "3. Replace <real-project-id-from-eas-init> with the generated PROJECT_ID" -ForegroundColor White
Write-Host "4. Restart your development server: npx expo start -c" -ForegroundColor White

Write-Host ""
Write-Host "💡 Tip: You can edit the .env file manually or use this script to set values interactively." -ForegroundColor Yellow

# Ask if user wants to set values interactively
$response = Read-Host "Would you like to set values interactively? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🔧 Interactive Setup:" -ForegroundColor Cyan
    
    $owner = Read-Host "Enter your Expo username"
    if ($owner) {
        $envContent = $envContent -replace "OWNER=.*", "OWNER=$owner"
    }
    
    Write-Host ""
    Write-Host "For PROJECT_ID, run 'npx eas init' first, then enter the generated ID:" -ForegroundColor Yellow
    $projectId = Read-Host "Enter your PROJECT_ID (or press Enter to skip)"
    if ($projectId) {
        $envContent = $envContent -replace "PROJECT_ID=.*", "PROJECT_ID=$projectId"
    }
    
    # Write back to .env file
    $envContent | Set-Content ".env"
    Write-Host "✅ .env file updated!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete! Run 'npx expo start -c' to start your app." -ForegroundColor Green
