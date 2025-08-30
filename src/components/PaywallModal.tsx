import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { startTrialOrPurchase } from "../api/purchases";
import { useThemeStore } from "../store/useThemeStore";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchased: () => void;
}

export function PaywallModal({ visible, onClose, onPurchased }: PaywallModalProps) {
  const { isDark } = useThemeStore();

  const onBuy = async () => {
    try {
      const ok = await startTrialOrPurchase();
      if (ok) onPurchased();
    } catch (error) {
      console.error('Purchase failed:', error);
      // Handle purchase error
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: isDark ? '#1f2937' : '#ffffff' }]}>
          <View style={styles.header}>
            <Ionicons
              name="diamond"
              size={48}
              color="#be5cff"
              style={styles.icon}
            />
            <Text style={[styles.title, { color: isDark ? '#f9fafb' : '#111827' }]}>
              TripTick Plus
            </Text>
          </View>

          <Text style={[styles.subtitle, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            Free trial for {process.env.EXPO_PUBLIC_TRIAL_DAYS ?? 7} days then monthly subscription.
            Unlock unlimited trips, higher AI limits and calendar export.
          </Text>

          <View style={styles.features}>
            <FeatureItem icon="airplane" text="Unlimited trips" />
            <FeatureItem icon="chatbubble" text="Unlimited AI conversations" />
            <FeatureItem icon="calendar" text="Calendar integration" />
            <FeatureItem icon="stats-chart" text="Advanced analytics" />
          </View>

          <TouchableOpacity
            onPress={onBuy}
            style={styles.purchaseButton}
          >
            <Text style={styles.purchaseButtonText}>Start free trial</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Maybe later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  const { isDark } = useThemeStore();

  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color="#10b981" />
      <Text style={[styles.featureText, { color: isDark ? '#d1d5db' : '#374151' }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  features: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  purchaseButton: {
    backgroundColor: '#be5cff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
  },
});
