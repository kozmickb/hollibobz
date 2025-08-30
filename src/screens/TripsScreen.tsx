import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Platform, ImageBackground, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text as RestyleText } from '../components/ui/Text';
import { useHolidayStore } from '../store/useHolidayStore';
import { useThemeStore } from '../store/useThemeStore';
import { TripsStackParamList } from '../navigation/AppNavigator';
import { formatDistanceToNow } from 'date-fns';
import { tripStore } from '../lib/tripStore';
import { Trip } from '../entities/trip';
import { calculateChecklistProgress } from '../utils/checklistProgress';
import { getDestinationImage, formatDestinationName } from '../utils/destinationImages';

// Import Timer type from the store
import type { Timer } from '../store/useHolidayStore';

type Nav = NativeStackNavigationProp<TripsStackParamList, "Trips">;

export function TripsScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark } = useThemeStore();

  // Use direct store access instead of destructuring
  const store = useHolidayStore();

  // Initialize with empty state and let subscription handle updates
  const [trips, setTrips] = React.useState<Timer[]>([]);
  const [checklists, setChecklists] = React.useState<Trip[]>([]);
  const [checklistProgress, setChecklistProgress] = React.useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load checklists from trip store
  const loadChecklists = async () => {
    try {
      // Clean up any orphaned checklists first
      const currentTimers = useHolidayStore.getState().timers;
      const activeTimerIds = currentTimers.map(timer => timer.id);
      await tripStore.cleanupOrphanedChecklists(activeTimerIds);
      
      // Then load remaining valid checklists
      const allTrips = await tripStore.getAll();
      const tripsWithChecklists = allTrips.filter(trip => trip.checklist);
      console.log('Loaded checklists:', tripsWithChecklists.length);
      setChecklists(tripsWithChecklists);
      
      // Calculate progress for each checklist
      const progressMap: Record<string, number> = {};
      for (const trip of tripsWithChecklists) {
        if (trip.checklist) {
          const progress = await calculateChecklistProgress(trip.id, trip.checklist);
          progressMap[trip.id] = progress;
        }
      }
      setChecklistProgress(progressMap);
    } catch (error) {
      console.error('Failed to load checklists:', error);
    }
  };

  // Subscribe to store changes and update local state
  React.useEffect(() => {
    console.log('TripsScreen - Setting up store subscription');

    const unsubscribe = useHolidayStore.subscribe((newState) => {
      console.log('TripsScreen - STORE SUBSCRIPTION TRIGGERED:', newState.timers?.length || 0, 'trips, isHydrated:', newState.isHydrated);
      console.log('TripsScreen - New state timers:', newState.timers);
      setTrips(newState.timers || []);
      setIsHydrated(newState.isHydrated);
      console.log('TripsScreen - Local state updated');

      // Also reload checklists when store updates
      loadChecklists();
    });

    // Load checklists on mount
    loadChecklists();

    return unsubscribe;
  }, []);

  // Additional effect to ensure we get data even if subscription doesn't fire initially
  React.useEffect(() => {
    const checkStoreState = () => {
      const currentState = useHolidayStore.getState();
      console.log('TripsScreen - Checking store state:', currentState.timers?.length || 0, 'trips, isHydrated:', currentState.isHydrated);

      // Only update if we have actual data and haven't set it yet
      if (currentState.isHydrated && (currentState.timers?.length > 0 || trips.length === 0)) {
        console.log('TripsScreen - Updating from store state check');
        setTrips(currentState.timers || []);
        setIsHydrated(currentState.isHydrated);
      }
    };

    // Check immediately
    checkStoreState();

    // Also check after a short delay to ensure hydration is complete
    const timeoutId = setTimeout(checkStoreState, 1000);

    return () => clearTimeout(timeoutId);
  }, [trips.length]); // Depend on trips.length to avoid infinite loops

  // Preload destination images for better performance (React Native approach)
  React.useEffect(() => {
    if (trips && trips.length > 0) {
      const destinationNames = trips.map(trip => trip.destination);
      // In React Native, we can prefetch images for better performance
      destinationNames.forEach(destination => {
        const imageUrl = getDestinationImage(destination);
        // Image prefetching will happen naturally through ImageBackground
        console.log(`Preloading image for: ${destination} - ${imageUrl}`);
      });
    }
  }, [trips]);

  // Debug logging to see trips data and hydration status
  console.log('TripsScreen render - trips data:', trips, 'isHydrated:', isHydrated, 'trips length:', trips?.length);

  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    await store._hydrate();
    // Force immediate update after manual refresh
    const currentState = useHolidayStore.getState();
    setTrips(currentState.timers || []);
    setIsHydrated(currentState.isHydrated);
    
    // Also reload checklists
    await loadChecklists();
  };

  const checkAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', keys);

      const holidayData = await AsyncStorage.getItem('holiday_state_v1');
      console.log('Holiday state data:', holidayData);

      if (holidayData) {
        const parsed = JSON.parse(holidayData);
        console.log('Parsed holiday data:', parsed);
      }
    } catch (error) {
      console.error('Error checking AsyncStorage:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1a1a1a" : "#fefefe" }}>
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
            My Trips
          </RestyleText>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={handleManualRefresh}
            style={{
              backgroundColor: isDark ? "#374151" : "#fef3c7",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={isDark ? "#fbbf24" : "#d97706"}
            />
          </Pressable>
          <Pressable
            onPress={checkAsyncStorage}
            style={{
              backgroundColor: isDark ? "#374151" : "#fef3c7",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={isDark ? "#fbbf24" : "#d97706"}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              // Test store subscription manually
              console.log('Manual test - Current store state:', useHolidayStore.getState());
              // Force a store update to test subscription
              useHolidayStore.setState({
                ...useHolidayStore.getState(),
                timers: [...(useHolidayStore.getState().timers || [])]
              });
            }}
            style={{
              backgroundColor: isDark ? "#374151" : "#fef3c7",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons
              name="bug"
              size={20}
              color={isDark ? "#fbbf24" : "#d97706"}
            />
          </Pressable>
          <Pressable
            onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'AddTimer' })}
            style={{
              backgroundColor: isDark ? "#374151" : "#fef3c7",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons
              name="add"
              size={20}
              color={isDark ? "#fbbf24" : "#d97706"}
            />
          </Pressable>
          <Pressable
            onPress={async () => {
              console.log('Manual cleanup triggered');
              const currentTimers = useHolidayStore.getState().timers;
              const activeTimerIds = currentTimers.map(timer => timer.id);
              await tripStore.cleanupOrphanedChecklists(activeTimerIds);
              await loadChecklists();
            }}
            style={{
              backgroundColor: isDark ? "#ef4444" : "#fecaca",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons
              name="trash"
              size={20}
              color={isDark ? "#fca5a5" : "#dc2626"}
            />
          </Pressable>
        </View>
      </View>

      {/* Debug Info - Temporarily hidden for better layout */}
      {__DEV__ && (
        <View style={{ padding: 8, backgroundColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(243, 244, 246, 0.5)" }}>
          <RestyleText variant="xs" color="textMuted" textAlign="center">
            Hydrated: {isHydrated ? 'Yes' : 'No'} | Trips: {trips?.length || 0} | Checklists: {checklists?.length || 0}
          </RestyleText>
        </View>
      )}

      {/* Main Content */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 100, // Extra padding for bottom navigation
        }}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {!isHydrated ? (
          /* Loading State */
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
            minHeight: 200
          }}>
            <Ionicons
              name="hourglass-outline"
              size={48}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
            <RestyleText
              variant="lg"
              color="textMuted"
              fontWeight="medium"
              marginTop={16}
              textAlign="center"
            >
              Loading your trips...
            </RestyleText>
          </View>
        ) : !trips || trips.length === 0 ? (
          <View style={{ 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingVertical: 60,
            minHeight: 300
          }}>
            <Ionicons 
              name="map-outline" 
              size={64} 
              color={isDark ? "#6b7280" : "#9ca3af"} 
            />
            <RestyleText 
              variant="lg" 
              color="textMuted" 
              fontWeight="medium"
              marginTop={16}
              textAlign="center"
            >
              No trips planned yet
            </RestyleText>
            <RestyleText 
              variant="sm" 
              color="textMuted" 
              textAlign="center"
              marginTop={8}
            >
              Add your first trip to get started!
            </RestyleText>
            <Pressable
              onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'AddTimer' })}
              style={{
                backgroundColor: '#fbbf24',
                borderRadius: 12,
                padding: 16,
                marginTop: 24,
                minWidth: 200,
                alignItems: 'center',
              }}
            >
              <RestyleText variant="md" color="text" fontWeight="semibold">
                ➕ Add New Trip
              </RestyleText>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingBottom: 20 }}>
            {/* My Trips Section */}
            <View style={{ marginBottom: 32 }}>
              <RestyleText 
                variant="lg" 
                color="text" 
                fontWeight="bold" 
                marginBottom={12}
                marginLeft={4}
              >
                🗺️ My Trips
              </RestyleText>
              <View>
                {(trips || []).map((trip, index) => {
                  const destinationImage = getDestinationImage(trip.destination);

                  return (
                    <Pressable
                      key={trip.id}
                      onPress={() => navigation.navigate('TimerDrilldown', { timerId: trip.id })}
                      style={{
                        height: 140, // Fixed height for consistent card size
                        borderRadius: 16,
                        marginBottom: 12,
                        overflow: 'hidden',
                        ...Platform.select({
                          ios: {
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                          },
                          android: {
                            elevation: 4,
                          },
                          web: {
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          },
                        }),
                      }}
                    >
                      <ImageBackground
                        source={{ uri: destinationImage }}
                        style={{
                          flex: 1,
                          borderRadius: 16,
                        }}
                        imageStyle={{
                          borderRadius: 16,
                        }}
                        resizeMode="cover"
                      >
                        {/* Gradient overlay for better text readability */}
                        <View style={{
                          ...StyleSheet.absoluteFillObject,
                          backgroundColor: isDark
                            ? 'rgba(0, 0, 0, 0.4)' // Darker overlay for dark theme
                            : 'rgba(0, 0, 0, 0.3)', // Lighter overlay for light theme
                          borderRadius: 16,
                        }} />

                        {/* Content */}
                        <View style={{
                          flex: 1,
                          padding: 16,
                          justifyContent: 'space-between',
                        }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1 }}>
                              <RestyleText
                                variant="lg"
                                style={{ color: '#FFFFFF', fontWeight: 'bold' }}
                              >
                                {formatDestinationName(trip.destination)}
                              </RestyleText>
                              <RestyleText
                                variant="sm"
                                style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 4 }}
                              >
                                {formatDistanceToNow(new Date(trip.date), { addSuffix: true })}
                              </RestyleText>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Ionicons name="people" size={16} color="rgba(255, 255, 255, 0.8)" />
                                  <RestyleText
                                    variant="xs"
                                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                  >
                                    {trip.adults + trip.children} travelers
                                  </RestyleText>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                  <Ionicons name="calendar" size={16} color="rgba(255, 255, 255, 0.8)" />
                                  <RestyleText
                                    variant="xs"
                                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                                  >
                                    {trip.duration} days
                                  </RestyleText>
                                </View>
                              </View>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={24}
                              color="#FFFFFF"
                            />
                          </View>
                        </View>
                      </ImageBackground>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* My Checklists Section */}
            {checklists.length > 0 && (
              <View style={{ marginBottom: 32 }}>
                <RestyleText 
                  variant="lg" 
                  color="text" 
                  fontWeight="bold" 
                  marginBottom={12}
                  marginLeft={4}
                >
                  ✅ My Checklists
                </RestyleText>
                <View>
                  {checklists.map((trip, index) => {
                    const progress = checklistProgress[trip.id] || 0;

                    return (
                      <Pressable
                        key={trip.id}
                        onPress={() => navigation.navigate('Checklist', { tripId: trip.id })}
                        style={{
                          backgroundColor: isDark ? "#374151" : "#ffffff",
                          borderRadius: 16,
                          padding: 20,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: isDark ? "#4b5563" : "#e5e7eb",
                          ...Platform.select({
                            ios: {
                              shadowColor: isDark ? "#000" : "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: isDark ? 0.3 : 0.1,
                              shadowRadius: 4,
                            },
                            android: {
                              elevation: 3,
                            },
                            web: {
                              boxShadow: isDark
                                ? "0 2px 8px rgba(0, 0, 0, 0.3)"
                                : "0 2px 4px rgba(0, 0, 0, 0.1)",
                            },
                          }),
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <Ionicons 
                                name="checkmark-circle" 
                                size={20} 
                                color={progress > 0 ? (isDark ? "#10b981" : "#059669") : (isDark ? "#6b7280" : "#9ca3af")} 
                              />
                              <RestyleText variant="lg" color="text" fontWeight="bold">
                                {formatDestinationName(trip.title)}
                              </RestyleText>
                            </View>
                            
                            {trip.timerContext && (
                              <RestyleText variant="sm" color="textMuted" marginBottom={4}>
                                {formatDestinationName(trip.timerContext.destination)} • {trip.timerContext.duration} days
                              </RestyleText>
                            )}
                            
                            <RestyleText variant="xs" color="textMuted" marginBottom={8}>
                              Created {formatDistanceToNow(new Date(trip.createdAt), { addSuffix: true })}
                            </RestyleText>
                            
                            {/* Progress Bar */}
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 8,
                            }}>
                              <View style={{
                                flex: 1,
                                height: 6,
                                backgroundColor: isDark ? "#4b5563" : "#e5e7eb",
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}>
                                <View style={{
                                  width: `${progress}%`,
                                  height: '100%',
                                  backgroundColor: isDark ? "#10b981" : "#059669",
                                  borderRadius: 3,
                                }} />
                              </View>
                              <RestyleText variant="xs" color="textMuted" style={{ minWidth: 35 }}>
                                {progress}%
                              </RestyleText>
                            </View>
                          </View>
                          <Ionicons 
                            name="chevron-forward" 
                            size={20} 
                            color={isDark ? "#6b7280" : "#6b7280"} 
                          />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
