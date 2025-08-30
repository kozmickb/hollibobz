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
  isDark: boolean;
  setColorScheme: (scheme: 'dark' | 'light') => void;
  setReduceMotion: (reduce: boolean) => void;
  toggleColorScheme: () => void;
  toggleReduceMotion: () => void;
  reinitializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => {
      const initialColorScheme = 'dark';
      const initialRestyleTheme = initialColorScheme === 'dark' ? theme : lightTheme;
      const initialKittenTheme = initialColorScheme === 'dark' ? darkKittenTheme : lightKittenTheme;
      const initialPaperTheme = initialColorScheme === 'dark' ? darkPaperTheme : lightPaperTheme;
      
      // Debug theme initialization (can be removed once theme is stable)
      console.log('Theme store initialization:', {
        initialColorScheme,
        hasTheme: !!initialRestyleTheme,
        hasColors: !!initialRestyleTheme?.colors,
        hasSecondary: !!initialRestyleTheme?.colors?.secondary,
        secondaryValue: initialRestyleTheme?.colors?.secondary,
      });
      
      // Ensure theme is properly structured
      const ensureTheme = (themeToCheck: any) => {
        if (!themeToCheck || !themeToCheck.colors || !themeToCheck.colors.secondary) {
          console.warn('Invalid theme detected, using fallback');
          return initialRestyleTheme;
        }
        return themeToCheck;
      };
      
      // Force reinitialize theme to ensure it's properly loaded
      const forceReinitializeTheme = () => {
        // During initialization, get() might not be available yet, so use initialColorScheme
        const currentScheme = initialColorScheme;
        const newTheme = currentScheme === 'dark' ? theme : lightTheme;
        // Debug logging (can be removed once theme is stable)
        console.log('Force reinitializing theme:', {
          currentScheme,
          hasNewTheme: !!newTheme,
          hasColors: !!newTheme?.colors,
          hasSecondary: !!newTheme?.colors?.secondary,
        });
        return ensureTheme(newTheme);
      };
      
      return {
        colorScheme: initialColorScheme,
        reduceMotion: false,
        restyleTheme: forceReinitializeTheme(),
        kittenTheme: initialKittenTheme,
        paperTheme: initialPaperTheme,
        isDark: initialColorScheme === 'dark',
        
        setColorScheme: (scheme: 'dark' | 'light') => {
          const restyleTheme = scheme === 'dark' ? theme : lightTheme;
          const kittenTheme = scheme === 'dark' ? darkKittenTheme : lightKittenTheme;
          const paperTheme = scheme === 'dark' ? darkPaperTheme : lightPaperTheme;
          
          // Ensure theme is properly structured
          const ensureTheme = (themeToCheck: any) => {
            if (!themeToCheck || !themeToCheck.colors || !themeToCheck.colors.secondary) {
              console.warn('Invalid theme detected in setColorScheme, using fallback');
              return scheme === 'dark' ? theme : lightTheme;
            }
            return themeToCheck;
          };
          
          set({
            colorScheme: scheme,
            isDark: scheme === 'dark',
            restyleTheme: ensureTheme(restyleTheme),
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
        
        reinitializeTheme: () => {
          const currentScheme = get().colorScheme;
          const newTheme = currentScheme === 'dark' ? theme : lightTheme;
          const newKittenTheme = currentScheme === 'dark' ? darkKittenTheme : lightKittenTheme;
          const newPaperTheme = currentScheme === 'dark' ? darkPaperTheme : lightPaperTheme;
          
          console.log('Reinitializing theme:', {
            currentScheme,
            hasNewTheme: !!newTheme,
            hasColors: !!newTheme?.colors,
            hasSecondary: !!newTheme?.colors?.secondary,
          });
          
          set({
            restyleTheme: newTheme,
            kittenTheme: newKittenTheme,
            paperTheme: newPaperTheme,
          });
        },
      };
    },
    {
      name: 'triptick-theme-storage-v2', // Changed name to clear old persisted state
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
