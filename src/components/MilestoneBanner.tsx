import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

interface MilestoneBannerProps {
  label: string;
}

export function MilestoneBanner({ label }: MilestoneBannerProps) {
  const { isDark } = useThemeStore();
  
  return (
    <View style={{
      marginTop: 16,
      marginHorizontal: 4,
      backgroundColor: isDark ? '#1a4b3a' : '#F0FDF4',
      borderColor: isDark ? '#22c55e' : '#86EFAC',
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
    }}>
      <Ionicons 
        name="sparkles" 
        size={24} 
        color={isDark ? '#4ade80' : '#16a34a'} 
        style={{ marginRight: 12, marginTop: 2 }}
      />
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontFamily: 'Poppins-SemiBold',
          color: isDark ? '#4ade80' : '#16a34a',
          marginBottom: 4,
        }}>
          Milestone Reached!
        </Text>
        
        <Text style={{
          fontSize: 14,
          fontFamily: 'Poppins-Medium',
          color: isDark ? '#86efac' : '#15803d',
          marginBottom: 6,
        }}>
          {label}
        </Text>
        
        <Text style={{
          fontSize: 13,
          fontFamily: 'Poppins-Regular',
          color: isDark ? '#bbf7d0' : '#166534',
          lineHeight: 18,
        }}>
          Check out today's teaser below or ask Holly for personalised advice
        </Text>
      </View>
    </View>
  );
}
