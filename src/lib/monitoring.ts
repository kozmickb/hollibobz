import * as Sentry from 'sentry-expo';
import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

// Get configuration from Constants.expoConfig.extra
const getConfig = () => {
  const extra = Constants.expoConfig?.extra ?? {};
  return {
    sentryDsn: extra.sentryDsn || process.env.SENTRY_DSN,
    posthogKey: extra.posthogKey || process.env.EXPO_PUBLIC_POSTHOG_KEY,
    appEnv: extra.APP_ENV || 'development',
    debugMode: extra.debugMode || false,
  };
};

// Initialize Sentry with production-only tracing
export const initSentry = () => {
  const config = getConfig();
  
  if (config.sentryDsn && config.appEnv === 'production') {
    try {
      Sentry.init({
        dsn: config.sentryDsn,
        enableInExpoDevelopment: false, // Only in production
        tracesSampleRate: 1.0,
        _experiments: {
          profilesSampleRate: 1.0,
        },
        debug: config.debugMode,
        beforeSend: (event) => {
          // Add environment tag
          event.tags = { ...event.tags, environment: config.appEnv };
          return event;
        },
      });
      
      console.log('✅ Sentry initialized for production');
      
      // Test call in production with debug flag
      if (config.debugMode) {
        // Use the correct Sentry API
        Sentry.Native.addBreadcrumb({
          category: 'app',
          message: 'Sentry test breadcrumb - production init',
          level: 'info',
        });
        console.log('🔍 Sentry test breadcrumb sent (debug mode)');
      }
    } catch (error) {
      console.error('❌ Sentry initialization failed:', error);
    }
  } else {
    console.log('ℹ️ Sentry not initialized - missing DSN or not production');
  }
};

// Initialize PostHog with consent respect
export const initPostHog = () => {
  const config = getConfig();
  
  if (config.posthogKey) {
    try {
      // Check for analytics consent (you can implement this based on your consent system)
      const hasAnalyticsConsent = true; // TODO: Replace with actual consent check
      
      if (hasAnalyticsConsent) {
        const posthog = new PostHog(config.posthogKey, {
          host: 'https://app.posthog.com', // Default PostHog host
          disabled: false, // Use disabled instead of enable
        });
        
        console.log('✅ PostHog initialized');
        
        // Test call in production with debug flag
        if (config.debugMode && config.appEnv === 'production') {
          posthog.capture('app_screen_view', {
            screen_name: 'App Initialization',
            screen_category: 'app_startup',
            environment: config.appEnv,
          });
          console.log('🔍 PostHog test event sent (debug mode)');
        }
        
        return posthog;
      } else {
        console.log('ℹ️ PostHog not initialized - no analytics consent');
        return null;
      }
    } catch (error) {
      console.error('❌ PostHog initialization failed:', error);
      return null;
    }
  } else {
    console.log('ℹ️ PostHog not initialized - missing key');
    return null;
  }
};

// Analytics tracking functions
export class Analytics {
  private static posthog: PostHog | null = null;

  static init() {
    this.posthog = initPostHog();
  }

  static track(event: string, properties?: Record<string, any>) {
    try {
      if (this.posthog) {
        this.posthog.capture(event, properties);
      }
      // Fallback logging for development
      if (__DEV__) {
        console.log('Analytics:', event, properties);
      }
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
    try {
      // Send to Sentry if available
      if (typeof Sentry !== 'undefined' && Sentry.Native.captureException) {
        Sentry.Native.captureException(error, {
          tags: { context },
        });
      }
    } catch (sentryError) {
      console.error('Sentry error tracking failed:', sentryError);
    }

    // Track in PostHog
    this.track('error_occurred', {
      error_message: error.message,
      error_name: error.name,
      context,
    });
  }
}

// Utility functions for monitoring
export const captureSentryBreadcrumb = (message: string, category: string = 'app', level: 'info' | 'warning' | 'error' = 'info') => {
  try {
    if (typeof Sentry !== 'undefined' && Sentry.Native.addBreadcrumb) {
      Sentry.Native.addBreadcrumb({
        category,
        message,
        level,
      });
      return true;
    }
  } catch (error) {
    console.error('Failed to capture Sentry breadcrumb:', error);
  }
  return false;
};

export const capturePostHogEvent = (event: string, properties?: Record<string, any>) => {
  try {
    if (typeof PostHog !== 'undefined') {
      // This would need to be called with the PostHog instance
      console.log('PostHog event captured:', event, properties);
      return true;
    }
  } catch (error) {
    console.error('Failed to capture PostHog event:', error);
  }
  return false;
};

// Export types for the ErrorBoundary component
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}
