import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface TimerCardProps {
  destination: string;
  date: string;
  daysLeft: number;
  createdAt: string;
  onPress: () => void;
  style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TimerCard({ destination, date, daysLeft, createdAt, onPress, style }: TimerCardProps) {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const [showProgressTooltip, setShowProgressTooltip] = useState(false);

  // Shimmer animation for excitement
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);

  // Pulse animation for urgent timers (less than 7 days)
  useEffect(() => {
    if (daysLeft <= 7 && daysLeft > 0) {
      pulseScale.value = withRepeat(
        withSpring(1.05, { damping: 8, stiffness: 100 }),
        -1,
        true
      );
    }
  }, [daysLeft]);

  // Gentle countdown pulse animation every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (daysLeft > 0) {
        scale.value = withSequence(
          withTiming(0.98, { duration: 300 }),
          withTiming(1, { duration: 300 })
        );
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [daysLeft]);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    runOnJS(onPress)();
  };

  const handleProgressPress = () => {
    Alert.alert(
      'Countdown Progress',
      `${Math.round(progressPercentage)}% of your countdown complete`,
      [{ text: 'OK' }]
    );
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { scale: daysLeft <= 7 && daysLeft > 0 ? pulseScale.value : 1 }
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-100, 300]);
    return {
      transform: [{ translateX }],
    };
  });

  const getGradientColors = () => {
    if (daysLeft <= 0) return ['#FF4757', '#FF6B6B']; // Red for past dates
    if (daysLeft <= 7) return ['#FF6B6B', '#FFD93D']; // Sunset gradient for urgent
    if (daysLeft <= 30) return ['#4ECDC4', '#42A5F5']; // Ocean gradient for soon
    return ['#45B69C', '#4ECDC4']; // Green-turquoise for distant
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysText = () => {
    if (daysLeft <= 0) return 'Today!';
    if (daysLeft === 1) return '1 day';
    return `${daysLeft} days`;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const created = new Date(createdAt).getTime();
    const target = new Date(date).getTime();
    const now = new Date().getTime();
    
    const totalDuration = target - created;
    const elapsed = now - created;
    
    if (totalDuration <= 0) return 0;
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const progressPercentage = getProgressPercentage();

  return (
    <AnimatedPressable
      style={[animatedCardStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <View style={{ borderRadius: 20, overflow: 'hidden' }}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 20,
            minHeight: 120,
            position: 'relative',
          }}
        >
          {/* Shimmer overlay for excitement */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 100,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: [{ skewX: '-20deg' }],
              },
              shimmerStyle,
            ]}
          />

          {/* Content */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontFamily: 'Poppins-Bold',
                  marginBottom: 4,
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
                numberOfLines={2}
              >
                {destination}
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: 14,
                  fontFamily: 'Poppins-Medium',
                  marginBottom: 8,
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                Departs in {getDaysText()}
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 12,
                  fontFamily: 'Poppins-Regular',
                }}
              >
                {formatDate(date)}
              </Text>
            </View>
            
            <Ionicons 
              name="airplane" 
              size={28} 
              color="rgba(255, 255, 255, 0.9)" 
            />
          </View>

          {/* Countdown */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
            <View>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 32,
                  fontFamily: 'Poppins-Bold',
                  lineHeight: 36,
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {Math.abs(daysLeft)}
              </Text>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: 14,
                  fontFamily: 'Poppins-Medium',
                  marginTop: -4,
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                {getDaysText()}
              </Text>
            </View>
            
            {daysLeft <= 7 && daysLeft > 0 && (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontFamily: 'Poppins-SemiBold',
                  }}
                >
                  Almost here! 🎉
                </Text>
              </View>
            )}
          </View>

          {/* Progress strip */}
          <Pressable
            onPress={handleProgressPress}
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <View style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 3,
            }} />
          </Pressable>
        </LinearGradient>
      </View>
    </AnimatedPressable>
  );
}
