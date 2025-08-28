import { dark as evaDark, light as evaLight } from '@eva-design/eva';
import { TripTickPalette } from './tokens';

const palette = TripTickPalette;

// Dark theme mapping
export const darkKittenTheme = {
  ...evaDark,
  'color-primary-100': palette.yellow400,
  'color-primary-200': palette.orange400,
  'color-primary-300': palette.orange500,
  'color-primary-400': palette.orange500,
  'color-primary-500': palette.orange500,
  'color-primary-600': palette.orange600,
  'color-primary-700': palette.yellow500,
  'color-primary-800': palette.yellow500,
  'color-primary-900': palette.yellow500,
  
  'color-success-100': palette.teal600,
  'color-success-200': palette.teal600,
  'color-success-300': palette.teal600,
  'color-success-400': palette.teal600,
  'color-success-500': palette.teal600,
  'color-success-600': palette.teal700,
  'color-success-700': palette.teal700,
  'color-success-800': palette.teal700,
  'color-success-900': palette.teal700,
  
  'color-info-100': palette.yellow400,
  'color-info-200': palette.yellow400,
  'color-info-300': palette.yellow400,
  'color-info-400': palette.yellow400,
  'color-info-500': palette.yellow400,
  'color-info-600': palette.orange400,
  'color-info-700': palette.orange500,
  'color-info-800': palette.orange500,
  'color-info-900': palette.orange500,
  
  'color-warning-100': '#FFC857',
  'color-warning-200': '#FFC857',
  'color-warning-300': '#FFC857',
  'color-warning-400': '#FFC857',
  'color-warning-500': '#FFC857',
  'color-warning-600': '#FFA85A',
  'color-warning-700': '#FF6B6B',
  'color-warning-800': '#FF6B6B',
  'color-warning-900': '#FF6B6B',
  
  'color-danger-100': '#FF6B6B',
  'color-danger-200': '#FF6B6B',
  'color-danger-300': '#FF6B6B',
  'color-danger-400': '#FF6B6B',
  'color-danger-500': '#FF6B6B',
  'color-danger-600': '#FF6B6B',
  'color-danger-700': '#FF6B6B',
  'color-danger-800': '#FF6B6B',
  'color-danger-900': '#FF6B6B',
  
  // Background colors
  'color-basic-100': palette.navy900,
  'color-basic-200': palette.surface,
  'color-basic-300': palette.surfaceAlt,
  'color-basic-400': palette.navy700,
  'color-basic-500': palette.navy600,
  'color-basic-600': palette.navy500,
  'color-basic-700': palette.navy500,
  'color-basic-800': palette.navy500,
  'color-basic-900': palette.navy500,
  
  // Text colors
  'color-basic-1000': palette.textOnNavy,
  'color-basic-1100': palette.textMuted,
};

// Light theme mapping
export const lightKittenTheme = {
  ...evaLight,
  'color-primary-100': palette.yellow400,
  'color-primary-200': palette.orange400,
  'color-primary-300': palette.orange500,
  'color-primary-400': palette.orange500,
  'color-primary-500': palette.orange500,
  'color-primary-600': palette.orange600,
  'color-primary-700': palette.yellow500,
  'color-primary-800': palette.yellow500,
  'color-primary-900': palette.yellow500,
  
  'color-success-100': palette.teal600,
  'color-success-200': palette.teal600,
  'color-success-300': palette.teal600,
  'color-success-400': palette.teal600,
  'color-success-500': palette.teal600,
  'color-success-600': palette.teal700,
  'color-success-700': palette.teal700,
  'color-success-800': palette.teal700,
  'color-success-900': palette.teal700,
  
  'color-info-100': palette.yellow400,
  'color-info-200': palette.yellow400,
  'color-info-300': palette.yellow400,
  'color-info-400': palette.yellow400,
  'color-info-500': palette.yellow400,
  'color-info-600': palette.orange400,
  'color-info-700': palette.orange500,
  'color-info-800': palette.orange500,
  'color-info-900': palette.orange500,
  
  'color-warning-100': '#FFC857',
  'color-warning-200': '#FFC857',
  'color-warning-300': '#FFC857',
  'color-warning-400': '#FFC857',
  'color-warning-500': '#FFC857',
  'color-warning-600': '#FFA85A',
  'color-warning-700': '#FF6B6B',
  'color-warning-800': '#FF6B6B',
  'color-warning-900': '#FF6B6B',
  
  'color-danger-100': '#FF6B6B',
  'color-danger-200': '#FF6B6B',
  'color-danger-300': '#FF6B6B',
  'color-danger-400': '#FF6B6B',
  'color-danger-500': '#FF6B6B',
  'color-danger-600': '#FF6B6B',
  'color-danger-700': '#FF6B6B',
  'color-danger-800': '#FF6B6B',
  'color-danger-900': '#FF6B6B',
  
  // Background colors for light theme
  'color-basic-100': '#FFFFFF',
  'color-basic-200': '#F8FAFC',
  'color-basic-300': '#F1F5F9',
  'color-basic-400': '#E2E8F0',
  'color-basic-500': '#CBD5E1',
  'color-basic-600': '#94A3B8',
  'color-basic-700': '#64748B',
  'color-basic-800': '#475569',
  'color-basic-900': '#334155',
  
  // Text colors for light theme
  'color-basic-1000': palette.navy900,
  'color-basic-1100': palette.navy500,
};
