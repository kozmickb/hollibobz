import { useThemeStore } from '../store/useThemeStore';

export function useTheme() {
  const { colorScheme } = useThemeStore();
  const isDark = colorScheme === 'dark';
  
  return {
    isDark,
    colors: {
      background: isDark ? '#1a1a1a' : '#F7F7F7',
      surface: isDark ? '#2a2a2a' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#333333',
      textSecondary: isDark ? '#CCCCCC' : '#666666',
      textMuted: isDark ? '#999999' : '#999999',
      border: isDark ? '#444444' : '#E5E5E5',
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFD93D',
    },
    shadows: {
      card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: isDark ? 6 : 4,
      },
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 2,
        elevation: isDark ? 2 : 1,
      },
    },
  };
}
