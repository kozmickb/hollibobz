import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useHolidayStore } from '../store/useHolidayStore';

interface AnimatedColor {
  value: Animated.SharedValue<number>;
  inputRange: number[];
  outputRange: string[];
}

interface FlipDigitProps {
  value: string | number;
  size?: 'sm' | 'lg' | 'xl';
  color?: string;
  animatedColor?: AnimatedColor;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function FlipDigit({ value, size = 'lg', color = '#FFFFFF', animatedColor }: FlipDigitProps) {
  const settings = useHolidayStore((s) => s.settings);
  const prevValue = useRef(value);
  const flipProgress = useSharedValue(0);
  const fadeProgress = useSharedValue(1);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: 24,
          lineHeight: 28,
          height: 32,
        };
      case 'lg':
        return {
          fontSize: 48,
          lineHeight: 56,
          height: 64,
        };
      case 'xl':
        return {
          fontSize: 72,
          lineHeight: 84,
          height: 96,
        };
      default:
        return {
          fontSize: 48,
          lineHeight: 56,
          height: 64,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  useEffect(() => {
    if (prevValue.current !== value) {
      if (settings.reduceMotion) {
        // Reduced motion: simple fade transition
        fadeProgress.value = withSequence(
          withTiming(0, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
      } else {
        // Full animation: flip effect
        flipProgress.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 200 })
        );
      }
      prevValue.current = value;
    }
  }, [value, settings.reduceMotion]);

  const flipStyle = useAnimatedStyle(() => {
    let baseStyle: any = {};
    
    if (settings.reduceMotion) {
      baseStyle.opacity = fadeProgress.value;
    } else {
      const rotateX = interpolate(flipProgress.value, [0, 0.5, 1], [0, 90, 0]);
      const scaleY = interpolate(flipProgress.value, [0, 0.5, 1], [1, 0.1, 1]);
      const opacity = interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 1]);

      baseStyle = {
        transform: [
          { perspective: 1000 },
          { rotateX: `${rotateX}deg` },
          { scaleY },
        ],
        opacity,
      };
    }

    // Add animated color if provided
    if (animatedColor) {
      baseStyle.color = interpolate(
        animatedColor.value.value,
        animatedColor.inputRange,
        animatedColor.outputRange as any
      );
    }

    return baseStyle;
  });

  return (
    <View style={{ 
      height: sizeStyles.height, 
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <AnimatedText
        style={[
          {
            fontSize: sizeStyles.fontSize,
            lineHeight: sizeStyles.lineHeight,
            fontFamily: 'Poppins-Bold',
            textAlign: 'center',
            color: color,
          },
          flipStyle,
        ]}
      >
        {value}
      </AnimatedText>
    </View>
  );
}
