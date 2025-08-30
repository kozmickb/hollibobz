import { create } from "zustand";
import { Platform } from "react-native";
import { hybridStorage } from "../lib/storage";

// Conditionally import notifications only for native platforms
let scheduleHolidayNotifications: (id: string, destination: string, date: string) => Promise<void>;
let cancelHolidayNotifications: (id: string) => Promise<void>;
let cancelAllHolidayNotifications: () => Promise<void>;

if (Platform.OS !== 'web') {
  const notifications = require("../utils/notifications");
  scheduleHolidayNotifications = notifications.scheduleHolidayNotifications;
  cancelHolidayNotifications = notifications.cancelHolidayNotifications;
  cancelAllHolidayNotifications = notifications.cancelAllHolidayNotifications;
} else {
  // No-op functions for web
  scheduleHolidayNotifications = async () => {};
  cancelHolidayNotifications = async () => {};
  cancelAllHolidayNotifications = async () => {};
}

export type Timer = {
  id: string;
  destination: string;
  date: string;      // ISO string
  createdAt: string; // ISO
  // Travel details
  adults: number;
  children: number;
  duration: number;  // Number of days
  // Gamification fields
  streak: number;
  xp: number;
  badges: string[];
  completedQuests: string[];
  lastCheckIn: string; // ISO string
};

type AddInput = { 
  destination: string; 
  date: string; 
  adults: number; 
  children: number; 
  duration: number; 
};

type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  seedQuery: string;
  rewardXP: number;
};

type State = {
  timers: Timer[];
  archivedTimers: Timer[];
  settings: {
    reduceMotion: boolean;
  };
  isHydrated: boolean;
  addTimer: (input: AddInput) => void;
  updateTimer: (id: string, updates: Partial<Pick<Timer, 'destination' | 'date'>>) => Promise<void>;
  archiveTimer: (id: string) => void;
  restoreTimer: (id: string) => void;
  removeTimer: (id: string) => Promise<void>; // hard delete - now async
  purgeArchive: () => Promise<void>; // now async
  // Gamification actions
  checkIn: (timerId: string) => void;
  awardXP: (timerId: string, amount: number) => void;
  grantBadge: (timerId: string, badgeId: string) => void;
  completeQuest: (timerId: string, questId: string) => void;
  updateSettings: (settings: Partial<State['settings']>) => void;
  _hydrate: () => Promise<void>;
};

