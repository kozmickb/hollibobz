import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

interface TeaserCardProps {
  title: string;
  body: string;
  onMore: () => void;
}

export function TeaserCard({ title, body, onMore }: TeaserCardProps) {
  const { isDark } = useThemeStore();
  
  return (
    <View style={{
      backgroundColor: isDark ? '#2a2a2a' : '#F8FAFC',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E2E8F0',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons 
          name="bulb-outline" 
          size={20} 
          color={isDark ? '#FFD93D' : '#F59E0B'} 
          style={{ marginRight: 8 }}
        />
        <Text style={{
          fontSize: 16,
          fontFamily: 'Questrial-Regular-SemiBold',
          color: isDark ? '#FFFFFF' : '#1F2937',
          flex: 1,
        }}>
          {title}
        </Text>
      </View>
      
      <Text style={{
        fontSize: 14,
        fontFamily: 'Questrial-Regular-Regular',
        color: isDark ? '#D1D5DB' : '#4B5563',
        lineHeight: 20,
        marginBottom: 16,
      }}>
        {body}
      </Text>
      
      <Pressable 
        onPress={onMore}
        style={{
          backgroundColor: '#4ECDC4',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: 14,
          fontFamily: 'Questrial-Regular-SemiBold',
          marginRight: 6,
        }}>
          Tell me more
        </Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
