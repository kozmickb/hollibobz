import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";
import { useThemeStore } from "../store/useThemeStore";
import { ThemedButton } from "../components/ThemedButton";
import { TripTickLogo } from "../components/TripTickLogo";
import { DateTimeSelector } from "../components/DateTimeSelector";
import { Ionicons } from '@expo/vector-icons';

// Try to import confetti and haptics with fallback
let ConfettiCannon: any = null;
let Haptics: any = null;

try {
  ConfettiCannon = require("react-native-confetti-cannon").default;
  Haptics = require("expo-haptics");
} catch (error) {
  console.log("Confetti or Haptics not available:", error);
}

type Nav = NativeStackNavigationProp<HomeStackParamList, "AddTimer">;

export function AddTimerScreen() {
  const navigation = useNavigation<Nav>();
  const addTimer = useHolidayStore((s) => s.addTimer);
  const { isDark } = useThemeStore();
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9:00 AM
    return tomorrow;
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [duration, setDuration] = useState(7);
  const [showConfetti, setShowConfetti] = useState(false);

  function onSave() {
    if (!destination.trim()) {
      Alert.alert("Missing Destination", "Please enter a destination for your trip");
      return;
    }

    // Check if date is in the future with warm messaging
    const now = new Date();
    if (selectedDate <= now) {
      Alert.alert(
        "Looking to the Future! ✨", 
        "That date's in the past—let's plan for something to look forward to! Pick a future date for your exciting trip.",
        [{ text: "Got it!", style: "default" }]
      );
      return;
    }

    const iso = selectedDate.toISOString();
    addTimer({ 
      destination: destination.trim(), 
      date: iso, 
      adults, 
      children, 
      duration 
    });
    
    // Trigger confetti celebration
    setShowConfetti(true);
    
    // Nice haptic feedback
    if (Haptics?.notificationAsync) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    
    // Navigate back after a short delay to show confetti
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  }


  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#F7F7F7' }}>
        {/* Static Header Banner */}
        <View style={{
          backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
          paddingTop: 12,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#444444' : '#E5E5E5',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TripTickLogo size="lg" />
              <Text
                style={{
                  color: isDark ? '#FFFFFF' : '#333333',
                  fontSize: 20,
                  fontFamily: 'Poppins-SemiBold',
                }}
              >
                TripTick
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: isDark ? '#444444' : '#F0F0F0',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            </Pressable>
          </View>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#FF6B6B', '#FFD93D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 24,
            paddingHorizontal: 20,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontFamily: 'Poppins-SemiBold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Add Trip Timer
          </Text>
          
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              textAlign: 'center',
            }}
          >
            Create a countdown to your next adventure
          </Text>
        </LinearGradient>

        {/* Form */}
        <View
          style={{
            backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
            marginHorizontal: 20,
            marginTop: -20,
            borderRadius: 20,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Poppins-SemiBold',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 8,
              }}
            >
              ✈️ Destination
            </Text>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g., Paris, Tenerife, New York"
              placeholderTextColor="#999999"
              style={{
                borderWidth: 2,
                borderColor: isDark ? '#555555' : '#E5E5E5',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#FFFFFF' : '#333333',
                backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7',
              }}
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <DateTimeSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              minimumDate={new Date()}
              label="Date & Time"
              showTime={true}
            />
          </View>

          {/* Travel Group */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Poppins-SemiBold',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 8,
              }}
            >
              👥 Travel Group
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    color: isDark ? '#CCCCCC' : '#666666',
                    marginBottom: 4,
                  }}
                >
                  Adults
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: isDark ? '#555555' : '#E5E5E5', borderRadius: 16, backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7' }}>
                  <Pressable
                    onPress={() => setAdults(Math.max(1, adults - 1))}
                    style={{ padding: 12 }}
                  >
                    <Ionicons name="remove" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
                  </Pressable>
                  <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', color: isDark ? '#FFFFFF' : '#333333' }}>
                    {adults}
                  </Text>
                  <Pressable
                    onPress={() => setAdults(adults + 1)}
                    style={{ padding: 12 }}
                  >
                    <Ionicons name="add" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
                  </Pressable>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    color: isDark ? '#CCCCCC' : '#666666',
                    marginBottom: 4,
                  }}
                >
                  Children
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: isDark ? '#555555' : '#E5E5E5', borderRadius: 16, backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7' }}>
                  <Pressable
                    onPress={() => setChildren(Math.max(0, children - 1))}
                    style={{ padding: 12 }}
                  >
                    <Ionicons name="remove" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
                  </Pressable>
                  <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', color: isDark ? '#FFFFFF' : '#333333' }}>
                    {children}
                  </Text>
                  <Pressable
                    onPress={() => setChildren(children + 1)}
                    style={{ padding: 12 }}
                  >
                    <Ionicons name="add" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Duration */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Poppins-SemiBold',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 8,
              }}
            >
              📅 Trip Duration
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: isDark ? '#555555' : '#E5E5E5', borderRadius: 16, backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7' }}>
              <Pressable
                onPress={() => setDuration(Math.max(1, duration - 1))}
                style={{ padding: 12 }}
              >
                <Ionicons name="remove" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
              </Pressable>
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-SemiBold', color: isDark ? '#FFFFFF' : '#333333' }}>
                {duration} day{duration !== 1 ? 's' : ''}
              </Text>
              <Pressable
                onPress={() => setDuration(duration + 1)}
                style={{ padding: 12 }}
              >
                <Ionicons name="add" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
              </Pressable>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <ThemedButton
              title="🎉 Create Timer"
              onPress={onSave}
              variant="primary"
              gradient={true}
              size="lg"
            />
            
            <ThemedButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="base"
            />
          </View>
        </View>

        {/* Tips */}
        <View
          style={{
            backgroundColor: '#4ECDC4',
            marginHorizontal: 20,
            marginTop: 20,
            marginBottom: 40,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Poppins-SemiBold',
              marginBottom: 8,
            }}
          >
            💡 Pro Tips
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
              fontFamily: 'Poppins-Regular',
              lineHeight: 20,
            }}
          >
            • Use the timer to build excitement for your trip{'\n'}
            • Ask Holly Bobz for travel planning advice{'\n'}
            • Set specific dates and times for your departure
          </Text>
        </View>
      </ScrollView>
      
      {/* Confetti celebration for new timer */}
      {showConfetti && ConfettiCannon ? (
        <>
          <ConfettiCannon
            count={80}
            origin={{ x: -50, y: 0 }}
            autoStart
            fadeOut
            explosionSpeed={400}
            fallSpeed={2500}
            colors={['#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
          />
          <ConfettiCannon
            count={80}
            origin={{ x: 50, y: 0 }}
            autoStart
            fadeOut
            explosionSpeed={400}
            fallSpeed={2500}
            colors={['#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
          />
        </>
      ) : null}
    </KeyboardAvoidingView>
  );
}