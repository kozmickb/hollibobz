import Constants from "expo-constants";
import { Platform } from "react-native";

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

export const API_BASE_URL = normaliseBaseUrl(RAW_BASE);
export const IS_DEV = __DEV__;

// Log the final API_BASE_URL in dev for debugging
if (IS_DEV) {
  console.log("API_BASE_URL:", API_BASE_URL);
}
