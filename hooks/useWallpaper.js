import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_WALLPAPER } from '../constants';

/**
 * 壁纸存储 Hook
 * 全局壁纸设置，所有屏幕共享
 */
export const useWallpaper = () => {
  // 全局壁纸设置
  const [wallpaperSettings, setWallpaperSettings] = useState({ ...DEFAULT_WALLPAPER });
  
  // 自定义壁纸列表
  const [customWallpapers, setCustomWallpapers] = useState([]);

  /**
   * 加载壁纸数据
   */
  const loadWallpaperSettings = useCallback(async () => {
    try {
      // 加载全局壁纸设置
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WALLPAPER);
      if (stored) {
        setWallpaperSettings(JSON.parse(stored));
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
   * 保存全局壁纸设置
   */
  const saveWallpaperSettings = useCallback(async (settings) => {
    try {
      setWallpaperSettings(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.WALLPAPER, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving wallpaper settings:', error);
    }
  }, []);

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

  return {
    wallpaperSettings,
    customWallpapers,
    loadWallpaperSettings,
    saveWallpaperSettings,
    saveCustomWallpapers,
  };
};

export default useWallpaper;