import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// 预置初始数据
const INITIAL_LIST_ID = 'initial-list-1';

const INITIAL_LISTS = [
  {
    id: INITIAL_LIST_ID,
    name: '发票抽奖城市',
    createdAt: new Date().toISOString(),
  }
];

// 50个城市
const INITIAL_ITEMS = [
  // 直辖市（4）
  { id: 'city-1', name: '北京', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-2', name: '天津', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-3', name: '上海', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-4', name: '重庆', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  // 计划单列市（5）
  { id: 'city-5', name: '大连', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-6', name: '青岛', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-7', name: '宁波', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-8', name: '厦门', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-9', name: '深圳', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  // 其他城市（41）
  { id: 'city-10', name: '石家庄', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-11', name: '邯郸', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-12', name: '太原', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-13', name: '呼和浩特', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-14', name: '沈阳', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-15', name: '长春', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-16', name: '大庆', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-17', name: '南京', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-18', name: '无锡', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-19', name: '苏州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-20', name: '湖州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-21', name: '绍兴', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-22', name: '衢州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-23', name: '合肥', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-24', name: '黄山', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-25', name: '福州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-26', name: '泉州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-27', name: '赣州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-28', name: '济南', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-29', name: '烟台', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-30', name: '郑州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-31', name: '开封', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-32', name: '武汉', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-33', name: '宜昌', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-34', name: '株洲', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-35', name: '湘潭', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-36', name: '广州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-37', name: '东莞', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-38', name: '江门', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-39', name: '南宁', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-40', name: '海口', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-41', name: '成都', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-42', name: '泸州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-43', name: '遵义', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-44', name: '昆明', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-45', name: '拉萨', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-46', name: '咸阳', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-47', name: '兰州', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-48', name: '西宁', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-49', name: '银川', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
  { id: 'city-50', name: '乌鲁木齐', listId: INITIAL_LIST_ID, createdAt: new Date().toISOString() },
];

/**
 * 数据存储 Hook
 * 封装 AsyncStorage 相关操作，提供统一的数据管理接口
 */
export const useStorage = () => {
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([]);

  /**
   * 加载所有数据
   */
  const loadData = useCallback(async () => {
    try {
      const storedLists = await AsyncStorage.getItem(STORAGE_KEYS.LISTS);
      const storedItems = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);

      if (storedLists) {
        setLists(JSON.parse(storedLists));
      } else {
        // 没有存储数据时使用初始数据
        setLists(INITIAL_LISTS);
        await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(INITIAL_LISTS));
      }

      if (storedItems) {
        setItems(JSON.parse(storedItems));
      } else {
        // 没有存储数据时使用初始数据
        setItems(INITIAL_ITEMS);
        await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  /**
   * 保存列表数据
   */
  const saveLists = useCallback(async (newLists) => {
    try {
      setLists(newLists);
      await AsyncStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(newLists));
    } catch (error) {
      console.error('Error saving lists:', error);
    }
  }, []);

  /**
   * 保存项目数据
   */
  const saveItems = useCallback(async (newItems) => {
    try {
      setItems(newItems);
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  }, []);

  /**
   * 删除列表时同步删除关联项目
   */
  const deleteListWithItems = useCallback(async (listId) => {
    try {
      const updatedLists = lists.filter(list => list.id !== listId);
      const updatedItems = items.filter(item => item.listId !== listId);
      
      setLists(updatedLists);
      setItems(updatedItems);
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LISTS, JSON.stringify(updatedLists)],
        [STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems)],
      ]);
    } catch (error) {
      console.error('Error deleting list with items:', error);
    }
  }, [lists, items]);

  /**
   * 清空列表中的所有项目
   */
  const clearListItems = useCallback(async (listId) => {
    try {
      const updatedItems = items.filter(item => item.listId !== listId);
      setItems(updatedItems);
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error clearing list items:', error);
    }
  }, [items]);

  return {
    lists,
    items,
    loadData,
    saveLists,
    saveItems,
    deleteListWithItems,
    clearListItems,
  };
};

export default useStorage;