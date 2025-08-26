import { createTheme } from '@shopify/restyle';
import { TripTickPalette } from './tokens';

const palette = TripTickPalette;

const theme = createTheme({
  colors: {
    // Backgrounds
    bg: palette.navy900,
    surface: palette.surface,
    surfaceAlt: palette.surfaceAlt,
    
    // Text
    text: palette.textOnNavy,
    textMuted: palette.textMuted,
    
    // Primary colors
    primary: palette.sunriseC,
    primaryAlt: palette.sunriseY,
    
    // Status colors
    success: palette.teal600,
    warning: '#FFC857',
    danger: '#FF6B6B',
    
    // Ring colors
    ringLow: palette.navy600,
    ringMid: palette.sunriseO,
    ringHigh: palette.sunriseY,
    
    // Utility
    scrim: palette.scrim,
    transparent: 'transparent',
  },
  
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
  },
  
  borderRadii: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  
  textVariants: {
    // Sizes
    xs: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    },
    sm: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
    md: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
    lg: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '500',
    },
    xl: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
    },
    '2xl': {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
    },
    '3xl': {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '700',
    },
    '4xl': {
      fontSize: 36,
      lineHeight: 40,
      fontWeight: '700',
    },
    
    // Weights
    regular: {
      fontWeight: '400',
    },
    medium: {
      fontWeight: '500',
    },
    semibold: {
      fontWeight: '600',
    },
    bold: {
      fontWeight: '700',
    },
  },
  
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
});

// Light theme variant
const lightTheme = createTheme({
  ...theme,
  colors: {
    ...theme.colors,
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceAlt: '#F1F5F9',
    text: palette.navy900,
    textMuted: palette.navy500,
  },
});

export type Theme = typeof theme;
export type LightTheme = typeof lightTheme;

export { theme, lightTheme };
export default theme;
