import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from './ui/Text';

interface AnimatedCountdownProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const AnimatedCountdown: React.FC<AnimatedCountdownProps> = ({ targetDate }) => {
  const { isDark } = useThemeStore();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Animation values for each time unit
  const [dayAnim] = useState(new Animated.Value(0));
  const [hourAnim] = useState(new Animated.Value(0));
  const [minuteAnim] = useState(new Animated.Value(0));
  const [secondAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        const newTimeLeft = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
          minutes: Math.floor(distance % (1000 * 60 * 60) / (1000 * 60)),
          seconds: Math.floor(distance % (1000 * 60) / 1000)
        };

        // Animate if values changed
        if (newTimeLeft.days !== timeLeft.days) {
          Animated.sequence([
            Animated.timing(dayAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(dayAnim, { toValue: 0, duration: 150, useNativeDriver: true })
          ]).start();
        }
        if (newTimeLeft.hours !== timeLeft.hours) {
          Animated.sequence([
            Animated.timing(hourAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(hourAnim, { toValue: 0, duration: 150, useNativeDriver: true })
          ]).start();
        }
        if (newTimeLeft.minutes !== timeLeft.minutes) {
          Animated.sequence([
            Animated.timing(minuteAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(minuteAnim, { toValue: 0, duration: 150, useNativeDriver: true })
          ]).start();
        }
        if (newTimeLeft.seconds !== timeLeft.seconds) {
          Animated.sequence([
            Animated.timing(secondAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(secondAnim, { toValue: 0, duration: 150, useNativeDriver: true })
          ]).start();
        }

        setPrevTimeLeft(timeLeft);
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, timeLeft, dayAnim, hourAnim, minuteAnim, secondAnim]);

  const TimeUnit: React.FC<{
    value: number;
    label: string;
    animValue: Animated.Value;
  }> = ({ value, label, animValue }) => (
    <View
      style={{
        backgroundColor: isDark ? '#1e40af' : '#3b82f6',
        borderRadius: 8,
        padding: 8,
        minWidth: 50,
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Animated.View
        style={{
          height: 24,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1]
            })
          }]
        }}
      >
        <RestyleText
          variant="lg"
          color="text"
          fontWeight="bold"
          style={{ color: '#ffffff', fontSize: 16 }}
        >
          {value.toString().padStart(2, '0')}
        </RestyleText>
      </Animated.View>
      <RestyleText
        variant="xs"
        color="text"
        style={{ color: '#ffffff', opacity: 0.9, marginTop: 2, fontSize: 10 }}
      >
        {label}
      </RestyleText>
    </View>
  );

  return (
    <Animated.View
      style={{
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        maxWidth: 280,
        alignSelf: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Ionicons name="time-outline" size={16} color="#3b82f6" />
        <RestyleText variant="sm" color="text" fontWeight="semibold">
          Trip Countdown
        </RestyleText>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <TimeUnit value={timeLeft.days} label="Days" animValue={dayAnim} />
        <TimeUnit value={timeLeft.hours} label="Hours" animValue={hourAnim} />
        <TimeUnit value={timeLeft.minutes} label="Min" animValue={minuteAnim} />
        <TimeUnit value={timeLeft.seconds} label="Sec" animValue={secondAnim} />
      </View>
    </Animated.View>
  );
};
