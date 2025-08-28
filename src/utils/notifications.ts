import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  // Skip notifications on web platform
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web platform');
    return false;
  }

  try {
    console.log('Requesting notification permissions...');
    
    // Check current permissions first
    const currentPermissions = await Notifications.getPermissionsAsync();
    console.log('Current notification permissions:', currentPermissions);
    
    let status = currentPermissions.status;
    
    // If not granted, request permissions
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
      console.log('Requested notification permissions:', requested);
    }
    
    if (status !== 'granted') {
      console.log('Notification permissions not granted:', status);
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      console.log('Setting up Android notification channel');
      await Notifications.setNotificationChannelAsync('holiday-reminders', {
        name: 'Holiday Reminders',
        description: 'Countdown notifications for your upcoming trips',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    console.log('Notification permissions granted successfully');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleHolidayNotifications(
  timerId: string,
  destination: string,
  date: string
): Promise<void> {
  // Skip notifications on web platform
  if (Platform.OS === 'web') {
    console.log('Notifications skipped - web platform');
    return;
  }

  try {
    console.log(`Scheduling notifications for ${destination} (${timerId})`);
    
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return;
    }

    const holidayDate = new Date(date);
    const now = new Date();
    
    console.log(`Holiday date: ${holidayDate}, Now: ${now}`);
    
    // Calculate notification dates (30, 7, 1 days before)
    const notificationDays = [30, 7, 1];
    let scheduledCount = 0;
    
    for (const days of notificationDays) {
      try {
        const notificationDate = new Date(holidayDate);
        notificationDate.setDate(notificationDate.getDate() - days);
        
        console.log(`Checking ${days} days before: ${notificationDate}`);
        
        // Only schedule if notification date is in the future
        if (notificationDate > now) {
          const content = getNotificationContent(destination, days);
          
          const result = await Notifications.scheduleNotificationAsync({
            identifier: `holiday-${timerId}-${days}d`,
            content,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationDate,
              channelId: Platform.OS === 'android' ? 'holiday-reminders' : undefined,
            },
          });
          
          console.log(`Scheduled notification for ${days} days before: ${result}`);
          scheduledCount++;
        } else {
          console.log(`Skipped ${days} days notification - date in past`);
        }
      } catch (dayError) {
        console.error(`Error scheduling ${days} day notification:`, dayError);
        // Continue with other notifications even if one fails
      }
    }
    
    console.log(`Scheduled ${scheduledCount} notifications for ${destination}`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    // Don't re-throw - allow timer creation to continue even if notifications fail
  }
}

export async function cancelHolidayNotifications(timerId: string): Promise<void> {
  // Skip notifications on web platform
  if (Platform.OS === 'web') {
    console.log('Notification cancellation skipped - web platform');
    return;
  }

  try {
    console.log(`Cancelling notifications for timer: ${timerId}`);
    const identifiers = [`holiday-${timerId}-30d`, `holiday-${timerId}-7d`, `holiday-${timerId}-1d`];
    
    // Check what notifications exist before cancelling
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const timerNotifications = scheduled.filter(n => identifiers.includes(n.identifier));
    
    console.log(`Found ${timerNotifications.length} notifications to cancel for timer ${timerId}`);
    
    if (timerNotifications.length > 0) {
      for (const identifier of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }
      console.log(`Cancelled ${timerNotifications.length} notifications for timer: ${timerId}`);
    } else {
      console.log(`No notifications found to cancel for timer: ${timerId}`);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
    // Don't re-throw - allow deletion to continue even if notifications fail
  }
}

// New function to cancel all holiday notifications (for purge operations)
export async function cancelAllHolidayNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('Notification cancellation skipped - web platform');
    return;
  }

  try {
    console.log('Cancelling all holiday notifications');
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const holidayNotifications = scheduled.filter(n => n.identifier.startsWith('holiday-'));
    
    console.log(`Found ${holidayNotifications.length} holiday notifications to cancel`);
    
    const identifiers = holidayNotifications.map(n => n.identifier);
    if (identifiers.length > 0) {
      for (const identifier of identifiers) {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      }
      console.log(`Cancelled ${identifiers.length} holiday notifications`);
    }
  } catch (error) {
    console.error('Error canceling all notifications:', error);
    // Don't re-throw - allow purge to continue even if notifications fail
  }
}

function getNotificationContent(destination: string, daysLeft: number): Notifications.NotificationContentInput {
  const messages = {
    30: {
      title: `${destination} in 30 days! 🌍`,
      body: `Your trip countdown has begun! Start planning your perfect adventure with Holly Bobz.`,
    },
    7: {
      title: `${destination} in 1 week! ✈️`,
      body: `Your trip is almost here! Time to pack and get excited. Ask Holly for last-minute tips!`,
    },
    1: {
      title: `${destination} tomorrow! 🎉`,
      body: `Your trip starts tomorrow! Have an amazing time and enjoy every moment!`,
    },
  };

  const message = messages[daysLeft as keyof typeof messages] || {
    title: `${destination} is coming up!`,
    body: `Your trip countdown continues. Ask Holly Bobz for travel advice!`,
  };

  return {
    title: message.title,
    body: message.body,
    data: { destination, daysLeft },
    badge: 1,
  };
}
