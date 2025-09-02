# Expo Configuration Setup

This document explains how to set up the Expo configuration to resolve "Experience with id ... does not exist" errors.

## Overview

The app now uses `app.config.ts` instead of `app.json` for better environment variable support and TypeScript configuration.

## Files Created/Modified

### 1. `app.config.ts` (New)
- TypeScript-based Expo configuration
- Reads environment variables from `.env` file
- Automatically generates `updates.url` from `PROJECT_ID`
- Supports environment variable overrides

### 2. `.env.example` (New)
- Template file with all required environment variables
- Includes setup instructions
- Copy to `.env` and fill in your values

### 3. `setup-env.ps1` (New)
- PowerShell script to help set up environment variables
- Interactive setup process
- Validates configuration

### 4. `app.json` (Removed)
- Replaced by `app.config.ts` for better flexibility

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_NAME` | App display name | `Odeysync` | No |
| `SLUG` | Expo slug | `odeysync` | No |
| `OWNER` | Expo username | `<your-expo-username>` | Yes |
| `PROJECT_ID` | EAS project ID | `<REPLACE_WITH_REAL_PROJECT_ID>` | Yes |
| `IOS_BUNDLE_ID` | iOS bundle identifier | `com.appeningnow.odeysync` | No |
| `ANDROID_PACKAGE` | Android package name | `com.appeningnow.odeysync` | No |

## Setup Instructions

### Option 1: Using the Setup Script (Recommended)

1. Run the setup script:
   ```powershell
   .\setup-env.ps1
   ```

2. Follow the interactive prompts to set your values

3. Run `npx eas init` to generate a real PROJECT_ID

4. Update the PROJECT_ID in your `.env` file

### Option 2: Manual Setup

1. Copy the example file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   - Replace `<your-expo-username>` with your actual Expo username
   - Run `npx eas init` to get a real PROJECT_ID
   - Replace `<real-project-id-from-eas-init>` with the generated PROJECT_ID

3. Restart your development server:
   ```powershell
   npx expo start -c
   ```

## Verification

To verify your configuration is working:

```powershell
npx expo config --json
```

You should see:
- `expo.extra.eas.projectId` equals your PROJECT_ID
- `expo.updates.url` equals `https://u.expo.dev/<YOUR_PROJECT_ID>`

## Troubleshooting

### "Experience with id ... does not exist" Error

This error occurs when:
1. `PROJECT_ID` is missing or invalid
2. `updates.url` is not properly configured
3. Environment variables are not loaded

**Solution:**
1. Ensure you have a valid PROJECT_ID from `npx eas init`
2. Check that your `.env` file contains the correct PROJECT_ID
3. Restart the development server with `npx expo start -c`

### Environment Variables Not Loading

If environment variables are not being read:

1. Check that your `.env` file exists and has the correct format
2. Ensure no spaces around the `=` sign in `.env` file
3. Restart the development server
4. Try setting environment variables directly in your shell:
   ```powershell
   $env:PROJECT_ID = "your-project-id"
   $env:OWNER = "your-expo-username"
   ```

### Invalid PROJECT_ID

If you see placeholder values in the config:

1. Run `npx eas init` to generate a real PROJECT_ID
2. Update your `.env` file with the new PROJECT_ID
3. Restart the development server

## Migration from app.json

If you were previously using `app.json`:

1. The old `app.json` has been removed
2. All configuration is now in `app.config.ts`
3. Environment variables are now supported
4. The configuration is more flexible and type-safe

## Next Steps

After setting up the configuration:

1. Test your app: `npx expo start -c`
2. Verify no "Experience with id ... does not exist" errors
3. Test on different platforms (web, iOS, Android)
4. Run `npx eas build` to test builds (if using EAS)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your `.env` file format
3. Ensure all required environment variables are set
4. Try the setup script: `.\setup-env.ps1`
