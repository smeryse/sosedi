import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home as HomeIcon, Building2, Users, UserPlus, User } from 'lucide-react-native';

import { COLORS, RADIUS, SHADOWS } from './src/theme/colors';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { HousingScreen } from './src/screens/HousingScreen';
import { HousingDetailScreen } from './src/screens/HousingDetailScreen';
import { RoommatesScreen } from './src/screens/RoommatesScreen';
import { RoommateDetailScreen } from './src/screens/RoommateDetailScreen';
import { GroupScreen } from './src/screens/GroupScreen';
import { CompatibilityScreen } from './src/screens/CompatibilityScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { ChoresScreen } from './src/screens/ChoresScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          ...SHADOWS.card,
        },
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Housing"
        component={HousingScreen}
        options={{
          tabBarLabel: 'Жильё',
          tabBarIcon: ({ color, size }) => <Building2 color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Roommates"
        component={RoommatesScreen}
        options={{
          tabBarLabel: 'Соседи',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Group"
        component={GroupScreen}
        options={{
          tabBarLabel: 'Группа',
          tabBarIcon: ({ color, size }) => <UserPlus color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="HousingDetail" component={HousingDetailScreen} />
          <Stack.Screen name="RoommateDetail" component={RoommateDetailScreen} />
          <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Chores" component={ChoresScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
