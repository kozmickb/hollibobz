import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { FlipDigit } from "./FlipDigit";

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
      <View className="items-end">
        <Text className="text-2xl font-bold text-slate-800">
          {timeLeft.days}
        </Text>
        <Text className="text-sm text-slate-500">
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