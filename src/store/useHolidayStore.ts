import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleHolidayNotifications, cancelHolidayNotifications, cancelAllHolidayNotifications } from "../utils/notifications";

type Timer = {
  id: string;
  destination: string;
  date: string;      // ISO string
  createdAt: string; // ISO
  // Gamification fields
  streak: number;
  xp: number;
  badges: string[];
  completedQuests: string[];
  lastCheckIn: string; // ISO string
};

type AddInput = { destination: string; date: string };

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
  addTimer: (input: AddInput) => void;
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
  addTimer: (input) => {
    const newTimer = {
      id: makeId(),
      destination: input.destination.trim(),
      date: input.date,
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
  archiveTimer: (id) =>
    set((s) => {
      const t = s.timers.find((x) => x.id === id);
      if (!t) return s;
      
      // Cancel notifications for archived timer
      cancelHolidayNotifications(id).catch((error) => {
        console.error('Failed to cancel notifications for archived timer:', error);
      });
      
      return {
        timers: s.timers.filter((x) => x.id !== id),
        archivedTimers: [t, ...s.archivedTimers],
      };
    }),
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
      console.log(`Removing timer: ${id}`);
      
      // Cancel notifications for deleted timer (non-blocking)
      cancelHolidayNotifications(id).catch((error) => {
        console.error('Failed to cancel notifications for removed timer:', error);
      });
      
      // Update state without manual persistence (let subscription handle it)
      set((s) => {
        const newState = {
          timers: s.timers.filter((t) => t.id !== id),
          archivedTimers: s.archivedTimers.filter((t) => t.id !== id),
        };
        
        console.log(`Timer removed. Remaining timers: ${newState.timers.length}, archived: ${newState.archivedTimers.length}`);
        return newState;
      });
      
    } catch (error) {
      console.error('Error removing timer:', error);
      // Don't re-throw - just log the error and continue
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
          console.error(`Error cancelling notifications for ${id}:`, error);
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
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { timers, archivedTimers, settings } = JSON.parse(raw);
      
      // Migrate existing timers to include gamification fields
      const migratedTimers = (timers ?? []).map((timer: any) => ({
        ...timer,
        streak: timer.streak ?? 0,
        xp: timer.xp ?? 0,
        badges: timer.badges ?? [],
        completedQuests: timer.completedQuests ?? [],
        lastCheckIn: timer.lastCheckIn ?? timer.createdAt ?? new Date().toISOString(),
      }));
      
      const migratedArchivedTimers = (archivedTimers ?? []).map((timer: any) => ({
        ...timer,
        streak: timer.streak ?? 0,
        xp: timer.xp ?? 0,
        badges: timer.badges ?? [],
        completedQuests: timer.completedQuests ?? [],
        lastCheckIn: timer.lastCheckIn ?? timer.createdAt ?? new Date().toISOString(),
      }));
      
      set({ 
        timers: migratedTimers, 
        archivedTimers: migratedArchivedTimers,
        settings: settings ?? { reduceMotion: false }
      });
    } catch {
      // ignore
    }
  },
}));

// Helper function for immediate persistence
const persistState = async () => {
  try {
    const state = useHolidayStore.getState();
    const data = { 
      timers: state.timers, 
      archivedTimers: state.archivedTimers,
      settings: state.settings
    };
    console.log('Persisting state:', { timersCount: data.timers.length, archivedCount: data.archivedTimers.length });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error persisting state:', error);
  }
};

// persist on any change
let init = false;
let persistenceTimeout: NodeJS.Timeout | null = null;

useHolidayStore.subscribe(async (state) => {
  if (!init) return;
  
  // Debounce persistence to avoid race conditions
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }
  
  persistenceTimeout = setTimeout(async () => {
    await persistState();
    persistenceTimeout = null;
  }, 100);
});

// Initialize store
(async () => {
  try {
    await useHolidayStore.getState()._hydrate();
    init = true;
    console.log('Holiday store initialized');
  } catch (error) {
    console.error('Error initializing holiday store:', error);
    init = true; // Still allow normal operation
  }
})();