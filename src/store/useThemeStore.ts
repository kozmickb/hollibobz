import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  isDark: boolean;
  reduceMotion: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  _hydrate: () => Promise<void>;
};

const THEME_STORAGE_KEY = "theme_preference";

const getSystemTheme = (): boolean => {
  return Appearance.getColorScheme() === 'dark';
};

const calculateIsDark = (mode: ThemeMode): boolean => {
  switch (mode) {
    case 'dark':
      return true;
    case 'light':
      return false;
    case 'system':
      return getSystemTheme();
    default:
      return false;
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  isDark: getSystemTheme(),
  reduceMotion: false,
  
  setMode: (mode) => {
    const isDark = calculateIsDark(mode);
    set({ mode, isDark });
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  },
  
  toggleTheme: () => {
    const { mode } = get();
    const newMode = mode === 'light' ? 'dark' : 'light';
    get().setMode(newMode);
  },
  
  setReduceMotion: (reduceMotion) => {
    set({ reduceMotion });
    AsyncStorage.setItem('reduce_motion_preference', JSON.stringify(reduceMotion)).catch(() => {});
  },
  
  _hydrate: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        const mode = savedMode as ThemeMode;
        const isDark = calculateIsDark(mode);
        set({ mode, isDark });
      }
      
      const savedReduceMotion = await AsyncStorage.getItem('reduce_motion_preference');
      if (savedReduceMotion !== null) {
        const reduceMotion = JSON.parse(savedReduceMotion);
        set({ reduceMotion });
      }
    } catch {
      // ignore
    }
  },
}));

// Listen for system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  const { mode } = useThemeStore.getState();
  if (mode === 'system') {
    useThemeStore.setState({ isDark: colorScheme === 'dark' });
  }
});

// Initialize on startup
(async () => {
  await useThemeStore.getState()._hydrate();
})();
