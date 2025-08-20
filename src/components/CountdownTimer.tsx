import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";

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
    <View className="flex-row space-x-4">
      <View className="items-center bg-white/20 rounded-lg px-3 py-2">
        <Text className="text-3xl font-bold text-white">
          {timeLeft.days.toString().padStart(2, "0")}
        </Text>
        <Text className="text-white/80 text-sm">Days</Text>
      </View>
      <View className="items-center bg-white/20 rounded-lg px-3 py-2">
        <Text className="text-3xl font-bold text-white">
          {timeLeft.hours.toString().padStart(2, "0")}
        </Text>
        <Text className="text-white/80 text-sm">Hours</Text>
      </View>
      <View className="items-center bg-white/20 rounded-lg px-3 py-2">
        <Text className="text-3xl font-bold text-white">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </Text>
        <Text className="text-white/80 text-sm">Minutes</Text>
      </View>
      <View className="items-center bg-white/20 rounded-lg px-3 py-2">
        <Text className="text-3xl font-bold text-white">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </Text>
        <Text className="text-white/80 text-sm">Seconds</Text>
      </View>
    </View>
  );
}