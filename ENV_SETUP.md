# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

## Required Environment Variables

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_AI_PROXY_URL=

# Analytics and Monitoring
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_REVENUECAT_KEY=
SENTRY_DSN=

# App Configuration
EXPO_PUBLIC_TRIAL_DAYS=7
IOS_BUNDLE_ID=com.appeningnow.odeysync
ANDROID_PACKAGE=com.appeningnow.odeysync
```

## EAS Secrets Setup

For production builds, set these secrets using EAS CLI:

```bash
# Analytics and Monitoring
eas secret:create --name EXPO_PUBLIC_POSTHOG_KEY --value <value>
eas secret:create --name EXPO_PUBLIC_REVENUECAT_KEY --value <value>
eas secret:create --name SENTRY_DSN --value <value>

# API Configuration
eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value <https url>
eas secret:create --name EXPO_PUBLIC_AI_PROXY_URL --value <https url>

# App Configuration
eas secret:create --name EXPO_PUBLIC_TRIAL_DAYS --value 7
eas secret:create --name IOS_BUNDLE_ID --value com.appeningnow.odeysync
eas secret:create --name ANDROID_PACKAGE --value com.appeningnow.odeysync
```

## Build Profiles

The app now supports three build profiles:

- **development**: For development builds with insecure networking allowed
- **preview**: For internal testing builds with secure networking required
- **production**: For production builds with secure networking required

## Runtime Safety

The app includes runtime guards that will prevent startup if:
- Non-development builds attempt to use HTTP endpoints
- Insecure URLs are detected in production environments
