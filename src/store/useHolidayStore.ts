import { create } from "zustand";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type Timer = {
  id: string;
  destination: string;
  date: string; // ISO
  createdAt: string;
};

type AddInput = { destination: string; date: string };

type State = {
  timers: Timer[];            // active
  archivedTimers: Timer[];    // archived
  addTimer: (input: AddInput) => void;
  removeTimer: (id: string) => void;       // hard delete
  archiveTimer: (id: string) => void;      // move to archive
  restoreTimer: (id: string) => void;      // move back from archive
  purgeArchive: () => void;                // empty archive
};

export const useHolidayStore = create<State>((set, get) => ({
  timers: [],
  archivedTimers: [],
  addTimer: (input) =>
    set((s) => ({
      timers: [
        ...s.timers,
        {
          id: makeId(),
          destination: input.destination.trim(),
          date: input.date,
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  removeTimer: (id) =>
    set((s) => ({
      timers: s.timers.filter((t) => t.id !== id),
      archivedTimers: s.archivedTimers.filter((t) => t.id !== id),
    })),
  archiveTimer: (id) =>
    set((s) => {
      const t = s.timers.find((x) => x.id === id);
      if (!t) return s;
      return {
        timers: s.timers.filter((x) => x.id !== id),
        archivedTimers: [t, ...s.archivedTimers],
      };
    }),
  restoreTimer: (id) =>
    set((s) => {
      const t = s.archivedTimers.find((x) => x.id === id);
      if (!t) return s;
      return {
        archivedTimers: s.archivedTimers.filter((x) => x.id !== id),
        timers: [t, ...s.timers],
      };
    }),
  purgeArchive: () => set({ archivedTimers: [] }),
}));