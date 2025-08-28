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
import { TripTickLogo } from "./src/components/TripTickLogo";
import { useThemeStore } from "./src/store/useThemeStore";
import { TripTickPalette } from "./src/theme/tokens";

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
  const { fontsLoaded, fontError } = useFonts();
  const { colorScheme, restyleTheme, kittenTheme, paperTheme } = useThemeStore();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      onLayoutRootView();
    }
  }, [fontsLoaded, fontError, onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={[TripTickPalette.orange500, TripTickPalette.yellow400]}
          style={{ 
            flex: 1, 
            width: '100%', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <TripTickLogo size="2xl" style={{ marginBottom: 24 }} />
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: '600',
            marginTop: 16,
            textAlign: 'center',
          }}>
            Loading TripTick...
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
    <ApplicationProvider {...eva} theme={kittenTheme}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider theme={restyleTheme}>
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
  );
}
