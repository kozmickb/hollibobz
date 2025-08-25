import React, { useMemo } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";

type Nav = NativeStackNavigationProp<RootStackParamList, "TimerDetail">;
type Rt = RouteProp<RootStackParamList, "TimerDetail">;

export function TimerDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { timerId } = route.params;
  const timer = useHolidayStore((s) => s.timers.find(t => t.id === timerId));
  const archive = useHolidayStore((s) => s.archiveTimer);
  const hardDelete = useHolidayStore((s) => s.removeTimer);

  const daysLeft = useMemo(() => {
    if (!timer) return null;
    const now = new Date();
    const target = new Date(timer.date);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [timer]);

  if (!timer) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Timer not found</Text>
      </View>
    );
  }

  function onDeleteOrArchive() {
    Alert.alert("Remove timer", "What would you like to do", [
      { text: "Cancel", style: "cancel" },
      { text: "Archive", onPress: () => { archive(timer.id); navigation.goBack(); } },
      { text: "Delete", style: "destructive", onPress: () => { hardDelete(timer.id); navigation.goBack(); } },
    ]);
  }

  const seed = `Plan a ${daysLeft && daysLeft > 0 ? "trip" : "stay"} to ${timer.destination} around ${new Date(timer.date).toDateString()}. Create a day by day plan with family friendly options, realistic timings, and travel between sights.`;

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold">{timer.destination}</Text>
      <Text className="text-slate-600 mt-1">{new Date(timer.date).toDateString()}</Text>

      {daysLeft !== null && (
        <View className="mt-6">
          <Text className="text-5xl font-extrabold">{daysLeft} days</Text>
          <Text className="text-slate-600 mt-2">until your holiday</Text>
        </View>
      )}

      <View className="mt-6 gap-y-3">
        <Pressable
          onPress={() =>
            navigation.navigate("HollyChat", {
              seedQuery: seed,
              context: { destination: timer.destination, dateISO: timer.date },
              reset: false,
            })
          }
          className="bg-emerald-600 rounded-lg py-4 items-center"
        >
          <Text className="text-white font-semibold">Ask Holly about {timer.destination}</Text>
        </Pressable>

        <Pressable onPress={onDeleteOrArchive} className="bg-red-600 rounded-lg py-4 items-center">
          <Text className="text-white font-semibold">Archive or Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}