import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";
import { useThemeStore } from "../store/useThemeStore";
import { ThemedButton } from "../components/ThemedButton";
import { OdysyncLogo } from "../components/OdysyncLogo";
import { DateTimeSelector } from "../components/DateTimeSelector";
import { FlightLookupModal, FlightInfo } from "../components/FlightLookupModal";
import { PaywallModal } from "../components/PaywallModal";
import { Ionicons } from '@expo/vector-icons';
import { searchDestinations, getDestinationInfo } from "../api/destination-data";
import { formatDestinationName } from "../utils/destinationImages";
import { initializeDestinationFactsForTimer } from "../utils/destinationManager";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tripType, setTripType] = useState<'business' | 'leisure'>('leisure');
  const [selectedFlight, setSelectedFlight] = useState<FlightInfo | null>(null);
  const [showFlightLookup, setShowFlightLookup] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false); // Set to false to test paywall functionality

  async function updateSuggestions(input: string) {
    const q = input.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // Basic partial matches
    const basics = searchDestinations(q).slice(0, 6);
    // Also try fuzzy and add suggestedName to the top if available
    try {
      const info = await getDestinationInfo(q);
      const maybe = info?.suggestedName || "";
      const items = basics.includes(maybe) || !maybe ? basics : [maybe, ...basics];
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch {
      setSuggestions(basics);
      setShowSuggestions(basics.length > 0);
    }
  }

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
      duration,
      tripType,
      selectedFlight: selectedFlight || undefined
    });

    // Initialize destination facts for daily facts feature
    initializeDestinationFactsForTimer(destination.trim());

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
              <OdysyncLogo size="lg" />
              <Text
                style={{
                  color: isDark ? '#FFFFFF' : '#333333',
                  fontSize: 20,
                  fontFamily: 'Questrial',
                }}
              >
                Odysync
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
              fontFamily: 'Questrial',
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
              fontFamily: 'Questrial',
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
                fontFamily: 'Questrial',
                fontWeight: '600',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 8,
              }}
            >
              ✈️ Destination
            </Text>
            <TextInput
              value={destination}
              onChangeText={(t) => { setDestination(t); updateSuggestions(t); }}
              placeholder="e.g., Paris, Tenerife, New York"
              placeholderTextColor="#999999"
              style={{
                borderWidth: 2,
                borderColor: isDark ? '#555555' : '#E5E5E5',
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                fontFamily: 'Questrial-Regular',
                color: isDark ? '#FFFFFF' : '#333333',
                backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7',
              }}
              autoCorrect={false}
              autoCapitalize="words"
              onFocus={() => updateSuggestions(destination)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <View style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: isDark ? '#444444' : '#E5E5E5',
                backgroundColor: isDark ? '#1f2937' : '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden'
              }}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => { setDestination(formatDestinationName(s)); setShowSuggestions(false); }}
                    style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#F1F1F1' }}
                  >
                    <Text style={{ color: isDark ? '#F3F4F6' : '#1F2937', fontFamily: 'Questrial-Regular', fontSize: 14 }}>
                      {formatDestinationName(s)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
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
                fontFamily: 'Questrial-Regular',
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
                    fontFamily: 'Questrial-Regular',
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
                  <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: 'Questrial-Regular', color: isDark ? '#FFFFFF' : '#333333' }}>
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
                    fontFamily: 'Questrial-Regular',
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
                  <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: 'Questrial-Regular', color: isDark ? '#FFFFFF' : '#333333' }}>
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

          {/* Trip Purpose */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Questrial-Regular',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 8,
              }}
            >
              🎯 Trip Purpose
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setTripType('leisure')}
                style={{
                  flex: 1,
                  borderWidth: 2,
                  borderColor: tripType === 'leisure' ? '#10b981' : (isDark ? '#555555' : '#E5E5E5'),
                  backgroundColor: tripType === 'leisure' ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : (isDark ? '#2a2a2a' : '#F7F7F7'),
                  borderRadius: 16,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Questrial-Regular', color: isDark ? '#FFFFFF' : '#333333' }}>Leisure</Text>
              </Pressable>
              <Pressable
                onPress={() => setTripType('business')}
                style={{
                  flex: 1,
                  borderWidth: 2,
                  borderColor: tripType === 'business' ? '#10b981' : (isDark ? '#555555' : '#E5E5E5'),
                  backgroundColor: tripType === 'business' ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : (isDark ? '#2a2a2a' : '#F7F7F7'),
                  borderRadius: 16,
                  padding: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Questrial-Regular', color: isDark ? '#FFFFFF' : '#333333' }}>Business</Text>
              </Pressable>
            </View>
          </View>

          {/* Trip Duration */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Questrial-Regular',
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
              <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontFamily: 'Questrial-Regular', color: isDark ? '#FFFFFF' : '#333333' }}>
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

          {/* Flight Selection */}
          <View style={{ gap: 8 }}>
            <Text style={{
              color: isDark ? '#FFFFFF' : '#333333',
              fontSize: 16,
              fontFamily: 'Questrial-Regular',
              marginBottom: 8,
            }}>
              ✈️ Flight Information {!isPremium && '(Premium)'}
            </Text>

            {selectedFlight ? (
              <View style={{
                backgroundColor: isDark ? '#2a2a2a' : '#F0F0F0',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: isDark ? '#555555' : '#E5E5E5',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View>
                    <Text style={{
                      color: isDark ? '#FFFFFF' : '#333333',
                      fontSize: 16,
                      fontFamily: 'Questrial-Regular',
                    }}>
                      {selectedFlight.flightNumber}
                    </Text>
                    <Text style={{
                      color: isDark ? '#CCCCCC' : '#666666',
                      fontSize: 14,
                      fontFamily: 'Questrial-Regular',
                    }}>
                      {selectedFlight.airline}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedFlight(null)}
                    style={{
                      backgroundColor: isDark ? '#444444' : '#E5E5E5',
                      borderRadius: 12,
                      padding: 4,
                    }}
                  >
                    <Ionicons name="close" size={16} color={isDark ? '#FFFFFF' : '#333333'} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{
                    color: isDark ? '#CCCCCC' : '#666666',
                    fontSize: 14,
                    fontFamily: 'Questrial-Regular',
                  }}>
                    {selectedFlight.departureAirport} → {selectedFlight.arrivalAirport}
                  </Text>
                  <Text style={{
                    color: isDark ? '#FFFFFF' : '#333333',
                    fontSize: 14,
                    fontFamily: 'Questrial-Regular',
                  }}>
                    {new Date(selectedFlight.scheduledDeparture).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  if (isPremium) {
                    setShowFlightLookup(true);
                  } else {
                    setShowPaywall(true);
                  }
                }}
                style={{
                  backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7',
                  borderWidth: 2,
                  borderColor: isDark ? '#555555' : '#E5E5E5',
                  borderRadius: 12,
                  borderStyle: 'dashed',
                  padding: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={isPremium ? (isDark ? '#5eead4' : '#0d9488') : (isDark ? '#666666' : '#999999')}
                  style={{ marginBottom: 8 }}
                />
                <Text style={{
                  color: isPremium ? (isDark ? '#5eead4' : '#0d9488') : (isDark ? '#666666' : '#999999'),
                  fontSize: 16,
                  fontFamily: 'Questrial-Regular',
                  textAlign: 'center',
                }}>
                  {isPremium ? 'Select Your Flight' : 'Flight Selection (Premium)'}
                </Text>
                <Text style={{
                  color: isDark ? '#999999' : '#666666',
                  fontSize: 12,
                  fontFamily: 'Questrial-Regular',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                  Track your flight status and get notifications
                </Text>
              </Pressable>
            )}
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
              fontFamily: 'Questrial-Regular',
              marginBottom: 8,
            }}
          >
            💡 Pro Tips
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
              fontFamily: 'Questrial-Regular',
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

      {/* Flight Lookup Modal */}
      <FlightLookupModal
        visible={showFlightLookup}
        onClose={() => setShowFlightLookup(false)}
        onFlightSelect={(flight) => {
          setSelectedFlight(flight);
          setShowFlightLookup(false);
        }}
        departureAirport={destination.trim() ? destination.trim().split(',')[0] : undefined}
        tripDate={selectedDate}
        isPremium={isPremium}
        destination={destination.trim()}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Flight Selection"
        description="Select your actual flight and get real-time status updates, delay notifications, and gate information for a seamless travel experience."
        onUpgrade={() => {
          console.log('User upgraded to premium');
          // Here you would handle the upgrade process
          setIsPremium(true);
        }}
      />
    </KeyboardAvoidingView>
  );
}