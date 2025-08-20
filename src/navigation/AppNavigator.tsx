import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { AddTimerScreen } from "../screens/AddTimerScreen";
import { TimerDetailScreen } from "../screens/TimerDetailScreen";

export type RootStackParamList = {
  Home: undefined;
  AddTimer: undefined;
  TimerDetail: { timerId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#f8fafc",
        },
        headerTintColor: "#1e293b",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Holiday Countdown",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="AddTimer"
        component={AddTimerScreen}
        options={{
          title: "Add Timer",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="TimerDetail"
        component={TimerDetailScreen}
        options={{
          title: "Timer Details",
        }}
      />
    </Stack.Navigator>
  );
}