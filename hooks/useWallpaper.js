import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, SCREEN_NAMES, DEFAULT_WALLPAPER } from '../constants';

/**
 * 壁纸存储 Hook
 * 封装壁纸设置和自定义壁纸列表的存储和读取操作
 */
export const useWallpaper = () => {
  const [wallpaperSettings, setWallpaperSettings] = useState({
    [SCREEN_NAMES.LISTS]: { ...DEFAULT_WALLPAPER },
    [SCREEN_NAMES.ITEMS]: { ...DEFAULT_WALLPAPER },
  });
  
  // 自定义壁纸列表
  const [customWallpapers, setCustomWallpapers] = useState([]);

  /**
   * 加载所有壁纸相关数据
   */
  const loadWallpaperSettings = useCallback(async () => {
    try {
      // 加载壁纸设置
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WALLPAPER);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWallpaperSettings(prev => ({
          ...prev,
          ...parsed,
        }));
      }
      
      // 加载自定义壁纸列表
      const customStored = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_WALLPAPERS);
      if (customStored) {
        setCustomWallpapers(JSON.parse(customStored));
      }
    } catch (error) {
      console.error('Error loading wallpaper settings:', error);
    }
  }, []);

  /**
   * 保存单个屏幕的壁纸设置
   */
  const saveWallpaperSettings = useCallback(async (screenName, settings) => {
    try {
      const newSettings = {
        ...wallpaperSettings,
        [screenName]: settings,
      };
      setWallpaperSettings(newSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.WALLPAPER, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving wallpaper settings:', error);
    }
  }, [wallpaperSettings]);

  /**
   * 保存自定义壁纸列表
   */
  const saveCustomWallpapers = useCallback(async (wallpapers) => {
    try {
      setCustomWallpapers(wallpapers);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_WALLPAPERS, JSON.stringify(wallpapers));
    } catch (error) {
      console.error('Error saving custom wallpapers:', error);
    }
  }, []);

  /**
   * 获取指定屏幕的壁纸设置
   */
  const getWallpaperSettings = useCallback((screenName) => {
    return wallpaperSettings[screenName] || DEFAULT_WALLPAPER;
  }, [wallpaperSettings]);

  return {
    wallpaperSettings,
    customWallpapers,
    loadWallpaperSettings,
    saveWallpaperSettings,
    saveCustomWallpapers,
    getWallpaperSettings,
  };
};

export default useWallpaper;
