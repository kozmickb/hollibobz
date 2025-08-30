
SYSTEM ROLE
You are a senior full stack engineer working inside an Expo React Native app called TripTick. Implement production hardening plus a paywall, and move AI calls through a server proxy. IMPORTANT: The project already has multiple AI keys and logic to pick the cheapest first. Keep that exact logic, do not change the selection order, just move secrets and request dispatch to the server. Do not remove or rename any existing env variables. Only add the new placeholders listed below if missing.

GUARDRAILS
• Keep the app running as is. Do not break existing screens, navigation, or data formats.
• Reuse the current AI provider selection logic. If it lives in the client, extract it into a shared module and use it on the server. If it already exists as a module, import it on the server as is.
• Only add the new env placeholders listed here. Do not touch current ones.

ASSUMPTIONS
• React Native with Expo, Zustand, AsyncStorage or MMKV, and an AI chat screen.
• Multiple AI providers are already supported with a cheapest first selection strategy. Keys currently live on device.
• We will add RevenueCat for purchases, a small Node server for AI proxy and metering, Sentry, and PostHog.

NEW ENV PLACEHOLDERS TO ADD ONLY IF MISSING
# client side, safe to expose
EXPO_PUBLIC_REVENUECAT_KEY=rc_live_placeholder
EXPO_PUBLIC_RC_ENTITLEMENT_NAME=pro
EXPO_PUBLIC_AI_PROXY_URL=https://yourai.proxy.example
EXPO_PUBLIC_POSTHOG_KEY=phc_placeholder
EXPO_PUBLIC_AI_LIMIT_FREE=15
EXPO_PUBLIC_AI_LIMIT_PRO=200
EXPO_PUBLIC_TRIAL_DAYS=7

# client uses this but do not expose its value anywhere except config
SENTRY_DSN=https://examplePublicKey@example.ingest.sentry.io/12345

# server side
PORT=3000
AI_MODEL=gpt-4o-mini
# OPENAI_API_KEY and other provider keys ALREADY EXIST. Do not rename or add duplicates.
# optional for future webhook validation
RC_WEBHOOK_SECRET=replace_later_if_used

DEPENDENCIES
Client
1. npx expo install react-native-purchases
2. npx expo install expo-secure-store
3. npx expo install @sentry/react-native sentry-expo
4. npm i posthog-react-native
5. npm i react-native-mmkv
6. npm i react-native-permissions
7. npm i zod

Server
1. npm i express cors node-fetch zod
2. npm i -D ts-node typescript @types/express

FILES TO ADD OR UPDATE

server/
  index.ts
  router/
    aiProxy.ts
    usage.ts
  ai/
    providerRouter.ts  # imports existing cheapest first logic if present
    adapters/
      openai.ts
      deepseek.ts
      openrouter.ts    # add adapters that match current repo usage
  quota/
    memoryQuotaStore.ts

src/
  api/
    purchases.ts
    remoteConfig.ts
  hooks/
    useEntitlements.ts
    useAIQuota.ts
  components/
    PaywallModal.tsx
    ErrorBoundary.tsx
  lib/
    storage.ts
    calendarGuard.ts
  screens/
    PaywallScreen.tsx   # simple marketing copy and manage subscription link

APP CONFIG
• In app.json or app.config, add:
  • iOS: NSCalendarsUsageDescription = "TripTick uses your calendar to add trip reminders"
  • Android: add calendar permissions
  • Include Sentry via sentry-expo plugin
• Initialise Sentry and PostHog at app start.

STEP 1 — SERVER: move AI calls and key usage off device while keeping the cheapest first logic
A. Reuse existing cheapest first selection
• Search the repo for current selection code, for example names like selectCheapestProvider, chooseModel, providerRouter, aiCostTable.
• If found in client code, extract it into server/ai/providerRouter.ts and update imports.
• If already a shared module, import it directly into server/ai/providerRouter.ts.
• Do not change the ranking or the fallback order. Preserve timeouts and retries.

