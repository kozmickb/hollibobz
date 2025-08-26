import React from "react";
import { View, Text, Pressable } from "react-native";
import { useThemeStore } from '../store/useThemeStore';

export function FAQCard(props: { title: string; onPress: () => void }) {
  const { isDark } = useThemeStore();
  
  const handlePress = () => {
    console.log('FAQ Card pressed:', props.title);
    props.onPress();
  };
  
  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: pressed 
          ? (isDark ? '#333333' : '#E5E5E5')
          : (isDark ? '#2a2a2a' : '#F7F7F7'),
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 2,
        elevation: 2,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{
        color: isDark ? '#FFFFFF' : '#333333',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8,
      }}>
        {props.title}
      </Text>
      <View>
        <Text style={{
          color: '#4ECDC4',
          fontSize: 14,
          fontFamily: 'Poppins-Medium',
        }}>
          Tell me more →
        </Text>
      </View>
    </Pressable>
  );
}
