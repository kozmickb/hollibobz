import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Platform, ImageBackground, Switch, Alert, Image, ActionSheetIOS } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text as RestyleText } from '../components/ui/Text';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/useThemeStore';
import { ProfileStackParamList } from '../navigation/AppNavigator';
import { UserStorageManager } from '../lib/userStorage';
import { UserProfile } from '../entities/userProfile';

type Nav = NativeStackNavigationProp<ProfileStackParamList, "Profile">;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark, toggleColorScheme } = useThemeStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storageStats, setStorageStats] = useState<{
    totalKeys: number;
    triptickKeys: number;
    estimatedSize: string;
  } | null>(null);
  
  const userManager = UserStorageManager.getInstance();

  useEffect(() => {
    loadUserProfile();
    loadStorageStats();
  }, []);

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
      loadStorageStats();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      const profile = await userManager.getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await userManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const userData = await userManager.exportUserData();
      const dataString = JSON.stringify(userData, null, 2);
      
      // For web, download as file
      if (Platform.OS === 'web') {
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `triptick-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, could implement share functionality
        Alert.alert('Export Complete', 'Your data has been prepared for export');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your trips, checklists, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await userManager.clearUserData();
              setUserProfile(null);
              setStorageStats(null);
              Alert.alert('Data Cleared', 'All your data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const updatePreference = async (key: keyof UserProfile['preferences'], value: any) => {
    try {
      await userManager.updatePreferences({ [key]: value });
      await loadUserProfile(); // Reload to get updated profile
    } catch (error) {
      Alert.alert('Error', 'Failed to update preference');
    }
  };

  // Request permissions for image picker
  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return false; // Web doesn't support permissions
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    return cameraPermission.granted && libraryPermission.granted;
  };

  // Pick image from camera
  const pickFromCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Web Limitation', 'Camera access is not available in the web version.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera and photo library permissions are required to select a profile image.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await userManager.updateAvatar(result.assets[0].uri);
        await loadUserProfile(); // Reload to show updated avatar
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Pick image from gallery
  const pickFromGallery = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Web Limitation', 'Photo library access is not available in the web version.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Photo library permission is required to select a profile image.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await userManager.updateAvatar(result.assets[0].uri);
        await loadUserProfile(); // Reload to show updated avatar
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    // Check if we're on web - ImagePicker doesn't work on web
    if (Platform.OS === 'web') {
      console.log('Profile photo upload attempted on web - showing limitation message');
      Alert.alert(
        'Web Limitation',
        'Profile photo upload is not available in the web version. Please use the mobile app to upload photos.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Remove Photo'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              pickFromCamera();
              break;
            case 2:
              pickFromGallery();
              break;
            case 3:
              removeAvatar();
              break;
          }
        }
      );
    } else {
      Alert.alert(
        'Change Profile Photo',
        '',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: pickFromCamera },
          { text: 'Choose from Library', onPress: pickFromGallery },
          { text: 'Remove Photo', style: 'destructive', onPress: removeAvatar },
        ]
      );
    }
  };

  // Remove avatar
  const removeAvatar = async () => {
    try {
      await userManager.removeAvatar();
      await loadUserProfile(); // Reload to show default avatar
      Alert.alert('Success', 'Profile photo removed');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove profile photo');
    }
  };

  const profileSections = [
    {
      title: 'Profile',
      items: [
        {
          icon: 'person',
          title: 'Profile Information',
          subtitle: userProfile ? `${userProfile.stats.tripsCreated} trips created` : 'Loading...',
          type: 'chevron',
          onPress: () => {
            if (userProfile) {
              Alert.alert(
                'Your Statistics',
                `Trips Created: ${userProfile.stats.tripsCreated}\n` +
                `Checklists Completed: ${userProfile.stats.checklistsCompleted}\n` +
                `Items Checked: ${userProfile.stats.itemsChecked}\n` +
                `Member Since: ${new Date(userProfile.stats.joinedDate).toLocaleDateString()}`
              );
            }
          },
        },
        {
          icon: 'shield-checkmark',
          title: 'Privacy & Security',
          subtitle: 'Data usage, permissions, and security settings',
          type: 'chevron',
          onPress: () => {
            navigation.navigate('PrivacySecurity' as any);
          },
        },
      ],
    },
    {
      title: 'Checklist Preferences',
      items: [
        {
          icon: 'list',
          title: 'Default View',
          subtitle: userProfile?.preferences.defaultChecklistView === 'expanded' ? 'Expanded' : 'Collapsed',
          type: 'chevron',
          onPress: () => {
            if (userProfile) {
              const newView = userProfile.preferences.defaultChecklistView === 'expanded' ? 'collapsed' : 'expanded';
              updatePreference('defaultChecklistView', newView);
            }
          },
        },
        {
          icon: 'analytics',
          title: 'Show Progress Indicators',
          subtitle: userProfile?.preferences.showProgressIndicators ? 'Enabled' : 'Disabled',
          type: 'switch',
          switchValue: userProfile?.preferences.showProgressIndicators ?? true,
          onSwitchChange: (value: boolean) => updatePreference('showProgressIndicators', value),
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: 'cloud-download',
          title: 'Export Data',
          subtitle: storageStats ? `${storageStats.estimatedSize} stored` : 'Loading...',
          type: 'chevron',
          onPress: handleExportData,
        },
        {
          icon: 'information-circle',
          title: 'Storage Info',
          subtitle: storageStats ? `${storageStats.triptickKeys} items` : 'Loading...',
          type: 'chevron',
          onPress: () => {
            if (storageStats) {
              Alert.alert(
                'Storage Information',
                `TripTick Data: ${storageStats.triptickKeys} items\n` +
                `Estimated Size: ${storageStats.estimatedSize}\n` +
                `Total Device Keys: ${storageStats.totalKeys}`
              );
            }
          },
        },
        {
          icon: 'trash',
          title: 'Clear All Data',
          subtitle: 'Permanently delete all data',
          type: 'chevron',
          onPress: handleClearData,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: 'document-text',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          type: 'chevron',
          onPress: () => {
            console.log('Terms of Service pressed');
          },
        },
        {
          icon: 'shield',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'chevron',
          onPress: () => {
            console.log('Privacy Policy pressed');
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
        <Pressable
          onPress={showImagePickerOptions}
          style={{
            position: 'relative',
            marginBottom: 16,
          }}
        >
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isDark ? "#374151" : "#f3f4f6",
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {userProfile?.avatar ? (
              <Image
                source={{ uri: userProfile.avatar }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="person"
                size={40}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
            )}
          </View>

          {/* Camera overlay button - only show on mobile */}
          {Platform.OS !== 'web' && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#fbbf24',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: isDark ? "#1f2937" : "#ffffff",
            }}>
              <Ionicons
                name="camera"
                size={16}
                color="#1f2937"
              />
            </View>
          )}

          {/* Web indicator */}
          {Platform.OS === 'web' && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#6b7280',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: isDark ? "#1f2937" : "#ffffff",
            }}>
              <Ionicons
                name="desktop"
                size={14}
                color="#ffffff"
              />
            </View>
          )}
        </Pressable>

        <RestyleText variant="lg" color="text" fontWeight="bold">
          {userProfile?.name || 'Traveler'}
        </RestyleText>
        <RestyleText variant="sm" color="textMuted">
          {Platform.OS === 'web'
            ? 'Photo upload available on mobile'
            : (userProfile?.avatar ? 'Tap photo to change' : 'Ready for your next adventure!')
          }
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
                  ) : item.type === 'switch' ? (
                    <Switch
                      value={item.switchValue}
                      onValueChange={item.onSwitchChange}
                      trackColor={{ false: isDark ? "#4b5563" : "#d1d5db", true: "#fbbf24" }}
                      thumbColor={item.switchValue ? "#ffffff" : "#ffffff"}
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
