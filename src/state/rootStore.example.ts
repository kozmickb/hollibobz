// This is an example of a Zustand store, use this for async storage.
// DO NOTE USE THIS FILE, create new ones in the state folder.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "../lib/storage";

interface RootStore {}

// Make sure to persist the store using the persist middleware.
const useRootStore = create<RootStore>()(
  persist(
    (set, get) => ({
      // add your Zustand store here
      // someData: 0,
      // addSomeData: () => set({ someData: get().someData + 1 }),
    }),
    {
      name: "root-storage",
      storage: createJSONStorage(() => ({
        getItem: storage.getItem,
        setItem: storage.setItem,
        removeItem: storage.removeItem
      })),
    },
  ),
);

export default useRootStore;
