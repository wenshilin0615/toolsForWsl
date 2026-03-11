import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaperProvider, DefaultTheme } from 'react-native-paper';

import ListsScreen from './screens/ListsScreen';
import ItemsScreen from './screens/ItemsScreen';
import ExpiryCountdownScreen from './screens/ExpiryCountdownScreen';

import { useStorage } from './hooks/useStorage';
import { useWallpaper } from './hooks/useWallpaper';

import { SCREEN_NAMES } from './constants';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    accent: '#FF4081',
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ListsStack() {
  const {
    lists,
    items,
    loadData,
    saveLists,
    saveItems,
    deleteListWithItems,
    clearListItems,
  } = useStorage();

  const {
    wallpaperSettings,
    customWallpapers,
    loadWallpaperSettings,
    saveWallpaperSettings,
    saveCustomWallpapers,
    getWallpaperSettings,
  } = useWallpaper();

  useEffect(() => {
    loadData();
    loadWallpaperSettings();
  }, [loadData, loadWallpaperSettings]);

  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen 
        name="ListsMain" 
        options={{ title: '我的列表' }}
      >
        {props => (
          <ListsScreen 
            {...props} 
            lists={lists} 
            saveLists={saveLists} 
            deleteListWithItems={deleteListWithItems}
            wallpaperSettings={getWallpaperSettings(SCREEN_NAMES.LISTS)}
            saveWallpaperSettings={(settings) => saveWallpaperSettings(SCREEN_NAMES.LISTS, settings)}
            customWallpapers={customWallpapers}
            saveCustomWallpapers={saveCustomWallpapers}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Items" 
        options={({ route }) => ({ title: route.params?.listName || '项目管理' })}
      >
        {props => (
          <ItemsScreen 
            {...props} 
            items={items} 
            saveItems={saveItems} 
            clearListItems={clearListItems}
            wallpaperSettings={getWallpaperSettings(SCREEN_NAMES.ITEMS)}
            saveWallpaperSettings={(settings) => saveWallpaperSettings(SCREEN_NAMES.ITEMS, settings)}
            customWallpapers={customWallpapers}
            saveCustomWallpapers={saveCustomWallpapers}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Lists') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
          } else if (route.name === 'ExpiryCountdown') {
            iconName = focused ? 'timer' : 'timer-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Lists" 
        component={ListsStack}
        options={{ title: '列表管理' }}
      />
      <Tab.Screen 
        name="ExpiryCountdown" 
        component={ExpiryCountdownScreen}
        options={{ 
          title: '保质期倒计时',
          headerShown: true,
          headerTitle: '保质期倒计时管理',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
