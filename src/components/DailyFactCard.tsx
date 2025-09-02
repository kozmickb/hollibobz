import React, { useState } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { useHolidayStore } from "../state/holidayStore";
import { useCurrentDestinationFacts } from "../utils/destinationManager";
import { useThemeStore } from "../store/useThemeStore";
import * as Haptics from "expo-haptics";

export function DailyFactCard() {
  const { markFactAsViewed, saveFact } = useHolidayStore();
  const { currentDestination, todaysFact, hasFacts } = useCurrentDestinationFacts();
  const { isDark } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const flipRotation = useSharedValue(0);
  
  if (!todaysFact || !currentDestination) {
    return null;
  }

  const handleFactPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // Flip animation
    flipRotation.value = withTiming(isExpanded ? 0 : 180, { duration: 300 });
    
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      markFactAsViewed(todaysFact.fact);
    }
  };

  const handleSaveFact = () => {
    if (!currentDestination || !todaysFact) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveFact(currentDestination.name, todaysFact.fact);
    
    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${flipRotation.value}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${flipRotation.value - 180}deg` },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  return (
    <View style={{ padding: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: 'bold', 
          color: isDark ? '#f1f5f9' : '#1e293b' 
        }}>
          Daily Fact
        </Text>
        <View style={{
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 4,
        }}>
          <Text style={{
            color: isDark ? '#60a5fa' : '#2563eb',
            fontSize: 12,
            fontWeight: '500',
          }}>
            {new Date().toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric" 
            })}
          </Text>
        </View>
      </View>
      
      <Animated.View style={animatedStyle}>
        <View style={{ position: 'relative', height: 120 }}>
          {/* Front of card */}
          <Animated.View style={[frontAnimatedStyle, { position: 'absolute', width: '100%' }]}>
            <Pressable
              onPress={handleFactPress}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8, marginRight: 12 }}>
                  <Ionicons name="bulb" size={20} color="white" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 8 }}>
                    About {currentDestination.name}
                  </Text>
                  
                  <Text 
                    style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20 }}
                    numberOfLines={2}
                  >
                    {todaysFact.fact}
                  </Text>
                  
                  {todaysFact.fact.length > 100 && (
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>
                      Tap to read more...
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Back of card */}
          <Animated.View style={[backAnimatedStyle, { position: 'absolute', width: '100%' }]}>
            <Pressable
              onPress={handleFactPress}
              style={{
                backgroundColor: '#8B5CF6',
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8, marginRight: 12 }}>
                  <Ionicons name="bulb" size={20} color="white" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, flex: 1 }}>
                      About {currentDestination.name}
                    </Text>
                    <Text style={{ fontSize: 20 }}>🌍</Text>
                  </View>
                  
                  <Text 
                    style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20 }}
                  >
                    {todaysFact.fact}
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}>
                <Pressable
                  onPress={handleShare}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Ionicons name="share" size={16} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>
                    Share
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={handleSaveFact}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Ionicons name="bookmark" size={16} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Toast notification */}
      {showToast && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: '#10B981',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', marginLeft: 8 }}>
            Saved to your Trip file
          </Text>
        </Animated.View>
      )}
    </View>
  );
}