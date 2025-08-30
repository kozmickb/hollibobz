import * as Calendar from "expo-calendar";
import { Platform, Alert } from "react-native";

export type CalendarAuth =
  | "none"
  | "writeOnly"
  | "full";

export async function ensureCalendarPermission(
  desired: CalendarAuth = "full"
): Promise<boolean> {
  try {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Calendar permissions not available on web platform');
      return false;
    }

    // Never request at import time. Only call this inside a user action.
    const getStatus = async () => {
      const cal = await Calendar.getCalendarPermissionsAsync();
      return cal;
    };

    const requestWriteOnly = async () => {
      // iOS 17 supports write only. On older iOS this falls back to full.
      // Expo abstracts platform differences.
      return Calendar.requestCalendarPermissionsAsync({
        writeOnly: true
      } as any);
    };

    const requestFull = async () => {
      return Calendar.requestCalendarPermissionsAsync();
    };

    let status = await getStatus();

    if (status.status === "granted") return true;

    if (desired === "writeOnly") {
      const res = await requestWriteOnly();
      return res.status === "granted";
    } else {
      const res = await requestFull();
      return res.status === "granted";
    }
  } catch (e) {
    console.warn("Calendar permission error", e);
    return false;
  }
}

export async function ensureRemindersPermission(
  desired: CalendarAuth = "full"
): Promise<boolean> {
  try {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Reminders permissions not available on web platform');
      return false;
    }

    const getStatus = async () => {
      return Calendar.getRemindersPermissionsAsync();
    };

    const requestWriteOnly = async () => {
      return Calendar.requestRemindersPermissionsAsync({
        writeOnly: true
      } as any);
    };

    const requestFull = async () => {
      return Calendar.requestRemindersPermissionsAsync();
    };

    let status = await getStatus();
    if (status.status === "granted") return true;

    if (desired === "writeOnly") {
      const res = await requestWriteOnly();
      return res.status === "granted";
    } else {
      const res = await requestFull();
      return res.status === "granted";
    }
  } catch (e) {
    console.warn("Reminders permission error", e);
    return false;
  }
}

// Safe calendar operations that automatically handle permissions
export async function withCalendarPermission<T>(
  operation: () => Promise<T>,
  desired: CalendarAuth = "full"
): Promise<T | null> {
  const hasPermission = await ensureCalendarPermission(desired);
  if (!hasPermission) {
    console.warn('Calendar operation blocked due to insufficient permissions');
    return null;
  }

  try {
    return await operation();
  } catch (error) {
    console.error('Error executing calendar operation:', error);
    return null;
  }
}

export async function withRemindersPermission<T>(
  operation: () => Promise<T>,
  desired: CalendarAuth = "full"
): Promise<T | null> {
  const hasPermission = await ensureRemindersPermission(desired);
  if (!hasPermission) {
    console.warn('Reminders operation blocked due to insufficient permissions');
    return null;
  }

  try {
    return await operation();
  } catch (error) {
    console.error('Error executing reminders operation:', error);
    return null;
  }
}

// Convenience functions for common operations
export async function getCalendars(): Promise<Calendar.Calendar[] | null> {
  return withCalendarPermission(async () => {
    return await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  });
}

export async function createCalendarEvent(
  calendarId: string,
  eventDetails: Calendar.Event
): Promise<string | null> {
  return withCalendarPermission(async () => {
    return await Calendar.createEventAsync(calendarId, eventDetails);
  });
}

export async function getCalendarEvents(
  calendarIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Calendar.Event[] | null> {
  return withCalendarPermission(async () => {
    return await Calendar.getEventsAsync(calendarIds, startDate, endDate);
  });
}