const STORAGE_KEY = "holiday_state_v1";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useHolidayStore = create<State>((set, get) => ({
  timers: [],
  archivedTimers: [],
  settings: {
    reduceMotion: false,
  },
  isHydrated: false,
  addTimer: (input) => {
    const newTimer = {
      id: makeId(),
      destination: input.destination.trim(),
      date: input.date,
      adults: input.adults,
      children: input.children,
      duration: input.duration,
      createdAt: new Date().toISOString(),
      // Initialize gamification fields
      streak: 0,
      xp: 0,
      badges: [],
      completedQuests: [],
      lastCheckIn: new Date().toISOString(),
    };
    
    set((s) => ({
      timers: [...s.timers, newTimer],
    }));
    
    // Schedule notifications for the new timer
    scheduleHolidayNotifications(newTimer.id, newTimer.destination, newTimer.date)
      .catch((error) => {
        console.error('Failed to schedule notifications:', error);
      });
  },
  updateTimer: async (id, updates) => {
    try {
      console.log(`Updating timer: ${id}`, updates);
      
      // Cancel existing notifications
      await cancelHolidayNotifications(id);
      
      set((s) => {
        const timerIndex = s.timers.findIndex(t => t.id === id);
        if (timerIndex === -1) return s;
        
        const updatedTimer = { ...s.timers[timerIndex], ...updates };
        const newTimers = [...s.timers];
        newTimers[timerIndex] = updatedTimer;
        
        return { timers: newTimers };
      });
      
      // Reschedule notifications with updated data
      const updatedTimer = get().timers.find(t => t.id === id);
      if (updatedTimer) {
        await scheduleHolidayNotifications(updatedTimer.id, updatedTimer.destination, updatedTimer.date);
      }
      
      console.log(`Timer ${id} updated successfully`);
    } catch (error) {
      console.error('Error updating timer:', error);
      throw error;
    }
  },
  archiveTimer: (id) => {
    console.log('archiveTimer called with id:', id);
    set((s) => {
      const t = s.timers.find((x) => x.id === id);
      if (!t) {
        console.log('Timer not found for archiving:', id);
        return s;
      }
      
      console.log('Archiving timer:', t.destination);
      
      // Cancel notifications for archived timer
      cancelHolidayNotifications(id).catch((error) => {
        if (Platform.OS === 'web') {
          console.log('Notification cancellation skipped - web platform');
        } else {
          console.error('Failed to cancel notifications for archived timer:', error);
        }
      });

      // Clean up related checklist when archiving
      (async () => {
        try {
          const { tripStore } = require('../lib/tripStore');
          await tripStore.delete(id);
          console.log(`Cleaned up checklist for archived timer: ${id}`);
        } catch (error) {
          console.warn('Failed to cleanup checklist for archived timer:', error);
        }
      })();
      
      const newState = {
        timers: s.timers.filter((x) => x.id !== id),
        archivedTimers: [t, ...s.archivedTimers],
      };
      
      console.log('Archive complete. Remaining timers:', newState.timers.length, 'Archived:', newState.archivedTimers.length);
      return newState;
    });
  },
  restoreTimer: (id) =>
    set((s) => {
      const t = s.archivedTimers.find((x) => x.id === id);
      if (!t) return s;
      
      // Reschedule notifications for restored timer
      scheduleHolidayNotifications(t.id, t.destination, t.date)
        .catch((error) => {
          console.error('Failed to reschedule notifications for restored timer:', error);
        });
      
      return {
        archivedTimers: s.archivedTimers.filter((x) => x.id !== id),
        timers: [t, ...s.timers],
      };
    }),
  removeTimer: async (id) => {
    try {
      console.log(`removeTimer called with id: ${id}`);
      
      // Cancel notifications for deleted timer (non-blocking)
      cancelHolidayNotifications(id).catch((error) => {
        if (Platform.OS === 'web') {
          console.log('Notification cancellation skipped - web platform');
        } else {
          console.error('Failed to cancel notifications for removed timer:', error);
        }
      });

      // Clean up related checklist when removing timer
      (async () => {
        try {
          const { tripStore } = require('../lib/tripStore');
          await tripStore.delete(id);
          console.log(`Cleaned up checklist for removed timer: ${id}`);
        } catch (error) {
          console.warn('Failed to cleanup checklist for removed timer:', error);
        }
      })();
      
      // Update state without manual persistence (let subscription handle it)
      set((s) => {
        const timerToRemove = s.timers.find((t) => t.id === id);
        if (!timerToRemove) {
          console.log('Timer not found for removal:', id);
          return s;
        }
        
        console.log('Removing timer:', timerToRemove.destination);
        
        const newState = {
          timers: s.timers.filter((t) => t.id !== id),
          archivedTimers: s.archivedTimers.filter((t) => t.id !== id),
        };
        
        console.log(`Timer removed. Remaining timers: ${newState.timers.length}, archived: ${newState.archivedTimers.length}`);
        return newState;
      });
      
      console.log('removeTimer function completed successfully');
      
    } catch (error) {
      console.error('Error removing timer:', error);
      throw error; // Re-throw the error so the calling function can handle it
    }
  },
  
  purgeArchive: async () => {
    try {
      console.log('Purging archive...');
      
      const currentState = get();
      const archivedIds = currentState.archivedTimers.map(t => t.id);
      
      // Cancel notifications for all archived timers (non-blocking)
      archivedIds.forEach(id => {
        cancelHolidayNotifications(id).catch((error) => {
          if (Platform.OS === 'web') {
            console.log('Notification cancellation skipped - web platform');
          } else {
            console.error(`Error cancelling notifications for ${id}:`, error);
          }
        });
      });
      
      // Update state without manual persistence (let subscription handle it)
      set({ archivedTimers: [] });
      
      console.log('Archive purged successfully');
    } catch (error) {
      console.error('Error purging archive:', error);
      // Don't re-throw - just log the error and continue
    }
  },
  // Gamification actions
  checkIn: (timerId) => {
    console.log(`Checking in timer ${timerId}`);
    set((s) => {
      const timer = s.timers.find(t => t.id === timerId);
      if (!timer) {
        console.log(`Timer ${timerId} not found`);
        return s;
      }

      const today = new Date().toDateString();
      const lastCheckIn = new Date(timer.lastCheckIn || timer.createdAt).toDateString();
      
      console.log(`Today: ${today}, Last check-in: ${lastCheckIn}`);
      
      if (today === lastCheckIn) {
        console.log(`Already checked in today for timer ${timerId}`);
        return s; // Already checked in today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      const newStreak = lastCheckIn === yesterdayStr ? (timer.streak || 0) + 1 : 1;
      
      console.log(`New streak for timer ${timerId}: ${newStreak}`);
      
      return {
        timers: s.timers.map(t => 
          t.id === timerId 
            ? { ...t, streak: newStreak, lastCheckIn: new Date().toISOString() }
            : t
        )
      };
    });
  },

  awardXP: (timerId, amount) => {
    console.log(`Awarding ${amount} XP to timer ${timerId}`);
    set((s) => {
      const updatedTimers = s.timers.map(t => 
        t.id === timerId 
          ? { ...t, xp: (t.xp || 0) + amount }
          : t
      );
      console.log(`Updated timers:`, updatedTimers.map(t => ({ id: t.id, xp: t.xp })));
      return { timers: updatedTimers };
    });
  },

  grantBadge: (timerId, badgeId) => {
    console.log(`Granting badge ${badgeId} to timer ${timerId}`);
    set((s) => {
      const updatedTimers = s.timers.map(t => 
        t.id === timerId 
          ? { ...t, badges: [...(t.badges || []), badgeId] }
          : t
      );
      console.log(`Updated timers with badges:`, updatedTimers.map(t => ({ id: t.id, badges: t.badges })));
      return { timers: updatedTimers };
    });
  },

  completeQuest: (timerId, questId) => {
    console.log(`Completing quest ${questId} for timer ${timerId}`);
    set((s) => {
      const updatedTimers = s.timers.map(t => 
        t.id === timerId 
          ? { ...t, completedQuests: [...(t.completedQuests || []), questId] }
          : t
      );
      console.log(`Updated timers with completed quests:`, updatedTimers.map(t => ({ id: t.id, completedQuests: t.completedQuests })));
      return { timers: updatedTimers };
    });
  },

  updateSettings: (newSettings) => {
    set((s) => ({
      settings: { ...s.settings, ...newSettings }
    }));
  },

  _hydrate: async () => {
    try {
      console.log('Starting store hydration...');
      const raw = hybridStorage.getString(STORAGE_KEY);
      console.log('Raw data from storage:', raw);

      if (!raw) {
        console.log('No stored data found, setting hydrated to true with empty data');
        set({ isHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw);
      console.log('Parsed data:', parsed);
      const { timers, archivedTimers, settings } = parsed;

      // Migrate existing timers to include gamification fields and travel details
      const migratedTimers = (timers ?? []).map((timer: any) => ({
        ...timer,
        // Travel details (new fields)
        adults: timer.adults ?? 1,
        children: timer.children ?? 0,
        duration: timer.duration ?? 7,
        // Gamification fields
        streak: timer.streak ?? 0,
        xp: timer.xp ?? 0,
        badges: timer.badges ?? [],
        completedQuests: timer.completedQuests ?? [],
        lastCheckIn: timer.lastCheckIn ?? timer.createdAt ?? new Date().toISOString(),
      }));

      const migratedArchivedTimers = (archivedTimers ?? []).map((timer: any) => ({
        ...timer,
        // Travel details (new fields)
        adults: timer.adults ?? 1,
        children: timer.children ?? 0,
        duration: timer.duration ?? 7,
        // Gamification fields
        streak: timer.streak ?? 0,
        xp: timer.xp ?? 0,
        badges: timer.badges ?? [],
        completedQuests: timer.completedQuests ?? [],
        lastCheckIn: timer.lastCheckIn ?? timer.createdAt ?? new Date().toISOString(),
      }));

      console.log('Setting hydrated data - timers:', migratedTimers.length, 'archived:', migratedArchivedTimers.length);

      set({
        timers: migratedTimers,
        archivedTimers: migratedArchivedTimers,
        settings: settings ?? { reduceMotion: false },
        isHydrated: true
      });

      console.log('Store hydration completed successfully');

      // Force a synchronous update to trigger component subscriptions
      setTimeout(() => {
        const currentState = get();
        console.log('Force synchronous update after hydration');
        set({ ...currentState });
      }, 0);
    } catch (error) {
      console.error('Error during store hydration:', error);
      // Set hydrated to true even on error to prevent infinite loading
      set({ isHydrated: true });
    }
  },
}));

// Helper function for immediate persistence
const persistState = () => {
  try {
    const state = useHolidayStore.getState();
    const data = {
      timers: state.timers,
      archivedTimers: state.archivedTimers,
      settings: state.settings
    };
    console.log('Persisting state:', { timersCount: data.timers.length, archivedCount: data.archivedTimers.length, timers: data.timers });
    hybridStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('State persisted successfully');
  } catch (error) {
    console.error('Error persisting state:', error);
  }
};

// persist on any change
let init = false;
let persistenceTimeout: ReturnType<typeof setTimeout> | null = null;

useHolidayStore.subscribe((state) => {
  console.log('STORE SUBSCRIPTION: init:', init, 'timers count:', state.timers?.length || 0, 'isHydrated:', state.isHydrated);

  // Only persist if the store is initialized and has been hydrated
  if (!init || !state.isHydrated) {
    console.log('STORE SUBSCRIPTION: Skipping persistence - store not ready yet');
    return;
  }

  // Synchronous persistence logic
  (async () => {
    // Debounce persistence to avoid race conditions
    if (persistenceTimeout) {
      clearTimeout(persistenceTimeout);
    }

    persistenceTimeout = setTimeout(async () => {
      await persistState();
      persistenceTimeout = null;
    }, 100);
  })();
});

// Initialize store
(async () => {
  try {
    console.log('Starting holiday store initialization...');
    await useHolidayStore.getState()._hydrate();
    init = true;
    console.log('Holiday store initialized successfully');
  } catch (error) {
    console.error('Error initializing holiday store:', error);
    init = true; // Still allow normal operation
  }
})();