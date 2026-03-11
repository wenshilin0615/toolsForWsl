# toolsForWsl 项目上下文

## 项目概述

这是一个基于 **Expo** 的 React Native 移动应用，用于管理列表、项目和保质期倒计时。应用采用 Material Design 设计风格，支持创建多个列表，每个列表下可管理多个项目。数据通过 AsyncStorage 进行本地持久化存储。支持自定义壁纸背景功能。

**主要功能：**
- 列表的创建、查看、删除
- 列表内项目的增删改查
- 项目搜索功能
- 批量选择与删除
- 清空列表内所有项目
- 壁纸设置（内置壁纸 + 自定义壁纸上传）
- 保质期倒计时管理

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.83.2 | 移动端框架 |
| Expo | ~55.0.4 | 开发工具链 |
| React | 19.2.0 | UI 库 |
| React Navigation | 7.x | 导航管理（Stack + Bottom Tabs） |
| React Native Paper | 5.15.0 | Material Design UI 组件库 |
| AsyncStorage | 2.2.0 | 本地数据持久化 |
| expo-image-picker | ~55.0.11 | 图片选择 |
| expo-file-system | ~55.0.10 | 文件系统操作 |
| @expo/vector-icons | 15.1.1 | 图标库 |

## 项目结构

```
toolsForWsl/
├── App.js                      # 主应用组件，配置导航和主题
├── index.js                    # 应用入口，注册根组件
├── app.json                    # Expo 配置文件
├── constants.js                # 应用常量（存储键名、默认配置、壁纸列表）
├── package.json                # 项目依赖和脚本配置
├── assets/                     # 静态资源（图标、启动画面、壁纸）
│   └── wallpapers/             # 内置壁纸图片
├── screens/
│   ├── ListsScreen.js          # 列表管理页面
│   ├── ItemsScreen.js          # 项目管理页面
│   └── ExpiryCountdownScreen.js # 保质期倒计时页面
├── hooks/
│   ├── useStorage.js           # AsyncStorage 封装 Hook
│   ├── useWallpaper.js         # 壁纸设置存储 Hook
│   ├── useBatchSelection.js    # 批量选择逻辑 Hook
│   ├── useDialog.js            # 对话框状态管理 Hook
│   └── useSearch.js            # 搜索功能 Hook
├── components/
│   ├── commonStyles.js         # 公共样式定义
│   └── WallpaperSettings.js    # 壁纸设置弹窗组件
└── node_modules/
```

## 构建和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 启动 Web 预览版本(8088端口)
npx expo start --clear --web --port 8088

# 指定平台运行
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## 构建预览版本
`npx eas build --platform android --profile preview`

## 核心模块说明

### App.js
- 配置 React Native Paper 主题（主色：`#2196F3`，强调色：`#FF4081`）
- 使用 `useStorage` Hook 管理全局数据状态
- 使用 `useWallpaper` Hook 管理壁纸设置
- 导航结构：底部 Tab 导航 → Stack 导航（Lists → Items）

### screens/ListsScreen.js
- 显示所有列表
- 支持创建新列表（带重名检测）
- 批量选择删除列表
- 壁纸设置入口
- 壁纸背景显示（支持透明度调节）

### screens/ItemsScreen.js
- 显示当前列表内的所有项目
- 功能：添加、编辑、删除、搜索、批量选择删除、清空列表
- 通过路由参数获取 `listId` 和 `listName`
- 壁纸背景显示（支持透明度调节）

### screens/ExpiryCountdownScreen.js
- 保质期倒计时管理页面
- 显示即将过期的项目列表

### components/WallpaperSettings.js
- 壁纸设置弹窗组件
- 支持选择内置壁纸（9张预设）
- 支持上传自定义壁纸
- 支持单个删除和批量删除自定义壁纸
- 删除当前选中壁纸后自动选中相邻壁纸
- 支持调节壁纸透明度（10%-100%）
- Web 平台兼容：使用 base64 存储自定义壁纸

### components/commonStyles.js
- 公共样式定义（搜索栏、计数栏、批量操作栏等）
- 半透明背景样式支持壁纸显示

### hooks/useStorage.js
封装 AsyncStorage 操作，提供以下方法：
- `loadData()` - 加载所有数据
- `saveLists(lists)` - 保存列表数据
- `saveItems(items)` - 保存项目数据
- `deleteListWithItems(listId)` - 删除列表及其关联项目
- `clearListItems(listId)` - 清空指定列表的项目

