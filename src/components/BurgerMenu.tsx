import React, { useState } from 'react';
import { Modal, View, Text, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeButton } from './ThemeButton';
import { HomeStackParamList } from '../navigation/AppNavigator';
import { textStyles, accessibilityProps, hitSlop } from '../utils/accessibility';

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function BurgerMenu({ visible, onClose }: BurgerMenuProps) {
  const navigation = useNavigation();
  const { isDark, reduceMotion, setReduceMotion } = useThemeStore();

  const menuItems: Array<{
    icon: any;
    label: string;
    screen: keyof HomeStackParamList;
    description: string;
    isTab?: boolean;
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
      screen: 'HollyChat' as any,
      description: 'Chat with Holly Bobz',
      isTab: true
    }
  ];

  const handleNavigate = (screen: keyof HomeStackParamList, isTab?: boolean) => {
    onClose();
    if (isTab) {
      navigation.getParent()?.navigate('ChatTab', { screen: screen as any });
    } else {
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
              onPress={() => handleNavigate(item.screen, item.isTab)}
              hitSlop={hitSlop}
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
                <Text style={[textStyles.h3, { marginBottom: 4 }]}>
                  {item.label}
                </Text>
                <Text style={[textStyles.bodySmall]}>
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
          <Text style={[textStyles.label, { marginBottom: 16 }]}>
            Settings
          </Text>
          
          <View style={{ gap: 16 }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View>
                <Text style={[textStyles.label, { marginBottom: 2 }]}>
                  Theme
                </Text>
                <Text style={[textStyles.bodySmall]}>
                  Tap to cycle through themes
                </Text>
              </View>
              
              <ThemeButton />
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View>
                <Text style={[textStyles.label, { marginBottom: 2 }]}>
                  Reduce Motion
                </Text>
                <Text style={[textStyles.bodySmall]}>
                  Disable animations for accessibility
                </Text>
              </View>
              
              <Pressable
                onPress={() => setReduceMotion(!reduceMotion)}
                hitSlop={hitSlop}
                style={{
                  backgroundColor: reduceMotion ? '#10B981' : '#E5E7EB',
                  borderRadius: 20,
                  width: 44,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: reduceMotion ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2,
                }}
                {...accessibilityProps.button}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }} />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
