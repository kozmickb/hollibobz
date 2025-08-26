import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useHolidayStore } from "../store/useHolidayStore";
import * as Haptics from "expo-haptics";

export function DailyFactCard() {
  const { getTodaysFact, markFactAsViewed, currentDestination } = useHolidayStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const todaysFact = getTodaysFact();
  
  if (!todaysFact || !currentDestination) {
    return null;
  }

  const handleFactPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      markFactAsViewed(todaysFact.fact);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Did you know? ${todaysFact.fact}\n\nFrom my upcoming trip to ${currentDestination.name}! 🌍✈️`,
        title: "Interesting Travel Fact",
      });
    } catch (error) {
      console.error("Error sharing fact:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="p-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-slate-800">
          Daily Fact
        </Text>
        <View className="bg-blue-100 rounded-full px-3 py-1">
          <Text className="text-blue-700 text-sm font-medium">
            {new Date().toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric" 
            })}
          </Text>
        </View>
      </View>
      
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handleFactPress}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 shadow-lg"
        >
          <View className="flex-row items-start">
            <View className="bg-white/20 rounded-full p-2 mr-3">
              <Ionicons name="bulb" size={20} color="white" />
            </View>
            
            <View className="flex-1">
              <Text className="text-white font-semibold text-base mb-2">
                About {currentDestination.name}
              </Text>
              
              <Text 
                className="text-white/90 text-sm leading-5"
                numberOfLines={isExpanded ? undefined : 2}
              >
                {todaysFact.fact}
              </Text>
              
              {!isExpanded && todaysFact.fact.length > 100 && (
                <Text className="text-white/70 text-xs mt-1">
                  Tap to read more...
                </Text>
              )}
            </View>
          </View>
          
          {isExpanded && (
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-white/20">
              <Pressable
                onPress={handleShare}
                className="flex-row items-center bg-white/20 rounded-full px-4 py-2"
              >
                <Ionicons name="share" size={16} color="white" />
                <Text className="text-white text-sm font-medium ml-2">
                  Share
                </Text>
              </Pressable>
              
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={14} color="white" />
                <Text className="text-white/80 text-xs ml-1">
                  Fact of the day
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}