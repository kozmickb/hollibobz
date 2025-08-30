// Debug script to check AsyncStorage data
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function checkStorage() {
  try {
    console.log('=== DEBUGGING ASYNCSTORAGE ===');

    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('All keys:', keys);

    // Check holiday store data
    const holidayData = await AsyncStorage.getItem('holiday_state_v1');
    console.log('Holiday store data:', holidayData);

    if (holidayData) {
      const parsed = JSON.parse(holidayData);
      console.log('Parsed holiday data:', JSON.stringify(parsed, null, 2));
      console.log('Timers count:', parsed.timers?.length || 0);
      console.log('Archived count:', parsed.archivedTimers?.length || 0);

      if (parsed.timers && parsed.timers.length > 0) {
        console.log('First timer:', JSON.stringify(parsed.timers[0], null, 2));
      }
    } else {
      console.log('No holiday store data found!');
    }

  } catch (error) {
    console.error('Error checking storage:', error);
  }
}

checkStorage();
