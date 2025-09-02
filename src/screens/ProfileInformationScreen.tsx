import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Platform, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from '../components/ui/Text';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/useThemeStore';
import { ProfileStackParamList } from '../navigation/AppNavigator';
import { UserStorageManager } from '../lib/userStorage';
import { UserProfile } from '../entities/userProfile';
import { useHolidayStore } from '../store/useHolidayStore';

type Nav = NativeStackNavigationProp<ProfileStackParamList, "ProfileInformation">;

export function ProfileInformationScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark } = useThemeStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { timers, archivedTimers } = useHolidayStore();

  const userManager = UserStorageManager.getInstance();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await userManager.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTotalTripDuration = () => {
    return timers.reduce((total, timer) => total + (timer.duration || 0), 0);
  };

  const getUpcomingTripsCount = () => {
    const now = new Date();
    return timers.filter(timer => new Date(timer.date) > now).length;
  };

  const getCompletedTripsCount = () => {
    const now = new Date();
    return timers.filter(timer => {
      const startDate = new Date(timer.date);
      // Calculate end date: start date + duration days
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (timer.duration || 1));
      return endDate <= now;
    }).length;
  };

  const getTotalDestinationsVisited = () => {
    const uniqueDestinations = new Set(timers.map(timer => timer.destination.toLowerCase()));
    return uniqueDestinations.size;
  };

  if (!userProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#1a1a1a" : "#fefefe", justifyContent: 'center', alignItems: 'center' }}>
        <RestyleText variant="lg" color="text" fontWeight="semibold">
          Loading profile...
        </RestyleText>
      </View>
    );
  }

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
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: isDark ? "#374151" : "#fef3c7",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#fbbf24" : "#d97706"} />
          </Pressable>
          <ImageBackground
            source={require('../../assets/odysync _logo.png')}
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
            Profile Information
          </RestyleText>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={{
          backgroundColor: isDark ? "#374151" : "#ffffff",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: isDark ? "#4b5563" : "#fbbf24",
        }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? "#4b5563" : "#f3f4f6",
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              {userProfile.avatar ? (
                <ImageBackground
                  source={{ uri: userProfile.avatar }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={40}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
              )}
            </View>
            <RestyleText variant="xl" color="text" fontWeight="bold">
              {userProfile.name || 'Traveler'}
            </RestyleText>
            <RestyleText variant="sm" color="textMuted">
              Member since {formatDate(userProfile.stats.joinedDate)}
            </RestyleText>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={{ marginBottom: 32 }}>
          <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={16}>
            Your Travel Statistics
          </RestyleText>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {/* Total Trips */}
            <View style={{
              flex: 1,
              minWidth: 140,
              backgroundColor: isDark ? "#374151" : "#ffffff",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? "#4b5563" : "#fbbf24",
            }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="airplane" size={24} color={isDark ? "#5eead4" : "#0d9488"} style={{ marginBottom: 8 }} />
                <RestyleText variant="2xl" color="text" fontWeight="bold">
                  {userProfile.stats.tripsCreated}
                </RestyleText>
                <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
                  Total Trips Created
                </RestyleText>
              </View>
            </View>

            {/* Upcoming Trips */}
            <View style={{
              flex: 1,
              minWidth: 140,
              backgroundColor: isDark ? "#374151" : "#ffffff",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? "#4b5563" : "#fbbf24",
            }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="calendar" size={24} color={isDark ? "#fbbf24" : "#d97706"} style={{ marginBottom: 8 }} />
                <RestyleText variant="2xl" color="text" fontWeight="bold">
                  {getUpcomingTripsCount()}
                </RestyleText>
                <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
                  Upcoming Trips
                </RestyleText>
              </View>
            </View>

            {/* Completed Trips */}
            <View style={{
              flex: 1,
              minWidth: 140,
              backgroundColor: isDark ? "#374151" : "#ffffff",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? "#4b5563" : "#fbbf24",
            }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={24} color={isDark ? "#10b981" : "#059669"} style={{ marginBottom: 8 }} />
                <RestyleText variant="2xl" color="text" fontWeight="bold">
                  {getCompletedTripsCount()}
                </RestyleText>
                <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
                  Completed Trips
                </RestyleText>
              </View>
            </View>

            {/* Destinations Visited */}
            <View style={{
              flex: 1,
              minWidth: 140,
              backgroundColor: isDark ? "#374151" : "#ffffff",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? "#4b5563" : "#fbbf24",
            }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="location" size={24} color={isDark ? "#8b5cf6" : "#7c3aed"} style={{ marginBottom: 8 }} />
                <RestyleText variant="2xl" color="text" fontWeight="bold">
                  {getTotalDestinationsVisited()}
                </RestyleText>
                <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
                  Destinations Visited
                </RestyleText>
              </View>
            </View>
          </View>
        </View>

        {/* Trip History */}
        <View style={{ marginBottom: 32 }}>
          <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={16}>
            Trip History
          </RestyleText>

          <View style={{
            backgroundColor: isDark ? "#374151" : "#ffffff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? "#4b5563" : "#fbbf24",
          }}>
            {timers.length > 0 ? (
              timers.map((timer, index) => (
                <View
                  key={timer.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: index < timers.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isDark ? "#4b5563" : "#f3f4f6",
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons
                      name={new Date(timer.date) > new Date() ? "calendar" : "checkmark-circle"}
                      size={20}
                      color={new Date(timer.date) > new Date()
                        ? (isDark ? "#fbbf24" : "#d97706")
                        : (isDark ? "#10b981" : "#059669")
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <RestyleText variant="md" color="text" fontWeight="medium">
                      {timer.destination}
                    </RestyleText>
                    <RestyleText variant="sm" color="textMuted">
                      {formatDate(timer.date)} • {timer.adults + timer.children} travelers
                    </RestyleText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <RestyleText variant="sm" color="textMuted">
                      {timer.duration} days
                    </RestyleText>
                    <RestyleText variant="xs" color="textMuted">
                      {timer.tripType}
                    </RestyleText>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Ionicons name="airplane-outline" size={48} color={isDark ? "#6b7280" : "#9ca3af"} style={{ marginBottom: 12 }} />
                <RestyleText variant="md" color="textMuted" style={{ textAlign: 'center' }}>
                  No trips yet. Start planning your first adventure!
                </RestyleText>
              </View>
            )}
          </View>
        </View>

        {/* Additional Stats */}
        <View style={{ marginBottom: 40 }}>
          <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={16}>
            Additional Information
          </RestyleText>

          <View style={{
            backgroundColor: isDark ? "#374151" : "#ffffff",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? "#4b5563" : "#fbbf24",
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <RestyleText variant="sm" color="textMuted">
                Total Trip Duration
              </RestyleText>
              <RestyleText variant="sm" color="text" fontWeight="medium">
                {getTotalTripDuration()} days
              </RestyleText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <RestyleText variant="sm" color="textMuted">
                Checklists Completed
              </RestyleText>
              <RestyleText variant="sm" color="text" fontWeight="medium">
                {userProfile.stats.checklistsCompleted}
              </RestyleText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <RestyleText variant="sm" color="textMuted">
                Items Checked
              </RestyleText>
              <RestyleText variant="sm" color="text" fontWeight="medium">
                {userProfile.stats.itemsChecked}
              </RestyleText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <RestyleText variant="sm" color="textMuted">
                Last Activity
              </RestyleText>
              <RestyleText variant="sm" color="text" fontWeight="medium">
                {formatDate(userProfile.stats.lastActivity)}
              </RestyleText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
