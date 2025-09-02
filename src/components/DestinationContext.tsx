import React from 'react';
import { View, Text } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface DestinationContextProps {
  destination: string;
  date?: string;
}

export function DestinationContext({ destination, date }: DestinationContextProps) {
  const { isDark } = useThemeStore();
  
  return (
    <View style={{
      backgroundColor: isDark ? '#2a2a2a' : '#E8F4FD',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#4ECDC4',
    }}>
      <Text style={{
        fontSize: 14,
        fontFamily: 'Questrial-Regular-SemiBold',
        color: isDark ? '#FFFFFF' : '#333333',
        marginBottom: 4,
      }}>
        🎯 Focused on {destination}
      </Text>
      {date && (
        <Text style={{
          fontSize: 12,
          fontFamily: 'Questrial-Regular-Regular',
          color: isDark ? '#CCCCCC' : '#666666',
        }}>
          Travel date: {new Date(date).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
      )}
      <Text style={{
        fontSize: 12,
        fontFamily: 'Questrial-Regular-Regular',
        color: isDark ? '#CCCCCC' : '#666666',
        marginTop: 4,
        fontStyle: 'italic',
      }}>
        All advice will be specific to this destination
      </Text>
    </View>
  );
}
