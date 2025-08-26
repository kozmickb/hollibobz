import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'base' | 'lg';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'base',
  disabled = false,
  gradient = false,
  style,
  textStyle,
}: ThemedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return gradient
          ? { colors: ['#FF6B6B', '#FFD93D'] }
          : { backgroundColor: '#FF6B6B' };
      case 'secondary':
        return gradient
          ? { colors: ['#4ECDC4', '#42A5F5'] }
          : { backgroundColor: '#4ECDC4' };
      case 'accent':
        return { backgroundColor: '#FFD93D' };
      case 'success':
        return { backgroundColor: '#45B69C' };
      case 'destructive':
        return { backgroundColor: '#FF4757' };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FF6B6B' };
      default:
        return { backgroundColor: '#FF6B6B' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'base':
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          fontSize: 16,
        };
      case 'lg':
        return {
          paddingHorizontal: 32,
          paddingVertical: 20,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 16,
          fontSize: 16,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return '#FF6B6B';
    if (variant === 'accent') return '#333333';
    return '#FFFFFF';
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  const handlePress = () => {
    if (!disabled) {
      runOnJS(onPress)();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (gradient && 'colors' in variantStyles) {
    return (
      <AnimatedPressable
        style={[animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
      >
        <LinearGradient
          colors={variantStyles.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            {
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: sizeStyles.paddingHorizontal,
              paddingVertical: sizeStyles.paddingVertical,
              opacity: disabled ? 0.6 : 1,
            },
            style,
          ]}
        >
          <Text
            style={[
              {
                color: getTextColor(),
                fontSize: sizeStyles.fontSize,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[
        {
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          opacity: disabled ? 0.6 : 1,
        },
        variantStyles,
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text
        style={[
          {
            color: getTextColor(),
            fontSize: sizeStyles.fontSize,
            fontFamily: 'Poppins-SemiBold',
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}
