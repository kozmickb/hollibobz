import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Pressable, Platform, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from '../components/ui/Text';
import { useHolidayStore } from '../store/useHolidayStore';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { formatDistanceToNow } from 'date-fns';

type Nav = NativeStackNavigationProp<RootStackParamList, "Trips">;

export function TripsScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark } = useTheme();
  const { trips } = useHolidayStore();

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
        
        <Pressable
          onPress={() => navigation.navigate('AddTimer')}
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
      </View>

      {/* Main Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {trips.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingVertical: 60 
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
              onPress={() => navigation.navigate('AddTimer')}
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
          <View style={{ gap: 16 }}>
            {trips.map((trip) => (
              <Pressable
                key={trip.id}
                onPress={() => navigation.navigate('TimerDrilldown', { timerId: trip.id })}
                style={{
                  backgroundColor: isDark ? "#374151" : "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: isDark ? "#4b5563" : "#e5e7eb",
                  shadowColor: isDark ? "#000" : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <RestyleText variant="lg" color="text" fontWeight="bold">
                      {trip.destination}
                    </RestyleText>
                    <RestyleText variant="sm" color="textMuted" marginTop={4}>
                      {formatDistanceToNow(new Date(trip.date), { addSuffix: true })}
                    </RestyleText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="people" size={16} color={isDark ? "#6b7280" : "#6b7280"} />
                        <RestyleText variant="xs" color="textMuted">
                          {trip.adults + trip.children} travelers
                        </RestyleText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="calendar" size={16} color={isDark ? "#6b7280" : "#6b7280"} />
                        <RestyleText variant="xs" color="textMuted">
                          {trip.days} days
                        </RestyleText>
                      </View>
                    </View>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isDark ? "#6b7280" : "#6b7280"} 
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
