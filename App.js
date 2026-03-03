import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaperProvider, DefaultTheme } from 'react-native-paper';

// 导入屏幕组件
import ListsScreen from './screens/ListsScreen';
import ItemsScreen from './screens/ItemsScreen';

// 导入 Hook
import { useStorage } from './hooks/useStorage';

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
const Tab = createBottomTabNavigator();

/**
 * 列表相关导航栈
 */
const ListStack = () => {
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

  /**
   * 组件挂载时从本地存储加载数据
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Stack.Navigator>
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
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

/**
 * 应用主组件
 * 负责管理应用状态、数据存储和导航结构
 */
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            // 配置底部标签图标
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === '工具') {
                iconName = focused ? 'tools' : 'tools-outline';
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2196F3',  // 激活状态的标签颜色
            tabBarInactiveTintColor: 'gray',   // 非激活状态的标签颜色
          })}
        >
          {/* 工具页面 */}
          <Tab.Screen name="工具" component={ListStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}