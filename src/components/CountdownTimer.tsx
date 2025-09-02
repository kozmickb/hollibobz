import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { FlipDigit } from "./FlipDigit";
import { useThemeStore } from "../store/useThemeStore";

interface CountdownTimerProps {
  targetDate: Date;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const { isDark } = useThemeStore();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (compact) {
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDark ? '#f1f5f9' : '#1e293b' }}>
          {timeLeft.days}
        </Text>
        <Text style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#64748b' }}>
          {timeLeft.days === 1 ? "day" : "days"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <FlipDigit value={timeLeft.days.toString().padStart(2, "0")} size="lg" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>Days</Text>
      </View>
      <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <FlipDigit value={timeLeft.hours.toString().padStart(2, "0")} size="lg" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>Hours</Text>
      </View>
      <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <FlipDigit value={timeLeft.minutes.toString().padStart(2, "0")} size="lg" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>Minutes</Text>
      </View>
      <View style={{ alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <FlipDigit value={timeLeft.seconds.toString().padStart(2, "0")} size="lg" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }}>Seconds</Text>
      </View>
    </View>
  );
}