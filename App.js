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

import { THEME_COLORS } from './components/commonStyles';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: THEME_COLORS.primary,
    accent: THEME_COLORS.accent,
    background: THEME_COLORS.background,
    surface: THEME_COLORS.card,
    text: THEME_COLORS.text,
    placeholder: THEME_COLORS.textLight,
  },
  roundness: 12,
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ListsStack({ lists, saveLists, deleteListWithItems, items, saveItems, clearListItems, wallpaperSettings }) {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { flex: 1 },
      }}
    >
      <Stack.Screen 
        name="ListsMain" 
        options={{ headerShown: false }}
      >
        {props => (
          <ListsScreen 
            {...props} 
            lists={lists} 
            saveLists={saveLists} 
            deleteListWithItems={deleteListWithItems}
            wallpaperSettings={wallpaperSettings}
          />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Items" 
        options={({ route }) => ({ title: route.params?.listName || '项目管理', headerShown: false })}
      >
        {props => (
          <ItemsScreen 
            {...props} 
            items={items} 
            saveItems={saveItems} 
            clearListItems={clearListItems}
            wallpaperSettings={wallpaperSettings}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainNavigator({ lists, saveLists, deleteListWithItems, items, saveItems, clearListItems, wallpaperSettings, customWallpapers, saveWallpaperSettings, saveCustomWallpapers }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Lists') {
            iconName = 'format-list-bulleted';
          } else if (route.name === 'ExpiryCountdown') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: THEME_COLORS.primary,
        tabBarInactiveTintColor: THEME_COLORS.textLight,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Lists" 
        options={{ title: '列表管理' }}
      >
        {props => (
          <ListsStack 
            {...props} 
            lists={lists} 
            saveLists={saveLists} 
            deleteListWithItems={deleteListWithItems}
            items={items}
            saveItems={saveItems}
            clearListItems={clearListItems}
            wallpaperSettings={wallpaperSettings}
          />
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="ExpiryCountdown" 
        options={{ title: '保质期倒计时' }}
      >
        {props => (
          <ExpiryCountdownScreen 
            {...props}
            wallpaperSettings={wallpaperSettings}
          />
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Settings" 
        options={{ title: '设置' }}
      >
        {props => (
          <SettingsScreen 
            {...props}
            wallpaperSettings={wallpaperSettings}
            saveWallpaperSettings={saveWallpaperSettings}
            customWallpapers={customWallpapers}
            saveCustomWallpapers={saveCustomWallpapers}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// 设置屏幕
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { List, Text } from 'react-native-paper';
import WallpaperSettings from './components/WallpaperSettings';
import { BUILT_IN_WALLPAPERS } from './constants';
import { useMemo, useState } from 'react';

function SettingsScreen({ wallpaperSettings, saveWallpaperSettings, customWallpapers, saveCustomWallpapers }) {
  const [wallpaperDialogVisible, setWallpaperDialogVisible] = useState(false);

  const currentWallpaper = useMemo(() => {
    const wallpaperId = wallpaperSettings?.wallpaperId;
    if (!wallpaperId || wallpaperId === 'none') {
      return BUILT_IN_WALLPAPERS[0];
    }
    const builtIn = BUILT_IN_WALLPAPERS.find(w => w.id === wallpaperId);
    if (builtIn) return builtIn;
    const custom = customWallpapers?.find(w => w.id === wallpaperId);
    return custom || BUILT_IN_WALLPAPERS[0];
  }, [wallpaperSettings, customWallpapers]);

  const handleSaveWallpaper = (settings) => {
    saveWallpaperSettings(settings);
    setWallpaperDialogVisible(false);
  };

  const wallpaperOpacity = wallpaperSettings?.opacity ?? 0.3;

  const renderContent = () => (
    <>
      <List.Section>
        <List.Subheader>外观设置</List.Subheader>
        <List.Item
          title="壁纸设置"
          description={currentWallpaper.id === 'none' ? '未设置壁纸' : currentWallpaper.name}
          left={props => <List.Icon {...props} icon="wallpaper" />}
          right={props => currentWallpaper.id !== 'none' && currentWallpaper.uri && (
            <Image 
              source={currentWallpaper.isCustom ? { uri: currentWallpaper.uri } : currentWallpaper.uri}
              style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }}
            />
          )}
          onPress={() => setWallpaperDialogVisible(true)}
        />
      </List.Section>

      <WallpaperSettings
        visible={wallpaperDialogVisible}
        onDismiss={() => setWallpaperDialogVisible(false)}
        currentSettings={wallpaperSettings}
        onSave={handleSaveWallpaper}
        customWallpapers={customWallpapers || []}
        saveCustomWallpapers={saveCustomWallpapers}
      />
    </>
  );

  if (currentWallpaper.uri) {
    const imageSource = currentWallpaper.isCustom 
      ? { uri: currentWallpaper.uri }
      : currentWallpaper.uri;
    
    return (
      <View style={styles.container}>
        <Image
          source={imageSource}
          style={styles.wallpaperImage}
          resizeMode="cover"
        />
        <View style={[styles.overlay, { backgroundColor: `rgba(255, 255, 255, ${1 - wallpaperOpacity})` }]}>
          <ScrollView style={styles.scrollView}>
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  wallpaperImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default function App() {
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
  } = useWallpaper();

  useEffect(() => {
    loadData();
    loadWallpaperSettings();
  }, [loadData, loadWallpaperSettings]);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <MainNavigator 
          lists={lists}
          saveLists={saveLists}
          deleteListWithItems={deleteListWithItems}
          items={items}
          saveItems={saveItems}
          clearListItems={clearListItems}
          wallpaperSettings={wallpaperSettings}
          customWallpapers={customWallpapers}
          saveWallpaperSettings={saveWallpaperSettings}
          saveCustomWallpapers={saveCustomWallpapers}
        />
      </NavigationContainer>
    </PaperProvider>
  );
}