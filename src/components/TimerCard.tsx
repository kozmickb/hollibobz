import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useHolidayStore } from '../store/useHolidayStore';
import { daysUntil } from '../features/countdown/logic';
import { createShadowStyle } from '../utils/shadowUtils';

interface TimerCardProps {
  timerId: string;
  onPress?: () => void;
  showProgress?: boolean;
}

export function TimerCard({ timerId, onPress, showProgress = true }: TimerCardProps) {
  const timer = useHolidayStore((s) => s.timers.find(t => t.id === timerId));
  const { isDark } = useThemeStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (!timer) return null;

  const daysLeft = daysUntil(timer.date);
  const progressPercent = Math.max(0, Math.min(1, (365 - daysLeft) / 365));

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          {
            marginBottom: 16,
            borderRadius: 20,
            overflow: 'hidden',
            elevation: 8,
          },
          createShadowStyle({
            shadowColor: isDark ? '#000' : '#666',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.2,
            shadowRadius: 8,
          })
        ]}
      >
        <LinearGradient
          colors={isDark 
            ? ['#2a2a2a', '#1a1a1a'] 
            : ['#FFFFFF', '#F8F8F8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 20,
            borderWidth: 1,
            borderColor: isDark ? '#444444' : '#E5E5E5',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#FF6B6B' : '#FF6B6B',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontFamily: 'Poppins-Bold',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 2,
              }}>
                {timer.destination}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#CCCCCC' : '#666666',
              }}>
                {new Date(timer.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Countdown Display */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginBottom: 16,
              transform: [{ scale: pulseAnim }],
            }}
          >
            <Text style={{
              fontSize: 48,
              fontFamily: 'Poppins-Bold',
              color: isDark ? '#FF6B6B' : '#FF6B6B',
              textAlign: 'center',
            }}>
              {daysLeft}
            </Text>
            <Text style={{
              fontSize: 16,
              fontFamily: 'Poppins-Medium',
              color: isDark ? '#CCCCCC' : '#666666',
              textAlign: 'center',
            }}>
              {daysLeft === 1 ? 'day' : 'days'} to go!
            </Text>
          </Animated.View>

          {/* Progress Bar */}
          {showProgress && (
            <View style={{ marginBottom: 8 }}>
              <View style={{
                height: 8,
                backgroundColor: isDark ? '#444444' : '#E5E5E5',
                borderRadius: 4,
                overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={['#FF6B6B', '#FFD93D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: '100%',
                    width: `${progressPercent * 100}%`,
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text style={{
                fontSize: 12,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#CCCCCC' : '#666666',
                textAlign: 'center',
                marginTop: 4,
              }}>
                {Math.round(progressPercent * 100)}% complete
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 16,
                fontFamily: 'Poppins-Bold',
                color: isDark ? '#FF6B6B' : '#FF6B6B',
              }}>
                {timer.streak || 0}
              </Text>
              <Text style={{
                fontSize: 12,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#CCCCCC' : '#666666',
              }}>
                Streak
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 16,
                fontFamily: 'Poppins-Bold',
                color: isDark ? '#4ECDC4' : '#4ECDC4',
              }}>
                {timer.xp || 0}
              </Text>
              <Text style={{
                fontSize: 12,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#CCCCCC' : '#666666',
              }}>
                XP
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
