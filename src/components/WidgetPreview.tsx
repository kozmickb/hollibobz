import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHolidayStore } from "../store/useHolidayStore";
import { useThemeStore } from "../store/useThemeStore";

export function WidgetPreview() {
  const { timers, currentDestination } = useHolidayStore();
  const { isDark } = useThemeStore();
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
    <View style={{ padding: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#f1f5f9' : '#1e293b' }}>Widget Preview</Text>
        <Pressable
          onPress={handleAddToHomeScreen}
          style={{
            backgroundColor: '#3b82f6',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add-circle" size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: '500', marginLeft: 4 }}>Add to Home</Text>
        </Pressable>
      </View>

      {/* Small Widget Preview */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : 'white', 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 16, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e2e8f0'
      }}>
        <Text style={{ fontSize: 10, color: isDark ? '#9ca3af' : '#64748b', marginBottom: 4 }}>Small Widget</Text>
        <View style={{ 
          backgroundColor: '#8b5cf6', 
          borderRadius: 12, 
          padding: 12 
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }} numberOfLines={1}>
            {currentDestination?.name || mainTimer.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              {Math.floor(
                (new Date(mainTimer.date).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, marginLeft: 4 }}>days</Text>
          </View>
        </View>
      </View>

      {/* Medium Widget Preview */}
      <View style={{ 
        backgroundColor: isDark ? '#1f2937' : 'white', 
        borderRadius: 16, 
        padding: 16, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e2e8f0'
      }}>
        <Text style={{ fontSize: 10, color: isDark ? '#9ca3af' : '#64748b', marginBottom: 4 }}>Medium Widget</Text>
        <View style={{ 
          backgroundColor: '#8b5cf6', 
          borderRadius: 12, 
          padding: 16 
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }} numberOfLines={1}>
            {currentDestination?.name || mainTimer.name}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {Math.floor(
                  (new Date(mainTimer.date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>Days</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {Math.floor(
                  ((new Date(mainTimer.date).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60)) %
                    24
                )}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>Hours</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {Math.floor(
                  ((new Date(mainTimer.date).getTime() - new Date().getTime()) /
                    (1000 * 60)) %
                    60
                )}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>Minutes</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}