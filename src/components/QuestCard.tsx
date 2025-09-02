import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Quest } from '../features/quests/data';

interface QuestCardProps {
  quest: Quest;
  isCompleted: boolean;
  onPress: () => void;
}

export function QuestCard({ quest, isCompleted, onPress }: QuestCardProps) {
  const { isDark } = useThemeStore();

  return (
    <Pressable
      onPress={onPress}
      disabled={isCompleted}
      style={{
        backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isCompleted 
          ? (isDark ? '#374151' : '#E5E5E5')
          : (isDark ? '#4ECDC4' : '#4ECDC4'),
        opacity: isCompleted ? 0.6 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontFamily: 'Questrial-Regular-SemiBold',
            color: isDark ? '#FFFFFF' : '#333333',
            marginBottom: 4,
          }}>
            {quest.title}
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: 'Questrial-Regular-Regular',
            color: isDark ? '#CCCCCC' : '#666666',
            lineHeight: 20,
          }}>
            {quest.description}
          </Text>
        </View>
        
        {isCompleted ? (
          <View style={{
            backgroundColor: '#45B69C',
            borderRadius: 20,
            padding: 8,
          }}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        ) : (
          <View style={{
            backgroundColor: '#4ECDC4',
            borderRadius: 20,
            padding: 8,
          }}>
            <Ionicons name="play" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{
          backgroundColor: isCompleted 
            ? (isDark ? '#374151' : '#F3F4F6')
            : '#FFD93D',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
        }}>
          <Text style={{
            fontSize: 12,
            fontFamily: 'Questrial-Regular-SemiBold',
            color: isCompleted 
              ? (isDark ? '#CCCCCC' : '#666666')
              : '#333333',
          }}>
            +{quest.rewardXP} XP
          </Text>
        </View>

        <Text style={{
          fontSize: 12,
          fontFamily: 'Questrial-Regular-Medium',
          color: isCompleted 
            ? (isDark ? '#666666' : '#999999')
            : (isDark ? '#4ECDC4' : '#4ECDC4'),
        }}>
          {isCompleted ? 'Completed' : 'Tap to start'}
        </Text>
      </View>
    </Pressable>
  );
}
