import React, { useEffect } from "react";
import { View, Text, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useThemeStore } from "../store/useThemeStore";
import { textStyles, accessibilityProps } from "../utils/accessibility";

interface CelebrationModalProps {
  visible: boolean;
  onComplete: () => void;
  timerName: string;
  destinationName?: string;
}

const ConfettiPiece = ({ delay = 0 }: { delay?: number }) => {
  const { reduceMotion } = useThemeStore();
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) {
      translateY.value = withDelay(
        delay,
        withTiming(600, { duration: 2000, easing: Easing.out(Easing.quad) })
      );
      translateX.value = withDelay(
        delay,
        withTiming((Math.random() - 0.5) * 200, { duration: 2000 })
      );
      rotate.value = withDelay(
        delay,
        withRepeat(withTiming(360, { duration: 1000 }), 2, false)
      );
      opacity.value = withDelay(
        delay + 1500,
        withTiming(0, { duration: 500 })
      );
    } else {
      // Skip animations, set final state immediately
      translateY.value = 600;
      translateX.value = (Math.random() - 0.5) * 200;
      opacity.value = 0;
    }
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = ["🎉", "🎊", "✨", "🌟", "💫"];
  const emoji = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.Text style={[animatedStyle, { position: "absolute", fontSize: 20 }]}>
      {emoji}
    </Animated.Text>
  );
};

export function CelebrationModal({
  visible,
  onComplete,
  timerName,
  destinationName,
}: CelebrationModalProps) {
  const { reduceMotion } = useThemeStore();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (!reduceMotion) {
        // Start animations
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withSequence(
          withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(1.7)) }),
          withTiming(1, { duration: 200 })
        );
        
        textScale.value = withDelay(
          200,
          withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) })
        );

        // Pulsing animation for the emoji
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          3,
          false
        );

        // Auto-close after animation
        const timer = setTimeout(() => {
          opacity.value = withTiming(0, { duration: 300 });
          scale.value = withTiming(0, { duration: 300 });
          setTimeout(onComplete, 300);
        }, 3500);

        return () => clearTimeout(timer);
      } else {
        // Skip animations, set final state immediately
        opacity.value = 1;
        scale.value = 1;
        textScale.value = 1;
        pulseScale.value = 1;
        
        // Auto-close after shorter delay
        const timer = setTimeout(() => {
          opacity.value = 0;
          scale.value = 0;
          setTimeout(onComplete, 100);
        }, 2000);

        return () => clearTimeout(timer);
      }
    } else {
      scale.value = 0;
      opacity.value = 0;
      textScale.value = 0;
      pulseScale.value = 1;
    }
  }, [visible, reduceMotion]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        {/* Confetti Animation */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'center' }}>
          {Array.from({ length: 15 }).map((_, index) => (
            <ConfettiPiece key={index} delay={index * 100} />
          ))}
        </View>
        
        <Animated.View style={[containerStyle, { alignItems: 'center' }]}>
          {/* Success Content */}
          <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, marginHorizontal: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 20 }}>
            <Animated.View style={[pulseStyle, { backgroundColor: '#dcfce7', borderRadius: 50, padding: 16, marginBottom: 16 }]}>
              <Text style={{ fontSize: 32 }}>🎉</Text>
            </Animated.View>
            
            <Animated.View style={[textStyle, { alignItems: 'center' }]}>
              <Text style={[textStyles.h2, { textAlign: 'center', marginBottom: 8 }]} {...accessibilityProps.text}>
                Timer Created!
              </Text>
              
              <Text style={[textStyles.body, { textAlign: 'center', marginBottom: 8 }]} {...accessibilityProps.text}>
                {timerName}
              </Text>
              
              {destinationName && (
                <Text style={[textStyles.label, { textAlign: 'center', color: '#2563EB' }]} {...accessibilityProps.text}>
                  Get ready for {destinationName}!
                </Text>
              )}
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ fontSize: 24, marginRight: 8 }}>✈️</Text>
                <Text style={[textStyles.label, { color: '#1D4ED8' }]} {...accessibilityProps.text}>
                  The countdown begins!
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}