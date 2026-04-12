import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

import { FileProvider } from './contexts/FileContext';

import HomeScreen from './screens/HomeScreen';
import BudgetScreen from './screens/BudgetScreen';
import SpendingScreen from './screens/SpendingScreen';
import SettingsScreen from './screens/SettingsScreen';

// White screen icons
import HomeIconWhite from './assets/icons/home_white.png';
import BudgetIconWhite from './assets/icons/budget_white.png';
import CalendarIconWhite from './assets/icons/calendar_white.png';
import SettingsIconWhite from './assets/icons/settings_white.png';

const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Semi-transparent white
          elevation: 0,           // Removes shadow on Android
          shadowOpacity: 0,       // Removes shadow on iOS
          height: 60,
        },
        tabBarActiveTintColor: '#2A2F87', // Matches your "About" header color
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({focused}) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = HomeIconWhite;
          } else if (route.name === 'Budget') {
            iconSource = BudgetIconWhite;
          } else if (route.name === 'Spending') {
            iconSource = CalendarIconWhite;
          } else if (route.name === 'Settings') {
            iconSource = SettingsIconWhite;
          }

          return <Image source={iconSource} style={{ width: 32, height: 32, marginTop: 16, opacity: focused ? 1 : 0.5 }} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Spending" component={SpendingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <FileProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    </FileProvider>
  );
}