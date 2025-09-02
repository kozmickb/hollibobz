import React, { useEffect, useMemo, useState, useRef } from "react";
import { View, Text, Alert, ScrollView, Pressable, Share, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { HomeStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";
import { useThemeStore } from "../store/useThemeStore";
import { Ionicons } from '@expo/vector-icons';
import { CountdownDisplay } from "../components/CountdownDisplay";
import { BurgerMenuButton } from '../components/BurgerMenuButton';
import { CustomAlert } from "../components/CustomAlert";
import { QuestCard } from "../components/QuestCard";
import { getQuestsForDestination, getQuestById } from "../features/quests/data";
import { proximityTheme, getGradientColors } from "../utils/proximityTheme";
import { ShareCard } from "../components/ShareCard";
import ViewShot from "react-native-view-shot";

import { Backdrop } from "../components/Backdrop";
import { QuickFactRow } from "../components/QuickFactRow";
import { FAQCard } from "../components/FAQCard";

// New countdown components
import { CountdownRing } from "../components/CountdownRing";
import { MilestoneBanner } from "../components/MilestoneBanner";
import { TeaserCard } from "../components/TeaserCard";

// Odysync UI components
import { Box } from "../components/ui/Box";
import { Text as RestyleText } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { HeroBackground } from "../components/HeroBackground";
import { OdysyncPalette } from "../theme/tokens";

import { buildDefaultMeta, DestinationMeta } from "../features/destination/meta";
import { loadCachedMeta, saveCachedMeta, fetchPexelsBackdrop } from "../features/destination/backdrop";
import { getDestinationImage } from "../utils/destinationImages";
import { generateQuickFacts } from "../features/destination/quickFacts";
import { clearLegacyCachedMeta } from "../features/destination/clearLegacyCache";
import { 
  daysUntil, 
  progressToTrip, 
  hitMilestone, 
  getCachedTeaser, 
  cacheTeaser, 
  buildDailyTeaser, 
  getMilestoneMessage,
  Teaser 
} from "../features/countdown/logic";

type Nav = NativeStackNavigationProp<HomeStackParamList, "TimerDetail">;
type Rt = RouteProp<HomeStackParamList, "TimerDetail">;

export function TimerDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { timerId } = route.params;
  const timer = useHolidayStore((s) => s.timers.find(t => t.id === timerId));
  const { colorScheme, isDark } = useThemeStore();
  const archive = useHolidayStore((s) => s.archiveTimer);
  const hardDelete = useHolidayStore((s) => s.removeTimer);
  const checkIn = useHolidayStore((s) => s.checkIn);
  const awardXP = useHolidayStore((s) => s.awardXP);
  const grantBadge = useHolidayStore((s) => s.grantBadge);
  const completeQuest = useHolidayStore((s) => s.completeQuest);

  const [meta, setMeta] = useState<DestinationMeta | null>(null);
  const [teaser, setTeaser] = useState<Teaser | null>(null);
  const [loadingQuickFacts, setLoadingQuickFacts] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [hasChecklist, setHasChecklist] = useState<boolean>(false);
  const [checklistTripId, setChecklistTripId] = useState<string | null>(null);

  // Meta/backdrop hydrate with AI-generated quick facts
  useEffect(() => {
    // Detect checklist linked to this timer (by exact id or by destination/title)
    (async () => {
      try {
        const { tripStore } = require('../lib/tripStore');
        const allTrips = await tripStore.getAll();
        const exact = allTrips.find((t: any) => t.id === timerId && t.checklist && !t.archived);
        if (exact) {
          setHasChecklist(true);
          setChecklistTripId(exact.id);
          return;
        }
        const byContext = allTrips.find((t: any) => t.timerContext?.destination?.toLowerCase() === (timer?.destination || '').toLowerCase() && t.checklist);
        if (byContext?.archived) {
          setHasChecklist(false);
          setChecklistTripId(null);
          return;
        }
        if (byContext) {
          setHasChecklist(true);
          setChecklistTripId(byContext.id);
          return;
        }
        const byTitle = allTrips.find((t: any) => (t.title || '').toLowerCase().includes((timer?.destination || '').toLowerCase()) && t.checklist && !t.archived);
        if (byTitle) {
          setHasChecklist(true);
          setChecklistTripId(byTitle.id);
          return;
        }
        setHasChecklist(false);
        setChecklistTripId(null);
      } catch (e) {
        setHasChecklist(false);
        setChecklistTripId(null);
      }
    })();
    let mounted = true;
    (async () => {
      if (!timer) return;
      const dest = timer.destination.trim();
      
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
          // Keep empty array rather than show generic placeholders
        }
      }

      // Try to ensure we have an imageUrl
      if (!base.imageUrl) {
        try {
          const imageUrl = getDestinationImage(dest);
          base.imageUrl = imageUrl;
          console.log('Loaded destination image for', dest, ':', imageUrl);
          if (mounted) setMeta({ ...base });
        } catch (error) {
          console.log('Failed to load destination image for', dest, ':', error);
        }
      }

      base.cachedAtISO = new Date().toISOString();
      await saveCachedMeta(dest, base);
    })();
    return () => { mounted = false; };
  }, [timer?.destination]);

  // Teaser hydrate per day
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!timer) return;
      const dl = daysUntil(timer.date);
      const cached = await getCachedTeaser(timer.id);
      if (cached) { 
        if (mounted) setTeaser(cached); 
        return; 
      }
      const t = buildDailyTeaser(timer.id, timer.destination, dl);
      await cacheTeaser(timer.id, t);
      if (mounted) setTeaser(t);
    })();
    return () => { mounted = false; };
  }, [timer?.id, timer?.date]);

  const daysLeft = useMemo(() => {
    if (!timer) return null;
    return daysUntil(timer.date);
  }, [timer]);

  const progressPercent = useMemo(() => {
    if (!timer) return 0;
    
    // For very new timers (less than 5 minutes old), show a minimum 5% progress for new timers to make animation visible
    const now = new Date();
    const created = new Date(timer.createdAt ?? now.toISOString());
    const minutesSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60);
    
    if (minutesSinceCreated < 5) {
      // Show a minimum 5% progress for new timers to make animation visible
      const calculatedProgress = progressToTrip(timer.createdAt ?? new Date().toISOString(), timer.date);
      return Math.max(0.05, calculatedProgress);
    }
    
    return progressToTrip(timer.createdAt ?? new Date().toISOString(), timer.date);
  }, [timer]);

  // Gamification: Check-in and milestone detection
  useEffect(() => {
    if (!timer || daysLeft === null) return;
    
    // Check-in if not already done today
    checkIn(timer.id);
    
    // Award XP for daily check-in (only once per day)
    const today = new Date().toDateString();
    const lastCheckIn = new Date(timer.lastCheckIn).toDateString();
    if (today !== lastCheckIn) {
      awardXP(timer.id, 1);
    }
    
    // Check for milestones and award XP + badges (only once per milestone)
    const milestones = [100, 50, 30, 14, 7, 3, 1, 0];
    if (milestones.includes(daysLeft) && !timer.badges.includes(`milestone-${daysLeft}`)) {
      awardXP(timer.id, 5);
      grantBadge(timer.id, `milestone-${daysLeft}`);
    }
  }, [timer?.id, daysLeft, checkIn, awardXP, grantBadge]);

  const milestone = useMemo(() => {
    if (daysLeft === null) return null;
    return hitMilestone(daysLeft);
  }, [daysLeft]);

  // Quest handling
  const quests = useMemo(() => {
    if (!timer) return [];
    return getQuestsForDestination(timer.destination).slice(0, 3); // Show 3 quests
  }, [timer?.destination]);

  const handleQuestPress = (questId: string) => {
    // Find the quest from the processed quests array (with destination replaced)
    const quest = quests.find(q => q.id === questId);
    if (!quest || !timer) return;
    
    // Navigate to Holly with the quest's seed query
    navigation.getParent()?.navigate('ChatTab', {
      seedQuery: quest.seedQuery, // Pass seedQuery at top level (already has destination replaced)
      context: {
        destination: timer.destination,
        dateISO: timer.date,
        questId: questId, // Pass quest ID to Holly
        questReward: quest.rewardXP, // Pass reward amount
        timerId: timer.id, // Pass timer ID for quest completion
      }
    });
    
    // Don't mark as completed yet - wait for user to actually interact with Holly
    console.log(`Quest ${questId} started: ${quest.title}`);
  };

  // Proximity theme
  const theme = useMemo(() => {
    if (daysLeft === null) return null;
    return proximityTheme(daysLeft);
  }, [daysLeft]);

  const shareCardRef = useRef<ViewShot>(null);
  const heroShareRef = useRef<ViewShot>(null);
  const [showShareError, setShowShareError] = useState(false);

  // Early return after all hooks
  if (!timer) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#1a1a1a' : '#F7F7F7',
        paddingHorizontal: 20,
      }}>
        <Ionicons name="timer-outline" size={48} color="#999999" />
        <Text style={{
          fontSize: 18,
          fontFamily: 'Questrial-Regular',
          color: isDark ? '#CCCCCC' : '#666666',
          textAlign: 'center',
          marginTop: 16,
        }}>
          Timer not found
        </Text>
      </View>
    );
  }

  function onDeleteOrArchive() {
    if (!timer) return;
    
    if (Platform.OS === 'web') {
      setShowDeleteAlert(true);
    } else {
      Alert.alert("Remove timer", "What would you like to do with this trip timer?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Archive", 
          onPress: () => { 
            archive(timer.id); 
            navigation.goBack(); 
          } 
        },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => { 
            await hardDelete(timer.id); 
            navigation.goBack();
          } 
        },
      ]);
    }
  }

  function tellMeMore(query: string) {
    if (!timer) return;
    
    console.log('FAQ Tell me more tapped:', query);
    navigation.getParent()?.navigate("ChatTab", {
      seedQuery: query,
      context: { destination: timer.destination, dateISO: timer.date },
      reset: false,
    });
  }

  async function shareCountdown() {
    if (!timer || daysLeft === null || !heroShareRef.current?.capture) return;
    try {
      // Capture the hero section as PNG
      const uri = await heroShareRef.current.capture();
      
      await Share.share({
        url: uri,
        message: `Counting down to ${timer.destination}! #Odysync`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
      setShowShareError(true);
    }
  }

  const dLabel = timer ? new Date(timer.date).toDateString() : '';

  const seed = `Plan a ${daysLeft && daysLeft > 0 ? "trip" : "stay"} to ${timer?.destination || 'destination'} around ${dLabel}. Create a day by day plan with family friendly options, realistic timings, and travel between sights.`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getGradientColorsForHeader = () => {
    if (daysLeft === null) return ['#FF6B6B', '#FFD93D'];
    return getGradientColors(daysLeft);
  };

  return (
    <Box flex={1} backgroundColor="bg">
      {/* Hero Section */}
      <ViewShot ref={heroShareRef} options={{ format: 'png', quality: 0.9, width: 1080, height: 1920 }}>
        <Box position="relative" height={300}>
          {/* HeroBackground with Odysync styling */}
          <HeroBackground type="peaks" height={300} />
          
          {/* Backdrop with gradient overlay */}
          <Backdrop destination={timer.destination} imageUrl={meta?.imageUrl} />
          <LinearGradient
            colors={['transparent', OdysyncPalette.scrim]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          
          {/* Navigation */}
          <Box
            position="absolute"
            top={60}
            left={20}
            right={20}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            zIndex={10}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Box flexDirection="row" gap={8}>
              <Pressable
                onPress={shareCountdown}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 12,
                  padding: 8,
                }}
              >
                <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
              </Pressable>
              <BurgerMenuButton />
            </Box>
          </Box>

          {/* Countdown Ring - Bottom Left */}
          {daysLeft !== null && (
            <Box
              position="absolute"
              bottom={20}
              left={20}
              zIndex={10}
            >
              <CountdownRing percent={progressPercent} daysLeft={daysLeft} showLabel={true} />
            </Box>
          )}

          {/* Destination Info - Bottom Right */}
          <Box
            position="absolute"
            bottom={20}
            right={20}
            zIndex={10}
            alignItems="flex-end"
          >
            <RestyleText
              variant="2xl"
              color="text"
              fontWeight="bold"
              textAlign="right"
            >
              {timer.destination}
            </RestyleText>
            <RestyleText
              variant="md"
              color="text"
              fontWeight="medium"
              marginTop={4}
              textAlign="right"
              opacity={0.9}
            >
              {formatDate(timer.date)}
            </RestyleText>
          </Box>

          {/* Watermark - Bottom Right */}
          <Box
            position="absolute"
            bottom={8}
            right={8}
            zIndex={5}
          >
            <RestyleText
              variant="xs"
              color="text"
              opacity={0.6}
              textAlign="right"
            >
              Made with Odysync
            </RestyleText>
          </Box>
        </Box>
      </ViewShot>

      {/* Progress Band */}
      {daysLeft !== null && (
        <Box
          backgroundColor="primary"
          paddingHorizontal={20}
          paddingVertical={12}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box flexDirection="row" alignItems="center" gap={16}>
            <Box flexDirection="row" alignItems="center" gap={6}>
              <Ionicons name="flame" size={16} color="#FFFFFF" />
              <RestyleText
                variant="sm"
                color="text"
                fontWeight="semibold"
              >
                Streak {timer.streak || 0}
              </RestyleText>
            </Box>
            <Box width={1} height={16} backgroundColor="whiteOverlay" />
            <Box flexDirection="row" alignItems="center" gap={6}>
              <Ionicons name="star" size={16} color="#FFFFFF" />
              <RestyleText
                variant="sm"
                color="text"
                fontWeight="semibold"
              >
                XP {timer.xp || 0}
              </RestyleText>
            </Box>
          </Box>
          <RestyleText
            variant="sm"
            color="text"
            fontWeight="medium"
          >
            {Math.round(progressPercent * 100)}% to go
          </RestyleText>
        </Box>
      )}

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Countdown Display */}
        {daysLeft !== null && (
          <Box 
            alignItems="center" 
            marginBottom={6}
            paddingVertical={20}
          >
            <CountdownDisplay 
              daysLeft={daysLeft} 
              size="xl" 
              showAnimation={true}
            />
          </Box>
        )}
        
        {/* Actions Section */}
        <Box marginBottom={6} gap={12}>
          {/* Checklist Card */}
          <Box backgroundColor="surface" borderRadius="lg" padding={16} borderWidth={1} borderColor="textMuted">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              <Box flexDirection="row" alignItems="center" gap={10}>
                <Ionicons name="checkmark-circle" size={22} color={hasChecklist ? (colorScheme === 'dark' ? '#10B981' : '#059669') : (colorScheme === 'dark' ? '#6B7280' : '#9CA3AF')} />
                <Box>
                  <RestyleText variant="md" color="text" fontWeight="semibold">
                    Trip Checklist
                  </RestyleText>
                  <RestyleText variant="xs" color="textMuted">
                    {hasChecklist ? 'Open your saved checklist.' : 'No checklist yet. Create one with Holly.'}
                  </RestyleText>
                </Box>
              </Box>
              <Box flexDirection="row" gap={8}>
                <Pressable
                  onPress={() => {
                    if (hasChecklist && checklistTripId) {
                      // Open existing checklist
                      // This page lives under Trips stack
                      navigation.getParent()?.navigate('TripsTab', {
                        screen: 'Checklist',
                        params: { tripId: checklistTripId }
                      });
                    } else {
                      // Guide user to ask Holly to generate an itinerary checklist with timer context
                      navigation.getParent()?.navigate('ChatTab', {
                        seedQuery: `Please generate a detailed trip itinerary with a checklist for ${timer.destination} around ${dLabel}. Return JSON per the app's checklist format.`,
                        context: { destination: timer.destination, dateISO: timer.date, timerId: timer.id, duration: timer.duration, adults: timer.adults, children: timer.children },
                        reset: false,
                      });
                    }
                  }}
                  style={{
                    backgroundColor: hasChecklist ? (colorScheme === 'dark' ? '#10B981' : '#059669') : (colorScheme === 'dark' ? '#374151' : '#F3F4F6'),
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    opacity: 1,
                  }}
                >
                  <Box flexDirection="row" alignItems="center" gap={6}>
                    <Ionicons name={hasChecklist ? 'open' : 'add-circle'} size={18} color={hasChecklist ? '#FFFFFF' : (colorScheme === 'dark' ? '#E5E7EB' : '#111827')} />
                    <RestyleText variant="sm" color="text" fontWeight="semibold" style={{ color: hasChecklist ? '#FFFFFF' : undefined }}>
                      {hasChecklist ? 'Open' : 'Create'}
                    </RestyleText>
                  </Box>
                </Pressable>
              </Box>
            </Box>
          </Box>

          <Box flexDirection="row" gap={12}>
            <Button
              onPress={() =>
                navigation.getParent()?.navigate("ChatTab", {
                  seedQuery: `Plan a trip to ${timer.destination} around ${dLabel}. Create a day by day plan with realistic timings and transit between sights.`,
                  context: { destination: timer.destination, dateISO: timer.date, timerId: timer.id },
                  reset: false,
                })
              }
              variant="primary"
              style={{ flex: 1 }}
            >
              <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
                <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                <RestyleText variant="sm" color="text" fontWeight="semibold">
                  Ask Holly Bobz
                </RestyleText>
              </Box>
            </Button>
            
            <Button
              onPress={shareCountdown}
              variant="secondary"
              style={{ flex: 1 }}
            >
              <Box flexDirection="row" alignItems="center" justifyContent="center" gap={8}>
                <Ionicons name="share" size={20} color="#FFFFFF" />
                <RestyleText variant="sm" color="text" fontWeight="semibold">
                  Share
                </RestyleText>
              </Box>
            </Button>
          </Box>
          
          <Pressable
            onPress={onDeleteOrArchive}
            style={{
              backgroundColor: isDark ? '#374151' : '#F3F4F6',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="archive" size={20} color={isDark ? '#CCCCCC' : '#666666'} />
            <RestyleText variant="sm" color="textMuted" fontWeight="semibold">
              Archive or Delete
            </RestyleText>
          </Pressable>
        </Box>

        {/* Quick Facts - 2x2 Grid */}
        {(meta?.quickFacts?.length || loadingQuickFacts) && (
          <Box marginBottom={6}>
            <RestyleText variant="xl" color="text" fontWeight="semibold" marginBottom={12}>
              Quick Facts
            </RestyleText>
            
            {loadingQuickFacts ? (
              <Box alignItems="center" paddingVertical={20}>
                <RestyleText variant="md" color="textMuted" textAlign="center">
                  Getting destination info...
                </RestyleText>
              </Box>
            ) : (
              <Box flexDirection="row" flexWrap="wrap" gap={8}>
                {meta?.quickFacts?.slice(0, 4).map((q) => (
                  <Box key={q.label} 
                    flex={1}
                    minWidth="45%"
                    backgroundColor="surface"
                    borderRadius="lg"
                    padding={12}
                    borderWidth={1}
                    borderColor="textMuted"
                  >
                    <RestyleText variant="xs" color="textMuted" fontWeight="medium" marginBottom={4}>
                      {q.label}
                    </RestyleText>
                    <RestyleText variant="sm" color="text" fontWeight="semibold">
                      {q.value}
                    </RestyleText>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Daily Teaser */}
        {teaser && (
          <Box marginBottom={6}>
            <RestyleText variant="xl" color="text" fontWeight="semibold" marginBottom={12}>
              Today's Travel Teaser
            </RestyleText>
            <TeaserCard 
              title={teaser.title}
              body={teaser.body}
              onMore={() => tellMeMore(teaser.seedQuery)}
            />
          </Box>
        )}

        {/* FAQ Chips */}
        {meta?.faqs?.length ? (
          <Box marginBottom={6}>
            <RestyleText variant="xl" color="text" fontWeight="semibold" marginBottom={12}>
              Quick Questions
            </RestyleText>
            <Box flexDirection="row" flexWrap="wrap" gap={8}>
              {meta.faqs.slice(0, 6).map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() => tellMeMore(f.query)}
                  style={{
                    backgroundColor: colorScheme === 'dark' ? OdysyncPalette.surface : '#FFFFFF',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: OdysyncPalette.navy500,
                  }}
                >
                  <RestyleText variant="sm" color="text" fontWeight="medium">
                    {f.title}
                  </RestyleText>
                </Pressable>
              ))}
            </Box>
          </Box>
        ) : null}

        {/* Quests */}
        {quests.length > 0 && (
          <Box marginBottom={6}>
            <RestyleText variant="xl" color="text" fontWeight="semibold" marginBottom={12}>
              Travel Quests
            </RestyleText>
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isCompleted={timer.completedQuests?.includes(quest.id) || false}
                onPress={() => handleQuestPress(quest.id)}
              />
            ))}
          </Box>
        )}

        {/* Hidden ShareCard for capturing */}
        <Box position="absolute" left={-1000} top={-1000}>
          <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 0.9 }}>
            <ShareCard
              destination={timer.destination}
              daysLeft={daysLeft || 0}
              imageUrl={meta?.imageUrl}
              size={400}
            />
          </ViewShot>
        </Box>

        {/* Milestone banner */}
        {milestone !== null && (
          <MilestoneBanner label={getMilestoneMessage(milestone, timer.destination)} />
        )}

        {/* Bottom spacing */}
        <Box height={40} />
      </ScrollView>

      {/* Custom Alert for Web */}
      <CustomAlert
        visible={showDeleteAlert}
        title="Remove timer"
        message="What would you like to do with this trip timer?"
        buttons={[
          { text: "Cancel", style: "cancel" },
          { 
            text: "Archive", 
            onPress: () => { 
              archive(timer.id); 
              navigation.goBack(); 
            } 
          },
          { 
            text: "Delete", 
            style: "destructive", 
            onPress: async () => { 
              await hardDelete(timer.id); 
              navigation.goBack();
            } 
          },
        ]}
        onClose={() => setShowDeleteAlert(false)}
      />

      {/* Share Error Alert */}
      <CustomAlert
        visible={showShareError}
        title="Share Failed"
        message="Sorry, we couldn't create your share image. Please try again."
        buttons={[
          { text: "OK", onPress: () => setShowShareError(false) }
        ]}
        onClose={() => setShowShareError(false)}
      />
    </Box>
  );
}