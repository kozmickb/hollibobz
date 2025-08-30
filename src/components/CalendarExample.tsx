import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { ensureCalendarPermission, createCalendarEvent, getCalendars } from '../lib/calendarPermissions';
import * as Calendar from 'expo-calendar';

interface Trip {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

interface CalendarExampleProps {
  trip: Trip;
}

export function CalendarExample({ trip }: CalendarExampleProps) {
  const [isAdding, setIsAdding] = useState(false);

  const onAddTripToCalendar = async () => {
    setIsAdding(true);

    try {
      // Step 1: Ensure calendar permission (this is safe to call from user action)
      const ok = await ensureCalendarPermission("full");
      if (!ok) {
        Alert.alert(
          "Calendar Access Required",
          "Please allow calendar access to add this event.",
          [{ text: "OK" }]
        );
        return;
      }

      // Step 2: Get available calendars
      const calendars = await getCalendars();
      if (!calendars || calendars.length === 0) {
        Alert.alert("Error", "No calendars available");
        return;
      }

      // Step 3: Use the first available calendar (or let user choose)
      const defaultCalendar = calendars[0];

      // Step 4: Create the event
      const eventId = await createCalendarEvent(defaultCalendar.id, {
        title: trip.title,
        startDate: trip.start,
        endDate: trip.end,
        location: trip.location,
        notes: `Trip planned with TripTick - ${trip.title}`,
        timeZone: 'UTC'
      });

      if (eventId) {
        Alert.alert("Success", "Trip added to your calendar!");
      } else {
        Alert.alert("Error", "Failed to add trip to calendar");
      }
    } catch (error) {
      console.error('Error adding trip to calendar:', error);
      Alert.alert("Error", "Failed to add trip to calendar");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isAdding && styles.buttonDisabled]}
        onPress={onAddTripToCalendar}
        disabled={isAdding}
      >
        <Text style={[styles.buttonText, isAdding && styles.buttonTextDisabled]}>
          {isAdding ? 'Adding...' : 'Add to Calendar'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        This will request calendar access only when you tap the button.
      </Text>
    </View>
  );
}

// Example usage with minimal create
export async function addTripToCalendarMinimal(trip: Trip) {
  const ok = await ensureCalendarPermission("full");
  if (!ok) {
    alert("Please allow calendar access to add this event.");
    return;
  }

  // Get default calendar
  const defaultCal = await Calendar.getDefaultCalendarAsync();

  // Create event
  await Calendar.createEventAsync(defaultCal.id, {
    title: trip.title,
    startDate: trip.start,
    endDate: trip.end,
    location: trip.location
  });

  alert("Trip added to calendar!");
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
  note: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

