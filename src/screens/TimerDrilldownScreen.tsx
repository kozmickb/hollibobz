import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, Image, Animated, ImageBackground, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPexelsBackdrop } from '../features/destination/backdrop';
import { formatDestinationName, getDestinationImage, testAbuDhabi, testDestinationImages, validateAndFixImages, quickTest } from '../utils/destinationImages';


import { TripsStackParamList } from '../navigation/AppNavigator';
import { useHolidayStore } from '../store/useHolidayStore';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from '../components/ui/Text';

// MVP2 Components
import { AnimatedCountdown } from '../components/AnimatedCountdown';
import { tripStore } from '../lib/tripStore';
import { InfoDashboardSection } from '../components/InfoDashboardSection';
import { calculateChecklistProgress } from '../utils/checklistProgress';
import { EditTimerModal } from '../components/EditTimerModal';
import { FlightLookupModal, FlightInfo } from '../components/FlightLookupModal';
import { PaywallModal } from '../components/PaywallModal';

type Nav = NativeStackNavigationProp<TripsStackParamList, "TimerDrilldown">;
type Rt = RouteProp<TripsStackParamList, "TimerDrilldown">;



export function TimerDrilldownScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { timerId } = route.params;
  const { isDark } = useThemeStore();
  const timers = useHolidayStore((s) => s.timers);
  const updateTimer = useHolidayStore((s) => s.updateTimer);

  

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [checklistTripId, setChecklistTripId] = useState<string | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<number | null>(null);
  const [showFlightLookup, setShowFlightLookup] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showFlightOptions, setShowFlightOptions] = useState(false);
  const [isPremium, setIsPremium] = useState(true); // Temporarily set to true to test flight editing

  // Find the timer for this ID - MOVED UP to be available for useEffect
  const timer = useMemo(() => {
    const foundTimer = timers.find(t => t.id === timerId);
    return foundTimer;
  }, [timers, timerId]);

  // Initialize background image on component mount
  useEffect(() => {
    if (timer?.destination) {
      // Try to load image immediately on mount
      try {
        const imageUrl = getDestinationImage(timer.destination);
        setBackgroundImage(imageUrl);
      } catch (error) {
        console.error('[TimerDrilldown] Error during initial image load:', error);
      }
    }
  }, [timer?.id]); // Run when timer.id changes, not just on mount

  // Utility function to format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return 'N/A';
    }
  }

  // Debug modal state changes - REMOVED to reduce console noise
  // useEffect(() => {
  //   console.log('Modal state changed:', { showFlightLookup, showPaywall });
  // }, [showFlightLookup, showPaywall]);
  




  // Detect checklist linked to this timer
  useEffect(() => {
    if (!timer?.destination) return; // Early return if no destination
    
    (async () => {
      try {
        const all = await tripStore.getAll();
        const exact = all.find((t: any) => t.id === timerId && t.checklist && !t.archived);
        if (exact) {
          setHasChecklist(true);
          setChecklistTripId(exact.id);
          try {
            const trip = await tripStore.get(exact.id);
            if (trip?.checklist) {
              const pct = await calculateChecklistProgress(exact.id, trip.checklist);
              setChecklistProgress(pct);
            } else {
              setChecklistProgress(null);
            }
          } catch {
            setChecklistProgress(null);
          }
          return;
        }
        const dest = (timer.destination.toLowerCase());
        const byContext = all.find((t: any) => (t.timerContext?.destination || '').toLowerCase() === dest && t.checklist && !t.archived);
        if (byContext) {
          setHasChecklist(true);
          setChecklistTripId(byContext.id);
          try {
            const trip = await tripStore.get(byContext.id);
            if (trip?.checklist) {
              const pct = await calculateChecklistProgress(byContext.id, trip.checklist);
              setChecklistProgress(pct);
            } else {
              setChecklistProgress(null);
            }
          } catch {
            setChecklistProgress(null);
          }
          return;
        }
        const byTitle = all.find((t: any) => (t.title || '').toLowerCase().includes(dest) && t.checklist && !t.archived);
        if (byTitle) {
          setHasChecklist(true);
          setChecklistTripId(byTitle.id);
          try {
            const trip = await tripStore.get(byTitle.id);
            if (trip?.checklist) {
              const pct = await calculateChecklistProgress(byTitle.id, trip.checklist);
              setChecklistProgress(pct);
            } else {
              setChecklistProgress(null);
            }
          } catch {
            setChecklistProgress(null);
          }
          return;
        }
        setHasChecklist(false);
        setChecklistTripId(null);
        setChecklistProgress(null);
      } catch (e) {
        setHasChecklist(false);
        setChecklistTripId(null);
        setChecklistProgress(null);
      }
    })();
  }, [timerId, timer?.id]); // Only depend on timerId and timer.id, not destination

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validate destination images (development only) - REMOVED to fix infinite loop
  // useEffect(() => {
  //   if (__DEV__) {
  //     console.log('[TimerDrilldown] Running comprehensive destination image tests...');
  //     testDestinationImages();
  //     validateAndFixImages(); // This was causing infinite loop
  //   }
  // }, []);

  // Load background image for destination - SIMPLIFIED to prevent infinite loops
  useEffect(() => {
    if (timer?.destination) {
      try {
        const imageUrl = getDestinationImage(timer.destination);
        setImageError(false);
        setBackgroundImage(imageUrl);
      } catch (error) {
        console.error('[TimerDrilldown] Failed to load background image:', error);
        setImageError(true);
        setBackgroundImage(null);
      }
    } else {
      setBackgroundImage(null);
    }
  }, [timer?.id]); // Only depend on timer.id, not destination

  // Debug background image state changes - REMOVED to reduce console noise and potential loops
  // useEffect(() => {
  //   console.log('[TimerDrilldown] Background image state changed:', backgroundImage);
  //   console.log('[TimerDrilldown] Image loading state:', imageLoading);
  //   console.log('[TimerDrilldown] Image error state:', imageError);
  // }, [backgroundImage, imageLoading, imageError]);



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const tellMeMore = (query: string) => {
    navigation.getParent()?.navigate("ChatTab", {
      screen: "HollyChat",
      params: {
        seedQuery: query,
        context: {
          destination: timer?.destination,
          dateISO: timer?.date,
          adults: timer?.adults,
          children: timer?.children,
          duration: timer?.duration,
          timerId: timer?.id
        },
        reset: false
      }
    });
  };

  const handleFlightSelect = async (flight: FlightInfo) => {
    if (!timer) return;

    try {
      await updateTimer(timer.id, {
        selectedFlight: {
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          departureAirport: flight.departureAirport,
          arrivalAirport: flight.arrivalAirport,
          scheduledDeparture: flight.scheduledDeparture,
          scheduledArrival: flight.scheduledArrival,
          status: flight.status,
          aircraft: flight.aircraft,
          terminal: flight.terminal,
          gate: flight.gate
        }
      });
    } catch (error) {
      console.error('Failed to update flight:', error);
      Alert.alert('Error', 'Failed to save flight information. Please try again.');
    }
  };

  const handleRemoveFlight = async () => {
    if (!timer) return;

    try {
      await updateTimer(timer.id, {
        selectedFlight: undefined
      });
      console.log('Flight removed from timer:', timer.id);
    } catch (error) {
      console.error('Failed to remove flight:', error);
      Alert.alert('Error', 'Failed to remove flight information. Please try again.');
    }
  };

  // Test function to add a sample flight
  const addTestFlight = async () => {
    if (!timer) return;
    try {
      await updateTimer(timer.id, {
        selectedFlight: {
          flightNumber: 'EY011',
          airline: 'Etihad Airways',
          departureAirport: 'LHR',
          arrivalAirport: 'AUH',
          scheduledDeparture: '2025-12-27T18:30:00Z',
          scheduledArrival: '2025-12-28T06:45:00Z',
          status: 'On Time',
          aircraft: 'B787',
          terminal: '3',
          gate: 'A12'
        }
      });
      console.log('Test flight added to timer');
    } catch (error) {
      console.error('Failed to add test flight:', error);
    }
  };

  const handleFlightAction = () => {
    console.log('Flight action triggered:', { isPremium, timerId: timer?.id, destination: timer?.destination });
    if (isPremium) {
      console.log('Opening flight lookup modal for:', timer?.destination);
      console.log('Setting showFlightLookup to true');
      setShowFlightLookup(true);
      console.log('showFlightLookup state should now be true');
    } else {
      console.log('Opening paywall modal for flight feature');
      setShowPaywall(true);
    }
  };

  if (!timer) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
        <RestyleText variant="xl" color="text" fontWeight="semibold">
          Timer not found
        </RestyleText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f8fafc' }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Sticky Header */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1f2937' : '#e2e8f0',
            paddingHorizontal: 16,
            paddingTop: 50,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
            </Pressable>
            <View>
              <RestyleText variant="xl" color="text" fontWeight="semibold">
                {formatDestinationName(timer.destination)}
              </RestyleText>
              <RestyleText variant="sm" color="textMuted">
                Trip Details
              </RestyleText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => {
                console.log('Edit button pressed, setting showEditModal to true');
                setShowEditModal(true);
              }}
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="create-outline" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Hero Section with Animated Countdown */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                position: 'relative',
                height: 240,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 24,
              }}
            >
              {backgroundImage && !imageError ? (
                <ImageBackground
                  key={backgroundImage} // Force re-render when URL changes
                  source={{ uri: backgroundImage }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('[TimerDrilldown] ImageBackground onError:', error, 'URL:', backgroundImage);
                    setImageLoading(false);
                    setImageError(true);
                    // Don't set fallback image here to prevent infinite loop
                  }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={{ width: '100%', height: '100%' }}
                  />
                  {/* Debug elements removed to improve performance */}
                </ImageBackground>
              ) : (
                <LinearGradient
                  colors={['#2563eb', '#7c3aed']}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
              {/* Debug URL display removed to improve performance */}
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                }}
              />
              
                             {/* Destination Info Overlay */}
               <View
                 style={{
                   position: 'absolute',
                   bottom: 16,
                   left: 16,
                   right: 16,
                   flexDirection: 'column',
                   alignItems: 'flex-start',
                   justifyContent: 'flex-end',
                 }}
               >
                                 <View style={{ width: '100%', marginBottom: 12 }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                       <Ionicons name="star" size={14} color="#fbbf24" />
                       <RestyleText variant="xs" color="text" fontWeight="medium">
                         4.8
                       </RestyleText>
                     </View>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                       <Ionicons name="people" size={14} color="#d1d5db" />
                       <RestyleText variant="xs" color="textMuted">
                         2.4k visitors
                       </RestyleText>
                     </View>
                   </View>
                   <RestyleText variant="xl" color="text" fontWeight="bold" marginBottom={2}>
                     {formatDestinationName(timer.destination)}
                   </RestyleText>
                   <RestyleText variant="xs" color="textMuted">
                     {formatDate(timer.date)}
                   </RestyleText>
                 </View>
                 
                 {/* Animated Countdown */}
                 <View style={{ alignSelf: 'center' }}>
                   <AnimatedCountdown targetDate={new Date(timer.date)} />
                 </View>
              </View>
            </View>
          </Animated.View>

          {/* Flight Information Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? '#1f2937' : '#e5e7eb',
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="airplane" size={22} color={isDark ? '#5eead4' : '#0d9488'} />
                  <View>
                    <RestyleText variant="md" color="text" fontWeight="semibold">
                      Flight Information
                    </RestyleText>
                    <RestyleText variant="xs" color="textMuted">
                      {timer.selectedFlight ? 'Track your flight status' : 'Add your flight details'}
                    </RestyleText>
                  </View>
                </View>

                {timer.selectedFlight && (
                  <Pressable
                    onPress={() => {
                      console.log('Three dots pressed - showing flight options');
                      console.log('Current flight:', timer.selectedFlight);
                      // Use custom modal instead of Alert for better web compatibility
                      console.log('Opening flight options modal');
                      setShowFlightOptions(true);
                    }}
                    style={{
                      backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                      borderRadius: 12,
                      padding: 6,
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={16} color={isDark ? '#ffffff' : '#333333'} />
                  </Pressable>
                )}
              </View>

              {timer.selectedFlight ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{
                      backgroundColor: isDark ? '#10b981' : '#059669',
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}>
                      <RestyleText variant="xs" color="text" style={{ color: '#ffffff' }}>
                        {timer.selectedFlight.status}
                      </RestyleText>
                    </View>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <RestyleText variant="md" color="text" fontWeight="semibold">
                        {timer.selectedFlight.flightNumber}
                      </RestyleText>
                      <RestyleText variant="sm" color="textMuted">
                        {timer.selectedFlight.airline}
                      </RestyleText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="location" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                      <RestyleText variant="sm" color="text">
                        {timer.selectedFlight.departureAirport} → {timer.selectedFlight.arrivalAirport}
                      </RestyleText>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <RestyleText variant="xs" color="textMuted" marginBottom={2}>
                        Departure
                      </RestyleText>
                      <RestyleText variant="sm" color="text" fontWeight="medium">
                        {formatTime(timer.selectedFlight.scheduledDeparture)}
                      </RestyleText>
                      {timer.selectedFlight.terminal && (
                        <RestyleText variant="xs" color="textMuted">
                          Terminal {timer.selectedFlight.terminal}
                          {timer.selectedFlight.gate && ` • Gate ${timer.selectedFlight.gate}`}
                        </RestyleText>
                      )}
                    </View>

                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <RestyleText variant="xs" color="textMuted" marginBottom={2}>
                        Arrival
                      </RestyleText>
                      <RestyleText variant="sm" color="text" fontWeight="medium">
                        {formatTime(timer.selectedFlight.scheduledArrival)}
                      </RestyleText>
                      {timer.selectedFlight.aircraft && (
                        <RestyleText variant="xs" color="textMuted">
                          {timer.selectedFlight.aircraft}
                        </RestyleText>
                      )}
                    </View>
                  </View>
                </>
              ) : (
                <Pressable
                  onPress={async () => {
                    // First add a test flight for immediate testing
                    await addTestFlight();
                    // Then open the flight lookup modal
                    setTimeout(() => handleFlightAction(), 100);
                  }}
                  style={{
                    backgroundColor: isDark ? '#2a2a2a' : '#f7f7f7',
                    borderWidth: 2,
                    borderColor: isDark ? '#555555' : '#e5e5e5',
                    borderRadius: 12,
                    borderStyle: 'dashed',
                    padding: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="add-circle"
                    size={32}
                    color={isPremium ? (isDark ? '#5eead4' : '#0d9488') : (isDark ? '#666666' : '#999999')}
                    style={{ marginBottom: 12 }}
                  />
                  <RestyleText variant="md" color="text" fontWeight="medium" style={{ marginBottom: 4 }}>
                    {isPremium ? 'Add Your Flight' : 'Flight Tracking (Premium)'}
                  </RestyleText>
                  <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
                    {isPremium
                      ? 'Select your flight to track status, delays, and gate information'
                      : 'Upgrade to Premium to add flight tracking to your trips'
                    }
                  </RestyleText>

                  {/* Debug button to test modal directly */}
                  {__DEV__ && (
                    <Pressable
                      onPress={() => {
                        console.log('Debug: Opening flight lookup modal directly');
                        setShowFlightLookup(true);
                      }}
                      style={{
                        marginTop: 10,
                        backgroundColor: '#ff6b6b',
                        padding: 8,
                        borderRadius: 6,
                      }}
                    >
                      <RestyleText variant="xs" color="text" style={{ color: '#ffffff', textAlign: 'center' }}>
                        DEBUG: Open Modal Directly
                      </RestyleText>
                    </Pressable>
                  )}
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Checklist Card (replaces Experience Points for MVP) */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: isDark ? '#1f2937' : '#e5e7eb',
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="checkmark-circle" size={22} color={hasChecklist ? (isDark ? '#10B981' : '#059669') : (isDark ? '#6B7280' : '#9CA3AF')} />
                  <View>
                    <RestyleText variant="md" color="text" fontWeight="semibold">
                      Trip Checklist
                    </RestyleText>
                    <RestyleText variant="xs" color="textMuted">
                      {hasChecklist ? 'Open your saved checklist.' : 'No checklist yet. Create one with Holly.'}
                    </RestyleText>
                    {hasChecklist && checklistProgress !== null && (
                      <View style={{
                        alignSelf: 'flex-start',
                        marginTop: 6,
                        backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(5,150,105,0.25)'
                      }}>
                        <RestyleText variant="xs" color="text" fontWeight="semibold" style={{ color: isDark ? '#34D399' : '#065F46' }}>
                          {checklistProgress}% complete
                        </RestyleText>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    if (hasChecklist && checklistTripId) {
                      navigation.navigate('Checklist', { tripId: checklistTripId });
                    } else if (timer) {
                      navigation.getParent()?.navigate('ChatTab', {
                        seedQuery: `Please generate a detailed trip itinerary with a checklist for ${timer.destination} around ${formatDate(timer.date)}. Return JSON per the app's checklist format.`,
                        context: {
                          destination: timer.destination,
                          dateISO: timer.date,
                          timerId: timer.id,
                          duration: timer.duration,
                          adults: timer.adults,
                          children: timer.children,
                        },
                        reset: false,
                      });
                    }
                  }}
                  style={{
                    backgroundColor: hasChecklist ? (isDark ? '#10B981' : '#059669') : (isDark ? '#374151' : '#F3F4F6'),
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={hasChecklist ? 'open' : 'add-circle'} size={18} color={hasChecklist ? '#FFFFFF' : (isDark ? '#E5E7EB' : '#111827')} />
                    <RestyleText variant="sm" color="text" fontWeight="semibold" style={{ color: hasChecklist ? '#FFFFFF' : undefined }}>
                      {hasChecklist ? 'Open' : 'Create'}
                    </RestyleText>
                  </View>
                </Pressable>
              </View>
            </View>
          </Animated.View>

                     {/* Info Dashboard Section */}
           <Animated.View
             style={{
               opacity: fadeAnim,
               transform: [{ translateY: slideAnim }],
             }}
           >
                           <View style={{ marginBottom: 24 }}>
                <InfoDashboardSection
                  destination={timer?.destination}
                  tripDate={timer?.date ? new Date(timer.date) : undefined}
                />
              </View>
           </Animated.View>



          {/* AI Assistant Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
                         <LinearGradient
               colors={['#8b5cf6', '#6366f1']}
               style={{
                 borderRadius: 12,
                 padding: 20,
                 marginBottom: 24,
               }}
             >
                             <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                 <View
                   style={{
                     backgroundColor: 'rgba(255, 255, 255, 0.2)',
                     borderRadius: 8,
                     padding: 8,
                   }}
                 >
                   <Ionicons name="chatbubble" size={20} color="#ffffff" />
                 </View>
                 <View style={{ flex: 1 }}>
                   <RestyleText variant="xl" color="text" fontWeight="bold" marginBottom={6}>
                     Ask Holly Bobz
                   </RestyleText>
                   <RestyleText variant="sm" color="text" marginBottom={12}>
                     "What are the must-visit hidden spots in {timer.destination} that most tourists miss?"
                   </RestyleText>
                                     <Pressable
                     onPress={() => tellMeMore(`What are the must-visit hidden spots in ${timer.destination} that most tourists miss?`)}
                     style={{
                       backgroundColor: '#ffffff',
                       paddingHorizontal: 16,
                       paddingVertical: 8,
                       borderRadius: 8,
                     }}
                   >
                     <RestyleText variant="xs" color="text" fontWeight="semibold" style={{ color: '#8b5cf6' }}>
                       Tell me more
                     </RestyleText>
                   </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      {/* Edit Timer Modal */}
      <EditTimerModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        timerId={timer.id}
        currentDestination={timer.destination}
        currentDate={timer.date}
      />

      {/* Flight Lookup Modal */}
      <FlightLookupModal
        visible={showFlightLookup}
        onClose={() => {
          console.log('FlightLookupModal onClose called - setting showFlightLookup to false');
          setShowFlightLookup(false);
        }}
        onFlightSelect={(flight) => {
          console.log('Flight selected in modal:', flight);
          handleFlightSelect(flight);
        }}
        departureAirport={timer.destination.split(',')[0]}
        tripDate={new Date(timer.date)}
        isPremium={isPremium}
        destination={timer.destination}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Flight Tracking"
        description="Add flight information to your existing trips to track status, delays, and gate information in real-time."
        onUpgrade={() => {
          console.log('User upgraded to premium from timer drilldown');
          setIsPremium(true);
        }}
      />

      {/* Custom Flight Options Modal */}
      <Modal
        visible={showFlightOptions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFlightOptions(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderRadius: 12,
            padding: 20,
            width: '100%',
            maxWidth: 320,
          }}>
            <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={8}>
              Flight Options
            </RestyleText>
            <RestyleText variant="sm" color="textMuted" marginBottom={20}>
              What would you like to do with this flight?
            </RestyleText>

            <View style={{ gap: 12 }}>
              <Pressable
                onPress={() => {
                  console.log('Edit Flight selected - calling handleFlightAction');
                  setShowFlightOptions(false);
                  handleFlightAction();
                }}
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderRadius: 8,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <RestyleText variant="md" color="text" fontWeight="medium">
                  ✏️ Edit Flight
                </RestyleText>
              </Pressable>

              <Pressable
                onPress={() => {
                  console.log('Remove Flight selected - calling handleRemoveFlight');
                  setShowFlightOptions(false);
                  handleRemoveFlight();
                }}
                style={{
                  backgroundColor: '#dc2626',
                  borderRadius: 8,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <RestyleText variant="md" color="text" style={{ color: '#ffffff' }}>
                  🗑️ Remove Flight
                </RestyleText>
              </Pressable>

              <Pressable
                onPress={() => {
                  console.log('Cancel selected');
                  setShowFlightOptions(false);
                }}
                style={{
                  backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                  borderRadius: 8,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <RestyleText variant="md" color="textMuted">
                  Cancel
                </RestyleText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
