import Constants from "expo-constants";
import * as Sentry from "sentry-expo";
import PostHog from "posthog-react-native";

let ph: PostHog | null = null;

type TelemetryOptions = { dsn?: string; posthogKey?: string; appEnv: string; debug?: boolean };

export function initTelemetry({ dsn, posthogKey, appEnv, debug }: TelemetryOptions) {
  const isProd = appEnv === "production";

  if (dsn && isProd) {
    Sentry.init({
      dsn,
      enableInExpoDevelopment: false,
      debug: !!debug,
      tracesSampleRate: 1.0,
    });
    Sentry.Native.setTag("appEnv", appEnv);
  }

  if (posthogKey && isProd) {
    ph = new PostHog(posthogKey, {
      captureAppLifecycleEvents: true,
      captureDeepLinks: true,
      enable: true,
      // respect any consent flag later if you have one
    });
  }
}

export function trackScreen(name: string, props?: Record<string, any>) {
  if (ph) ph.screen(name, props ?? {});
}

export function trackEvent(name: string, props?: Record<string, any>) {
  if (ph) ph.capture(name, props ?? {});
}

export function captureError(err: unknown) {
  try {
    Sentry.Native.captureException(err);
  } catch {}
}
