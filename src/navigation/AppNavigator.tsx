import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { AddTimerScreen } from "../screens/AddTimerScreen";
import { TimerDetailScreen } from "../screens/TimerDetailScreen";
import { TimerDrilldownScreen } from "../screens/TimerDrilldownScreen";
import { DestinationDetailScreen } from "../screens/DestinationDetailScreen";
import { HollyChatScreen } from "../screens/HollyChatScreen";
import { SavedFactsScreen } from "../screens/SavedFactsScreen";
import { ArchiveScreen } from "../screens/ArchiveScreen";

export type HollyChatParams = {
  seedQuery?: string;
  context?: {
    destination?: string;
    dateISO?: string;
    adults?: number;
    children?: number;
    duration?: number;
    travellers?: string;
    budgetPerPersonGBP?: number;
    days?: number;
    timerId?: string;
    questId?: string;
  };
  reset?: boolean;
};

export type RootStackParamList = {
  Home: undefined;
  AddTimer: undefined;
  TimerDetail: { timerId: string };
  TimerDrilldown: { timerId: string };
  DestinationDetail: { destination: string };
  HollyChat: HollyChatParams | undefined;
  SavedFacts: undefined;
  Archive: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "TripTick" }} />
      <Stack.Screen name="AddTimer" component={AddTimerScreen} options={{ title: "Add Timer", presentation: "modal" }} />
      <Stack.Screen name="TimerDetail" component={TimerDetailScreen} options={{ title: "Timer Details" }} />
      <Stack.Screen name="TimerDrilldown" component={TimerDrilldownScreen} options={{ title: "Trip Details", headerShown: false }} />
      <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: "Destination Details" }} />
      <Stack.Screen name="HollyChat" component={HollyChatScreen} options={{ title: "Chat with Holly Bobz" }} />
      <Stack.Screen name="SavedFacts" component={SavedFactsScreen} options={{ title: "Saved Facts" }} />
      <Stack.Screen name="Archive" component={ArchiveScreen} options={{ title: "Archived Trips", headerShown: false }} />
    </Stack.Navigator>
  );
}