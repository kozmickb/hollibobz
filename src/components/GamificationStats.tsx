import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from './ui/Text';

interface GamificationStatsProps {
  experiencePoints: number;
  xpProgress?: number;
}

export const GamificationStats: React.FC<GamificationStatsProps> = ({
  experiencePoints,
  xpProgress = 60
}) => {
  const { isDark } = useThemeStore();
  
  // Animation values
  const [zapAnim] = useState(new Animated.Value(0));
  const [xpScaleAnim] = useState(new Animated.Value(0));
  const [xpProgressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Zap animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(zapAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(zapAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();

    // Scale animations
    Animated.timing(xpScaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Progress animations
    Animated.timing(xpProgressAnim, { toValue: xpProgress, duration: 1000, useNativeDriver: false }).start();
  }, [xpProgress]);

  return (
    <View style={{ flexDirection: 'column', gap: 12 }}>
      {/* Experience Points Card */}
      <Animated.View
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#e5e7eb',
          transform: [{ scale: xpScaleAnim }]
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Animated.View
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderRadius: 8,
              padding: 8,
              transform: [{
                scale: zapAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })
              }]
            }}
          >
            <Ionicons name="flash" size={20} color="#a78bfa" />
          </Animated.View>
          <View>
            <RestyleText variant="md" color="text" fontWeight="semibold">
              Experience Points
            </RestyleText>
            <RestyleText variant="sm" color="textMuted">
              Level up your travels
            </RestyleText>
          </View>
        </View>
        
        <Animated.Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#a78bfa',
            marginBottom: 8,
            transform: [{ scale: xpScaleAnim }]
          }}
        >
          {experiencePoints.toLocaleString()} XP
        </Animated.Text>
        
        <View
          style={{
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
            borderRadius: 4,
            height: 8,
            marginBottom: 8,
            overflow: 'hidden'
          }}
        >
          <Animated.View
            style={{
              backgroundColor: '#a78bfa',
              borderRadius: 4,
              height: 8,
              width: xpProgressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })
            }}
          />
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <RestyleText variant="xs" color="textMuted">
            Progress to next level
          </RestyleText>
          <RestyleText variant="xs" color="text" fontWeight="medium" style={{ color: '#a78bfa' }}>
            {xpProgress}%
          </RestyleText>
        </View>
      </Animated.View>
    </View>
  );
};
