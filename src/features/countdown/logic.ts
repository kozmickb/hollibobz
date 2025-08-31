import { storage } from "../../lib/storage";

export type Milestone = 100 | 50 | 30 | 14 | 7 | 3 | 1 | 0;

export type Teaser = {
  id: string;
  title: string;
  body: string;
  seedQuery: string; // what we pass to Holly on CTA
  createdAtISO: string;
};

export function daysUntil(dateISO: string, now = new Date()): number {
  const target = new Date(dateISO);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Fraction complete from now → trip date, clamped [0,1] based on created date if known.
export function progressToTrip(startISO: string, dateISO: string, now = new Date()): number {
  const start = new Date(startISO).getTime();
  const end = new Date(dateISO).getTime();
  const cur = now.getTime();
  if (end <= start) return 1;
  const pct = (cur - start) / (end - start);
  return Math.max(0, Math.min(1, pct));
}

export function hitMilestone(daysLeft: number): Milestone | null {
  const list: Milestone[] = [100, 50, 30, 14, 7, 3, 1, 0];
  return list.includes(daysLeft as Milestone) ? (daysLeft as Milestone) : null;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const TEASER_PREFIX = "teaser_v1_"; // key: teaser_v1_{timerId}_{YYYY-MM-DD}

export async function getCachedTeaser(timerId: string, when = new Date()): Promise<Teaser | null> {
  try {
    const key = `${TEASER_PREFIX}${timerId}_${dateKey(when)}`;
    const raw = await storage.getItem(key);
    return raw ? JSON.parse(raw) as Teaser : null;
  } catch { 
    return null; 
  }
}

export async function cacheTeaser(timerId: string, teaser: Teaser, when = new Date()) {
  try {
    const key = `${TEASER_PREFIX}${timerId}_${dateKey(when)}`;
    await storage.setItem(key, JSON.stringify(teaser));
  } catch {}
}

// Deterministic "daily teaser" seeded by timerId + date so it is stable within a day.
export function buildDailyTeaser(
  timerId: string,
  destination: string,
  daysLeft: number
): Teaser {
  const buckets = [
    {
      id: "fact",
      title: "Did you know?",
      body: `Share a short, surprising fact about ${destination}. Keep it under 60 words.`,
      seed: `Give me one surprising travel fact about ${destination}, under 60 words, with context that would help first-time visitors.`,
    },
    {
      id: "micro-itin",
      title: "A quick idea for your first day",
      body: `Suggest a 3–4 hour mini plan in ${destination} with realistic timings and transit.`,
      seed: `Create a 3–4 hour mini itinerary in ${destination} with specific sights, order, approximate durations, and transit between them.`,
    },
    {
      id: "food",
      title: "What to eat",
      body: `Recommend 2–3 local dishes and where to try them at different price points.`,
      seed: `What are 2–3 essential dishes to try in ${destination}? Suggest areas or venues by budget tier.`,
    },
    {
      id: "transport",
      title: "Getting around",
      body: `Explain the simplest way to get around ${destination} and typical costs.`,
      seed: `Explain the best ways to get around ${destination}, including typical ticket prices and when to choose taxi vs metro/bus.`,
    },
    {
      id: "packing",
      title: "Packing nudge",
      body: `Based on the season, mention one commonly forgotten item for ${destination}.`,
      seed: `For a trip to ${destination} around this date, what is one commonly forgotten item and why is it useful? Keep it practical.`,
    },
  ];

  // deterministic pick: hash timerId + daysLeft to a bucket index
  const str = `${timerId}:${daysLeft}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  const idx = Math.abs(h) % buckets.length;
  const b = buckets[idx];

  return {
    id: `${b.id}-${daysLeft}`,
    title: b.title,
    body: b.body,
    seedQuery: b.seed,
    createdAtISO: new Date().toISOString(),
  };
}

export function getMilestoneMessage(milestone: Milestone, destination: string): string {
  switch (milestone) {
    case 100:
      return `100 days to go — here's a fun fact about ${destination}`;
    case 50:
      return `Halfway there! 50 days until your ${destination} adventure`;
    case 30:
      return `30 days to go — Holly Bobz has a packing list ready for you`;
    case 14:
      return `2 weeks left — time to start getting excited about ${destination}`;
    case 7:
      return `1 week left — here are the best things to do on your first day`;
    case 3:
      return `3 days to go — final preparations for ${destination}`;
    case 1:
      return `Tomorrow's the day! Your ${destination} journey begins`;
    case 0:
      return `It's go day! Enjoy your time in ${destination}`;
    default:
      return `Getting closer to your ${destination} adventure`;
  }
}
