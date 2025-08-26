import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

export function ThemeButton() {
  const { mode, setMode, isDark } = useThemeStore();
  
  const cycleTheme = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };
  
  const getIcon = () => {
    switch (mode) {
      case 'light': return 'sunny-outline';
      case 'dark': return 'moon-outline';
      case 'system': return 'phone-portrait-outline';
      default: return 'sunny-outline';
    }
  };

  return (
    <Pressable
      onPress={cycleTheme}
      style={{
        backgroundColor: isDark ? '#333333' : '#F7F7F7',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Ionicons name={getIcon()} size={16} color={isDark ? '#F7F7F7' : '#666666'} />
      <Text style={{
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: isDark ? '#F7F7F7' : '#666666',
        textTransform: 'capitalize',
      }}>
        {mode}
      </Text>
    </Pressable>
  );
}
