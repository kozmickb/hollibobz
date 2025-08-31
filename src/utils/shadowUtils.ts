import { Platform } from 'react-native';

interface ShadowProps {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

export const createShadowStyle = (props: ShadowProps) => {
  if (Platform.OS === 'web') {
    const { shadowColor = '#000', shadowOffset = { width: 0, height: 0 }, shadowOpacity = 0.3, shadowRadius = 0 } = props;
    
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${shadowColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}`
    };
  }
  
  return props;
};

export const createTextShadowStyle = (props: ShadowProps) => {
  if (Platform.OS === 'web') {
    const { shadowColor = '#000', shadowOffset = { width: 0, height: 0 }, shadowOpacity = 0.3, shadowRadius = 0 } = props;
    
    return {
      textShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${shadowColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}`
    };
  }
  
  return props;
};
