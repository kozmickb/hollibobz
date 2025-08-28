import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useHolidayStore } from '../store/useHolidayStore';
import { useThemeStore } from '../store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

// TripTick UI components
import { Box } from '../components/ui/Box';
import { Text as RestyleText } from '../components/ui/Text';
import { CustomAlert } from '../components/CustomAlert';

// Import existing components
import { CountdownDisplay } from '../components/CountdownDisplay';
import { CountdownRing } from '../components/CountdownRing';
import { TripTickLogo } from '../components/TripTickLogo';

// Import features
import { daysUntil, progressToTrip } from '../features/countdown/logic';
import { buildDefaultMeta, DestinationMeta } from '../features/destination/meta';
import { loadCachedMeta, saveCachedMeta, fetchPexelsBackdrop } from '../features/destination/backdrop';
import { generateQuickFacts } from '../features/destination/quickFacts';
import { clearLegacyCachedMeta } from '../features/destination/clearLegacyCache';

type Nav = NativeStackNavigationProp<RootStackParamList, "DestinationDetail">;
type Rt = RouteProp<RootStackParamList, "DestinationDetail">;

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

export function DestinationDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { destination } = route.params;
  const { isDark } = useThemeStore();
  const timers = useHolidayStore((s) => s.timers);
  
  const [meta, setMeta] = useState<DestinationMeta | null>(null);
  const [loadingQuickFacts, setLoadingQuickFacts] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  // Find the timer for this destination
  const timer = useMemo(() => {
    return timers.find(t => t.destination.toLowerCase().includes(destination.toLowerCase()));
  }, [timers, destination]);

  const daysLeft = useMemo(() => {
    if (!timer) return null;
    return daysUntil(timer.date);
  }, [timer]);

  const progressPercent = useMemo(() => {
    if (!timer) return 0;
    return progressToTrip(timer.createdAt ?? new Date().toISOString(), timer.date);
  }, [timer]);

  // Meta/backdrop hydrate with AI-generated quick facts
  useEffect(() => {
    let mounted = true;
    (async () => {
      const dest = destination.trim();
      
      // One-time cleanup of legacy cache on first load
      await clearLegacyCachedMeta();
      
      // hydrate from cache
      const cached = await loadCachedMeta(dest);
      let base = cached ?? buildDefaultMeta(dest);

      // Show immediate data first if available
      if (mounted) setMeta({ ...base });

      // If we don't have cached quick facts or they're empty, generate them
      if (!base.quickFacts || base.quickFacts.length === 0) {
        console.log('Generating quick facts for', dest);
        if (mounted) setLoadingQuickFacts(true);
        
        try {
          const facts = await generateQuickFacts(dest);
          if (mounted) {
            base.quickFacts = facts;
            setMeta({ ...base });
            setLoadingQuickFacts(false);
          }
        } catch (error) {
          console.log('Failed to generate quick facts:', error);
          if (mounted) setLoadingQuickFacts(false);
        }
      }

      // Try to ensure we have an imageUrl
      if (!base.imageUrl) {
        const img = await fetchPexelsBackdrop(dest);
        if (img.imageUrl) {
          base.imageUrl = img.imageUrl;
          if (mounted) setMeta({ ...base });
        }
      }

      base.cachedAtISO = new Date().toISOString();
      await saveCachedMeta(dest, base);
    })();
    return () => { mounted = false; };
  }, [destination]);

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
    navigation.navigate("HollyChat", {
      seedQuery: query,
      context: { 
        destination: destination, 
        dateISO: timer?.date, 
        timerId: timer?.id 
      },
      reset: false,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f8fafc' }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Sticky Header */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1f2937' : '#e2e8f0',
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 16,
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
                {destination}
              </RestyleText>
              <RestyleText variant="sm" color="textMuted">
                Destination Details
              </RestyleText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="heart-outline" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
            </Pressable>
            <Pressable
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="camera-outline" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* Hero Section */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                position: 'relative',
                height: 320,
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 32,
              }}
            >
              {meta?.imageUrl ? (
                <Image
                  source={{ uri: meta.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
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
                  bottom: 24,
                  left: 24,
                  right: 24,
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="star" size={16} color="#fbbf24" />
                      <RestyleText variant="sm" color="text" fontWeight="medium">
                        4.8
                      </RestyleText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="people" size={16} color="#d1d5db" />
                      <RestyleText variant="sm" color="textMuted">
                        2.4k visitors
                      </RestyleText>
                    </View>
                  </View>
                  <RestyleText variant="2xl" color="text" fontWeight="bold" marginBottom={4}>
                    {destination}
                  </RestyleText>
                  <RestyleText variant="sm" color="textMuted">
                    {timer ? formatDate(timer.date) : 'Plan your trip'}
                  </RestyleText>
                </View>
                
                {/* Countdown Card */}
                {timer && daysLeft !== null && (
                  <View
                    style={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      minWidth: 200,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Ionicons name="time-outline" size={16} color="#60a5fa" />
                      <RestyleText variant="xs" color="textMuted" fontWeight="medium">
                        Trip Countdown
                      </RestyleText>
                    </View>
                    <CountdownDisplay daysLeft={daysLeft} size="lg" showAnimation={false} />
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          {timer && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View style={{ marginBottom: 32 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Login Streak */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderRadius: 16,
                      padding: 24,
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <View
                        style={{
                          backgroundColor: 'rgba(251, 146, 60, 0.2)',
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <Ionicons name="flame" size={24} color="#fb923c" />
                      </View>
                      <View>
                        <RestyleText variant="md" color="text" fontWeight="semibold">
                          Login Streak
                        </RestyleText>
                        <RestyleText variant="sm" color="textMuted">
                          Keep the momentum!
                        </RestyleText>
                      </View>
                    </View>
                    <RestyleText variant="3xl" color="#fb923c" fontWeight="bold" marginBottom={12}>
                      {timer.streak || 0} Days
                    </RestyleText>
                    <View
                      style={{
                        backgroundColor: isDark ? '#374151' : '#e5e7eb',
                        borderRadius: 4,
                        height: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#fb923c',
                          borderRadius: 4,
                          height: 8,
                          width: `${Math.min(80, (timer.streak || 0) * 5)}%`,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <RestyleText variant="xs" color="textMuted">
                        Next milestone
                      </RestyleText>
                      <RestyleText variant="xs" color="#fb923c" fontWeight="medium">
                        80%
                      </RestyleText>
                    </View>
                  </View>
                  
                  {/* Experience Points */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderRadius: 16,
                      padding: 24,
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <View
                        style={{
                          backgroundColor: 'rgba(139, 92, 246, 0.2)',
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <Ionicons name="flash" size={24} color="#a78bfa" />
                      </View>
                      <View>
                        <RestyleText variant="md" color="text" fontWeight="semibold">
                          Experience Points
                        </RestyleText>
                        <RestyleText variant="sm" color="textMuted">
                          Level up your travels
                        </RestyleText>
                      </View>
                    </View>
                    <RestyleText variant="3xl" color="#a78bfa" fontWeight="bold" marginBottom={12}>
                      {timer.xp || 0} XP
                    </RestyleText>
                    <View
                      style={{
                        backgroundColor: isDark ? '#374151' : '#e5e7eb',
                        borderRadius: 4,
                        height: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: '#a78bfa',
                          borderRadius: 4,
                          height: 8,
                          width: `${Math.min(60, (timer.xp || 0) / 10)}%`,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <RestyleText variant="xs" color="textMuted">
                        Next level
                      </RestyleText>
                      <RestyleText variant="xs" color="#a78bfa" fontWeight="medium">
                        60%
                      </RestyleText>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Travel Information Dashboard */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderRadius: 16,
                padding: 32,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#e5e7eb',
                marginBottom: 32,
              }}
            >
              <RestyleText variant="2xl" color="text" fontWeight="bold" marginBottom={6}>
                Travel Information
              </RestyleText>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      borderRadius: 20,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons name="card" size={24} color={isDark ? '#4ade80' : '#16a34a'} />
                  </View>
                  <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={4}>
                    Currency
                  </RestyleText>
                  <RestyleText variant="sm" color="text" fontWeight="medium" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
                    {meta?.currency || 'Local Currency'}
                  </RestyleText>
                </View>
                
                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: 20,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                                         <Ionicons name="language" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
                  </View>
                  <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={4}>
                    Language
                  </RestyleText>
                                     <RestyleText variant="sm" color="text" fontWeight="medium" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>
                    {meta?.language || 'Local Language'}
                  </RestyleText>
                </View>
                
                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(251, 191, 36, 0.2)',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(251, 191, 36, 0.2)',
                      borderRadius: 20,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                                         <Ionicons name="calendar" size={24} color={isDark ? '#fbbf24' : '#d97706'} />
                  </View>
                  <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={4}>
                    Best Months
                  </RestyleText>
                                     <RestyleText variant="sm" color="text" fontWeight="medium" style={{ color: isDark ? '#fbbf24' : '#d97706' }}>
                    {meta?.bestMonths || 'Year-round'}
                  </RestyleText>
                </View>
                
                <View
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: 20,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                                         <Ionicons name="train" size={24} color={isDark ? '#a5b4fc' : '#6366f1'} />
                  </View>
                  <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={4}>
                    Transport
                  </RestyleText>
                                     <RestyleText variant="sm" color="text" fontWeight="medium" style={{ color: isDark ? '#a5b4fc' : '#6366f1' }}>
                    {meta?.transport || 'Various'}
                  </RestyleText>
                </View>
              </View>
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
                borderRadius: 16,
                padding: 32,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#e5e7eb',
                marginBottom: 32,
              }}
            >
              <RestyleText variant="2xl" color="text" fontWeight="bold" marginBottom={6}>
                Travel Tips & Fun Facts
              </RestyleText>
              
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
                    borderRadius: 12,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                    <View
                      style={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <Ionicons name={travelFacts[currentFactIndex].icon as any} size={20} color="#60a5fa" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={8}>
                        {travelFacts[currentFactIndex].title}
                      </RestyleText>
                      <RestyleText variant="sm" color="textMuted" lineHeight={20}>
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
                borderRadius: 16,
                padding: 32,
                marginBottom: 32,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Ionicons name="chatbubble" size={24} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <RestyleText variant="2xl" color="text" fontWeight="bold" marginBottom={8}>
                    Ask HollyBobz AI
                  </RestyleText>
                  <RestyleText variant="md" color="text" marginBottom={16}>
                    "What are the must-visit hidden spots in {destination} that most tourists miss?"
                  </RestyleText>
                  <Pressable
                    onPress={() => tellMeMore(`What are the must-visit hidden spots in ${destination} that most tourists miss?`)}
                    style={{
                      backgroundColor: '#ffffff',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: '#8b5cf6', fontSize: 14, fontWeight: '600' }}>
                      Tell me more
                    </Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}
