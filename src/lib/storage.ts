import AsyncStorage from "@react-native-async-storage/async-storage";

type KV = {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
  getAllKeys: () => Promise<string[]>;
};

const isFn = (fn: any) => typeof fn === "function";

const fallback: KV = {
  async getItem() { return null; },
  async setItem() {},
  async removeItem() {},
  async getAllKeys() { return []; },
};

const base: Partial<KV> = {
  getItem: isFn((AsyncStorage as any)?.getItem) ? AsyncStorage.getItem.bind(AsyncStorage) : undefined,
  setItem: isFn((AsyncStorage as any)?.setItem) ? AsyncStorage.setItem.bind(AsyncStorage) : undefined,
  removeItem: isFn((AsyncStorage as any)?.removeItem) ? AsyncStorage.removeItem.bind(AsyncStorage) : undefined,
  getAllKeys: isFn((AsyncStorage as any)?.getAllKeys) ? (AsyncStorage as any).getAllKeys.bind(AsyncStorage) : undefined,
};

export const storage: KV = {
  getItem: base.getItem || fallback.getItem,
  setItem: base.setItem || fallback.setItem,
  removeItem: base.removeItem || fallback.removeItem,
  getAllKeys: base.getAllKeys || fallback.getAllKeys,
};

// Utility stats used by Profile screen
export async function getStorageStats() {
  try {
    const keys = await storage.getAllKeys();
    let bytes = 0;
    for (const k of keys) {
      const v = await storage.getItem(k);
      if (v) bytes += v.length;
    }
    return { items: keys.length, bytes };
  } catch (e) {
    console.warn("getStorageStats failed", e);
    return { items: 0, bytes: 0 };
  }
}

// Optional migration from legacy global AsyncStorage variable
export async function migrateFromAsyncStorage(legacy?: any) {
  try {
    const legacyGet = legacy?.getItem;
    const legacyKeys = legacy?.getAllKeys;
    if (!isFn(legacyGet) || !isFn(legacyKeys)) return false;

    const keys: string[] = await legacyKeys();
    for (const k of keys) {
      const v = await legacyGet(k);
      if (v != null) await storage.setItem(k, v);
    }
    return true;
  } catch (e) {
    console.warn("Migration skipped", e);
    return false;
  }
}