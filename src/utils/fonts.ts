// Font utility functions with fallbacks

export const getFontFamily = (
  fontWeight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular',
  fontType: 'primary' | 'secondary' = 'primary'
) => {
  const primary = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  };

  const secondary = {
    regular: 'PlayfairDisplay-Regular',
    medium: 'PlayfairDisplay-Medium',
    semibold: 'PlayfairDisplay-SemiBold',
    bold: 'PlayfairDisplay-Bold',
  };

  const fonts = fontType === 'primary' ? primary : secondary;
  return fonts[fontWeight];
};

// Fallback fonts for different platforms
export const getFontFallback = (
  fontWeight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular'
) => {
  const weightMap = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  return {
    fontFamily: 'System',
    fontWeight: weightMap[fontWeight],
  };
};

// Safe font style that falls back gracefully
export const getSafeFont = (
  fontWeight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular',
  fontType: 'primary' | 'secondary' = 'primary',
  fontsLoaded: boolean = true
) => {
  if (fontsLoaded) {
    return {
      fontFamily: getFontFamily(fontWeight, fontType),
    };
  }
  
  return getFontFallback(fontWeight);
};
