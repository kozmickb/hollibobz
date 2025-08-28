import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { TripTickPalette } from './tokens';

const palette = TripTickPalette;

// Dark theme for Paper
export const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: palette.orange500,
    primaryContainer: palette.yellow400,
    secondary: palette.teal600,
    secondaryContainer: palette.teal700,
    tertiary: palette.orange400,
    tertiaryContainer: palette.yellow400,
    
    background: palette.navy900,
    surface: palette.surface,
    surfaceVariant: palette.surfaceAlt,
    
    onPrimary: palette.textOnNavy,
    onPrimaryContainer: palette.navy900,
    onSecondary: palette.textOnNavy,
    onSecondaryContainer: palette.textOnNavy,
    onTertiary: palette.textOnNavy,
    onTertiaryContainer: palette.navy900,
    
    onBackground: palette.textOnNavy,
    onSurface: palette.textOnNavy,
    onSurfaceVariant: palette.textMuted,
    
    error: '#FF6B6B',
    errorContainer: '#FF6B6B',
    onError: palette.textOnNavy,
    onErrorContainer: palette.textOnNavy,
    
    outline: palette.navy500,
    outlineVariant: palette.navy600,
    
    scrim: palette.scrim,
    shadow: palette.scrim,
  },
};

// Light theme for Paper
export const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.orange500,
    primaryContainer: palette.yellow400,
    secondary: palette.teal600,
    secondaryContainer: palette.teal700,
    tertiary: palette.orange400,
    tertiaryContainer: palette.yellow400,
    
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#F1F5F9',
    
    onPrimary: palette.textOnNavy,
    onPrimaryContainer: palette.navy900,
    onSecondary: palette.textOnNavy,
    onSecondaryContainer: palette.textOnNavy,
    onTertiary: palette.textOnNavy,
    onTertiaryContainer: palette.navy900,
    
    onBackground: palette.navy900,
    onSurface: palette.navy900,
    onSurfaceVariant: palette.navy500,
    
    error: '#FF6B6B',
    errorContainer: '#FF6B6B',
    onError: palette.textOnNavy,
    onErrorContainer: palette.textOnNavy,
    
    outline: palette.navy500,
    outlineVariant: palette.navy600,
    
    scrim: palette.scrim,
    shadow: palette.scrim,
  },
};
