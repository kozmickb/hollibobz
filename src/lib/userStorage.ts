import { UserProfile, UserData, createDefaultUserProfile } from '../entities/userProfile';
import { Trip } from '../entities/trip';
import { storage, STORAGE_KEYS as SECURE_KEYS, migrateFromAsyncStorage } from './storage';

// Storage keys for organized data
export const STORAGE_KEYS = {
  userProfile: 'odysync:user:profile:v2',
  trips: 'odysync:trips:v2',
  checklists: 'odysync:checklists:v2',
  // Legacy keys for migration
  legacyTrips: 'triptick:trips',
  legacyHolidays: 'holiday_state_v1',
} as const;

// User Profile Management
export class UserStorageManager {
  private static instance: UserStorageManager;
  private userProfile: UserProfile | null = null;

  static getInstance(): UserStorageManager {
    if (!UserStorageManager.instance) {
      UserStorageManager.instance = new UserStorageManager();
    }
    return UserStorageManager.instance;
  }

  // Initialize user profile (create if doesn't exist)
  async initializeProfile(): Promise<UserProfile> {
    try {
      // Check if migration is needed
      const migrationCompleted = await storage.getItem('migration_completed');
      if (!migrationCompleted) {
        await migrateFromAsyncStorage();
      }

      const profileData = await storage.getItem(STORAGE_KEYS.userProfile);

      if (profileData) {
        this.userProfile = JSON.parse(profileData);
        // Migrate if needed
        await this.migrateProfileIfNeeded();
      } else {
        // Create new profile
        this.userProfile = createDefaultUserProfile();
        await this.saveProfile();

        // Migrate legacy data if exists
        await this.migrateLegacyData();
      }

      return this.userProfile;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      this.userProfile = createDefaultUserProfile();
      await this.saveProfile();
      return this.userProfile;
    }
  }

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }
    return this.userProfile!;
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }
    
    this.userProfile = {
      ...this.userProfile!,
      ...updates,
      stats: {
        ...this.userProfile!.stats,
        ...updates.stats,
        lastActivity: new Date().toISOString(),
      }
    };
    
    await this.saveProfile();
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<void> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }

    this.userProfile.preferences = {
      ...this.userProfile.preferences,
      ...preferences,
    };

    await this.saveProfile();
  }

  // Update user avatar
  async updateAvatar(avatarUri: string): Promise<void> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }

    this.userProfile.avatar = avatarUri;
    await this.saveProfile();
  }

  // Remove user avatar
  async removeAvatar(): Promise<void> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }

    this.userProfile.avatar = undefined;
    await this.saveProfile();
  }

  // Update user stats
  async updateStats(stats: Partial<UserProfile['stats']>): Promise<void> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }

    this.userProfile.stats = {
      ...this.userProfile.stats,
      ...stats,
      lastActivity: new Date().toISOString(),
    };

    await this.saveProfile();
  }

  // Save profile to storage
  private async saveProfile(): Promise<void> {
    if (!this.userProfile) return;

    try {
      await storage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(this.userProfile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Migrate profile structure if needed
  private async migrateProfileIfNeeded(): Promise<void> {
    if (!this.userProfile) return;

    // Check if migration is needed based on version
    if (!this.userProfile.data?.version || this.userProfile.data.version < '2.0.0') {
      console.log('Migrating user profile to v2.0.0');
      
      // Add any missing fields with defaults
      const defaultProfile = createDefaultUserProfile();
      this.userProfile = {
        ...defaultProfile,
        ...this.userProfile,
        preferences: {
          ...defaultProfile.preferences,
          ...this.userProfile.preferences,
        },
        stats: {
          ...defaultProfile.stats,
          ...this.userProfile.stats,
        },
        data: {
          ...defaultProfile.data,
          ...this.userProfile.data,
          version: '2.0.0',
        },
      };

      await this.saveProfile();
      console.log('Profile migration completed');
    }
  }

  // Migrate legacy data from old storage format
  private async migrateLegacyData(): Promise<void> {
    try {
      // Check for legacy trip data
      const legacyTrips = await storage.getItem(STORAGE_KEYS.legacyTrips);
      if (legacyTrips) {
        console.log('Migrating legacy trip data');
        const trips = JSON.parse(legacyTrips);

        if (Array.isArray(trips) && trips.length > 0) {
          // Convert to new format and save
          await storage.setItem(STORAGE_KEYS.trips, legacyTrips);

          // Update profile stats
          await this.updateStats({
            tripsCreated: trips.length,
          });
        }
      }

      // Check for legacy holiday data
      const legacyHolidays = await storage.getItem(STORAGE_KEYS.legacyHolidays);
      if (legacyHolidays) {
        console.log('Legacy holiday data found - keeping for timer compatibility');
        // Keep legacy holiday data for timer functionality
      }

    } catch (error) {
      console.error('Error migrating legacy data:', error);
    }
  }

  // Export user data for backup/transfer
  async exportUserData(): Promise<UserData> {
    const profile = await this.getProfile();

    const tripsData = await storage.getItem(STORAGE_KEYS.trips);
    const checklistsData = await storage.getItem(STORAGE_KEYS.checklists);

    return {
      profile,
      trips: tripsData ? JSON.parse(tripsData) : {},
      checklists: checklistsData ? JSON.parse(checklistsData) : {},
    };
  }

  // Import user data from backup
  async importUserData(userData: UserData): Promise<void> {
    try {
      // Save profile
      this.userProfile = userData.profile;
      await this.saveProfile();
      
      // Save trips
      if (userData.trips && Object.keys(userData.trips).length > 0) {
                await storage.setItem(STORAGE_KEYS.trips, JSON.stringify(userData.trips));
      }
      
      // Save checklists
      if (userData.checklists && Object.keys(userData.checklists).length > 0) {
        await storage.setItem(STORAGE_KEYS.checklists, JSON.stringify(userData.checklists));
      }
      
      console.log('User data imported successfully');
    } catch (error) {
      console.error('Error importing user data:', error);
      throw error;
    }
  }

  // Clear all user data (for reset/logout)
  async clearUserData(): Promise<void> {
    try {
      await storage.removeItem(STORAGE_KEYS.userProfile);
      await storage.removeItem(STORAGE_KEYS.trips);
      await storage.removeItem(STORAGE_KEYS.checklists);

      this.userProfile = null;
      console.log('User data cleared');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalKeys: number;
    odysyncKeys: number;
    estimatedSize: string;
  }> {
    try {
      const allKeys = await storage.getAllKeys();
      const odysyncKeys = allKeys.filter(key => key.startsWith('odysync:'));

      // Estimate size by getting all odysync data
      let totalSize = 0;
      for (const key of odysyncKeys) {
        const data = await storage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return {
        totalKeys: allKeys.length,
        odysyncKeys: odysyncKeys.length,
        estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalKeys: 0,
        odysyncKeys: 0,
        estimatedSize: '0 KB',
      };
    }
  }
}
