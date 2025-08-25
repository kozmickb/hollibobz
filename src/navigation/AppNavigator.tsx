import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { AddTimerScreen } from "../screens/AddTimerScreen";
import { TimerDetailScreen } from "../screens/TimerDetailScreen";
import { HollyChatScreen } from "../screens/HollyChatScreen";

export type HollyChatParams = {
  seedQuery?: string;
  context?: {
    destination?: string;
    dateISO?: string;
    travellers?: string;
    budgetPerPersonGBP?: number;
    days?: number;
  };
  reset?: boolean;
};

export type RootStackParamList = {
  Home: undefined;
  AddTimer: undefined;
  TimerDetail: { timerId: string };
  HollyChat: HollyChatParams | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Holiday Timers" }} />
      <Stack.Screen name="AddTimer" component={AddTimerScreen} options={{ title: "Add Timer", presentation: "modal" }} />
      <Stack.Screen name="TimerDetail" component={TimerDetailScreen} options={{ title: "Timer Details" }} />
      <Stack.Screen name="HollyChat" component={HollyChatScreen} options={{ title: "Chat with Holly Bobz" }} />
    </Stack.Navigator>
  );
}