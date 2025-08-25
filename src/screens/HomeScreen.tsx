import React from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useHolidayStore } from "../store/useHolidayStore";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const timers = useHolidayStore((s) => s.timers);
  const archived = useHolidayStore((s) => s.archivedTimers);
  const restore = useHolidayStore((s) => s.restoreTimer);
  const purge = useHolidayStore((s) => s.purgeArchive);

  return (
    <View className="flex-1 bg-white">
      <View className="p-6 gap-y-3">
        <Pressable onPress={() => navigation.navigate("AddTimer")} className="bg-indigo-600 rounded-lg py-4 items-center">
          <Text className="text-white font-semibold">Add a timer</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("HollyChat")} className="bg-emerald-600 rounded-lg py-4 items-center">
          <Text className="text-white font-semibold">Ask Holly Bobz</Text>
        </Pressable>
      </View>

      <FlatList
        data={timers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<Text className="text-xl font-bold mb-3">Active timers</Text>}
        ListEmptyComponent={<View className="px-2 py-4"><Text className="text-base">No timers yet</Text></View>}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("TimerDetail", { timerId: item.id })} className="p-4 mb-3 bg-slate-100 rounded-lg">
            <Text className="text-lg font-semibold">{item.destination}</Text>
            <Text className="text-slate-600">{new Date(item.date).toDateString()}</Text>
          </Pressable>
        )}
      />

      {archived.length > 0 && (
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold mb-3">Archived</Text>
          {archived.map((a) => (
            <View key={a.id} className="p-3 mb-2 bg-slate-50 rounded-lg">
              <Text className="font-semibold">{a.destination}</Text>
              <Text className="text-slate-600">{new Date(a.date).toDateString()}</Text>
              <View className="flex-row gap-x-3 mt-2">
                <Pressable onPress={() => restore(a.id)} className="bg-slate-800 px-3 py-2 rounded">
                  <Text className="text-white">Restore</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <Pressable onPress={purge} className="bg-red-600 px-3 py-3 rounded items-center mt-2">
            <Text className="text-white font-semibold">Empty archive</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}