import React, { useEffect, useRef, useMemo, useState } from "react";
import { View, Text, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../store/useThemeStore";
import { useHolidayStore } from "../store/useHolidayStore";
import { getRingColor } from "../utils/proximityTheme";

// Celebration days for pulse animations
const CELEBRATE_DAYS = new Set([100, 50, 30, 14, 7, 3, 1, 0]);

// Try to import confetti and haptics with fallback
let ConfettiCannon: any = null;
let Haptics: any = null;

try {
  ConfettiCannon = require("react-native-confetti-cannon").default;
  Haptics = require("expo-haptics");
} catch (error) {
  console.log("Confetti or Haptics not available:", error);
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { 
  percent: number; 
  daysLeft: number; 
  showLabel?: boolean;
};

export function CountdownRing({ percent, daysLeft, showLabel = false }: Props) {
  const { isDark, reduceMotion } = useThemeStore();
  const { settings } = useHolidayStore();
  const size = 180;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // animated progress
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const weeklyArcs = useRef(new Animated.Value(0)).current;
  const milestoneCircles = useRef(new Animated.Value(0)).current;
  const particles = useRef(new Animated.Value(0)).current;
  const lastPulsedDayRef = useRef<number | null>(null);
  const sweptInRef = useRef(false);
  const lastProgressRef = useRef(0);
  const lastMilestoneRef = useRef<number | null>(null);
  const ringThickness = useRef(new Animated.Value(stroke)).current;

  // Memoize progress value and days left integer
  const progressValue = useMemo(() => Math.max(0, Math.min(1, percent)), [percent]);
  const daysLeftInt = useMemo(() => Math.max(0, Math.round(daysLeft)), [daysLeft]);

  useEffect(() => {
    // Reset to 0 first, then animate to target value for visible effect
    progress.setValue(0);
    sweptInRef.current = false;
    
    if (!reduceMotion) {
      Animated.timing(progress, {
        toValue: progressValue,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start(() => {
        sweptInRef.current = true;
      });
    } else {
      // Skip animation, set directly
      progress.setValue(progressValue);
      sweptInRef.current = true;
    }
  }, [progressValue, progress, reduceMotion]);

  // Particle effects when plane rotates to new progress
  useEffect(() => {
    const progressChange = Math.abs(progressValue - lastProgressRef.current);
    if (progressChange > 0.01 && sweptInRef.current && !settings.reduceMotion) {
      lastProgressRef.current = progressValue;
      
      // Trigger particle animation
      particles.setValue(0);
      Animated.timing(particles, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();
    }
  }, [progressValue, particles, settings.reduceMotion]);

  // milestone pulse and animations with improved gating
  useEffect(() => {
    // Only pulse if: swept in, celebrating day, and haven't pulsed this day yet
    if (sweptInRef.current && 
        CELEBRATE_DAYS.has(daysLeftInt) && 
        lastPulsedDayRef.current !== daysLeftInt) {
      
      lastPulsedDayRef.current = daysLeftInt;
      
      // Pulse animation
      if (!settings.reduceMotion) {
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
      }

      // Milestone circles animation
      if (!settings.reduceMotion) {
        milestoneCircles.setValue(0);
        Animated.timing(milestoneCircles, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [daysLeftInt, pulse, milestoneCircles, settings.reduceMotion]);

  // Milestone detection and ring thickness pulse
  useEffect(() => {
    const milestones = [30, 14, 7, 3, 1];
    const currentMilestone = milestones.find(m => daysLeftInt <= m);
    
    if (sweptInRef.current && 
        currentMilestone !== undefined && 
        lastMilestoneRef.current !== currentMilestone &&
        lastMilestoneRef.current !== null) {
      
      lastMilestoneRef.current = currentMilestone;
      
      // Ring thickness pulse animation
      if (!settings.reduceMotion) {
        Animated.sequence([
          Animated.timing(ringThickness, { 
            toValue: stroke + 4, 
            duration: 180, 
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false 
          }),
          Animated.timing(ringThickness, { 
            toValue: stroke, 
            duration: 180, 
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false 
          }),
        ]).start();
      }
    } else if (lastMilestoneRef.current === null && currentMilestone !== undefined) {
      lastMilestoneRef.current = currentMilestone;
    }
  }, [daysLeftInt, ringThickness, settings.reduceMotion]);

  // Weekly arcs animation
  useEffect(() => {
    if (!settings.reduceMotion) {
      Animated.timing(weeklyArcs, {
        toValue: progressValue,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    }
  }, [progressValue, weeklyArcs, settings.reduceMotion]);

  // dynamic colours with theme support
  const ringColor = useMemo(() => {
    return getRingColor(daysLeft);
  }, [daysLeft]);

  // Create animated interpolations
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const rotateValue = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // confetti on day 0 (run once per mount / change to 0)
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (daysLeft === 0 && !confetti && ConfettiCannon) {
      setConfetti(true);
      // nice haptic pop
      if (Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
  }, [daysLeft, confetti]);

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: pulse }], 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <Svg width={size} height={size}>
        {/* background ring */}
        <Circle
          stroke={isDark ? "#374151" : "#e2e8f0"}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        
        {/* Weekly tick marks */}
        {Array.from({ length: 52 }, (_, i) => {
          const angle = (i * 360 / 52) * (Math.PI / 180);
          const x1 = size / 2 + Math.cos(angle) * (radius - stroke / 2);
          const y1 = size / 2 + Math.sin(angle) * (radius - stroke / 2);
          const x2 = size / 2 + Math.cos(angle) * (radius + stroke / 2);
          const y2 = size / 2 + Math.sin(angle) * (radius + stroke / 2);
          
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isDark ? "#4B5563" : "#CBD5E1"}
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}
        
        {/* Milestone dots */}
        {[30, 14, 7, 3, 1].map((milestone, index) => {
          const milestoneProgress = Math.max(0, Math.min(1, (100 - milestone) / 100));
          const angle = (milestoneProgress * 360 - 90) * (Math.PI / 180);
          const x = size / 2 + Math.cos(angle) * (radius + stroke / 2 + 4);
          const y = size / 2 + Math.sin(angle) * (radius + stroke / 2 + 4);
          
          return (
            <circle
              key={`milestone-${milestone}`}
              cx={x}
              cy={y}
              r={3}
              fill={ringColor}
              opacity={0.8}
            />
          );
        })}
        
        {/* Weekly arcs behind main arc */}
        {Array.from({ length: 8 }, (_, i) => {
          const arcProgress = Math.min(1, (i + 1) / 8);
          const arcOpacity = arcProgress <= progressValue ? 0.3 : 0.1;
          const arcScale = arcProgress <= progressValue ? 1 : 0.8;
          
          return (
            <AnimatedCircle
              key={`weekly-${i}`}
              stroke={ringColor}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke - 2}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - arcProgress)}
              strokeLinecap="round"
              opacity={arcOpacity}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        
        {/* progress arc */}
        <AnimatedCircle
          stroke={ringColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={ringThickness}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Milestone circles animation */}
      {milestoneCircles && !settings.reduceMotion && Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const x = Math.cos(angle) * (radius + 10);
        const y = Math.sin(angle) * (radius + 10);
        
        return (
          <Animated.View
            key={`milestone-${i}`}
            style={{
              position: 'absolute',
              left: size / 2 + x - 3,
              top: size / 2 + y - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: ringColor,
              opacity: milestoneCircles,
              transform: [{
                scale: milestoneCircles.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1.5],
                })
              }],
            }}
          />
        );
      })}

      {/* rotating plane */}
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "flex-start",
          transform: [{ rotate: rotateValue }],
        }}
      >
        <View 
          style={{ 
            marginTop: stroke / 2,
            transform: [{ rotate: '45deg' }] // Keep plane oriented correctly
          }}
        >
          <Ionicons 
            name="airplane" 
            size={20} 
            color={ringColor} 
          />
        </View>
      </Animated.View>

      {/* Particle effects at plane tip */}
      {!settings.reduceMotion && Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60) * (Math.PI / 180);
        const x = Math.cos(angle) * 15;
        const y = Math.sin(angle) * 15;
        
        return (
          <Animated.View
            key={`particle-${i}`}
            style={{
              position: 'absolute',
              left: size / 2 + x - 2,
              top: size / 2 + y - 2,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: ringColor,
              opacity: particles.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0.9, 0.6, 0],
              }),
              transform: [{
                scale: particles.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.6],
                })
              }],
            }}
          />
        );
      })}

      {/* day count in centre */}
      <View style={{ 
        position: 'absolute', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Text style={{
          fontSize: 36,
          fontFamily: 'Questrial',
        fontWeight: '700',
          color: isDark ? '#FFFFFF' : '#333333',
        }}>
          {daysLeft}
        </Text>
        {showLabel ? (
          <Text style={{
            fontSize: 12,
            fontFamily: 'Questrial',
            fontWeight: '500',
            color: isDark ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            marginTop: 2,
          }}>
            {daysLeft === 0 ? "It's go day! 🎉" : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go`}
          </Text>
        ) : (
          <Text style={{
            fontSize: 14,
            fontFamily: 'Questrial',
            fontWeight: '500',
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            {daysLeft === 0 ? "It's go day! 🎉" : daysLeft === 1 ? "day" : "days"}
          </Text>
        )}
      </View>

      {/* Confetti celebration for trip day */}
      {confetti && ConfettiCannon ? (
        <>
          <ConfettiCannon
            count={60}
            origin={{ x: -40, y: 0 }}
            autoStart
            fadeOut
            explosionSpeed={350}
            fallSpeed={2000}
            colors={['#e11d48', '#f97316', '#22c55e', '#0ea5e9', '#8b5cf6']}
          />
          <ConfettiCannon
            count={60}
            origin={{ x: 40, y: 0 }}
            autoStart
            fadeOut
            explosionSpeed={350}
            fallSpeed={2000}
            colors={['#e11d48', '#f97316', '#22c55e', '#0ea5e9', '#8b5cf6']}
          />
        </>
      ) : daysLeft === 0 ? (
        <View style={{
          position: 'absolute',
          top: -20,
          left: 0,
          right: 0,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 24 }}>🎉</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}