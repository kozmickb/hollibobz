import React from 'react';
import { View, ScrollView, Pressable, Platform, ImageBackground, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RestyleText } from '../components/RestyleText';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/useThemeStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, "Profile">;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark, toggleColorScheme } = useThemeStore();

  const profileSections = [
    {
      title: 'App Settings',
      items: [
        {
          icon: isDark ? 'sunny' : 'moon',
          title: 'Dark Mode',
          subtitle: 'Toggle between light and dark theme',
          type: 'toggle',
          value: isDark,
          onPress: toggleColorScheme,
        },
        {
          icon: 'notifications',
          title: 'Notifications',
          subtitle: 'Manage push notifications',
          type: 'toggle',
          value: true,
          onPress: () => {},
        },
        {
          icon: 'language',
          title: 'Language',
          subtitle: 'English',
          type: 'chevron',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Profile Information',
          subtitle: 'Edit your personal details',
          type: 'chevron',
          onPress: () => {},
        },
        {
          icon: 'shield-checkmark',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          type: 'chevron',
          onPress: () => {},
        },
        {
          icon: 'card',
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          type: 'chevron',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          title: 'Help & Support',
          subtitle: 'Get help with the app',
          type: 'chevron',
          onPress: () => {},
        },
        {
          icon: 'document-text',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          type: 'chevron',
          onPress: () => {},
        },
        {
          icon: 'shield',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'chevron',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          title: 'About TripTick',
          subtitle: 'Version 1.0.0',
          type: 'chevron',
          onPress: () => {},
        },
        {
          icon: 'star',
          title: 'Rate the App',
          subtitle: 'Share your feedback',
          type: 'chevron',
          onPress: () => {},
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ImageBackground
            source={require('../../assets/TT logo.png')}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            resizeMode="cover"
          />
          <RestyleText variant="xl" color="text" fontWeight="bold">
            Profile
          </RestyleText>
        </View>
      </View>

      {/* Profile Header */}
      <View style={{ 
        padding: 20, 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#374151" : "#e5e7eb",
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isDark ? "#374151" : "#f3f4f6",
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Ionicons 
            name="person" 
            size={40} 
            color={isDark ? "#6b7280" : "#9ca3af"} 
          />
        </View>
        <RestyleText variant="lg" color="text" fontWeight="bold">
          Traveler
        </RestyleText>
        <RestyleText variant="sm" color="textMuted">
          Ready for your next adventure!
        </RestyleText>
      </View>

      {/* Settings Sections */}
      <ScrollView style={{ flex: 1 }}>
        {profileSections.map((section, sectionIndex) => (
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
                  
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onPress}
                      trackColor={{ false: isDark ? "#4b5563" : "#d1d5db", true: "#fbbf24" }}
                      thumbColor={item.value ? "#ffffff" : "#ffffff"}
                    />
                  ) : (
                    <Ionicons 
                      name="chevron-forward" 
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
