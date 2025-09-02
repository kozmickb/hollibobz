import { useFonts as useExpoFonts } from 'expo-font';

export function useFonts() {
  const [fontsLoaded, fontError] = useExpoFonts({
    'Questrial': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
    'Questrial-Regular': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
    'PlayfairDisplay-Regular': require('../../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Medium': require('../../assets/fonts/PlayfairDisplay-Medium.ttf'),
    'PlayfairDisplay-SemiBold': require('../../assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    'PlayfairDisplay-Bold': require('../../assets/fonts/PlayfairDisplay-Bold.ttf'),
  });

  // Log font loading status for debugging
  if (fontError) {
    console.warn('Font loading error:', fontError);
  }
  
  console.log('📱 Font loading status:', { fontsLoaded, fontError });
  
  if (fontsLoaded) {
    console.log('✅ Fonts loaded successfully:', [
      'Questrial', 'Questrial-Regular', 'PlayfairDisplay-Regular', 
      'PlayfairDisplay-Medium', 'PlayfairDisplay-SemiBold', 'PlayfairDisplay-Bold'
    ]);
  }

  return { fontsLoaded, fontError };
}
