import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore, Timer } from "../state/holidayStore";
import { getDestinationInfo } from "../utils/destinationService";
import { CelebrationModal } from "../components/CelebrationModal";
import { DestinationInput } from "../components/DestinationInput";
import * as Haptics from "expo-haptics";

type AddTimerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddTimer"
>;

const timerTypes: Array<{ value: Timer["type"]; label: string; icon: string }> = [
  { value: "holiday", label: "Holiday", icon: "sunny" },
  { value: "flight", label: "Flight", icon: "airplane" },
  { value: "excursion", label: "Excursion", icon: "map" },
  { value: "custom", label: "Custom", icon: "time" },
];

export function AddTimerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AddTimerScreenNavigationProp>();
  const { addTimer, setDestination, settings } = useHolidayStore();

  const [name, setName] = useState("");
  const [destination, setDestinationName] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<Timer["type"]>("holiday");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a timer name");
      return;
    }

    if (date <= new Date()) {
      Alert.alert("Error", "Please select a future date");
      return;
    }

    // Haptic feedback for button press
    if (settings.enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);

    try {
      // Add the timer
      addTimer({
        name: name.trim(),
        date,
        type: selectedType,
      });

      // If it's a holiday timer and destination is provided, fetch destination info
      if (selectedType === "holiday" && destination.trim()) {
        const destinationInfo = await getDestinationInfo(destination.trim());
        if (destinationInfo) {
          setDestination(destinationInfo);
        }
      }

      // Show celebration animation if enabled
      if (settings.enableAnimations) {
        setShowCelebration(true);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving timer:", error);
      Alert.alert("Error", "Failed to save timer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View style={{ paddingTop: insets.top }} className="p-6">
        <View className="bg-white rounded-xl p-6 mb-6">
          <Text className="text-lg font-semibold text-slate-800 mb-4">
            Timer Details
          </Text>

          <View className="mb-4">
            <Text className="text-slate-600 font-medium mb-2">Timer Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Paris Vacation, Flight to Tokyo"
              className="bg-slate-100 rounded-lg px-4 py-3 text-slate-800"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {selectedType === "holiday" && (
            <View className="mb-4">
              <Text className="text-slate-600 font-medium mb-2">
                Destination (Optional)
              </Text>
              <DestinationInput
                value={destination}
                onChangeText={setDestinationName}
                placeholder="e.g., Paris, France"
              />
              <Text className="text-slate-400 text-sm mt-1">
                We'll fetch photos and information about your destination
              </Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-slate-600 font-medium mb-2">Date & Time</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-slate-100 rounded-lg px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-slate-800">
                {format(date, "MMM d, yyyy 'at' h:mm a")}
              </Text>
              <Ionicons name="calendar" size={20} color="#64748b" />
            </Pressable>
          </View>

          <View className="mb-6">
            <Text className="text-slate-600 font-medium mb-3">Timer Type</Text>
            <View className="flex-row flex-wrap gap-3">
              {timerTypes.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  className={`flex-row items-center px-4 py-3 rounded-lg border-2 ${
                    selectedType === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={selectedType === type.value ? "#3b82f6" : "#64748b"}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      selectedType === type.value
                        ? "text-blue-600"
                        : "text-slate-600"
                    }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View className="flex-row space-x-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-1 bg-slate-200 rounded-lg py-4 items-center"
          >
            <Text className="text-slate-700 font-semibold">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            className={`flex-1 rounded-lg py-4 items-center ${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            }`}
          >
            <Text className="text-white font-semibold">
              {isLoading ? "Saving..." : "Save Timer"}
            </Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
            <View className="bg-white rounded-xl mx-6 p-4 shadow-lg">
              <Text className="text-lg font-semibold text-slate-800 mb-4 text-center">
                Select Date & Time
              </Text>
              <DateTimePicker
                value={date}
                mode="datetime"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                style={{ backgroundColor: "white" }}
              />
              <View className="flex-row space-x-3 mt-4">
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="flex-1 bg-slate-200 rounded-lg py-3 items-center"
                >
                  <Text className="text-slate-700 font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                >
                  <Text className="text-white font-medium">Done</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <CelebrationModal
          visible={showCelebration}
          onComplete={handleCelebrationComplete}
          timerName={name}
          destinationName={selectedType === "holiday" ? destination : undefined}
        />
      </View>
    </ScrollView>
  );
}