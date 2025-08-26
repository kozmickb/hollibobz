import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, lightTheme } from '../theme/theme';
import { darkKittenTheme, lightKittenTheme } from '../theme/uiKittenMapping';
import { darkPaperTheme, lightPaperTheme } from '../theme/paperTheme';

interface ThemeState {
  colorScheme: 'dark' | 'light';
  reduceMotion: boolean;
  restyleTheme: typeof theme;
  kittenTheme: typeof darkKittenTheme;
  paperTheme: typeof darkPaperTheme;
  setColorScheme: (scheme: 'dark' | 'light') => void;
  setReduceMotion: (reduce: boolean) => void;
  toggleColorScheme: () => void;
  toggleReduceMotion: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      colorScheme: 'dark',
      reduceMotion: false,
      restyleTheme: theme,
      kittenTheme: darkKittenTheme,
      paperTheme: darkPaperTheme,
      
      setColorScheme: (scheme: 'dark' | 'light') => {
        const restyleTheme = scheme === 'dark' ? theme : lightTheme;
        const kittenTheme = scheme === 'dark' ? darkKittenTheme : lightKittenTheme;
        const paperTheme = scheme === 'dark' ? darkPaperTheme : lightPaperTheme;
        
        set({
          colorScheme: scheme,
          restyleTheme,
          kittenTheme,
          paperTheme,
        });
      },
      
      setReduceMotion: (reduce: boolean) => {
        set({ reduceMotion: reduce });
      },
      
      toggleColorScheme: () => {
        const current = get().colorScheme;
        const newScheme = current === 'dark' ? 'light' : 'dark';
        get().setColorScheme(newScheme);
      },
      
      toggleReduceMotion: () => {
        const current = get().reduceMotion;
        set({ reduceMotion: !current });
      },
    }),
    {
      name: 'triptick-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
