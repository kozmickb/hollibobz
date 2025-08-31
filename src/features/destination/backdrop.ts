import { storage } from "../../lib/storage";

const KEY_PREFIX = "dest_meta_v1_";

export type BackdropResult = { imageUrl?: string };

export async function loadCachedMeta(dest: string) {
  try {
    const raw = await storage.getItem(KEY_PREFIX + dest.toLowerCase());
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveCachedMeta(dest: string, meta: any) {
  try {
    await storage.setItem(KEY_PREFIX + dest.toLowerCase(), JSON.stringify(meta));
  } catch {}
}

// Pexels search: simple first result use. If ENV missing or fails, return undefined.
export async function fetchPexelsBackdrop(dest: string): Promise<BackdropResult> {
  const key = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
  if (!key) return {};
  try {
    const q = encodeURIComponent(dest);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=1&orientation=landscape`, {
      headers: { Authorization: key },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const first = json?.photos?.[0];
    const url = first?.src?.large || first?.src?.landscape || first?.src?.original;
    return { imageUrl: url };
  } catch { return {}; }
}
