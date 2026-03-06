import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaperProvider, DefaultTheme, Portal } from 'react-native-paper';

// 导入屏幕组件
import ListsScreen from './screens/ListsScreen';
import ItemsScreen from './screens/ItemsScreen';

// 导入 Hook
import { useStorage } from './hooks/useStorage';
import { useWallpaper } from './hooks/useWallpaper';

// 导入常量
import { SCREEN_NAMES } from './constants';

/**
 * 定义应用主题配置
 * 继承默认主题并自定义主色调和强调色
 */
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',  // 主色调：蓝色
    accent: '#FF4081',   // 强调色：粉色
  },
};

// 创建导航器
const Stack = createStackNavigator();

/**
 * 应用主组件
 * 负责管理应用状态、数据存储和导航结构
 */
export default function App() {
  // 使用自定义 Hook 管理数据
  const {
    lists,
    items,
    loadData,
    saveLists,
    saveItems,
    deleteListWithItems,
    clearListItems,
  } = useStorage();

  // 使用壁纸 Hook
  const {
    wallpaperSettings,
    customWallpapers,
    loadWallpaperSettings,
    saveWallpaperSettings,
    saveCustomWallpapers,
    getWallpaperSettings,
  } = useWallpaper();

  /**
   * 组件挂载时从本地存储加载数据
   */
  useEffect(() => {
    loadData();
    loadWallpaperSettings();
  }, [loadData, loadWallpaperSettings]);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            cardStyle: { flex: 1 },
          }}
        >
          <Stack.Screen 
            name="Lists" 
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
      </NavigationContainer>
    </PaperProvider>
  );
}
