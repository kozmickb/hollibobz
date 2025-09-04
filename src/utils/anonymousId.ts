import AsyncStorage from '@react-native-async-storage/async-storage';

const ANONYMOUS_ID_KEY = 'anonymous_user_id';

/**
 * Generate a random anonymous ID
 */
function generateAnonymousId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `anon_${timestamp}_${random}`;
}

/**
 * Get or create an anonymous user ID
 * Stores the ID in AsyncStorage for persistence
 */
export async function getAnonymousId(): Promise<string> {
  try {
    // Try to get existing ID from storage
    const existingId = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
    
    if (existingId) {
      return existingId;
    }
    
    // Generate new ID if none exists
    const newId = generateAnonymousId();
    await AsyncStorage.setItem(ANONYMOUS_ID_KEY, newId);
    
    return newId;
  } catch (error) {
    console.error('Error getting anonymous ID:', error);
    // Fallback to generated ID if storage fails
    return generateAnonymousId();
  }
}

/**
 * Clear the stored anonymous ID
 * Useful for testing or user logout
 */
export async function clearAnonymousId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_ID_KEY);
  } catch (error) {
    console.error('Error clearing anonymous ID:', error);
  }
}
