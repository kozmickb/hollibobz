import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BurgerMenu } from './BurgerMenu';
import { useThemeStore } from '../store/useThemeStore';

export function BurgerMenuButton() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { isDark } = useThemeStore();

  return (
    <>
      <Pressable
        onPress={() => setMenuVisible(true)}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 12,
          padding: 8,
        }}
      >
        <Ionicons name="menu" size={24} color="#FFFFFF" />
      </Pressable>
      
      <BurgerMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </>
  );
}
