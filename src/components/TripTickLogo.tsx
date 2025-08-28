import React from 'react';
import { Image, View, ViewStyle } from 'react-native';

interface TripTickLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  style?: ViewStyle;
}

export function TripTickLogo({ size = 'md', style }: TripTickLogoProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32 };
      case 'md':
        return { width: 48, height: 48 };
      case 'lg':
        return { width: 64, height: 64 };
      case 'xl':
        return { width: 80, height: 80 };
      case '2xl':
        return { width: 96, height: 96 };
      case '3xl':
        return { width: 128, height: 128 };
      default:
        return { width: 48, height: 48 };
    }
  };

  return (
    <View style={[style]}>
      <Image
        source={require('../../assets/TT logo.png')}
        style={getSizeStyles()}
        resizeMode="contain"
        accessibilityLabel="TripTick Logo"
      />
    </View>
  );
}
