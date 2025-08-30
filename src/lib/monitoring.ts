// TODO: Install sentry-expo and posthog-react-native
// import * as Sentry from 'sentry-expo';
// import PostHog from 'posthog-react-native';

// Initialize Sentry (mock)
export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    console.log('Sentry initialization (mock) - DSN configured');
    // TODO: Uncomment when sentry-expo is installed
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   enableInExpoDevelopment: __DEV__,
    //   tracesSampleRate: 1.0,
    //   _experiments: {
    //     profilesSampleRate: 1.0,
    //   },
    // });
  }
};

// Initialize PostHog (mock)
export const initPostHog = () => {
  if (process.env.EXPO_PUBLIC_POSTHOG_KEY) {
    console.log('PostHog initialization (mock) - key configured');
    // TODO: Uncomment when posthog-react-native is installed
    // const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY);
    // return posthog;
  }
  return null;
};

// Analytics tracking functions (mock)
export class Analytics {
  private static posthog: any = null;

  static init() {
    this.posthog = initPostHog();
  }

  static track(event: string, properties?: Record<string, any>) {
    try {
      // TODO: Uncomment when posthog-react-native is installed
      // if (this.posthog) {
      //   this.posthog.capture(event, properties);
      // }
      console.log('Analytics (mock):', event, properties);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Predefined tracking events
  static appOpen() {
    this.track('app_open');
  }

  static tripCreated(destination: string, adults: number, children: number) {
    this.track('trip_created', {
      destination,
      adults,
      children,
      total_travelers: adults + children,
    });
  }

  static aiMessageSent(provider: string, model: string, tokenCount: number) {
    this.track('ai_send', {
      provider,
      model,
      token_count: tokenCount,
    });
  }

  static paywallShown(reason: string) {
    this.track('paywall_shown', { reason });
  }

  static trialStarted() {
    this.track('trial_started');
  }

  static purchaseSuccess() {
    this.track('purchase_success');
  }

  static error(error: Error, context?: string) {
    // TODO: Uncomment when sentry-expo is installed
    // Sentry.captureException(error, {
    //   tags: { context },
    // });

    // Track in PostHog
    this.track('error_occurred', {
      error_message: error.message,
      error_name: error.name,
      context,
    });
  }
}

// Export types for the ErrorBoundary component
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}
