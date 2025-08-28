import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

export function ThemeButton() {
  const { colorScheme, setColorScheme } = useThemeStore();
  
  const cycleTheme = () => {
    const newScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newScheme);
  };
  
  const getIcon = () => {
    switch (colorScheme) {
      case 'light': return 'sunny-outline';
      case 'dark': return 'moon-outline';
      default: return 'sunny-outline';
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={cycleTheme}
      style={{
        backgroundColor: isDark 
          ? 'rgba(55, 65, 81, 0.8)' 
          : 'rgba(251, 146, 60, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: isDark 
          ? 'rgba(75, 85, 99, 0.5)' 
          : 'rgba(251, 146, 60, 0.2)',
        shadowColor: isDark ? '#000' : '#F97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.1,
        shadowRadius: 4,
        elevation: isDark ? 2 : 2,
      }}
    >
      <Ionicons 
        name={getIcon()} 
        size={16} 
        color={isDark ? '#FB923C' : '#F97316'} 
      />
      <Text style={{
        fontSize: 12,
        fontFamily: 'Poppins-Medium',
        color: isDark ? '#F3F4F6' : '#EA580C',
        textTransform: 'capitalize',
      }}>
        {colorScheme}
      </Text>
    </Pressable>
  );
}
