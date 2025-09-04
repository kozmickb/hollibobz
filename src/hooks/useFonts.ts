import React from 'react';
import { useFonts as useExpoFonts } from 'expo-font';
import { Platform } from 'react-native';

export function useFonts() {
  // Simplified: Use only Questrial variants for consistency
  const [fontsLoaded, fontError] = useExpoFonts(
    Platform.OS === 'web' ? {} : {
      'Questrial': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
      'Questrial-Regular': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
    }
  );

  // Handle font loading differently for web vs native
  if (Platform.OS === 'web') {
    // For web, we assume fonts are loaded via CSS @font-face
    React.useEffect(() => {
      const timer = setTimeout(() => {
        console.log('🌐 Web environment: Assuming fonts loaded via CSS');
      }, 100);
      return () => clearTimeout(timer);
    }, []);
    
    return { fontsLoaded: true, fontError: null };
  } else {
    // For native, use expo-font loading status
    if (fontError) {
      console.warn('❌ Font loading error:', fontError);
    }
    
    console.log('📱 Native font loading status:', { fontsLoaded, fontError });
    
    if (fontsLoaded) {
      console.log('✅ Native fonts loaded successfully');
    }
    
    return { fontsLoaded, fontError };
  }
}
