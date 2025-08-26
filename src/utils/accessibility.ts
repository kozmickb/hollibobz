import { TextStyle, ViewStyle } from 'react-native';
import { theme } from '../theme';

// Minimum contrast ratio for WCAG AA compliance
const MIN_CONTRAST_RATIO = 4.5;

// Calculate relative luminance for contrast ratio
const getRelativeLuminance = (color: string): number => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Check if contrast meets WCAG AA standards
export const hasAdequateContrast = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= MIN_CONTRAST_RATIO;
};

// Standard text styles with proper contrast
export const textStyles = {
  // Headings - Poppins SemiBold
  h1: {
    fontFamily: theme.fonts.primary.semiBold,
    fontSize: theme.fontSizes['3xl'],
    lineHeight: theme.fontSizes['3xl'] * 1.2,
    color: theme.colors.text,
  } as TextStyle,
  
  h2: {
    fontFamily: theme.fonts.primary.semiBold,
    fontSize: theme.fontSizes['2xl'],
    lineHeight: theme.fontSizes['2xl'] * 1.2,
    color: theme.colors.text,
  } as TextStyle,
  
  h3: {
    fontFamily: theme.fonts.primary.semiBold,
    fontSize: theme.fontSizes.xl,
    lineHeight: theme.fontSizes.xl * 1.2,
    color: theme.colors.text,
  } as TextStyle,
  
  // Body text - Poppins Medium for readability
  body: {
    fontFamily: theme.fonts.primary.medium,
    fontSize: theme.fontSizes.base,
    lineHeight: theme.fontSizes.base * 1.5,
    color: theme.colors.text,
  } as TextStyle,
  
  bodySmall: {
    fontFamily: theme.fonts.primary.medium,
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.fontSizes.sm * 1.4,
    color: theme.colors.textSecondary,
  } as TextStyle,
  
  // Labels - Poppins SemiBold
  label: {
    fontFamily: theme.fonts.primary.semiBold,
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.fontSizes.sm * 1.3,
    color: theme.colors.text,
  } as TextStyle,
  
  // Caption text
  caption: {
    fontFamily: theme.fonts.primary.regular,
    fontSize: theme.fontSizes.xs,
    lineHeight: theme.fontSizes.xs * 1.3,
    color: theme.colors.textMuted,
  } as TextStyle,
};

// Text styles for use on gradient backgrounds
export const gradientTextStyles = {
  h1: {
    ...textStyles.h1,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  
  h2: {
    ...textStyles.h2,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  
  h3: {
    ...textStyles.h3,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  
  body: {
    ...textStyles.body,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  } as TextStyle,
  
  bodySmall: {
    ...textStyles.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  } as TextStyle,
};

// Standard tap target size (44x44 points minimum)
export const TAP_TARGET_SIZE = 44;

// Hit slop for better touch targets
export const hitSlop = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
};

// Extended hit slop for smaller elements
export const extendedHitSlop = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};

// Minimum pressable area style
export const pressableArea: ViewStyle = {
  minHeight: TAP_TARGET_SIZE,
  minWidth: TAP_TARGET_SIZE,
  justifyContent: 'center',
  alignItems: 'center',
};

// Semi-transparent scrim for text over gradients
export const textScrim: ViewStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
};

// Stronger scrim for better contrast
export const strongTextScrim: ViewStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
};

// Accessibility helpers
export const accessibilityProps = {
  // For interactive elements
  button: {
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityHint: 'Double tap to activate',
  },
  
  // For navigation elements
  link: {
    accessible: true,
    accessibilityRole: 'link' as const,
    accessibilityHint: 'Double tap to navigate',
  },
  
  // For images
  image: {
    accessible: true,
    accessibilityRole: 'image' as const,
  },
  
  // For text that should be read
  text: {
    accessible: true,
    accessibilityRole: 'text' as const,
  },
};
