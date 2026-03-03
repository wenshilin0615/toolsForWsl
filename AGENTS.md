# toolsForWsl 项目上下文

## 项目概述

这是一个基于 **Expo** 的 React Native 移动应用，用于管理列表和项目数据。应用采用 Material Design 设计风格，支持创建多个列表，每个列表下可管理多个项目。数据通过 AsyncStorage 进行本地持久化存储。

**主要功能：**
- 列表的创建、查看、删除
- 列表内项目的增删改查
- 项目搜索功能
- 批量选择与删除
- 清空列表内所有项目

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.83.2 | 移动端框架 |
| Expo | ~55.0.4 | 开发工具链 |
| React | 19.2.0 | UI 库 |
| React Navigation | 7.x | 导航管理（Stack + Bottom Tabs） |
| React Native Paper | 5.15.0 | Material Design UI 组件库 |
| AsyncStorage | 2.2.0 | 本地数据持久化 |
| @expo/vector-icons | 15.1.1 | 图标库 |

## 项目结构

```
toolsForWsl/
├── App.js              # 主应用组件，配置导航和主题
├── index.js            # 应用入口，注册根组件
├── app.json            # Expo 配置文件
├── constants.js        # 应用常量（存储键名、默认配置）
├── package.json        # 项目依赖和脚本配置
├── assets/             # 静态资源（图标、启动画面）
├── screens/
│   ├── ListsScreen.js  # 列表管理页面
│   └── ItemsScreen.js  # 项目管理页面
├── hooks/
│   └── useStorage.js   # AsyncStorage 封装 Hook
├── components/         # 可复用组件（预留目录）
└── node_modules/
```

## 构建和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 指定平台运行
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## 核心模块说明

### App.js
- 配置 React Native Paper 主题（主色：`#2196F3`，强调色：`#FF4081`）
- 使用 `useStorage` Hook 管理全局数据状态
- 导航结构：底部 Tab 导航 → Stack 导航（Lists → Items）

### screens/ListsScreen.js
- 显示所有列表
- 支持创建新列表（带重名检测）
- 长按列表可删除（级联删除关联项目）

### screens/ItemsScreen.js
- 显示当前列表内的所有项目
- 功能：添加、编辑、删除、搜索、批量选择删除、清空列表
- 通过路由参数获取 `listId` 和 `listName`

### hooks/useStorage.js
封装 AsyncStorage 操作，提供以下方法：
- `loadData()` - 加载所有数据
- `saveLists(lists)` - 保存列表数据
- `saveItems(items)` - 保存项目数据
- `deleteListWithItems(listId)` - 删除列表及其关联项目
- `clearListItems(listId)` - 清空指定列表的项目

### constants.js
定义存储键名和默认配置：
```javascript
STORAGE_KEYS = { LISTS: 'lists', ITEMS: 'items' }
DEFAULT_ICONS = { LIST: 'format-list-bulleted', ITEM: 'text' }
DEFAULT_COLORS = { LIST: '#2196F3', ITEM: '#FF4081' }
```

## 开发约定

### 代码风格
- 使用中文注释
- 组件采用函数式组件 + Hooks
- 样式使用 `StyleSheet.create()` 集中定义
- 文件命名：PascalCase（组件）、camelCase（工具）

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

### UI 组件
- 使用 React Native Paper 组件：`List.Item`, `FAB`, `Dialog`, `Button`, `TextInput`, `Searchbar`, `Checkbox`, `Menu` 等
- 图标使用 `MaterialCommunityIcons`

## 注意事项

1. **重名检测**：创建列表或项目时会检查是否重名
2. **级联删除**：删除列表时会自动删除其下所有项目
3. **数据持久化**：所有数据存储在 AsyncStorage，应用卸载后数据会丢失
4. **平台兼容**：支持 iOS、Android 和 Web 平台
