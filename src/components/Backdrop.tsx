import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { useThemeStore } from '../store/useThemeStore';

export function Backdrop(props: { destination: string; imageUrl?: string }) {
  const { isDark } = useThemeStore();
  
  if (!props.imageUrl) {
    // Fallback: solid card with initials
    const initials = props.destination.split(/\s+/).map(s => s[0]?.toUpperCase()).slice(0,2).join("");
    return (
      <View style={{
        height: 176,
        backgroundColor: isDark ? '#444444' : '#666666',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 36,
          fontFamily: 'Poppins-Bold',
        }}>
          {initials || "?"}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={{ borderRadius: 20, overflow: 'hidden', height: 176 }}>
      <ImageBackground 
        source={{ uri: props.imageUrl }} 
        style={{ flex: 1, justifyContent: 'flex-end', resizeMode: 'cover' }}
      >
        <View style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 20,
            fontFamily: 'Poppins-SemiBold',
          }}>
            {props.destination}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}
