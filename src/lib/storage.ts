import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// MMKV instance for fast, encrypted local storage
// Note: encryptionKey is not supported on web platform
export const storage = new MMKV({
  id: 'triptick-storage',
  ...(Platform.OS !== 'web' && { encryptionKey: 'triptick-secure-key' }), // In production, use a more secure key
});

// Secure storage for sensitive data (API keys, tokens, etc.)
export class SecureStorage {
  private static instance: SecureStorage;

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    // SecureStore doesn't provide a way to list all keys
    // We'll maintain a separate index in MMKV for this
    const keysString = storage.getString('secure_keys_index');
    return keysString ? JSON.parse(keysString) : [];
  }

  private updateKeysIndex(key: string, action: 'add' | 'remove'): void {
    const keysString = storage.getString('secure_keys_index');
    let keys = keysString ? JSON.parse(keysString) : [];

    if (action === 'add' && !keys.includes(key)) {
      keys.push(key);
    } else if (action === 'remove') {
      keys = keys.filter((k: string) => k !== key);
    }

    storage.set('secure_keys_index', JSON.stringify(keys));
  }

  async setItemAndIndex(key: string, value: string): Promise<void> {
    await this.setItem(key, value);
    this.updateKeysIndex(key, 'add');
  }

  async removeItemAndUpdateIndex(key: string): Promise<void> {
    await this.removeItem(key);
    this.updateKeysIndex(key, 'remove');
  }
}

// Hybrid storage that uses MMKV for general data and SecureStore for sensitive data
export class HybridStorage {
  private secureStorage = SecureStorage.getInstance();

  // For sensitive data (API keys, tokens, personal info)
  async setSecureItem(key: string, value: string): Promise<void> {
    await this.secureStorage.setItemAndIndex(key, value);
  }

  async getSecureItem(key: string): Promise<string | null> {
    return await this.secureStorage.getItem(key);
  }

  async removeSecureItem(key: string): Promise<void> {
    await this.secureStorage.removeItemAndUpdateIndex(key);
  }

  // For general app data (settings, cache, non-sensitive user data)
  setItem(key: string, value: string): void {
    storage.set(key, value);
  }

  getString(key: string): string | undefined {
    return storage.getString(key);
  }

  getNumber(key: string): number | undefined {
    return storage.getNumber(key);
  }

  getBoolean(key: string): boolean | undefined {
    return storage.getBoolean(key);
  }

  delete(key: string): void {
    storage.delete(key);
  }

  contains(key: string): boolean {
    return storage.contains(key);
  }

  clearAll(): void {
    storage.clearAll();
  }
}

// Export singleton instance
export const hybridStorage = new HybridStorage();

// Constants for storage keys
export const STORAGE_KEYS = {
  // Secure keys (API keys, tokens)
  openaiApiKey: 'openai_api_key',
  deepseekApiKey: 'deepseek_api_key',
  grokApiKey: 'grok_api_key',
  anthropicApiKey: 'anthropic_api_key',

  // General keys (app data)
  userProfile: 'user_profile',
  appSettings: 'app_settings',
  stateVersion: 'state_version',
} as const;

// Migration helper for existing AsyncStorage data
export async function migrateFromAsyncStorage(): Promise<void> {
  try {
    // Skip migration on web platform as AsyncStorage is not available
    if (Platform.OS === 'web') {
      console.log('Skipping AsyncStorage migration on web platform');
      hybridStorage.setItem('migration_completed', 'true');
      return;
    }

    const AsyncStorage = require('@react-native-async-storage/async-storage');

    // Migrate API keys to secure storage
    const apiKeys = [
      'EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY',
      'EXPO_PUBLIC_VIBECODE_XAI_API_KEY',
      'DEEPSEEK_API_KEY',
      'ANTHROPIC_API_KEY'
    ];

    for (const key of apiKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        // Determine which secure key to use
        let secureKey: string;
        switch (key) {
          case 'EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY':
            secureKey = STORAGE_KEYS.openaiApiKey;
            break;
          case 'EXPO_PUBLIC_VIBECODE_XAI_API_KEY':
            secureKey = STORAGE_KEYS.grokApiKey;
            break;
          case 'DEEPSEEK_API_KEY':
            secureKey = STORAGE_KEYS.deepseekApiKey;
            break;
          case 'ANTHROPIC_API_KEY':
            secureKey = STORAGE_KEYS.anthropicApiKey;
            break;
          default:
            continue;
        }

        await hybridStorage.setSecureItem(secureKey, value);
        await AsyncStorage.removeItem(key);
        console.log(`Migrated ${key} to secure storage`);
      }
    }

    // Set migration flag
    hybridStorage.setItem('migration_completed', 'true');
    console.log('Migration from AsyncStorage completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}