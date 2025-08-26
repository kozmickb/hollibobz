import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Timer {
  id: string;
  name: string;
  date: Date;
  type: "holiday" | "flight" | "excursion" | "custom";
}

export interface Destination {
  name: string;
  country: string;
  images: string[];
  facts: string[];
  thingsToDo: string[];
}

export interface DailyFact {
  fact: string;
  date: string;
  shown: boolean;
}

export interface SavedFact {
  destination: string;
  fact: string;
  savedAt: string;
}

export interface AppSettings {
  enableAnimations: boolean;
  enableHaptics: boolean;
  enableNotifications: boolean;
  factNotificationTime: string;
}

interface HolidayState {
  timers: Timer[];
  currentDestination: Destination | null;
  dailyFacts: DailyFact[];
  viewedFacts: string[];
  savedFacts: SavedFact[];
  settings: AppSettings;
  addTimer: (timer: Omit<Timer, "id">) => void;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Timer>) => void;
  setDestination: (destination: Destination) => void;
  clearDestination: () => void;
  getTodaysFact: () => DailyFact | null;
  markFactAsViewed: (fact: string) => void;
  saveFact: (destination: string, fact: string) => void;
  removeSavedFact: (savedAt: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetViewedFacts: () => void;
}

export const useHolidayStore = create<HolidayState>()(
  persist(
    (set, get) => ({
      timers: [],
      currentDestination: null,
      dailyFacts: [],
      viewedFacts: [],
      savedFacts: [],
      settings: {
        enableAnimations: true,
        enableHaptics: true,
        enableNotifications: true,
        factNotificationTime: "09:00",
      },
      
      addTimer: (timer) => {
        const newTimer: Timer = {
          ...timer,
          id: Date.now().toString(),
        };
        set((state) => ({
          timers: [...state.timers, newTimer],
        }));
      },
      
      removeTimer: (id) => {
        set((state) => ({
          timers: state.timers.filter((timer) => timer.id !== id),
        }));
      },
      
      updateTimer: (id, updates) => {
        set((state) => ({
          timers: state.timers.map((timer) =>
            timer.id === id ? { ...timer, ...updates } : timer
          ),
        }));
      },
      
      setDestination: (destination) => {
        const dailyFacts = destination.facts.map((fact, index) => ({
          fact,
          date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toDateString(),
          shown: false,
        }));
        
        set({ 
          currentDestination: destination,
          dailyFacts,
          viewedFacts: []
        });
      },
      
      clearDestination: () => {
        set({ 
          currentDestination: null,
          dailyFacts: [],
          viewedFacts: []
        });
      },
      
      getTodaysFact: () => {
        const state = get();
        const today = new Date().toDateString();
        const todaysFact = state.dailyFacts.find(df => df.date === today);
        
        if (todaysFact && !state.viewedFacts.includes(todaysFact.fact)) {
          return todaysFact;
        }
        
        // If no fact for today or already viewed, get next unviewed fact
        const unviewedFact = state.dailyFacts.find(df => 
          !state.viewedFacts.includes(df.fact)
        );
        
        return unviewedFact || null;
      },
      
      markFactAsViewed: (fact) => {
        set((state) => ({
          viewedFacts: [...state.viewedFacts, fact],
        }));
      },
      
      saveFact: (destination, fact) => {
        const savedFact: SavedFact = {
          destination,
          fact,
          savedAt: new Date().toISOString(),
        };
        set((state) => ({
          savedFacts: [...state.savedFacts, savedFact],
        }));
      },
      
      removeSavedFact: (savedAt) => {
        set((state) => ({
          savedFacts: state.savedFacts.filter(sf => sf.savedAt !== savedAt),
        }));
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      resetViewedFacts: () => {
        set({ viewedFacts: [] });
      },
    }),
    {
      name: "holiday-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (state: any) => {
        try {
          const timers = Array.isArray(state?.timers)
            ? state.timers.map((t: any) => ({
                ...t,
                date: t?.date instanceof Date ? t.date : new Date(t?.date),
              }))
            : [];
          return { ...state, timers };
        } catch {
          return state as any;
        }
      },
      partialize: (state) => ({
        timers: state.timers,
        currentDestination: state.currentDestination,
        savedFacts: state.savedFacts,
      }),
    }
  )
);