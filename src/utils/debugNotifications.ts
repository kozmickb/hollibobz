import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Debug utility to check current notification state
export async function debugNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('📱 Debug: Web platform - notifications not supported');
    return;
  }

  try {
    console.log('🔔 === NOTIFICATION DEBUG START ===');
    
    // Check permissions
    const permissions = await Notifications.getPermissionsAsync();
    console.log('📋 Current permissions:', permissions);
    
    // Check scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📅 Total scheduled notifications: ${scheduled.length}`);
    
    // Filter holiday notifications
    const holidayNotifications = scheduled.filter(n => n.identifier.startsWith('holiday-'));
    console.log(`🏖️ Holiday notifications: ${holidayNotifications.length}`);
    
    // Log each holiday notification
    holidayNotifications.forEach(notification => {
      const triggerInfo = notification.trigger ? 
        (notification.trigger as any).date ? 
          new Date((notification.trigger as any).date).toLocaleDateString() : 
          'No date info' : 
        'No trigger';
      console.log(`  - ${notification.identifier}: ${notification.content.title} (${triggerInfo})`);
    });
    
    // Check notification categories (iOS)
    if (Platform.OS === 'ios') {
      const categories = await Notifications.getNotificationCategoriesAsync();
      console.log('📱 iOS Categories:', categories);
    }
    
    // Check notification channels (Android)
    if (Platform.OS === 'android') {
      const channels = await Notifications.getNotificationChannelsAsync();
      console.log('🤖 Android Channels:', channels);
    }
    
    console.log('🔔 === NOTIFICATION DEBUG END ===');
    
  } catch (error) {
    console.error('❌ Debug notifications error:', error);
  }
}

// Clear all notifications (for testing)
export async function clearAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('Web platform - no notifications to clear');
    return;
  }

  try {
    console.log('🧹 Clearing all notifications...');
    
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${scheduled.length} scheduled notifications`);
    
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cleared');
    
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
  }
}
