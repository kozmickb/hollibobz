# Calendar Permissions Implementation

This document explains the safe calendar permissions implementation for the TripTick Expo app.

## Overview

The app now uses a safe permission guard that prevents automatic calendar API access and ensures all calendar operations are triggered by user actions only.

## Configuration Changes

### iOS 17+ Privacy Keys

Updated `app.config.ts` with proper iOS 17+ privacy keys:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCalendarsFullAccessUsageDescription": "We use your calendar to read and update trip events you create.",
        "NSCalendarsWriteOnlyAccessUsageDescription": "We add trip events to your calendar without reading other entries.",
        "NSRemindersFullAccessUsageDescription": "We use reminders to read and manage trip tasks you create.",
        "NSRemindersWriteOnlyAccessUsageDescription": "We add trip reminders without reading other entries."
      }
    }
  }
}
```

### Android Permissions

Android permissions are already properly configured:
```json
{
  "expo": {
    "android": {
      "permissions": ["READ_CALENDAR", "WRITE_CALENDAR", ...]
    }
  }
}
```

## Permission Helper

The `src/lib/calendarPermissions.ts` file provides safe permission handling:

### Main Functions

- `ensureCalendarPermission(desired?: CalendarAuth)` - Request calendar permissions
- `ensureRemindersPermission(desired?: CalendarAuth)` - Request reminders permissions
- `withCalendarPermission(operation, desired?)` - Safe wrapper for calendar operations
- `withRemindersPermission(operation, desired?)` - Safe wrapper for reminders operations

### Permission Types

```typescript
type CalendarAuth = "none" | "writeOnly" | "full";
```

## Safe Usage Patterns

### ❌ DON'T DO THIS (Eager Permission Request)
```typescript
// In component or app initialization
useEffect(() => {
  ensureCalendarPermission(); // ❌ Never call at startup
}, []);
```

### ✅ DO THIS (User-Driven Permission Request)
```typescript
// In a button press handler
const handleAddToCalendar = async () => {
  const ok = await ensureCalendarPermission("full");
  if (!ok) {
    alert("Please allow calendar access to add this event.");
    return;
  }

  // Safe to use calendar APIs now
  const calendars = await getCalendars();
  // ... rest of calendar logic
};
```

## Example Component

See `src/components/CalendarExample.tsx` for a complete working example.

## Key Benefits

1. **Prevents Crashes**: No more `MissingCalendarPListValueException` errors
2. **User Control**: Permissions only requested when user initiates an action
3. **Platform Safe**: Automatically handles web platform limitations
4. **iOS 17 Compatible**: Uses new separate read/write permission keys
5. **Backward Compatible**: Falls back gracefully on older iOS versions

## Build Requirements

### For EAS Managed Builds
Run a new iOS build after updating `app.config.ts`:
```bash
eas build --platform ios
```

### For Local Prebuild
```bash
npx expo prebuild -p ios
cd ios && pod install
```

### For Android
Run a new build to update the manifest:
```bash
eas build --platform android
# or for local development
npx expo run:android
```

## Testing

1. Test on iOS device/simulator to ensure permission dialogs appear correctly
2. Test permission denial scenarios
3. Test on web platform (should gracefully skip calendar features)
4. Test on Android devices

## Migration Notes

- All existing calendar code should be wrapped with permission checks
- Remove any automatic permission requests from app startup
- Update imports to use the new `calendarPermissions.ts` helper
- Test thoroughly on both iOS and Android platforms

