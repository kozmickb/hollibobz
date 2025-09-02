import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { TripsScreen } from "../screens/TripsScreen";
import { HollyChatScreen } from "../screens/HollyChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProfileInformationScreen } from "../screens/ProfileInformationScreen";
import { AirportSchedulesScreen } from "../screens/AirportSchedulesScreen";
import { PrivacySecurityScreen } from "../screens/PrivacySecurityScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { TermsOfServiceScreen } from "../screens/TermsOfServiceScreen";
import { PaywallScreen } from "../screens/PaywallScreen";
import { AddTimerScreen } from "../screens/AddTimerScreen";
import { TimerDetailScreen } from "../screens/TimerDetailScreen";
import { TimerDrilldownScreen } from "../screens/TimerDrilldownScreen";
import { DestinationDetailScreen } from "../screens/DestinationDetailScreen";
import { SavedFactsScreen } from "../screens/SavedFactsScreen";
import { ArchiveScreen } from "../screens/ArchiveScreen";
import ChecklistScreen from "../screens/ChecklistScreen";
import { ChecklistArchiveScreen } from "../screens/ChecklistArchiveScreen";
import { useThemeStore } from "../store/useThemeStore";

// Tab Navigator Types
export type TabParamList = {
  HomeTab: undefined;
  TripsTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

// Stack Navigator Types
export type HomeStackParamList = {
  Home: undefined;
  AddTimer: undefined;
  TimerDetail: { timerId: string };
  DestinationDetail: { destination: string };
};

export type TripsStackParamList = {
  Trips: undefined;
  TimerDrilldown: { timerId: string };
  Archive: undefined;
  SavedFacts: undefined;
  Checklist: { tripId: string };
  ChecklistArchive: undefined;
};

export type ChatStackParamList = {
  HollyChat: HollyChatParams | undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileInformation: undefined;
  AirportSchedules: undefined;
  PrivacySecurity: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Paywall: undefined;
};

export type HollyChatParams = {
  seedQuery?: string;
  tripId?: string;
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

// Create navigators
const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const TripsStack = createNativeStackNavigator<TripsStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="AddTimer" component={AddTimerScreen} options={{ title: "Add New Trip", presentation: "modal" }} />
      <HomeStack.Screen name="TimerDetail" component={TimerDetailScreen} options={{ title: "Trip Details" }} />
      <HomeStack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: "Destination Details" }} />
    </HomeStack.Navigator>
  );
}

// Trips Stack Navigator
function TripsStackNavigator() {
  return (
    <TripsStack.Navigator>
      <TripsStack.Screen name="Trips" component={TripsScreen} options={{ headerShown: false }} />
      <TripsStack.Screen name="TimerDrilldown" component={TimerDrilldownScreen} options={{ headerShown: false }} />
      <TripsStack.Screen name="Archive" component={ArchiveScreen} options={{ title: "Archived Trips" }} />
      <TripsStack.Screen name="SavedFacts" component={SavedFactsScreen} options={{ title: "Saved Facts" }} />
      <TripsStack.Screen name="Checklist" component={ChecklistScreen} options={{ headerShown: false }} />
      <TripsStack.Screen name="ChecklistArchive" component={ChecklistArchiveScreen as any} options={{ title: "Archived Checklists" }} />
    </TripsStack.Navigator>
  );
}

// Chat Stack Navigator
function ChatStackNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="HollyChat" component={HollyChatScreen} options={{ headerShown: false }} />
    </ChatStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="ProfileInformation" component={ProfileInformationScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="AirportSchedules" component={AirportSchedulesScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Paywall" component={PaywallScreen} options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
}

// Main Tab Navigator
export function AppNavigator() {
  const { isDark } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TripsTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#14B8A6' : '#F97316',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 80 : 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Questrial-Regular',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsStackNavigator}
        options={{
          title: 'My Trips',
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{
          title: 'Holly Bobz',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}