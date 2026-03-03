import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

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

      // 加载列表数据
      if (storedLists) {
        setLists(JSON.parse(storedLists));
      }

      // 加载项目数据
      if (storedItems) {
        setItems(JSON.parse(storedItems));
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