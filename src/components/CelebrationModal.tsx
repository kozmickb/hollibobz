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

interface CelebrationModalProps {
  visible: boolean;
  onComplete: () => void;
  timerName: string;
  destinationName?: string;
}

const ConfettiPiece = ({ delay = 0 }: { delay?: number }) => {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
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
  }, []);

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
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
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
      scale.value = 0;
      opacity.value = 0;
      textScale.value = 0;
      pulseScale.value = 1;
    }
  }, [visible]);

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
      <View className="flex-1 bg-black/50 justify-center items-center">
        {/* Confetti Animation */}
        <View className="absolute inset-0 justify-start items-center">
          {Array.from({ length: 15 }).map((_, index) => (
            <ConfettiPiece key={index} delay={index * 100} />
          ))}
        </View>
        
        <Animated.View style={containerStyle} className="items-center">
          {/* Success Content */}
          <View className="bg-white rounded-3xl p-8 mx-8 items-center shadow-2xl">
            <Animated.View style={pulseStyle} className="bg-green-100 rounded-full p-4 mb-4">
              <Text className="text-4xl">🎉</Text>
            </Animated.View>
            
            <Animated.View style={textStyle} className="items-center">
              <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                Timer Created!
              </Text>
              
              <Text className="text-lg text-slate-600 text-center mb-2">
                {timerName}
              </Text>
              
              {destinationName && (
                <Text className="text-base text-blue-600 text-center font-medium">
                  Get ready for {destinationName}!
                </Text>
              )}
              
              <View className="flex-row items-center mt-4 bg-blue-50 rounded-full px-4 py-2">
                <Text className="text-2xl mr-2">✈️</Text>
                <Text className="text-blue-700 font-medium">
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