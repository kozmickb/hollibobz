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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore, Timer } from "../state/holidayStore";
import { getDestinationInfo } from "../utils/destinationService";

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
  const { addTimer, setDestination } = useHolidayStore();

  const [name, setName] = useState("");
  const [destination, setDestinationName] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<Timer["type"]>("holiday");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a timer name");
      return;
    }

    if (date <= new Date()) {
      Alert.alert("Error", "Please select a future date");
      return;
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

      navigation.goBack();
    } catch (error) {
      console.error("Error saving timer:", error);
      Alert.alert("Error", "Failed to save timer. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              <TextInput
                value={destination}
                onChangeText={setDestinationName}
                placeholder="e.g., Paris, France"
                className="bg-slate-100 rounded-lg px-4 py-3 text-slate-800"
                placeholderTextColor="#94a3b8"
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
                {date.toLocaleDateString()} at {date.toLocaleTimeString()}
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
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}