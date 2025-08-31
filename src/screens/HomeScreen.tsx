import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Platform, ImageBackground } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";
import { useThemeStore } from "../store/useThemeStore";
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { fetchPexelsBackdrop } from "../features/destination/backdrop";
import { formatDestinationName } from "../utils/destinationImages";

// TripTick UI components
import { Text as RestyleText, SafeText } from "../components/ui/Text";
import { CustomAlert } from "../components/CustomAlert";

// Import features
import { daysUntil } from "../features/countdown/logic";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Home">;

// Helper function to get a random destination
const getRandomDestination = (): string => {
  const destinations = [
    'Paris', 'London', 'New York', 'Tokyo', 'Rome', 'Barcelona', 
    'Amsterdam', 'Berlin', 'Prague', 'Vienna', 'Budapest', 'Dubai', 
    'Abu Dhabi', 'Singapore', 'Bangkok', 'Sydney', 'Melbourne', 
    'Toronto', 'Vancouver', 'Mexico City', 'Rio de Janeiro', 
    'Buenos Aires', 'Switzerland', 'Zurich', 'Geneva'
  ];
  return destinations[Math.floor(Math.random() * destinations.length)];
};

interface Trip {
  id: string;
  destination: string;
  date: string;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { timers, archivedTimers, archiveTimer } = useHolidayStore();
  const { isDark, toggleColorScheme } = useThemeStore();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [backgroundImages, setBackgroundImages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    return () => clearInterval(timer);
  }, [fadeAnim, slideAnim]);

  // Load background images for destinations
  useEffect(() => {
    const loadBackgroundImages = async () => {
      const images: {[key: string]: string} = {};
      for (const timer of timers) {
        if (!backgroundImages[timer.destination]) {
          try {
            const result = await fetchPexelsBackdrop(timer.destination);
            if (result.imageUrl) {
              images[timer.destination] = result.imageUrl;
            }
          } catch (error) {
            console.log('Failed to load background image for', timer.destination);
          }
        }
      }
      if (Object.keys(images).length > 0) {
        setBackgroundImages(prev => ({ ...prev, ...images }));
      }
    };

    loadBackgroundImages();
  }, [timers]);

  const handleDeleteTimer = (timerId: string) => {
    setTimerToDelete(timerId);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (timerToDelete) {
      archiveTimer(timerToDelete);
    }
    setShowDeleteAlert(false);
    setTimerToDelete(null);
  };

  // Convert timers to Trip format
  const tripsData: Trip[] = timers.map(timer => {
    const daysLeft = daysUntil(timer.date);
    const tripDate = new Date(timer.date);
    const now = new Date();
    const diffTime = tripDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    return {
      id: timer.id,
      destination: timer.destination,
      date: timer.date,
      daysLeft: Math.max(0, diffDays),
      hoursLeft: Math.max(0, diffHours),
      minutesLeft: Math.max(0, diffMinutes),
      secondsLeft: Math.max(0, diffSeconds),
    };
  });

  const nextTrip = tripsData[0];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1a1a1a" : "#fefefe" }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#374151" : "#fbbf24",
            paddingHorizontal: 16,
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ImageBackground
              source={require('../../assets/TT logo.png')}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              resizeMode="cover"
            />
            <RestyleText variant="xl" color="text" fontWeight="bold">
              TripTick
            </RestyleText>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('TripsTab', { screen: 'Archive' })}
              style={{
                backgroundColor: isDark ? "#374151" : "#fef3c7",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons 
                name="archive" 
                size={20} 
                color={isDark ? "#fbbf24" : "#d97706"} 
              />
            </Pressable>
            <Pressable
              onPress={toggleColorScheme}
              style={{
                backgroundColor: isDark ? "#374151" : "#ccfbf1",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons 
                name={isDark ? "sunny" : "moon"} 
                size={20} 
                color={isDark ? "#5eead4" : "#0d9488"} 
              />
            </Pressable>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('ProfileTab')}
              style={{
                backgroundColor: isDark ? "#374151" : "#ccfbf1",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons 
                name="settings" 
                size={20} 
                color={isDark ? "#5eead4" : "#0d9488"} 
              />
            </Pressable>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Current Trip Countdown */}
          {nextTrip && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Pressable
                onPress={() => navigation.getParent()?.navigate('TripsTab', { screen: 'TimerDrilldown', params: { timerId: nextTrip.id } })}
                style={{
                  position: 'relative',
                  borderRadius: 24,
                  overflow: 'hidden',
                  marginBottom: 24,
                }}
              >
                {backgroundImages[nextTrip.destination] ? (
                  <ImageBackground
                    source={{ uri: backgroundImages[nextTrip.destination] }}
                    style={{ padding: 24 }}
                    resizeMode="cover"
                  >
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
                    <View style={{ position: 'relative', zIndex: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View>
                          <RestyleText variant="sm" color="text" opacity={0.9}>
                            Next Adventure
                          </RestyleText>
                          <RestyleText variant="xl" color="text" fontWeight="bold">
                            {formatDestinationName(nextTrip.destination)}
                          </RestyleText>
                        </View>
                        <Ionicons name="calendar" size={24} color="#FFFFFF" opacity={0.8} />
                      </View>
                      
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        {[
                          { label: 'Days', value: nextTrip.daysLeft },
                          { label: 'Hours', value: nextTrip.hoursLeft },
                          { label: 'Minutes', value: nextTrip.minutesLeft },
                          { label: 'Seconds', value: nextTrip.secondsLeft }
                        ].map((item) => (
                          <Animated.View
                            key={item.label}
                            style={{
                              flex: 1,
                              opacity: fadeAnim,
                              transform: [{ scale: fadeAnim }],
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 16,
                                padding: 12,
                                alignItems: 'center',
                              }}
                            >
                              <RestyleText variant="2xl" color="text" fontWeight="bold">
                                {item.value}
                              </RestyleText>
                              <RestyleText variant="xs" color="text" opacity={0.8}>
                                {item.label}
                              </RestyleText>
                            </View>
                          </Animated.View>
                        ))}
                      </View>
                    </View>
                  </ImageBackground>
                ) : (
                  <LinearGradient
                    colors={['#8b5cf6', '#ec4899', '#f97316']}
                    style={{ padding: 24 }}
                  >
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />
                    <View style={{ position: 'relative', zIndex: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View>
                          <RestyleText variant="sm" color="text" opacity={0.9}>
                            Next Adventure
                          </RestyleText>
                          <RestyleText variant="xl" color="text" fontWeight="bold">
                            {formatDestinationName(nextTrip.destination)}
                          </RestyleText>
                        </View>
                        <Ionicons name="calendar" size={24} color="#FFFFFF" opacity={0.8} />
                      </View>
                      
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        {[
                          { label: 'Days', value: nextTrip.daysLeft },
                          { label: 'Hours', value: nextTrip.hoursLeft },
                          { label: 'Minutes', value: nextTrip.minutesLeft },
                          { label: 'Seconds', value: nextTrip.secondsLeft }
                        ].map((item) => (
                          <Animated.View
                            key={item.label}
                            style={{
                              flex: 1,
                              opacity: fadeAnim,
                              transform: [{ scale: fadeAnim }],
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 16,
                                padding: 12,
                                alignItems: 'center',
                              }}
                            >
                              <RestyleText variant="2xl" color="text" fontWeight="bold">
                                {item.value}
                              </RestyleText>
                              <RestyleText variant="xs" color="text" opacity={0.8}>
                                {item.label}
                              </RestyleText>
                            </View>
                          </Animated.View>
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                )}
              </Pressable>
            </Animated.View>
          )}

          {/* Upcoming Trips */}
          {tripsData.length > 1 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <RestyleText variant="lg" color="text" fontWeight="semibold">
                  Upcoming Trips
                </RestyleText>
                <Pressable
                  onPress={() => navigation.navigate('AddTimer')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Ionicons 
                    name="add" 
                    size={16} 
                    color={isDark ? "#5eead4" : "#0d9488"} 
                  />
                                <SafeText variant="sm" color="secondary" fontWeight="medium">
                Add Trip
              </SafeText>
                </Pressable>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {tripsData.slice(1).map((trip) => (
                    <Animated.View
                      key={trip.id}
                      style={{
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                      }}
                    >
                      <Pressable
                        onPress={() => navigation.getParent()?.navigate('TripsTab', { screen: 'TimerDrilldown', params: { timerId: trip.id } })}
                        style={{
                          width: 256,
                          backgroundColor: isDark ? "#1f2937" : "#FFFFFF",
                          borderWidth: 1,
                          borderColor: isDark ? "#374151" : "#fbbf24",
                          borderRadius: 16,
                          padding: 16,
                        }}
                      >
                        {backgroundImages[trip.destination] ? (
                          <ImageBackground
                            source={{ uri: backgroundImages[trip.destination] }}
                            style={{
                              width: "100%",
                              height: 128,
                              borderRadius: 12,
                              marginBottom: 12,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            resizeMode="cover"
                          >
                            <View style={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              bottom: 0, 
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              borderRadius: 12,
                            }} />
                            <Ionicons name="location" size={32} color="#FFFFFF" style={{ zIndex: 1 }} />
                          </ImageBackground>
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              height: 128,
                              backgroundColor: "rgba(5, 150, 105, 0.2)",
                              borderRadius: 12,
                              marginBottom: 12,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons name="location" size={32} color="#FFFFFF" />
                          </View>
                        )}
                        <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={1}>
                          {formatDestinationName(trip.destination)}
                        </RestyleText>
                        <RestyleText variant="sm" color="textMuted" marginBottom={2}>
                          {trip.daysLeft} days left
                        </RestyleText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons 
                            name="time" 
                            size={12} 
                            color={isDark ? "#6b7280" : "#6b7280"} 
                          />
                          <RestyleText variant="xs" color="textMuted">
                            {trip.hoursLeft}h {trip.minutesLeft}m
                          </RestyleText>
                        </View>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* AI Assistant */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <LinearGradient
              colors={['#0d9488', '#2563eb']}
              style={{
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <RestyleText variant="md" color="text" fontWeight="semibold">
                    Holly Bobz
                  </RestyleText>
                  <RestyleText variant="sm" color="text" opacity={0.9}>
                    Your AI travel planning assistant
                  </RestyleText>
                </View>
              </View>
              <Pressable
                onPress={() => navigation.getParent()?.navigate('ChatTab')}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <RestyleText variant="sm" color="text">
                  Ask me anything about travel planning!
                </RestyleText>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Progress Section */}
          <View
            style={{
              backgroundColor: isDark ? "#1f2937" : "#FFFFFF",
              borderWidth: 1,
              borderColor: isDark ? "#374151" : "#fbbf24",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={4}>
              Your Travel Progress
            </RestyleText>
            <View style={{ gap: 16 }}>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <RestyleText variant="sm" color="textMuted">
                    Trips Planned
                  </RestyleText>
                  <RestyleText variant="sm" color="text" fontWeight="medium">
                    {timers.length}/5
                  </RestyleText>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 8,
                    backgroundColor: isDark ? "#374151" : "#e5e7eb",
                    borderRadius: 4,
                  }}
                >
                  <Animated.View
                    style={{
                      width: `${Math.min(100, (timers.length / 5) * 100)}%`,
                      height: 8,
                      backgroundColor: '#fbbf24',
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <RestyleText variant="sm" color="textMuted">
                    Countries Visited
                  </RestyleText>
                  <RestyleText variant="sm" color="text" fontWeight="medium">
                    {Math.min(timers.length, 197)}/197
                  </RestyleText>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 8,
                    backgroundColor: isDark ? "#374151" : "#e5e7eb",
                    borderRadius: 4,
                  }}
                >
                  <Animated.View
                    style={{
                      width: `${Math.min(100, (timers.length / 197) * 100)}%`,
                      height: 8,
                      backgroundColor: '#5eead4',
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('TripsTab', { screen: 'Trips' })}
              style={{
                backgroundColor: isDark ? '#0ea5e9' : '#38bdf8',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <RestyleText variant="md" color="text" fontWeight="semibold" style={{ color: '#FFFFFF' }}>
                🗺️ View My Trips
              </RestyleText>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('AddTimer')}
              style={{
                backgroundColor: '#fbbf24',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <RestyleText variant="md" color="text" fontWeight="semibold">
                ➕ Add New Timer
              </RestyleText>
            </Pressable>
            
            <Pressable
              onPress={() => navigation.navigate('DestinationDetail', { destination: getRandomDestination() })}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: isDark ? "#5eead4" : "#0d9488",
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <SafeText variant="md" color="secondary" fontWeight="semibold">
                🎲 Explore Random Destination
              </SafeText>
            </Pressable>
          </View>
        </ScrollView>

      </Animated.View>

      {/* Delete Alert */}
      <CustomAlert
        visible={showDeleteAlert}
        title="Delete Timer"
        message="Are you sure you want to delete this timer? This action cannot be undone."
        buttons={[
          { text: "Cancel", onPress: () => setShowDeleteAlert(false) },
          { text: "Delete", onPress: confirmDelete, style: "destructive" },
        ]}
        onClose={() => setShowDeleteAlert(false)}
      />
    </View>
  );
}