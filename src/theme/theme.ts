import { createTheme } from '@shopify/restyle';
import { TripTickPalette } from './tokens';

const palette = TripTickPalette;

const theme = createTheme({
  colors: {
    // Backgrounds
    bg: palette.darkBg,
    surface: palette.darkCard,
    surfaceAlt: palette.surfaceAlt,
    
    // Text
    text: palette.textOnNavy,
    textMuted: palette.textMuted,
    
    // Primary colors (Orange gradient)
    primary: palette.orange500,
    primaryAlt: palette.orange400,
    
    // Secondary colors (Teal gradient)
    secondary: palette.teal500,
    secondaryAlt: palette.teal400,
    
    // Accent colors
    accent: palette.yellow400,
    accentAlt: palette.purple400,
    
    // Status colors
    success: palette.teal600,
    warning: palette.yellow500,
    danger: palette.pink500,
    
    // Ring colors (gradient inspired)
    ringLow: palette.navy600,
    ringMid: palette.orange500,
    ringHigh: palette.teal400,
    
    // Utility
    scrim: palette.scrim,
    whiteOverlay: palette.whiteOverlay,
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
    13: 52,
    14: 56,
    15: 60,
    16: 64,
    17: 68,
    18: 72,
    19: 76,
    20: 80,
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
    bg: palette.lightBg,
    surface: palette.lightCard,
    surfaceAlt: '#F8FAFC',
    text: palette.navy900,
    textMuted: palette.navy500,
    whiteOverlay: palette.whiteOverlay,
  },
});

export type Theme = typeof theme;
export type LightTheme = typeof lightTheme;

export { theme, lightTheme };
export default theme;
