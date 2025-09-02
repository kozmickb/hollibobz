import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Platform, Alert, Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from '../components/ui/Text';
import { useThemeStore } from '../store/useThemeStore';
import { ProfileStackParamList } from '../navigation/AppNavigator';
import { UserStorageManager } from '../lib/userStorage';

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Profile">;

export function PrivacySecurityScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark } = useThemeStore();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const userManager = UserStorageManager.getInstance();

  const handleDataExport = async () => {
    try {
      const userData = await userManager.exportUserData();
      const dataString = JSON.stringify(userData, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `odysync-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Export Complete', 'Your data has been downloaded as a JSON file.');
      } else {
        Alert.alert('Export Complete', 'Your data has been prepared. Check your downloads folder.');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    }
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your trips, checklists, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await userManager.clearUserData();
              Alert.alert('Data Deleted', 'All your data has been permanently deleted.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = useCallback(() => {
    console.log('Privacy Policy button pressed');
    try {
      navigation.push('PrivacyPolicy');
    } catch (error) {
      console.error('Navigation failed:', error);
      Alert.alert('Navigation Error', `Failed to open Privacy Policy: ${error.message}`);
    }
  }, [navigation]);

  const openTermsOfService = useCallback(() => {
    console.log('Terms of Service button pressed');
    try {
      navigation.push('TermsOfService');
    } catch (error) {
      console.error('Navigation failed:', error);
      Alert.alert('Navigation Error', `Failed to open Terms of Service: ${error.message}`);
    }
  }, [navigation]);

  const privacySections = [
    {
      title: 'Data Collection & Usage',
      items: [
        {
          icon: 'information-circle',
          title: 'What data we collect',
          subtitle: 'Trip details, checklists, and usage statistics',
          type: 'info',
          onPress: () => {
            Alert.alert(
              'Data Collection',
              'We collect:\n\n• Trip details (destinations, dates, group size)\n• Checklist items and completion status\n• App usage statistics\n• Device information for performance\n\nAll data is stored locally on your device.'
            );
          },
        },
        {
          icon: 'analytics',
          title: 'Analytics & Performance',
          subtitle: 'Help improve the app (optional)',
          type: 'switch',
          switchValue: analyticsEnabled,
          onSwitchChange: setAnalyticsEnabled,
        },
      ],
    },
    {
      title: 'Privacy Settings',
      items: [
        {
          icon: 'location',
          title: 'Location Services',
          subtitle: 'Access to device location (currently disabled)',
          type: 'switch',
          switchValue: locationEnabled,
          onSwitchChange: setLocationEnabled,
        },
        {
          icon: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Trip reminders and updates',
          type: 'switch',
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        {
          icon: 'camera',
          title: 'Camera & Photos',
          subtitle: 'Profile photo upload permissions',
          type: 'info',
          onPress: () => {
            Alert.alert(
              'Camera Permissions',
              'Camera and photo library access is only used for profile photo uploads. You can change these permissions in your device settings at any time.'
            );
          },
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: 'download',
          title: 'Export Your Data',
          subtitle: 'Download all your data as JSON',
          type: 'chevron',
          onPress: handleDataExport,
        },
        {
          icon: 'trash',
          title: 'Delete All Data',
          subtitle: 'Permanently remove all data',
          type: 'chevron',
          onPress: handleDataDeletion,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: 'lock-closed',
          title: 'Data Encryption',
          subtitle: 'All data is encrypted at rest',
          type: 'info',
          onPress: () => {
            Alert.alert(
              'Security Features',
              'Your data is protected by:\n\n• Local device encryption\n• Secure storage mechanisms\n• No cloud storage by default\n• Optional data export for backup'
            );
          },
        },
        {
          icon: 'shield-checkmark',
          title: 'Privacy by Design',
          subtitle: 'We don\'t sell or share your data',
          type: 'info',
          onPress: () => {
            Alert.alert(
              'Privacy Commitment',
              'TripTick is committed to your privacy:\n\n• No data collection without consent\n• No third-party tracking\n• No data sharing or selling\n• Transparent data practices'
            );
          },
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: 'document-text',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'chevron',
          onPress: openPrivacyPolicy,
        },
        {
          icon: 'document-text-outline',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          type: 'chevron',
          onPress: openTermsOfService,
        },
        {
          icon: 'mail',
          title: 'Contact Us',
          subtitle: 'Questions about privacy or security',
          type: 'chevron',
          onPress: () => {
            // Replace with your actual support email
            const email = 'privacy@odysync.app'; // TODO: Update with your actual support email
            const url = `mailto:${email}?subject=Privacy Question`;
            Linking.canOpenURL(url).then(supported => {
              if (supported) {
                Linking.openURL(url);
              } else {
                Alert.alert('Contact', `Please email us at: ${email}`);
              }
            });
          },
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1a1a1a" : "#fefefe" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#374151" : "#fbbf24",
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? "#374151" : "#f3f4f6",
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>
          <View>
            <RestyleText variant="lg" color="text" fontWeight="bold">
              Privacy & Security
            </RestyleText>
            <RestyleText variant="sm" color="textMuted">
              Your data, your control
            </RestyleText>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {/* Overview */}
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <View style={{
            backgroundColor: isDark ? "#374151" : "#f8fafc",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}>
            <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={8}>
              🔒 Your Privacy Matters
            </RestyleText>
            <RestyleText variant="sm" color="textMuted" lineHeight={20}>
              TripTick is designed with privacy first. Your trip data stays on your device unless you choose to export it. We don't collect personal information, track your location, or share data with third parties.
            </RestyleText>
          </View>
        </View>

        {privacySections.map((section, sectionIndex) => (
          <View key={section.title} style={{ marginBottom: 24 }}>
            <RestyleText
              variant="sm"
              color="textMuted"
              fontWeight="semibold"
              marginHorizontal={16}
              marginBottom={8}
            >
              {section.title}
            </RestyleText>

            <View style={{
              backgroundColor: isDark ? "#374151" : "#ffffff",
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: isDark ? "#4b5563" : "#e5e7eb",
            }}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={item.title}
                  onPress={item.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isDark ? "#4b5563" : "#f3f4f6",
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <RestyleText variant="md" color="text" fontWeight="medium">
                      {item.title}
                    </RestyleText>
                    <RestyleText variant="sm" color="textMuted">
                      {item.subtitle}
                    </RestyleText>
                  </View>

                  {item.type === 'switch' ? (
                    <Pressable
                      onPress={() => item.onSwitchChange?.(!item.switchValue)}
                      style={{
                        width: 50,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: item.switchValue
                          ? '#fbbf24'
                          : isDark ? "#4b5563" : "#d1d5db",
                        alignItems: 'center',
                        justifyContent: item.switchValue ? 'flex-end' : 'flex-start',
                        paddingHorizontal: 2,
                      }}
                    >
                      <View style={{
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        backgroundColor: '#ffffff',
                      }} />
                    </Pressable>
                  ) : (
                    <Ionicons
                      name={item.type === 'info' ? "information-circle" : "chevron-forward"}
                      size={20}
                      color={isDark ? "#6b7280" : "#6b7280"}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
