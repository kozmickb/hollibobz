import React, { useMemo, useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";
import { useThemeStore } from '../store/useThemeStore';
import { BurgerMenuButton } from '../components/BurgerMenuButton';
import { TripTickLogo } from '../components/TripTickLogo';
import { CustomAlert } from "../components/CustomAlert";
import { CountdownDisplay } from "../components/CountdownDisplay";
import { HeroBackground } from "../components/HeroBackground";
import { Box } from "../components/ui/Box";
import { Text as RestyleText } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { TripTickPalette } from "../theme/tokens";


// Try to import confetti with fallback
let ConfettiCannon: any = null;
try {
  ConfettiCannon = require("react-native-confetti-cannon").default;
} catch (error) {
  console.log("Confetti not available:", error);
}

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const timers = useHolidayStore((s) => s.timers);
  const archived = useHolidayStore((s) => s.archivedTimers);
  const restore = useHolidayStore((s) => s.restoreTimer);
  const purge = useHolidayStore((s) => s.purgeArchive);
  const { colorScheme } = useThemeStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevTimerCount, setPrevTimerCount] = useState(timers.length);
  const [showPurgeAlert, setShowPurgeAlert] = useState(false);

  // Show confetti when a new timer is added
  useEffect(() => {
    if (timers.length > prevTimerCount) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setPrevTimerCount(timers.length);
  }, [timers.length, prevTimerCount]);

  const sortedTimers = useMemo(() => {
    return [...timers].sort((a, b) => {
      const now = new Date().getTime();
      const aDays = Math.ceil((new Date(a.date).getTime() - now) / (1000 * 60 * 60 * 24));
      const bDays = Math.ceil((new Date(b.date).getTime() - now) / (1000 * 60 * 60 * 24));
      return aDays - bDays;
    });
  }, [timers]);

  const getTimerDaysLeft = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getGreeting = () => {
    const nextTrip = sortedTimers[0];
    if (!nextTrip) return "Ready for your next adventure?";
    
    const daysLeft = getTimerDaysLeft(nextTrip.date);
    if (daysLeft <= 0) return "Your trip is here! 🎉";
    if (daysLeft <= 7) return "Your trip is almost here! ✈️";
    if (daysLeft <= 30) return "Exciting times ahead! 🌟";
    return "Start dreaming of your next getaway! 🏖️";
  };

  return (
    <Box flex={1} backgroundColor="bg">
      {/* Hero Section with TripTick Background */}
      <Box position="relative" paddingTop={60} paddingBottom={40} paddingHorizontal={20}>
        <HeroBackground type="wave" height={200} />
        
        {/* Compact top bar */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={24}>
          <Box flexDirection="row" alignItems="center" gap={8}>
            <TripTickLogo size="lg" />
            <RestyleText variant="2xl" color="text" fontWeight="bold">
              TripTick
            </RestyleText>
          </Box>
          <BurgerMenuButton />
        </Box>

        {/* Hero content */}
        <Box position="relative" zIndex={1}>
          <RestyleText variant="lg" color="text" marginBottom={8}>
            {getGreeting()}
          </RestyleText>
          <RestyleText variant="sm" color="textMuted">
            Count down to your next escape
          </RestyleText>
        </Box>
      </Box>
        


      <ScrollView style={{ flex: 1 }}>
        {/* Countdown Display for next trip */}
        {sortedTimers.length > 0 && (
          <Box 
            alignItems="center" 
            paddingVertical={20}
            backgroundColor="surface"
            margin={20}
            borderRadius="lg"
            shadowColor="scrim"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
          >
            <CountdownDisplay 
              daysLeft={getTimerDaysLeft(sortedTimers[0].date)} 
              size="lg" 
              showAnimation={true}
            />
          </Box>
        )}
        
        {/* Action buttons */}
        <Box padding={20} gap={12}>
          <Button
            onPress={() => navigation.navigate("AddTimer")}
            variant="primary"
          >
            ✈️ Add New Timer
          </Button>
          <Button
            onPress={() => navigation.navigate("HollyChat")}
            variant="secondary"
          >
            🤖 Ask Holly Bobz
          </Button>
        </Box>

        {/* Active timers */}
        <Box paddingHorizontal={20}>
          <RestyleText variant="xl" color="text" fontWeight="semibold" marginBottom={16}>
            Your Trips
          </RestyleText>

          {sortedTimers.length === 0 ? (
            <Box
              backgroundColor="surface"
              borderRadius="xl"
              padding={40}
              alignItems="center"
              marginBottom={20}
              borderWidth={2}
              borderColor="textMuted"
              borderStyle="dashed"
            >
              <Ionicons name="airplane-outline" size={64} color={TripTickPalette.textMuted} />
              <RestyleText variant="lg" color="text" textAlign="center" marginTop={16} marginBottom={8}>
                No trips yet
              </RestyleText>
              <RestyleText variant="md" color="textMuted" textAlign="center" marginBottom={24}>
                Add your first and let the countdown begin.
              </RestyleText>
              <Button
                onPress={() => navigation.navigate("AddTimer")}
                variant="primary"
              >
                ✈️ Add Your First Trip
              </Button>
            </Box>
          ) : (
            <Box gap={16} marginBottom={20}>
              {sortedTimers.map((timer) => (
                <Box
                  key={timer.id}
                  backgroundColor="surface"
                  borderRadius="lg"
                  padding={16}
                  borderWidth={1}
                  borderColor="textMuted"
                  onTouchEnd={() => navigation.navigate("TimerDetail", { timerId: timer.id })}
                >
                  <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={4}>
                    {timer.destination}
                  </RestyleText>
                  <RestyleText variant="sm" color="textMuted" marginBottom={8}>
                    {new Date(timer.date).toLocaleDateString('en-GB')}
                  </RestyleText>
                  <RestyleText variant="md" color="primary">
                    {getTimerDaysLeft(timer.date)} days to go
                  </RestyleText>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Archived section */}
        {archived.length > 0 && (
          <Box paddingHorizontal={20} paddingBottom={40}>
            <RestyleText variant="md" color="textMuted" marginBottom={12}>
              Archived Trips
            </RestyleText>
            
            <Box
              backgroundColor="surface"
              borderRadius="lg"
              padding={16}
            >
              {archived.map((timer, index) => (
                <Box
                  key={timer.id}
                  paddingVertical={12}
                  borderBottomWidth={index < archived.length - 1 ? 1 : 0}
                  borderBottomColor="textMuted"
                >
                  <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={4}>
                    {timer.destination}
                  </RestyleText>
                  <RestyleText variant="sm" color="textMuted" marginBottom={8}>
                    {new Date(timer.date).toLocaleDateString('en-GB')}
                  </RestyleText>
                  
                  <Button
                    onPress={() => restore(timer.id)}
                    variant="ghost"
                  >
                    Restore
                  </Button>
                    variant="outline"
                    size="sm"
                  />
                </View>
              ))}
              
              <View style={{ marginTop: 16 }}>
                <ThemedButton
                  title="Empty Archive"
                  onPress={async () => {
                    if (Platform.OS === 'web') {
                      setShowPurgeAlert(true);
                    } else {
                      Alert.alert("Empty Archive", "Delete all archived timers permanently?", [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Delete All", 
                          style: "destructive", 
                          onPress: async () => {
                            await purge();
                          }
                        },
                      ]);
                    }
                  }}
                  variant="destructive"
                  size="sm"
                />
              </View>
            </View>
        </View>
      )}
      </ScrollView>

      {/* Confetti for new timer creation */}
      {showConfetti && ConfettiCannon && (
        <>
          <ConfettiCannon
            count={80}
            origin={{ x: -50, y: 0 }}
            autoStart
            fadeOut
            explosionSpeed={350}
            fallSpeed={2000}
            colors={['#e11d48', '#f97316', '#22c55e', '#0ea5e9', '#8b5cf6']}
          />
          <ConfettiCannon
            count={80}
            origin={{ x: 50, y: 0 }}
            autoStart
            fadeOut
            explosionSpeed={350}
            fallSpeed={2000}
            colors={['#e11d48', '#f97316', '#22c55e', '#0ea5e9', '#8b5cf6']}
          />
        </>
      )}

      {/* Custom Alert for Web */}
      <CustomAlert
        visible={showPurgeAlert}
        title="Empty Archive"
        message="Delete all archived timers permanently?"
        buttons={[
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete All", 
            style: "destructive", 
            onPress: async () => {
              await purge();
            }
          },
        ]}
        onClose={() => setShowPurgeAlert(false)}
      />
    </View>
  );
}