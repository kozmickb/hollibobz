import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../state/holidayStore";
import { CountdownTimer } from "../components/CountdownTimer";
import { WidgetPreview } from "../components/WidgetPreview";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { timers, currentDestination } = useHolidayStore();

  const mainTimer = timers.find((timer) => timer.type === "holiday");

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustContentInsets={true}
    >
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {mainTimer && currentDestination ? (
          <ImageBackground
            source={{
              uri:
                currentDestination.images[0] ||
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
            }}
            className="h-80 justify-end"
            imageStyle={{ opacity: 0.8 }}
          >
            <View className="bg-black/40 p-6">
              <Text className="text-white text-3xl font-bold mb-2">
                {currentDestination.name}
              </Text>
              <CountdownTimer targetDate={mainTimer.date} />
            </View>
          </ImageBackground>
        ) : (
          <View className="h-80 bg-gradient-to-br from-blue-500 to-purple-600 justify-center items-center">
            <Ionicons name="airplane" size={64} color="white" />
            <Text className="text-white text-2xl font-bold mt-4">
              Plan Your Next Adventure
            </Text>
            <Text className="text-white/80 text-center mt-2 px-8">
              Add your holiday destination and start the countdown to your dream
              vacation
            </Text>
          </View>
        )}

        <View className="p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-slate-800">
              Your Timers
            </Text>
            <Pressable
              onPress={() => navigation.navigate("AddTimer")}
              className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Add Timer</Text>
            </Pressable>
          </View>

          {timers.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="time-outline" size={48} color="#94a3b8" />
              <Text className="text-slate-600 text-lg font-medium mt-4">
                No timers yet
              </Text>
              <Text className="text-slate-400 text-center mt-2">
                Create your first countdown timer to start building excitement
                for your holiday
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {timers.map((timer) => (
                <Pressable
                  key={timer.id}
                  onPress={() =>
                    navigation.navigate("TimerDetail", { timerId: timer.id })
                  }
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-slate-800">
                        {timer.name}
                      </Text>
                      <Text className="text-slate-500 capitalize">
                        {timer.type}
                      </Text>
                    </View>
                    <View className="items-end">
                      <CountdownTimer
                        targetDate={timer.date}
                        compact={true}
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {currentDestination && (
            <View className="mt-8">
              <Text className="text-xl font-bold text-slate-800 mb-4">
                About {currentDestination.name}
              </Text>
              
              {currentDestination.facts.length > 0 && (
                <View className="bg-white rounded-xl p-4 mb-4">
                  <Text className="text-lg font-semibold text-slate-800 mb-2">
                    Interesting Facts
                  </Text>
                  {currentDestination.facts.slice(0, 3).map((fact, index) => (
                    <Text key={index} className="text-slate-600 mb-2">
                      • {fact}
                    </Text>
                  ))}
                </View>
              )}

              {currentDestination.thingsToDo.length > 0 && (
                <View className="bg-white rounded-xl p-4">
                  <Text className="text-lg font-semibold text-slate-800 mb-2">
                    Things to Do
                  </Text>
                  {currentDestination.thingsToDo.slice(0, 3).map((activity, index) => (
                    <Text key={index} className="text-slate-600 mb-2">
                      • {activity}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {mainTimer && <WidgetPreview />}
        </View>
      </View>
    </ScrollView>
  );
}