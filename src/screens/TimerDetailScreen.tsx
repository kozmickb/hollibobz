import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../state/holidayStore";
import { CountdownTimer } from "../components/CountdownTimer";

type TimerDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TimerDetail"
>;

type TimerDetailScreenRouteProp = RouteProp<RootStackParamList, "TimerDetail">;

export function TimerDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TimerDetailScreenNavigationProp>();
  const route = useRoute<TimerDetailScreenRouteProp>();
  const { timers, removeTimer, currentDestination } = useHolidayStore();

  const timer = timers.find((t) => t.id === route.params.timerId);

  if (!timer) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <Text className="text-slate-600 text-lg">Timer not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Timer",
      "Are you sure you want to delete this timer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeTimer(timer.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isHolidayTimer = timer.type === "holiday";
  const backgroundImage = isHolidayTimer && currentDestination?.images[0];

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View style={{ paddingTop: insets.top }}>
        {backgroundImage ? (
          <ImageBackground
            source={{ uri: backgroundImage }}
            className="h-80 justify-end"
            imageStyle={{ opacity: 0.8 }}
          >
            <View className="bg-black/40 p-6">
              <Text className="text-white text-3xl font-bold mb-2">
                {timer.name}
              </Text>
              <Text className="text-white/80 text-lg mb-4 capitalize">
                {timer.type}
              </Text>
              <CountdownTimer targetDate={timer.date} />
            </View>
          </ImageBackground>
        ) : (
          <View className="h-80 bg-gradient-to-br from-blue-500 to-purple-600 justify-end p-6">
            <View className="items-center mb-6">
              <Ionicons
                name={
                  timer.type === "flight"
                    ? "airplane"
                    : timer.type === "excursion"
                    ? "map"
                    : "time"
                }
                size={64}
                color="white"
              />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">
              {timer.name}
            </Text>
            <Text className="text-white/80 text-lg mb-4 capitalize">
              {timer.type}
            </Text>
            <CountdownTimer targetDate={timer.date} />
          </View>
        )}

        <View className="p-6">
          <View className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-lg font-semibold text-slate-800 mb-4">
              Timer Information
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-slate-600">Name:</Text>
                <Text className="text-slate-800 font-medium">{timer.name}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-600">Type:</Text>
                <Text className="text-slate-800 font-medium capitalize">
                  {timer.type}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-600">Date:</Text>
                <Text className="text-slate-800 font-medium">
                  {timer.date.toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-slate-600">Time:</Text>
                <Text className="text-slate-800 font-medium">
                  {timer.date.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </View>

          {isHolidayTimer && currentDestination && (
            <>
              {currentDestination.images.length > 1 && (
                <View className="mb-6">
                  <Text className="text-xl font-bold text-slate-800 mb-4">
                    Gallery
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row space-x-4">
                      {currentDestination.images.slice(1).map((image, index) => (
                        <View key={index} className="w-48 h-32 rounded-xl overflow-hidden">
                          <ImageBackground
                            source={{ uri: image }}
                            className="w-full h-full"
                            imageStyle={{ borderRadius: 12 }}
                          />
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {currentDestination.facts.length > 0 && (
                <View className="bg-white rounded-xl p-6 mb-6">
                  <Text className="text-lg font-semibold text-slate-800 mb-4">
                    Interesting Facts
                  </Text>
                  {currentDestination.facts.map((fact, index) => (
                    <View key={index} className="flex-row mb-3">
                      <Text className="text-blue-500 mr-2">•</Text>
                      <Text className="text-slate-600 flex-1">{fact}</Text>
                    </View>
                  ))}
                </View>
              )}

              {currentDestination.thingsToDo.length > 0 && (
                <View className="bg-white rounded-xl p-6 mb-6">
                  <Text className="text-lg font-semibold text-slate-800 mb-4">
                    Things to Do
                  </Text>
                  {currentDestination.thingsToDo.map((activity, index) => (
                    <View key={index} className="flex-row mb-3">
                      <Text className="text-green-500 mr-2">•</Text>
                      <Text className="text-slate-600 flex-1">{activity}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <Pressable
            onPress={handleDelete}
            className="bg-red-500 rounded-lg py-4 items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="trash" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Delete Timer</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}