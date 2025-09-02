import React from 'react';
import { View, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from './ui/Text';
import { useThemeStore } from '../store/useThemeStore';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  description: string;
  onUpgrade?: () => void;
}

export function PaywallModal({
  visible,
  onClose,
  feature,
  description,
  onUpgrade
}: PaywallModalProps) {
  const { isDark } = useThemeStore();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade action - could navigate to paywall screen
      console.log('Navigate to paywall screen');
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: isDark ? "#1a1a1a" : "#fefefe"
      }}>
        {/* Header */}
        <View style={{
          backgroundColor: isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#374151" : "#fbbf24",
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: isDark ? "#374151" : "#fef3c7",
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons name="close" size={20} color={isDark ? "#fbbf24" : "#d97706"} />
            </Pressable>
            <RestyleText variant="xl" color="text" fontWeight="bold">
              Upgrade to Premium
            </RestyleText>
          </View>
        </View>

        <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          {/* Premium Icon */}
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: isDark ? "#5eead4" : "#0d9488",
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32,
          }}>
            <Ionicons name="diamond" size={60} color="#ffffff" />
          </View>

          {/* Feature Title */}
          <RestyleText variant="xl" color="text" fontWeight="bold" style={{ textAlign: 'center', marginBottom: 16 }}>
            Unlock {feature}
          </RestyleText>

          {/* Description */}
          <RestyleText variant="md" color="textMuted" style={{ textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
            {description}
          </RestyleText>

          {/* Benefits List */}
          <View style={{ width: '100%', marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isDark ? "#10b981" : "#059669",
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </View>
              <RestyleText variant="md" color="text">
                Real-time flight tracking
              </RestyleText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isDark ? "#10b981" : "#059669",
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </View>
              <RestyleText variant="md" color="text">
                Flight status notifications
              </RestyleText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isDark ? "#10b981" : "#059669",
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </View>
              <RestyleText variant="md" color="text">
                Unlimited trip planning
              </RestyleText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isDark ? "#10b981" : "#059669",
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark" size={14} color="#ffffff" />
              </View>
              <RestyleText variant="md" color="text">
                Advanced travel analytics
              </RestyleText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ width: '100%', gap: 12 }}>
            <Pressable
              onPress={handleUpgrade}
              style={{
                backgroundColor: isDark ? "#5eead4" : "#0d9488",
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <RestyleText variant="lg" color="text" fontWeight="semibold" style={{ color: '#ffffff' }}>
                Upgrade to Premium
              </RestyleText>
              <RestyleText variant="sm" color="text" style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 4 }}>
                Starting from $4.99/month
              </RestyleText>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: 'transparent',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? "#6b7280" : "#d1d5db",
              }}
            >
              <RestyleText variant="md" color="text">
                Maybe Later
              </RestyleText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}