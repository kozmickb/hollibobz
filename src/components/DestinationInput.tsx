import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { suggestDestinations } from "../utils/destinationService";
import * as Haptics from "expo-haptics";

interface DestinationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: object;
}

export function DestinationInput({
  value,
  onChangeText,
  placeholder = "e.g., Paris, France",
  style = {},
}: DestinationInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value.length > 0) {
      const newSuggestions = suggestDestinations(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions(suggestDestinations(""));
      setShowSuggestions(isFocused);
    }
  }, [value, isFocused]);

  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText(suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value.length === 0) {
      setSuggestions(suggestDestinations(""));
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for tap
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <View style={{ position: 'relative' }}>
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            backgroundColor: isDark ? '#374151' : '#f1f5f9',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingRight: 48,
            color: isDark ? '#f1f5f9' : '#1e293b',
            fontSize: 16,
            ...style
          }}
          placeholderTextColor="#94a3b8"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <View style={{ position: 'absolute', right: 12, top: 12 }}>
          <Ionicons name="location" size={20} color={isDark ? '#9ca3af' : '#64748b'} />
        </View>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: 4 }}>
          <ScrollView
            style={{
              backgroundColor: isDark ? '#1f2937' : 'white',
              borderRadius: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              borderWidth: 1,
              borderColor: isDark ? '#374151' : '#e2e8f0',
              maxHeight: 192,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                onPress={() => handleSuggestionPress(suggestion)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#374151' : '#f1f5f9'
                }}
              >
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text style={{ 
                  color: isDark ? '#d1d5db' : '#374151', 
                  marginLeft: 12, 
                  flex: 1 
                }}>{suggestion}</Text>
                {value.toLowerCase() === suggestion.toLowerCase() && (
                  <Ionicons name="checkmark" size={16} color="#3b82f6" />
                )}
              </Pressable>
            ))}
            
            {value.length > 0 && !suggestions.some(s => 
              s.toLowerCase().includes(value.toLowerCase())
            ) && (
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 1)',
              }}>
                <Text style={{
                  color: isDark ? '#60a5fa' : '#1d4ed8',
                  fontSize: 12,
                }}>
                  💡 Tip: Try popular destinations like "Paris, France" or "Tokyo, Japan"
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}