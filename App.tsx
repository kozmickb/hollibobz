import React, { useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@shopify/restyle';
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useFonts } from "./src/hooks/useFonts";
import { OdysyncLogo } from "./src/components/OdysyncLogo";
import { useThemeStore } from "./src/store/useThemeStore";
import { OdysyncPalette } from "./src/theme/tokens";
import { UserStorageManager } from "./src/lib/userStorage";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

// New imports for production hardening
import { initPurchases } from "./src/api/purchases";
import { Analytics, initSentry } from "./src/lib/monitoring";
import { runRuntimeGuards, APP_ENV, API_BASE_URL, AI_PROXY_URL, POSTHOG_KEY, SENTRY_DSN } from "./src/config/env";
import { initTelemetry, trackScreen } from "./src/lib/telemetry";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Run runtime guards at the earliest safe point
  runRuntimeGuards();
  
  const { fontsLoaded, fontError } = useFonts();
  const { colorScheme, restyleTheme, kittenTheme, paperTheme, reinitializeTheme } = useThemeStore();
  
  // Debug theme state (can be removed once theme is stable)
  console.log('App render - Theme debug:', {
    colorScheme,
    hasRestyleTheme: !!restyleTheme,
    hasColors: !!restyleTheme?.colors,
    hasSecondary: !!restyleTheme?.colors?.secondary,
    secondaryValue: restyleTheme?.colors?.secondary,
  });
  
  // Ensure theme is properly initialized
  useEffect(() => {
    if (!restyleTheme?.colors?.secondary) {
      console.log('Theme missing secondary color, reinitializing...');
      reinitializeTheme();
    }
  }, [restyleTheme, reinitializeTheme]);
  

  
  // Ensure theme is properly initialized with complete structure
  const safeRestyleTheme = restyleTheme || {
    colors: {
      primary: '#F97316',
      secondary: '#14B8A6',
      accent: '#FACC15',
      text: '#FFFFFF',
      textMuted: '#B8C2D9',
      bg: '#0F172A',
      surface: '#1E293B',
      surfaceAlt: '#102046',
      primaryAlt: '#FB923C',
      secondaryAlt: '#2DD4BF',
      accentAlt: '#A78BFA',
      success: '#22C6A5',
      warning: '#EAB308',
      danger: '#EC4899',
      ringLow: '#243461',
      ringMid: '#F97316',
      ringHigh: '#2DD4BF',
      scrim: 'rgba(0,0,0,0.35)',
      whiteOverlay: 'rgba(255,255,255,0.3)',
      transparent: 'transparent',
    },
    spacing: {
      0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40,
      11: 44, 12: 48, 13: 52, 14: 56, 15: 60, 16: 64, 17: 68, 18: 72, 19: 76, 20: 80,
    },
    borderRadii: {
      sm: 6, md: 12, lg: 16, xl: 24, pill: 999,
    },
    textVariants: {
      xs: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
      sm: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
      md: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
      lg: { fontSize: 18, lineHeight: 26, fontWeight: '500' },
      xl: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
      '2xl': { fontSize: 24, lineHeight: 32, fontWeight: '600' },
      '3xl': { fontSize: 30, lineHeight: 36, fontWeight: '700' },
      '4xl': { fontSize: 36, lineHeight: 40, fontWeight: '700' },
      regular: { fontWeight: '400' },
      medium: { fontWeight: '500' },
      semibold: { fontWeight: '600' },
      bold: { fontWeight: '700' },
    },
    breakpoints: {
      phone: 0,
      tablet: 768,
    },
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      onLayoutRootView();

      // Initialize all services
      const initializeServices = async () => {
        try {
          // Initialize new telemetry system
          initTelemetry({ 
            dsn: SENTRY_DSN, 
            posthogKey: POSTHOG_KEY, 
            appEnv: APP_ENV,
            debug: __DEV__
          });

          // Initialize legacy monitoring (keep for compatibility)
          initSentry();
          Analytics.init();
          Analytics.appOpen();

          // Track app launch
          trackScreen("AppLaunched", { api: API_BASE_URL });

          // Initialize RevenueCat for payments
          await initPurchases();

          // Initialize user profile
          const userManager = UserStorageManager.getInstance();
          await userManager.initializeProfile();

          console.log('All services initialized successfully');
        } catch (error) {
          console.error('Failed to initialize services:', error);
          Analytics.error(error as Error, 'App initialization');
        }
      };

      initializeServices();
    }
  }, [fontsLoaded, fontError, onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={[OdysyncPalette.orange500, OdysyncPalette.yellow400]}
          style={{ 
            flex: 1, 
            width: '100%', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <OdysyncLogo size="2xl" style={{ marginBottom: 24 }} />
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '600',
            marginTop: 16,
            textAlign: 'center',
          }}>
            Loading Odysync...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#FF6B6B', textAlign: 'center', marginBottom: 16 }}>
          Font loading error
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          The app will continue with system fonts.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ApplicationProvider {...eva} theme={kittenTheme}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider theme={safeRestyleTheme}>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <SafeAreaProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                </NavigationContainer>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </ThemeProvider>
        </PaperProvider>
      </ApplicationProvider>
    </ErrorBoundary>
  );
}
