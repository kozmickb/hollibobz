import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const APP_ENV = process.env.APP_ENV ?? "development";
  const isDev = APP_ENV === "development";

  return {
    ...config,
    name: config.name ?? "Odysync",
    slug: "triptick",
    owner: config.owner ?? "kozmickb",
    scheme: 'odysync',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/odysync_icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/odysync _logo.png',
      resizeMode: 'contain',
      backgroundColor: '#FF6B6B'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_ID ?? "com.appeningnow.odysync",
      supportsTablet: true,
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        ITSAppUsesNonExemptEncryption: false,
        // iOS ATS dev exception (only for development)
        ...(isDev
          ? {
              NSAppTransportSecurity: {
                NSAllowsArbitraryLoads: true,
              },
            }
          : {}),
        // iOS 17+ Calendar permissions (separate read/write keys)
        NSCalendarsFullAccessUsageDescription: "We use your calendar to read and update trip events you create.",
        NSCalendarsWriteOnlyAccessUsageDescription: "We add trip events to your calendar without reading other entries.",
        // iOS 17+ Reminders permissions (separate read/write keys)
        NSRemindersFullAccessUsageDescription: "We use reminders to read and manage trip tasks you create.",
        NSRemindersWriteOnlyAccessUsageDescription: "We add trip reminders without reading other entries.",
        // Camera and media library permissions for profile photos
        NSCameraUsageDescription: "We need camera access to take profile photos.",
        NSPhotoLibraryUsageDescription: "We need photo library access to select profile photos."
      }
    },
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE ?? "com.appeningnow.odysync",
      permissions: ["READ_CALENDAR", "WRITE_CALENDAR", "CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
      // Android cleartext traffic (only for development)
      ...(isDev
        ? {
            usesCleartextTraffic: true,
          }
        : {}),
      adaptiveIcon: {
        foregroundImage: './assets/odysync_icon.png',
        backgroundColor: '#FF6B6B'
      },
      notificationIcon: './assets/odysync_icon.png'
    },
    plugins: [
      'expo-font',
      'expo-secure-store',
      'sentry-expo',
      './expo-plugins.js'
    ],
    extra: {
      ...config.extra,
      eas: { projectId: "62ed6c16-c869-42cd-b91c-c82a9e410526" },
      LAN_IP: "localhost",
      API_BASE_URL: "http://localhost:8787",
      APP_ENV,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8787",
      aiProxyUrl: process.env.EXPO_PUBLIC_AI_PROXY_URL ?? "http://localhost:8787",
      posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? "",
      revenuecatKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY ?? "",
      sentryDsn: process.env.SENTRY_DSN ?? "",
      trialDays: Number(process.env.EXPO_PUBLIC_TRIAL_DAYS ?? "7"),
      debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === "true" || false,
    },
    updates: { url: "https://u.expo.dev/62ed6c16-c869-42cd-b91c-c82a9e410526" },
    // Add cache configuration to prevent permission issues
    _internal: {
      isDebug: false,
    },
  };
};

