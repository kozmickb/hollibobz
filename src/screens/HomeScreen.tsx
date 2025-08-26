import React, { useMemo, useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView, Alert, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";
import { ThemedButton } from "../components/ThemedButton";
import { TimerCard } from "../components/TimerCard";
import { useThemeStore } from '../store/useThemeStore';
import { BurgerMenuButton } from '../components/BurgerMenuButton';
import { TripTickLogo } from '../components/TripTickLogo';
import { CustomAlert } from "../components/CustomAlert";
import { CountdownDisplay } from "../components/CountdownDisplay";


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
  const { isDark } = useThemeStore();
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
    <View style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#F7F7F7' }}>
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={['#FF6B6B', '#FFD93D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: 60,
          paddingBottom: 40,
          paddingHorizontal: 20,
          position: 'relative',
        }}
      >
        {/* Vignette overlay for better contrast */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
          }}
        />
        
        {/* Compact top bar */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TripTickLogo size="lg" />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 24,
                fontFamily: 'Poppins-Bold',
              }}
            >
              TripTick
            </Text>
          </View>
          <BurgerMenuButton />
        </View>

        {/* Hero content */}
        <View style={{ position: 'relative', zIndex: 1 }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Poppins-Medium',
              marginBottom: 8,
            }}
          >
            {getGreeting()}
          </Text>
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 14,
              fontFamily: 'Poppins-Regular',
            }}
          >
            Count down to your next escape
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }}>
        {/* Countdown Display for next trip */}
        {sortedTimers.length > 0 && (
          <View style={{ 
            alignItems: 'center', 
            paddingVertical: 20,
            backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
            margin: 20,
            borderRadius: 16,
          }}>
            <CountdownDisplay 
              daysLeft={getTimerDaysLeft(sortedTimers[0].date)} 
              size="lg" 
              showAnimation={true}
            />
          </View>
        )}
        
        {/* Action buttons */}
        <View style={{ padding: 20, gap: 12 }}>
          <ThemedButton
            title="✈️ Add New Timer"
            onPress={() => navigation.navigate("AddTimer")}
            variant="primary"
            gradient={true}
            size="lg"
          />
          <ThemedButton
            title="🤖 Ask Holly Bobz"
            onPress={() => navigation.navigate("HollyChat")}
            variant="secondary"
            gradient={true}
            size="base"
          />
      </View>

        {/* Active timers */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: 'Poppins-SemiBold',
              color: isDark ? '#FFFFFF' : '#333333',
              marginBottom: 16,
            }}
          >
            Your Trips
          </Text>

          {sortedTimers.length === 0 ? (
            <View
              style={{
                backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
                borderRadius: 20,
                padding: 40,
                alignItems: 'center',
                marginBottom: 20,
                borderWidth: 2,
                borderColor: isDark ? '#374151' : '#E5E5E5',
                borderStyle: 'dashed',
              }}
            >
              <Ionicons name="airplane-outline" size={64} color={isDark ? '#666666' : '#999999'} />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Poppins-SemiBold',
                  color: isDark ? '#FFFFFF' : '#333333',
                  textAlign: 'center',
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                No trips yet
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Poppins-Regular',
                  color: isDark ? '#CCCCCC' : '#666666',
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                Add your first and let the countdown begin.
              </Text>
              <ThemedButton
                title="✈️ Add Your First Trip"
                onPress={() => navigation.navigate("AddTimer")}
                variant="primary"
                gradient={true}
                size="lg"
              />
            </View>
          ) : (
            <View style={{ gap: 16, marginBottom: 20 }}>
              {sortedTimers.map((timer) => (
                <TimerCard
                  key={timer.id}
                  destination={timer.destination}
                  date={timer.date}
                  daysLeft={getTimerDaysLeft(timer.date)}
                  createdAt={timer.createdAt}
                  onPress={() => navigation.navigate("TimerDetail", { timerId: timer.id })}
                />
              ))}
            </View>
          )}
        </View>

        {/* Archived section */}
        {archived.length > 0 && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Poppins-SemiBold',
                color: isDark ? '#CCCCCC' : '#666666',
                marginBottom: 12,
              }}
            >
              Archived Trips
            </Text>
            
            <View
              style={{
                backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
                borderRadius: 16,
                padding: 16,
              }}
            >
              {archived.map((timer, index) => (
                <View
                  key={timer.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: index < archived.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? '#444444' : '#E5E5E5',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Poppins-SemiBold',
                      color: isDark ? '#FFFFFF' : '#333333',
                      marginBottom: 4,
                    }}
                  >
                    {timer.destination}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Poppins-Regular',
                      color: isDark ? '#CCCCCC' : '#666666',
                      marginBottom: 8,
                    }}
                  >
                    {new Date(timer.date).toLocaleDateString('en-GB')}
                  </Text>
                  
                  <ThemedButton
                    title="Restore"
                    onPress={() => restore(timer.id)}
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