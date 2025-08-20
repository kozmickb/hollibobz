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

interface HolidayState {
  timers: Timer[];
  currentDestination: Destination | null;
  addTimer: (timer: Omit<Timer, "id">) => void;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Timer>) => void;
  setDestination: (destination: Destination) => void;
  clearDestination: () => void;
}

export const useHolidayStore = create<HolidayState>()(
  persist(
    (set) => ({
      timers: [],
      currentDestination: null,
      
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
        set({ currentDestination: destination });
      },
      
      clearDestination: () => {
        set({ currentDestination: null });
      },
    }),
    {
      name: "holiday-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        timers: state.timers,
        currentDestination: state.currentDestination,
      }),
    }
  )
);