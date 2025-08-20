import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHolidayStore } from "../state/holidayStore";

export function WidgetPreview() {
  const { timers, currentDestination } = useHolidayStore();
  const mainTimer = timers.find((timer) => timer.type === "holiday");

  const handleAddToHomeScreen = () => {
    Alert.alert(
      "Add Widget to Home Screen",
      "To add this countdown widget to your home screen:\n\n1. Long press on your home screen\n2. Tap the '+' button\n3. Search for 'Holiday Countdown'\n4. Select the widget size you prefer\n5. Tap 'Add Widget'",
      [{ text: "Got it!", style: "default" }]
    );
  };

  if (!mainTimer) {
    return null;
  }

  return (
    <View className="p-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-slate-800">Widget Preview</Text>
        <Pressable
          onPress={handleAddToHomeScreen}
          className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
        >
          <Ionicons name="add-circle" size={16} color="white" />
          <Text className="text-white font-medium ml-1">Add to Home</Text>
        </Pressable>
      </View>

      {/* Small Widget Preview */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-200">
        <Text className="text-xs text-slate-500 mb-1">Small Widget</Text>
        <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>
            {currentDestination?.name || mainTimer.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-white text-2xl font-bold">
              {Math.floor(
                (new Date(mainTimer.date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
            </Text>
            <Text className="text-white/80 text-xs ml-1">days</Text>
          </View>
        </View>
      </View>

      {/* Medium Widget Preview */}
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <Text className="text-xs text-slate-500 mb-1">Medium Widget</Text>
        <View className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4">
          <Text className="text-white font-bold text-lg mb-2" numberOfLines={1}>
            {currentDestination?.name || mainTimer.name}
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-white text-xl font-bold">
                {Math.floor(
                  (new Date(mainTimer.date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </Text>
              <Text className="text-white/80 text-xs">Days</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">
                {Math.floor(
                  ((new Date(mainTimer.date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60)) %
                    24
                )}
              </Text>
              <Text className="text-white/80 text-xs">Hours</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">
                {Math.floor(
                  ((new Date(mainTimer.date).getTime() - new Date().getTime()) /
                    (1000 * 60)) %
                    60
                )}
              </Text>
              <Text className="text-white/80 text-xs">Minutes</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}