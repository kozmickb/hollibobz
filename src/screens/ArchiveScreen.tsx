import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useHolidayStore } from '../store/useHolidayStore';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from '../components/ui/Text';
import { ThemeButton } from '../components/ThemeButton';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, "Archive">;

export function ArchiveScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark } = useThemeStore();
  const { archivedTimers, restoreTimer, removeTimer, purgeArchive } = useHolidayStore();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRestore = (timerId: string) => {
    Alert.alert(
      'Restore Timer',
      'Are you sure you want to restore this timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () => {
            restoreTimer(timerId);
          },
        },
      ]
    );
  };

  const handleDelete = (timerId: string) => {
    Alert.alert(
      'Delete Timer',
      'Are you sure you want to permanently delete this timer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeTimer(timerId);
          },
        },
      ]
    );
  };

  const handlePurgeAll = () => {
    Alert.alert(
      'Clear All Archived',
      'Are you sure you want to permanently delete all archived timers? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await purgeArchive();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f8fafc' }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1f2937' : '#e2e8f0',
            paddingHorizontal: 16,
            paddingTop: 50,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f1f5f9',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={isDark ? '#f8fafc' : '#1e293b'} />
            </Pressable>
            <View>
              <RestyleText variant="xl" color="text" fontWeight="semibold">
                Archived Trips
              </RestyleText>
              <RestyleText variant="sm" color="textMuted">
                {archivedTimers.length} archived timer{archivedTimers.length !== 1 ? 's' : ''}
              </RestyleText>
            </View>
          </View>
          
          {archivedTimers.length > 0 && (
            <Pressable
              onPress={handlePurgeAll}
              style={{
                backgroundColor: isDark ? '#dc2626' : '#ef4444',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="trash" size={20} color="#ffffff" />
            </Pressable>
          )}
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {archivedTimers.length === 0 ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 60,
            }}>
              <View style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 50,
                padding: 20,
                marginBottom: 16,
              }}>
                <Ionicons 
                  name="archive-outline" 
                  size={48} 
                  color={isDark ? '#6b7280' : '#9ca3af'} 
                />
              </View>
              <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={8}>
                No Archived Trips
              </RestyleText>
              <RestyleText variant="md" color="textMuted" textAlign="center">
                Archived trips will appear here. You can restore them or delete them permanently.
              </RestyleText>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {archivedTimers.map((timer) => (
                <Animated.View
                  key={timer.id}
                  style={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    opacity: fadeAnim,
                    transform: [{ 
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={4}>
                        {timer.destination}
                      </RestyleText>
                      <RestyleText variant="sm" color="textMuted">
                        {formatDate(timer.date)}
                      </RestyleText>
                    </View>
                    <View style={{
                      backgroundColor: isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                      borderRadius: 8,
                      padding: 4,
                    }}>
                      <Ionicons name="archive" size={16} color="#6b7280" />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <ThemeButton
                      onPress={() => handleRestore(timer.id)}
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        borderColor: '#10b981',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="refresh" size={16} color="#10b981" style={{ marginRight: 8 }} />
                        <RestyleText variant="sm" color="success" fontWeight="semibold">
                          Restore
                        </RestyleText>
                      </View>
                    </ThemeButton>

                    <ThemeButton
                      onPress={() => handleDelete(timer.id)}
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        borderColor: '#ef4444',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                        <RestyleText variant="sm" color="error" fontWeight="semibold">
                          Delete
                        </RestyleText>
                      </View>
                    </ThemeButton>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}
