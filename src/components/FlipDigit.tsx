import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useThemeStore } from '../store/useThemeStore';
import { OdysyncPalette } from '../theme/tokens';

interface FlipDigitProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return { fontSize: 16, lineHeight: 20, width: 20 };
    case 'md':
      return { fontSize: 24, lineHeight: 28, width: 28 };
    case 'lg':
      return { fontSize: 32, lineHeight: 36, width: 36 };
    case 'xl':
      return { fontSize: 48, lineHeight: 52, width: 52 };
    default:
      return { fontSize: 24, lineHeight: 28, width: 28 };
  }
};

export const FlipDigit: React.FC<FlipDigitProps> = ({
  value,
  size = 'md',
  color = OdysyncPalette.textOnNavy,
}) => {
  const { reduceMotion } = useThemeStore();
  const flipValue = useSharedValue(0);
  const sizeStyles = getSizeStyles(size);

  useEffect(() => {
    if (reduceMotion) {
      // Simple fade transition for reduced motion
      flipValue.value = withTiming(1, { duration: 300 });
    } else {
      // Flip animation
      flipValue.value = withTiming(1, { duration: 180 }, () => {
        flipValue.value = withTiming(0, { duration: 180 });
      });
    }
  }, [value, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {
        opacity: interpolate(flipValue.value, [0, 1], [0.5, 1]),
      };
    }

    const rotateX = interpolate(flipValue.value, [0, 0.5, 1], [0, 90, 0]);
    const scale = interpolate(flipValue.value, [0, 0.5, 1], [1, 0.8, 1]);

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX}deg` },
        { scale },
      ],
    };
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            ...sizeStyles,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: OdysyncPalette.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: OdysyncPalette.navy500,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        <Text
          style={{
            fontSize: sizeStyles.fontSize,
            lineHeight: sizeStyles.lineHeight,
            fontWeight: '600',
            color,
            textAlign: 'center',
          }}
        >
          {value}
        </Text>
      </Animated.View>
    </View>
  );
};
