import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { suggestDestinations } from "../utils/destinationService";
import * as Haptics from "expo-haptics";

interface DestinationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function DestinationInput({
  value,
  onChangeText,
  placeholder = "e.g., Paris, France",
  className = "",
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
    <View className="relative">
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`bg-slate-100 rounded-lg px-4 py-3 pr-12 text-slate-800 ${className}`}
          placeholderTextColor="#94a3b8"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <View className="absolute right-3 top-3">
          <Ionicons name="location" size={20} color="#64748b" />
        </View>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View className="absolute top-full left-0 right-0 z-50 mt-1">
          <ScrollView
            className="bg-white rounded-lg shadow-lg border border-slate-200 max-h-48"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                onPress={() => handleSuggestionPress(suggestion)}
                className="flex-row items-center px-4 py-3 border-b border-slate-100 last:border-b-0"
              >
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text className="text-slate-700 ml-3 flex-1">{suggestion}</Text>
                {value.toLowerCase() === suggestion.toLowerCase() && (
                  <Ionicons name="checkmark" size={16} color="#3b82f6" />
                )}
              </Pressable>
            ))}
            
            {value.length > 0 && !suggestions.some(s => 
              s.toLowerCase().includes(value.toLowerCase())
            ) && (
              <View className="px-4 py-3 bg-blue-50">
                <Text className="text-blue-700 text-sm">
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