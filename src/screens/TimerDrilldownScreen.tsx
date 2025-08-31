import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, Image, Animated, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPexelsBackdrop } from '../features/destination/backdrop';
import { formatDestinationName } from '../utils/destinationImages';

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

type Nav = NativeStackNavigationProp<TripsStackParamList, "TimerDrilldown">;
type Rt = RouteProp<TripsStackParamList, "TimerDrilldown">;

interface TravelFact {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const travelFacts: TravelFact[] = [
  {
    id: '1',
    title: 'Local Delicacy',
    description: 'Try the famous street food markets that come alive after sunset with authentic flavors.',
    icon: 'restaurant'
  },
  {
    id: '2',
    title: 'Hidden Gem',
    description: 'Visit the secret rooftop gardens that locals use for morning meditation sessions.',
    icon: 'location'
  },
  {
    id: '3',
    title: 'Cultural Tip',
    description: 'Learn basic greetings in the local language - it opens doors to authentic experiences.',
    icon: 'language'
  }
];

export function TimerDrilldownScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { timerId } = route.params;
  const { isDark } = useThemeStore();
  const timers = useHolidayStore((s) => s.timers);
  
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [checklistTripId, setChecklistTripId] = useState<string | null>(null);
  const [checklistProgress, setChecklistProgress] = useState<number | null>(null);
  
  // Find the timer for this ID
  const timer = useMemo(() => {
    return timers.find(t => t.id === timerId);
  }, [timers, timerId]);
  
  // Debug modal state
  useEffect(() => {
    console.log('showEditModal state changed to:', showEditModal);
  }, [showEditModal]);

  // Debug timer data
  useEffect(() => {
    console.log('TimerDrilldownScreen timer data:', timer);
    console.log('TimerDrilldownScreen passing destination:', timer?.destination);
  }, [timer]);

  // Detect checklist linked to this timer
  useEffect(() => {
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
        const dest = (timer?.destination || '').toLowerCase();
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
  }, [timerId, timer?.destination]);

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

  // Load background image for destination
  useEffect(() => {
    const loadBackgroundImage = async () => {
      if (timer?.destination) {
        try {
          const result = await fetchPexelsBackdrop(timer.destination);
          if (result.imageUrl) {
            setBackgroundImage(result.imageUrl);
          }
        } catch (error) {
          console.log('Failed to load background image for', timer.destination);
        }
      }
    };

    loadBackgroundImage();
  }, [timer?.destination]);

  const nextFact = () => {
    setCurrentFactIndex(prev => (prev + 1) % travelFacts.length);
  };

  const prevFact = () => {
    setCurrentFactIndex(prev => (prev - 1 + travelFacts.length) % travelFacts.length);
  };

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
              {backgroundImage ? (
                <ImageBackground
                  source={{ uri: backgroundImage }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={{ width: '100%', height: '100%' }}
                  />
                </ImageBackground>
              ) : (
                <LinearGradient
                  colors={['#2563eb', '#7c3aed']}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
              
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
                />
              </View>
           </Animated.View>

          {/* Travel Facts Carousel */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
                         <View
               style={{
                 backgroundColor: isDark ? '#1f2937' : '#ffffff',
                 borderRadius: 12,
                 padding: 20,
                 borderWidth: 1,
                 borderColor: isDark ? '#374151' : '#e5e7eb',
                 marginBottom: 24,
               }}
             >
                             <RestyleText variant="xl" color="text" fontWeight="bold" marginBottom={4}>
                 Travel Tips & Fun Facts
               </RestyleText>
              
              <View>
                                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Pressable
                    onPress={prevFact}
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      borderRadius: 20,
                      padding: 8,
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
                  </Pressable>
                  
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {travelFacts.map((_, index) => (
                      <View
                        key={index}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: index === currentFactIndex ? '#3b82f6' : '#6b7280',
                        }}
                      />
                    ))}
                  </View>
                  
                  <Pressable
                    onPress={nextFact}
                    style={{
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      borderRadius: 20,
                      padding: 8,
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
                  </Pressable>
                </View>
                
                                 <View
                   style={{
                     backgroundColor: 'rgba(59, 130, 246, 0.1)',
                     borderRadius: 8,
                     padding: 16,
                     borderWidth: 1,
                     borderColor: 'rgba(59, 130, 246, 0.2)',
                   }}
                 >
                                     <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                     <View
                       style={{
                         backgroundColor: isDark ? '#1f2937' : '#ffffff',
                         borderRadius: 8,
                         padding: 8,
                       }}
                     >
                       <Ionicons name={travelFacts[currentFactIndex].icon as any} size={16} color="#60a5fa" />
                     </View>
                     <View style={{ flex: 1 }}>
                       <RestyleText variant="sm" color="text" fontWeight="semibold" marginBottom={4}>
                         {travelFacts[currentFactIndex].title}
                       </RestyleText>
                       <RestyleText variant="xs" color="textMuted" lineHeight={16}>
                         {travelFacts[currentFactIndex].description}
                       </RestyleText>
                     </View>
                   </View>
                </View>
              </View>
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
    </View>
  );
}