B. Provider adapters
• For each provider you already use, create an adapter in server/ai/adapters/* that:
  • accepts { model, messages, temperature, maxTokens }
  • uses the provider key from process.env
  • returns a normalised { text, tokensIn, tokensOut, provider, model, costEstimate }

C. aiProxy route
Create server/router/aiProxy.ts
```ts
import { Router } from "express";
import { z } from "zod";
import { dispatchWithCheapestFirst } from "../ai/providerRouter";

const schema = z.object({
  messages: z.array(z.object({ role: z.string(), content: z.string() })),
  model: z.string().optional(),
  params: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional()
  }).optional(),
  userId: z.string().optional()
});

export const aiProxy = Router().post("/ai-proxy", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "bad request" });
  try {
    const result = await dispatchWithCheapestFirst(parsed.data);
    res.json(result);
  } catch (e: any) {
    res.status(502).json({ error: "ai failed", detail: String(e?.message || e) });
  }
});
```

D. usage route and in memory quota
Create server/router/usage.ts
```ts
import { Router } from "express";
const usage = new Map<string, number>();
const monthKey = () => `${new Date().getUTCFullYear()}-${new Date().getUTCMonth()+1}`;

export const usageRouter = Router().post("/usage", (req, res) => {
  const { userId, hasPro, freeLimit, proLimit } = req.body || {};
  if (!userId) return res.status(400).json({ error: "missing userId" });
  const key = `${userId}:${monthKey()}`;
  const current = usage.get(key) || 0;
  const limit = hasPro ? Number(proLimit ?? process.env.EXPO_PUBLIC_AI_LIMIT_PRO ?? 200)
                       : Number(freeLimit ?? process.env.EXPO_PUBLIC_AI_LIMIT_FREE ?? 15);
  if (current >= limit) return res.status(429).json({ allowed: false, used: current, limit });
  usage.set(key, current + 1);
  res.json({ allowed: true, used: current + 1, limit });
});
```

E. server/index.ts
```ts
import express from "express";
import cors from "cors";
import { aiProxy } from "./router/aiProxy";
import { usageRouter } from "./router/usage";

const app = express();
app.use(cors());
app.use(express.json());
app.use(aiProxy);
app.use(usageRouter);
app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3000, () => console.log("server ready"));
```

STEP 2 — CLIENT: RevenueCat paywall and entitlement gates
A. purchases api
```ts
// src/api/purchases.ts
import Purchases from "react-native-purchases";

const ENTITLEMENT = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_NAME || "pro";

export async function initPurchases(userId?: string) {
  await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY!, appUserID: userId });
}
export async function hasProEntitlement(): Promise<boolean> {
  const info = await Purchases.getCustomerInfo();
  return Boolean(info.entitlements.active[ENTITLEMENT]);
}
export async function startTrialOrPurchase(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages?.[0];
  if (!pkg) throw new Error("no package");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
}
```

B. entitlement hook
```ts
// src/hooks/useEntitlements.ts
import { useEffect, useState } from "react";
import { hasProEntitlement } from "../api/purchases";

export function useEntitlements() {
  const [loading, setLoading] = useState(true);
  const [hasPro, setHasPro] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const pro = await hasProEntitlement(); if (mounted) setHasPro(pro); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);
  return { loading, hasPro, setHasPro };
}
```

C. quota hook
```ts
// src/hooks/useAIQuota.ts
export async function checkAndIncrementAI({ hasPro, userId }:{ hasPro:boolean; userId:string; }) {
  const r = await fetch(`${process.env.EXPO_PUBLIC_AI_PROXY_URL}/usage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      hasPro,
      freeLimit: Number(process.env.EXPO_PUBLIC_AI_LIMIT_FREE ?? 15),
      proLimit: Number(process.env.EXPO_PUBLIC_AI_LIMIT_PRO ?? 200)
    })
  });
  const data = await r.json();
  return { ok: r.ok && data.allowed !== false, used: data.used, limit: data.limit };
}
```

D. Paywall modal
```tsx
// src/components/PaywallModal.tsx
import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { startTrialOrPurchase } from "../api/purchases";

export function PaywallModal({ visible, onClose, onPurchased }:{ visible:boolean; onClose:()=>void; onPurchased:()=>void; }) {
  const onBuy = async () => {
    const ok = await startTrialOrPurchase();
    if (ok) onPurchased();
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.6)", justifyContent:"flex-end" }}>
        <View style={{ backgroundColor:"#111", padding:24, borderTopLeftRadius:20, borderTopRightRadius:20 }}>
          <Text style={{ fontSize:20, color:"white", marginBottom:8 }}>TripTick Plus</Text>
          <Text style={{ color:"#ccc", marginBottom:16 }}>
            Free trial for {process.env.EXPO_PUBLIC_TRIAL_DAYS ?? 7} days then monthly subscription. Unlock unlimited trips, higher AI limits and calendar export.
          </Text>
          <TouchableOpacity onPress={onBuy} style={{ backgroundColor:"#be5cff", padding:14, borderRadius:12, alignItems:"center" }}>
            <Text style={{ color:"white", fontWeight:"600" }}>Start free trial</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ padding:14, alignItems:"center" }}>
            <Text style={{ color:"#ccc" }}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

E. Gate AI send and second trip creation
• In the chat screen, before sending, call checkAndIncrementAI. If not ok, open PaywallModal.
• In the place where a new trip is created, if the user does not have pro and already has one trip, open PaywallModal.

F. Call the proxy from the client
```ts
export async function sendAI(messages:{ role:string; content:string }[]) {
  const r = await fetch(`${process.env.EXPO_PUBLIC_AI_PROXY_URL}/ai-proxy`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ messages })
  });
  if (!r.ok) throw new Error("AI failed");
  return r.json();
}
```

STEP 3 — Storage, permissions, and stability
A. Replace sensitive AsyncStorage usage with SecureStore for secrets and MMKV for general data. Add a STATE_VERSION key and a simple migration that runs once if version changes.
B. Add a calendar permission guard using react native permissions. Request only when exporting to calendar.
C. Add Sentry init on app start and wrap navigation root in ErrorBoundary.
D. Add PostHog init and track: app_open, trip_created, ai_send, paywall_shown, trial_started, purchase_success.

INITIALISATION SNIPPETS
```ts
// Sentry
import * as Sentry from "sentry-expo";
Sentry.init({ dsn: process.env.SENTRY_DSN, enableInExpoDevelopment: true });

// PostHog
import PostHog from "posthog-react-native";
const ph = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!);
ph.capture("app_open");
```

STEP 4 — Tests
• Unit test the gate: free users stop at configured limit.
• Unit test entitlements hook when RevenueCat returns active pro.
• If providerRouter is now shared, add a small test that the chosen provider matches the current cheapest first rule for a sample cost table.

ACCEPTANCE CRITERIA
• Free users can create one trip and send up to EXPO_PUBLIC_AI_LIMIT_FREE messages per month. When the limit is reached they see the paywall and can start a trial.
• After purchase, pro features unlock immediately and the limit increases to EXPO_PUBLIC_AI_LIMIT_PRO without reinstall.
• All AI requests go through the server proxy. No provider keys exist on the device.
• Existing cheapest first selection remains unchanged, only moved to the server. Provider order, prices and fallbacks behave exactly as before.
• Calendar permission requests are graceful and do not crash if denied.
• Sentry receives events and PostHog records the funnel.

IMPLEMENTATION NOTES
• When moving the selection code, prefer to import the exact module from the repo. If paths make that awkward, copy the file contents into server/ai/providerRouter.ts unchanged.
• Keep the adapter boundaries thin so that adding or removing a provider later requires only one file change.
• If the app already uses MMKV and SecureStore, leave as is and only add migration and secrets separation if missing.
• Leave all existing env keys untouched. Only append the new placeholders if missing.
