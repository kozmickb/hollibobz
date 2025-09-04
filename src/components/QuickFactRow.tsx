import React from "react";
import { View, Text } from "react-native";
import { useThemeStore } from '../store/useThemeStore';

export function QuickFactRow(props: { label: string; value: string }) {
  const { isDark } = useThemeStore();
  
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      alignItems: 'flex-start',
    }}>
      <Text style={{
        color: isDark ? '#CCCCCC' : '#666666',
        fontSize: 14,
        fontFamily: 'Questrial',
        flex: 0.35,
      }}>
        {props.label}
      </Text>
      <Text style={{
        color: isDark ? '#FFFFFF' : '#333333',
        fontSize: 14,
        fontFamily: 'Questrial',
        fontWeight: '500',
        flex: 0.65,
        textAlign: 'right',
      }}>
        {props.value}
      </Text>
    </View>
  );
}
