import { Platform } from 'react-native';
import { storage } from './storage';
import { Trip, ChecklistDoc } from "../entities/trip";
import { UserStorageManager, STORAGE_KEYS } from "./userStorage";

const KEY = STORAGE_KEYS.trips; // Use new storage key

// Platform-specific storage helpers
const tripStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return storage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return storage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return storage.removeItem(key);
  }
};

// Get user storage manager instance
const userManager = UserStorageManager.getInstance();

async function loadAll(): Promise<Trip[]> {
  try {
    const data = await tripStorage.getItem(KEY);
    return JSON.parse(data || "[]") as Trip[];
  } catch {
    return [];
  }
}

async function saveAll(trips: Trip[]): Promise<void> {
  try {
    await tripStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    console.error('Failed to save trips to storage');
  }
}

export const tripStore = {
  async upsert(trip: Trip): Promise<void> {
    const all = await loadAll();
    const idx = all.findIndex(t => t.id === trip.id);
    const isNewTrip = idx < 0;
    
    if (idx >= 0) {
      all[idx] = trip;
    } else {
      all.push(trip);
    }
    await saveAll(all);
    
    // Update user profile stats for new trips
    if (isNewTrip) {
      try {
        const profile = await userManager.getProfile();
        await userManager.updateStats({
          tripsCreated: profile.stats.tripsCreated + 1,
        });
      } catch (error) {
        console.warn('Failed to update user stats:', error);
      }
    }
  },
  
  async get(id: string): Promise<Trip | null> {
    const all = await loadAll();
    return all.find(t => t.id === id) || null;
  },
  
  async setChecklist(id: string, doc: ChecklistDoc): Promise<void> {
    const trip = await tripStore.get(id);
    if (!trip) return;
    trip.checklist = doc;
    await tripStore.upsert(trip);
  },
  
  async getAll(): Promise<Trip[]> {
    return loadAll();
  },
  
  async delete(id: string): Promise<void> {
    const all = await loadAll();
    const filtered = all.filter(t => t.id !== id);
    await saveAll(filtered);
    
    // Also clean up checklist progress data
    try {
      const checklistKey = `checklist:${id}`;
      await tripStorage.removeItem(checklistKey);
      console.log(`Cleaned up checklist data for trip: ${id}`);
    } catch (error) {
      console.warn('Failed to clean up checklist data:', error);
    }
  },

  async archive(id: string): Promise<void> {
    const all = await loadAll();
    const idx = all.findIndex(t => t.id === id);
    if (idx < 0) return;
    const updated = { ...all[idx], archived: true, archivedAt: new Date().toISOString() };
    all[idx] = updated;
    await saveAll(all);
  },

  async restore(id: string): Promise<void> {
    const all = await loadAll();
    const idx = all.findIndex(t => t.id === id);
    if (idx < 0) return;
    const updated = { ...all[idx], archived: false, archivedAt: undefined };
    all[idx] = updated;
    await saveAll(all);
  },

  // Clean up orphaned checklists that don't have corresponding timers
  async cleanupOrphanedChecklists(activeTimerIds: string[]): Promise<void> {
    try {
      const allTrips = await loadAll();
      
      // Remove any trip that doesn't have a matching active timer ID
      const orphanedTrips = allTrips.filter(trip => {
        return !activeTimerIds.includes(trip.id);
      });

      if (orphanedTrips.length > 0) {
        console.log(`Cleaning up ${orphanedTrips.length} orphaned checklist(s)...`);
        
        for (const trip of orphanedTrips) {
          await this.delete(trip.id);
          console.log(`✓ Removed orphaned checklist: ${trip.title}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup orphaned checklists:', error);
    }
  }
};
