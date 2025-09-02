import React from "react";
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Text as RestyleText } from "../components/ui/Text";
import { useThemeStore } from "../store/useThemeStore";
import { createShadowStyle } from "../utils/shadowUtils";
import { startTrialOrPurchase } from "../api/purchases";

export function PaywallScreen() {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  
  const shadowStyle = createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  });
  
  const pricingShadowStyle = createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  });

  const handlePurchase = async () => {
    try {
      const success = await startTrialOrPurchase();
      if (success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="diamond" size={64} color="#be5cff" />
        </View>
        <RestyleText variant="xl" style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
          Upgrade to Odysync Plus
        </RestyleText>
        <RestyleText variant="md" style={[styles.tagline, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
          Unlock the full potential of your travel planning
        </RestyleText>
      </View>

      <View style={styles.trialBanner}>
        <Ionicons name="gift" size={24} color="#10b981" />
        <RestyleText variant="md" style={styles.trialText}>
          Start with {process.env.EXPO_PUBLIC_TRIAL_DAYS ?? 7} days free trial
        </RestyleText>
      </View>

      <View style={styles.featuresContainer}>
        <FeatureCard
          icon="infinite"
          title="Unlimited AI Conversations"
          description="Chat with Holly Bobz without limits. Get personalized travel recommendations anytime."
        />
        <FeatureCard
          icon="airplane"
          title="Unlimited Trips"
          description="Plan as many trips as you want. No restrictions on your travel dreams."
        />
        <FeatureCard
          icon="calendar"
          title="Calendar Integration"
          description="Seamlessly sync your trips with your device calendar for reminders and events."
        />
        <FeatureCard
          icon="stats-chart"
          title="Advanced Analytics"
          description="Get detailed insights about your travel patterns and trip statistics."
        />
        <FeatureCard
          icon="cloud-upload"
          title="Cloud Backup"
          description="Never lose your trip data with automatic cloud synchronization."
        />
        <FeatureCard
          icon="shield-checkmark"
          title="Priority Support"
          description="Get faster responses and priority access to new features."
        />
      </View>

      <View style={styles.pricingContainer}>
        <View style={[styles.pricingCard, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }, pricingShadowStyle]}>
          <RestyleText variant="lg" style={[styles.pricingTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Odeysync Plus
          </RestyleText>
          <View style={styles.priceContainer}>
            <RestyleText variant="xl" style={[styles.price, { color: '#be5cff' }]}>
              $4.99
            </RestyleText>
            <RestyleText variant="sm" style={[styles.period, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              /month
            </RestyleText>
          </View>
          <RestyleText variant="sm" style={[styles.pricingDescription, { color: isDark ? '#d1d5db' : '#374151' }]}>
            Cancel anytime. First {process.env.EXPO_PUBLIC_TRIAL_DAYS ?? 7} days free.
          </RestyleText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handlePurchase}
        >
          <RestyleText variant="lg" style={styles.upgradeButtonText}>
            Start Free Trial
          </RestyleText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => {/* Handle restore purchases */}}
        >
          <RestyleText variant="md" style={[styles.restoreButtonText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Restore Purchases
          </RestyleText>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <RestyleText variant="xs" style={[styles.footerText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
          By upgrading, you agree to our Terms of Service and Privacy Policy.
          Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
        </RestyleText>
      </View>
    </ScrollView>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const { isDark } = useThemeStore();
  
  const shadowStyle = createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  });

  return (
    <View style={[styles.featureCard, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }, shadowStyle]}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={24} color="#be5cff" />
      </View>
      <View style={styles.featureContent}>
        <RestyleText variant="md" style={[styles.featureTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
          {title}
        </RestyleText>
        <RestyleText variant="sm" style={[styles.featureDescription, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
          {description}
        </RestyleText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  trialText: {
    color: '#10b981',
    marginLeft: 8,
    fontWeight: '600',
  },
  featuresContainer: {
    paddingHorizontal: 24,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(190, 92, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    lineHeight: 18,
  },
  pricingContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  pricingCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
  },
  pricingTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  period: {
    marginLeft: 4,
  },
  pricingDescription: {
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  upgradeButton: {
    backgroundColor: '#be5cff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginTop: 24,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
