import React, { useEffect, useState } from "react";
import { View, Text, Pressable, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { TripsStackParamList } from "../navigation/AppNavigator";
import { useThemeStore } from "../store/useThemeStore";
import { tripStore } from "../lib/tripStore";
import { Trip } from "../entities/trip";
import { formatDestinationName } from "../utils/destinationImages";
import Checklist from "../features/checklist/Checklist";

type ChecklistScreenRouteProp = RouteProp<TripsStackParamList, "Checklist">;
type ChecklistScreenNavigationProp = NativeStackNavigationProp<TripsStackParamList, "Checklist">;

export default function ChecklistScreen() {
  const route = useRoute<ChecklistScreenRouteProp>();
  const navigation = useNavigation<ChecklistScreenNavigationProp>();
  const { isDark } = useThemeStore();
  const { tripId } = route.params;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrip() {
      try {
        const foundTrip = await tripStore.get(tripId);
        setTrip(foundTrip);
        if (!foundTrip) {
          setError("Trip not found");
        }
      } catch (err) {
        setError("Failed to load trip");
        console.error("Error loading trip:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadTrip();
  }, [tripId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#FEF7ED' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.centered}>
          <Text style={[styles.text, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
            Loading checklist...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !trip) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#FEF7ED' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)' }]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#F3F4F6' : '#F97316'}
            />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
            Checklist
          </Text>
        </View>
        
        <View style={styles.centered}>
          <View style={[styles.errorCard, { 
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
          }]}>
            <Ionicons
              name="alert-circle"
              size={48}
              color={isDark ? '#F87171' : '#EF4444'}
              style={styles.errorIcon}
            />
            <Text style={[styles.errorTitle, { color: isDark ? '#F87171' : '#EF4444' }]}>
              {error || "Trip not found"}
            </Text>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.button, { backgroundColor: isDark ? '#A78BFA' : '#8B5CF6' }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip.checklist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#FEF7ED' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)' }]}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#F3F4F6' : '#F97316'}
            />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
              {trip.title}
            </Text>
            {trip.timerContext && (
              <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {formatDestinationName(trip.timerContext.destination)} • {trip.timerContext.duration} days
                {trip.timerContext.date && ` • ${new Date(trip.timerContext.date).toLocaleDateString()}`}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.centered}>
          <View style={[styles.emptyCard, { 
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)'
          }]}>
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={isDark ? '#9CA3AF' : '#6B7280'}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyTitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
              No checklist yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Ask Holly Bobz to create an itinerary for this trip to generate a checklist.
            </Text>
            <Pressable
              onPress={() => {
                // Navigate to chat with this trip context
                navigation.getParent()?.navigate('ChatTab', {
                  screen: 'HollyChat',
                  params: { tripId: trip.id }
                });
              }}
              style={[styles.button, { backgroundColor: isDark ? '#14B8A6' : '#F97316' }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Chat with Holly Bobz
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.buttonSecondary, { borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(251, 146, 60, 0.2)' }]}
            >
              <Text style={[styles.buttonSecondaryText, { color: isDark ? '#F3F4F6' : '#F97316' }]}>
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#FEF7ED' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)' }]}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#F3F4F6' : '#F97316'}
          />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: isDark ? '#F3F4F6' : '#1F2937' }]}>
            {trip.title}
          </Text>
          {trip.timerContext && (
            <Text style={[styles.headerSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {trip.timerContext.destination} • {trip.timerContext.duration} days
              {trip.timerContext.date && ` • ${new Date(trip.timerContext.date).toLocaleDateString()}`}
            </Text>
          )}
        </View>
        {trip.checklist && (
          <View style={{
            backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
            borderColor: isDark ? 'rgba(16,185,129,0.35)' : 'rgba(5,150,105,0.35)',
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginRight: 8,
          }}>
            <Text style={{ color: isDark ? '#34D399' : '#065F46', fontFamily: 'Poppins-SemiBold' }}>Checklist</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {!trip.archived && (
            <Pressable
              onPress={async () => {
                try {
                  await tripStore.archive(trip.id);
                  const updated = await tripStore.get(trip.id);
                  setTrip(updated);
                } catch (e) {
                  console.warn('Failed to archive checklist:', e);
                }
              }}
              style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.08)' }]}
            >
              <Ionicons name="archive" size={18} color={isDark ? '#F3F4F6' : '#F97316'} />
            </Pressable>
          )}
          {trip.archived && (
            <Pressable
              onPress={async () => {
                try {
                  await tripStore.restore(trip.id);
                  const updated = await tripStore.get(trip.id);
                  setTrip(updated);
                } catch (e) {
                  console.warn('Failed to restore checklist:', e);
                }
              }}
              style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}
            >
              <Ionicons name="refresh" size={18} color={isDark ? '#34D399' : '#059669'} />
            </Pressable>
          )}
          <Pressable
            onPress={async () => {
              try {
                await tripStore.delete(trip.id);
                navigation.goBack();
              } catch (e) {
                console.warn('Failed to delete checklist:', e);
              }
            }}
            style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)' }]}
          >
            <Ionicons name="trash" size={18} color={isDark ? '#FCA5A5' : '#DC2626'} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <Checklist 
          doc={trip.checklist} 
          storageKey={`checklist:${tripId}`}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  errorCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 320,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  buttonSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});
