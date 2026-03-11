/**
 * 应用常量配置文件
 * 包含默认数据、存储键名等
 */

// AsyncStorage 存储键名
export const STORAGE_KEYS = {
  LISTS: 'lists',
  ITEMS: 'items',
  WALLPAPER: 'wallpaper_settings',
  CUSTOM_WALLPAPERS: 'custom_wallpapers',
  EXPIRY_ITEMS: 'expiry_items',
};

// 默认图标配置
export const DEFAULT_ICONS = {
  LIST: 'format-list-bulleted',
  ITEM: 'text',
};

// 默认颜色配置
export const DEFAULT_COLORS = {
  LIST: '#2196F3',
  ITEM: '#FF4081',
};

// 过期风险等级颜色配置
export const EXPIRY_COLORS = {
  SAFE: '#4CAF50',      // 绿色：距离过期 > 90 天
  WARNING: '#FFC107',   // 黄色：距离过期 30-90 天
  DANGER: '#FF5722',    // 红色：距离过期 < 30 天
  EXPIRED: '#D32F2F',   // 深红色：已过期
};

// 过期风险阈值（天数）
export const EXPIRY_THRESHOLDS = {
  SAFE_DAYS: 90,        // 绿色阈值
  WARNING_DAYS: 30,     // 黄色阈值
};

// 屏幕名称
export const SCREEN_NAMES = {
  LISTS: 'lists',
  ITEMS: 'items',
  EXPIRY_COUNTDOWN: 'expiryCountdown',
};

// 默认壁纸设置
export const DEFAULT_WALLPAPER = {
  wallpaperId: 'none',
  opacity: 0.3,
};

// 内置壁纸列表（静态资源）
export const BUILT_IN_WALLPAPERS = [
  { id: 'none', name: '无壁纸', uri: null },
  { id: 'wallpaper_1', name: '壁纸 1', uri: require('./assets/wallpapers/640.png') },
  { id: 'wallpaper_2', name: '壁纸 2', uri: require('./assets/wallpapers/640 (1).png') },
  { id: 'wallpaper_3', name: '壁纸 3', uri: require('./assets/wallpapers/640 (2).png') },
  { id: 'wallpaper_4', name: '壁纸 4', uri: require('./assets/wallpapers/640 (3).png') },
  { id: 'wallpaper_5', name: '壁纸 5', uri: require('./assets/wallpapers/640 (4).png') },
  { id: 'wallpaper_6', name: '壁纸 6', uri: require('./assets/wallpapers/640 (5).png') },
  { id: 'wallpaper_7', name: '壁纸 7', uri: require('./assets/wallpapers/640 (6).png') },
  { id: 'wallpaper_8', name: '壁纸 8', uri: require('./assets/wallpapers/640 (7).png') },
  { id: 'wallpaper_9', name: '壁纸 9', uri: require('./assets/wallpapers/640 (8).png') },
];

// 兼容旧代码
export const WALLPAPERS = BUILT_IN_WALLPAPERS;