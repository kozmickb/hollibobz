import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { FlipDigit } from './FlipDigit';
import { useThemeStore } from '../store/useThemeStore';
import { textStyles, accessibilityProps } from '../utils/accessibility';

interface CountdownDisplayProps {
  daysLeft: number;
  size?: 'sm' | 'lg' | 'xl';
  showAnimation?: boolean;
}

export function CountdownDisplay({ 
  daysLeft, 
  size = 'lg', 
  showAnimation = true 
}: CountdownDisplayProps) {
  const { reduceMotion } = useThemeStore();
  const scale = useSharedValue(1);
  const colorAnimation = useSharedValue(0);

  useEffect(() => {
    if (showAnimation && !reduceMotion) {
      // Pulse animation on mount
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 8 })
      );

      // Color animation based on urgency
      if (daysLeft <= 7) {
        colorAnimation.value = withTiming(1, { duration: 1000 });
      } else if (daysLeft <= 30) {
        colorAnimation.value = withTiming(0.5, { duration: 1000 });
      } else {
        colorAnimation.value = withTiming(0, { duration: 1000 });
      }
    }
  }, [daysLeft, showAnimation, reduceMotion]);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          labelSize: 14,
          spacing: 4,
          containerPadding: 8,
        };
      case 'lg':
        return {
          labelSize: 18,
          spacing: 8,
          containerPadding: 12,
        };
      case 'xl':
        return {
          labelSize: 24,
          spacing: 12,
          containerPadding: 16,
        };
      default:
        return {
          labelSize: 18,
          spacing: 8,
          containerPadding: 12,
        };
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      colorAnimation.value,
      [0, 0.5, 1],
      ['#45B69C', '#FFD93D', '#FF6B6B'] // Green -> Yellow -> Red
    );

    return {
      color,
    };
  });

  const sizeStyles = getSizeStyles();

  const getDaysText = () => {
    if (daysLeft <= 0) return 'Today!';
    if (daysLeft === 1) return 'day to go';
    return 'days to go';
  };

  const getMotivationalText = () => {
    if (daysLeft <= 0) return '🎉 Enjoy your trip!';
    if (daysLeft <= 3) return '🚀 Almost time!';
    if (daysLeft <= 7) return '✈️ Pack your bags!';
    if (daysLeft <= 14) return '📅 Getting closer!';
    if (daysLeft <= 30) return '🌟 Exciting times ahead!';
    return '🗓️ Something to look forward to!';
  };

  return (
    <Animated.View style={[
      { 
        alignItems: 'center',
        padding: sizeStyles.containerPadding,
      }, 
      animatedStyle
    ]}>
      {/* Glow effect for urgent countdowns */}
      {daysLeft <= 7 && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderRadius: 20,
          zIndex: -1,
        }} />
      )}
      
      <FlipDigit 
        value={Math.abs(daysLeft)} 
        size={size} 
        animatedColor={{
          value: colorAnimation,
          inputRange: [0, 0.5, 1],
          outputRange: ['#45B69C', '#FFD93D', '#FF6B6B']
        }}
      />
      
      <Text
        style={[
          textStyles.bodySmall,
          {
            fontSize: sizeStyles.labelSize,
            textAlign: 'center',
            marginTop: sizeStyles.spacing,
          }
        ]}
        {...accessibilityProps.text}
      >
        {getDaysText()}
      </Text>

      {size === 'xl' && (
        <Text
          style={[
            textStyles.caption,
            {
              fontSize: 16,
              textAlign: 'center',
              marginTop: sizeStyles.spacing * 2,
            }
          ]}
          {...accessibilityProps.text}
        >
          {getMotivationalText()}
        </Text>
      )}
    </Animated.View>
  );
}