### hooks/useWallpaper.js
封装壁纸存储操作，提供以下方法：
- `loadWallpaperSettings()` - 加载壁纸设置和自定义壁纸列表
- `saveWallpaperSettings(screenName, settings)` - 保存屏幕的壁纸设置
- `saveCustomWallpapers(wallpapers)` - 保存自定义壁纸列表
- `getWallpaperSettings(screenName)` - 获取指定屏幕的壁纸设置

### hooks/useBatchSelection.js
封装批量选择逻辑：
- `batchMode` - 是否处于批量选择模式
- `selectedIds` - 已选中的 ID 列表
- `selectedCount` - 已选中数量
- `isAllSelected` - 是否全选
- `isSelected(id)` - 检查某项是否被选中
- `toggleSelection(id)` - 切换选中状态
- `toggleSelectAll()` - 全选/取消全选
- `enterBatchMode()` - 进入批量模式
- `exitBatchMode()` - 退出批量模式

### hooks/useDialog.js
封装对话框状态管理：
- `dialogs` - 对话框显示状态对象
- `showDialog(type)` - 显示指定类型对话框
- `hideDialog(type)` - 隐藏指定类型对话框
- `showAlert(message)` - 显示警告消息
- `hideAlert()` - 隐藏警告

### hooks/useSearch.js
封装搜索功能：
- `searchQuery` - 搜索关键词
- `setSearchQuery` - 设置搜索关键词
- `filteredItems` - 过滤后的项目列表

### constants.js
定义存储键名和默认配置：
```javascript
STORAGE_KEYS = { 
  LISTS: 'lists', 
  ITEMS: 'items', 
  WALLPAPER: 'wallpaper_settings', 
  CUSTOM_WALLPAPERS: 'custom_wallpapers',
  EXPIRY_ITEMS: 'expiry_items',
}

SCREEN_NAMES = { 
  LISTS: 'lists', 
  ITEMS: 'items',
  EXPIRY_COUNTDOWN: 'expiryCountdown',
}

DEFAULT_WALLPAPER = { wallpaperId: 'none', opacity: 0.3 }

EXPIRY_COLORS = { SAFE: '#4CAF50', WARNING: '#FFC107', DANGER: '#FF5722', EXPIRED: '#D32F2F' }

EXPIRY_THRESHOLDS = { SAFE_DAYS: 90, WARNING_DAYS: 30 }

BUILT_IN_WALLPAPERS = [...] // 9张内置壁纸 + 1个"无壁纸"选项
```

## 开发约定

### 代码风格
- 使用中文注释
- 组件采用函数式组件 + Hooks
- 样式使用 `StyleSheet.create()` 集中定义
- 公共样式集中在 `components/commonStyles.js`
- 文件命名：PascalCase（组件）、camelCase（工具/Hook）

### 数据结构

**列表 (List):**
```typescript
interface List {
  id: string;        // 时间戳字符串
  name: string;      // 列表名称
  createdAt: string; // ISO 日期字符串
}
```

**项目 (Item):**
```typescript
interface Item {
  id: string;        // 时间戳字符串
  name: string;      // 项目名称
  listId: string;    // 所属列表 ID
  createdAt: string; // ISO 日期字符串
}
```

**壁纸设置 (WallpaperSettings):**
```typescript
interface WallpaperSettings {
  wallpaperId: string;  // 壁纸 ID（'none' 或自定义 ID）
  opacity: number;      // 透明度 0.1-1.0
}
```

**自定义壁纸 (CustomWallpaper):**
```typescript
interface CustomWallpaper {
  id: string;        // custom_${timestamp}
  name: string;      // 显示名称
  uri: string;       // 文件路径或 base64 data URL
  isCustom: true;
  createdAt: number; // 创建时间戳
}
```

### UI 组件
- 使用 React Native Paper 组件：`List.Item`, `FAB`, `Dialog`, `Button`, `TextInput`, `Searchbar`, `Checkbox`, `Menu`, `Portal` 等
- 图标使用 `MaterialCommunityIcons`
- 半透明背景使用 `rgba(255, 255, 255, 0.75~0.85)` 支持壁纸显示

## 注意事项

1. **重名检测**：创建列表或项目时会检查是否重名
2. **级联删除**：删除列表时会自动删除其下所有项目
3. **数据持久化**：所有数据存储在 AsyncStorage，应用卸载后数据会丢失
4. **平台兼容**：支持 iOS、Android 和 Web 平台
5. **壁纸存储**：Web 平台使用 base64 存储，移动端使用文件系统存储
6. **闭包问题**：删除操作时使用 ref 或副本保存当前状态，避免闭包陷阱