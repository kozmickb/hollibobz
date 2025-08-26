// Holiday Excitement Theme System
export const theme = {
  colors: {
    // Primary: Energetic coral for buttons, accents—evokes sunset excitement
    primary: '#FF6B6B',
    primaryDark: '#E55555',
    primaryLight: '#FF8A8A',
    
    // Secondary: Fresh turquoise for backgrounds, timers—suggests tropical waters and adventure
    secondary: '#4ECDC4',
    secondaryDark: '#3FB8B1',
    secondaryLight: '#6FD5CE',
    
    // Accent: Sunny yellow for highlights, countdowns—builds anticipation
    accent: '#FFD93D',
    accentDark: '#E6C235',
    accentLight: '#FFE066',
    
    // Neutrals
    background: '#F7F7F7',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E5E5E5',
    
    // Status colors
    success: '#45B69C',
    error: '#FF4757',
    warning: '#FFA726',
    info: '#42A5F5',
    
    // Gradients
    gradients: {
      sunset: ['#FF6B6B', '#FFD93D'],
      ocean: ['#4ECDC4', '#42A5F5'],
      primary: ['#FF6B6B', '#FF8A8A'],
      secondary: ['#4ECDC4', '#6FD5CE'],
    }
  },
  
  fonts: {
    primary: {
      regular: 'Poppins-Regular',
      medium: 'Poppins-Medium', 
      semiBold: 'Poppins-SemiBold',
      bold: 'Poppins-Bold',
    },
    secondary: {
      regular: 'PlayfairDisplay-Regular',
      medium: 'PlayfairDisplay-Medium',
      semiBold: 'PlayfairDisplay-SemiBold',
      bold: 'PlayfairDisplay-Bold',
    }
  },
  
  fontSizes: {
    xs: 12,
    sm: 14, 
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    base: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    sm: 8,
    base: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  }
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeFonts = typeof theme.fonts;
