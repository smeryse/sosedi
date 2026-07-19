import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home as HomeIcon, User, Heart, MessageCircle, CirclePlus } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from './src/theme/colors';
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
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DocumentsScreen } from './src/screens/DocumentsScreen';
import { InviteScreen } from './src/screens/InviteScreen';
import { RentScreen } from './src/screens/RentScreen';
import { DealDetailScreen, OnlineDealScreen } from './src/screens/DealScreens';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { ApplicationSuccessScreen, PaymentSuccessScreen } from './src/screens/SuccessScreens';
import { VerificationScreen } from './src/screens/VerificationScreen';
import { DocumentDetailScreen } from './src/screens/DocumentDetailScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import {
  ApplicationsScreen,
  AssistantScreen,
  GroupCreateScreen,
  GroupReplacementScreen,
  RecommendationsScreen,
  RoommateCompareScreen,
  SimulatorScreen,
} from './src/screens/ParityScreens';
import { ApplicationDetailScreen } from './src/screens/ApplicationDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_META: Record<string, { label: string; Icon: typeof HomeIcon }> = {
  Home: { label: 'Главная', Icon: HomeIcon },
  Favorites: { label: 'Избранное', Icon: Heart },
  Rent: { label: 'Аренда', Icon: CirclePlus },
  Chats: { label: 'Чаты', Icon: MessageCircle },
  Profile: { label: 'Профиль', Icon: User },
};

function SosediTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[tabStyles.shell, { paddingBottom: Math.max(insets.bottom, 8), height: 66 + Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = TAB_META[route.name];
        const Icon = meta.Icon;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} accessibilityRole="button" accessibilityState={focused ? { selected: true } : {}} style={tabStyles.item}>
            {focused ? <View style={tabStyles.activeIndicator} /> : null}
            <View style={tabStyles.iconWrap}>
              <Icon size={21} color={focused ? COLORS.text : COLORS.textMuted} strokeWidth={focused ? 2.5 : 1.9} />
            </View>
            <Text numberOfLines={1} style={[tabStyles.label, focused && tabStyles.activeLabel]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SosediTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Избранное',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Rent"
        component={RentScreen}
        options={{
          tabBarLabel: 'Аренда',
          tabBarIcon: ({ color, size }) => <CirclePlus color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Чаты',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size - 2} />,
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
        <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false, animation: 'fade_from_bottom', contentStyle: { backgroundColor: COLORS.background } }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Housing" component={HousingScreen} />
          <Stack.Screen name="Roommates" component={RoommatesScreen} />
          <Stack.Screen name="Group" component={GroupScreen} />
          <Stack.Screen name="HousingDetail" component={HousingDetailScreen} />
          <Stack.Screen name="RoommateDetail" component={RoommateDetailScreen} />
          <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Chores" component={ChoresScreen} />
          {/* New screens */}
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Documents" component={DocumentsScreen} />
          <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
          <Stack.Screen name="Invite" component={InviteScreen} />
          <Stack.Screen name="DealDetail" component={DealDetailScreen} />
          <Stack.Screen name="OnlineDeal" component={OnlineDealScreen} />
          <Stack.Screen name="ApplicationSuccess" component={ApplicationSuccessScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="Applications" component={ApplicationsScreen} />
          <Stack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
          <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
          <Stack.Screen name="RoommateCompare" component={RoommateCompareScreen} />
          <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
          <Stack.Screen name="GroupReplacement" component={GroupReplacementScreen} />
          <Stack.Screen name="Assistant" component={AssistantScreen} />
          <Stack.Screen name="Simulator" component={SimulatorScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const tabStyles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 7,
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    shadowColor: '#0D0D0C',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 5,
  },
  item: { position: 'relative', flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-start', gap: 3 },
  activeIndicator: { position: 'absolute', top: -8, width: 28, height: 3, borderRadius: 2, backgroundColor: COLORS.accent },
  iconWrap: { width: 34, height: 30, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9.5, fontWeight: '600', color: COLORS.textMuted },
  activeLabel: { color: COLORS.text, fontWeight: '900' },
});
