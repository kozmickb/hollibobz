import Constants from "expo-constants";
import { Platform } from "react-native";
import { assertRuntimeSafety } from "./runtimeGuard";

const extra = (Constants.expoConfig?.extra ?? {}) as any;

const LAN_FALLBACK =
  Constants.expoConfig?.extra?.LAN_IP ?? "localhost";

const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.API_BASE_URL ||
  "http://localhost:8787";

function normaliseBaseUrl(url: string) {
  if (!url) return "";
  
  // For development, keep localhost as is
  if (__DEV__) {
    return url;
  }
  
  // Replace localhost with LAN IP for device testing (production only)
  return url
    .replace("http://localhost", `http://${LAN_FALLBACK}`)
    .replace("http://127.0.0.1", `http://${LAN_FALLBACK}`);
}

export const APP_ENV = String(extra.APP_ENV ?? "development");
export const API_BASE_URL = normaliseBaseUrl(RAW_BASE);
export const AI_PROXY_URL = String(extra.aiProxyUrl ?? "");
export const POSTHOG_KEY = extra.posthogKey ? String(extra.posthogKey) : "";
export const REVENUECAT_KEY = extra.revenuecatKey ? String(extra.revenuecatKey) : "";
export const SENTRY_DSN = extra.sentryDsn ? String(extra.sentryDsn) : "";
export const TRIAL_DAYS = Number.isFinite(extra.trialDays) ? Number(extra.trialDays) : 7;
export const IS_DEV = __DEV__;

// Amadeus Flight API Configuration
export const AMADEUS_API_KEY = process.env.EXPO_PUBLIC_AMADEUS_API_KEY || extra.amadeusApiKey || "";
export const AMADEUS_API_SECRET = process.env.EXPO_PUBLIC_AMADEUS_API_SECRET || extra.amadeusApiSecret || "";

// AviationStack API Configuration (Fallback - 20 calls/month)
export const AVIATIONSTACK_API_KEY = process.env.EXPO_PUBLIC_AVIATIONSTACK_API_KEY || extra.aviationstackApiKey || "";

// Alternative Flight APIs
export const FLIGHTAWARE_API_KEY = process.env.EXPO_PUBLIC_FLIGHTAWARE_API_KEY || extra.flightawareApiKey || "";
export const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || extra.rapidapiKey || "";

export function runRuntimeGuards() {
  assertRuntimeSafety(APP_ENV, [API_BASE_URL, AI_PROXY_URL]);
}

// Log the final API_BASE_URL in dev for debugging
if (IS_DEV) {
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("APP_ENV:", APP_ENV);
}
