import React, { useState } from 'react';
import { Modal, View, Text, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeButton } from './ThemeButton';
import { RootStackParamList } from '../navigation/AppNavigator';

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function BurgerMenu({ visible, onClose }: BurgerMenuProps) {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();

  const menuItems: Array<{
    icon: any;
    label: string;
    screen: keyof RootStackParamList;
    description: string;
  }> = [
    {
      icon: 'home-outline',
      label: 'Home',
      screen: 'Home',
      description: 'View your trip timers'
    },
    {
      icon: 'add-circle-outline',
      label: 'Add Timer',
      screen: 'AddTimer',
      description: 'Plan a new holiday'
    },
    {
      icon: 'chatbubble-outline',
      label: 'Holly Chat',
      screen: 'HollyChat',
      description: 'AI travel assistant'
    }
  ];

  const handleNavigate = (screen: keyof RootStackParamList) => {
    onClose();
    if (screen === 'HollyChat') {
      navigation.navigate(screen, undefined);
    } else {
      // @ts-ignore - navigation typing for other screens
      navigation.navigate(screen);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#F7F7F7' }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <LinearGradient
          colors={['#FF6B6B', '#FFD93D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{
              fontSize: 28,
              fontFamily: 'Poppins-Bold',
              color: '#FFFFFF',
              marginBottom: 4,
            }}>
              TripTick
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              color: 'rgba(255, 255, 255, 0.9)',
            }}>
              Navigate your travel journey
            </Text>
          </View>
          
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 12,
              padding: 8,
            }}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </LinearGradient>

        {/* Menu Items */}
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          {menuItems.map((item) => (
            <Pressable
              key={item.screen}
              onPress={() => handleNavigate(item.screen)}
              style={{
                backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
                borderRadius: 20,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View style={{
                backgroundColor: isDark ? '#FF6B6B' : '#F7F7F7',
                borderRadius: 16,
                padding: 12,
                marginRight: 16,
              }}>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={isDark ? '#FFFFFF' : '#FF6B6B'} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontFamily: 'Poppins-SemiBold',
                  color: isDark ? '#FFFFFF' : '#333333',
                  marginBottom: 4,
                }}>
                  {item.label}
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontFamily: 'Poppins-Regular',
                  color: isDark ? '#CCCCCC' : '#666666',
                }}>
                  {item.description}
                </Text>
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#666666' : '#CCCCCC'} 
              />
            </Pressable>
          ))}
        </View>

        {/* Settings Section */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: isDark ? '#333333' : '#E5E5E5',
          padding: 24,
        }}>
          <Text style={{
            fontSize: 16,
            fontFamily: 'Poppins-SemiBold',
            color: isDark ? '#FFFFFF' : '#333333',
            marginBottom: 16,
          }}>
            Settings
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View>
              <Text style={{
                fontSize: 16,
                fontFamily: 'Poppins-Medium',
                color: isDark ? '#FFFFFF' : '#333333',
                marginBottom: 2,
              }}>
                Theme
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#CCCCCC' : '#666666',
              }}>
                Tap to cycle through themes
              </Text>
            </View>
            
            <ThemeButton />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
