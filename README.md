# 工具箱 - ToolsForWsl

一个基于 React Native + Expo 开发的列表管理应用，支持创建列表、管理项目、搜索和批量操作。

## 功能特性

- **列表管理**：创建、删除列表，支持模糊搜索
- **项目管理**：添加、编辑、删除项目，支持批量操作
- **数据持久化**：使用 AsyncStorage 本地存储数据
- **预置数据**：内置发票抽奖城市列表（50个城市）
- **跨平台**：支持 Android、iOS 和 Web

## 技术栈

- [Expo](https://expo.dev/) - React Native 开发框架
- [React Navigation](https://reactnavigation.org/) - 导航管理
- [React Native Paper](https://reactnativepaper.com/) - Material Design UI 组件库
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - 本地数据存储

## 项目结构

```
toolsForWsl/
├── App.js                 # 应用入口
├── index.js               # 注册根组件
├── constants.js           # 常量配置
├── app.json               # Expo 配置
├── package.json           # 依赖配置
├── assets/                # 静态资源
│   ├── icon.png
│   ├── splash-icon.png
│   └── ...
├── hooks/
│   └── useStorage.js      # 数据存储 Hook
└── screens/
    ├── ListsScreen.js     # 列表管理页面
    └── ItemsScreen.js     # 项目管理页面
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI

### 安装依赖

```bash
npm install
```

### 启动应用

```bash
# 启动开发服务器
npm start

# 或指定平台启动
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

### 清除缓存

```bash
npx expo start --clear
```

## 使用说明

### 列表管理

1. 点击右下角 **+** 按钮创建新列表
2. 输入列表名称保存
3. 点击列表进入项目管理页面
4. 左滑或点击删除按钮删除列表

### 项目管理

1. 进入列表后点击 **+** 添加项目
2. 支持模糊搜索项目
3. 点击「批量选择」进入批量操作模式
4. 支持全选/取消全选
5. 点击「清空」删除所有项目

## 预置数据

应用内置了发票抽奖城市列表，包含 50 个城市：

- **直辖市（4）**：北京、天津、上海、重庆
- **计划单列市（5）**：大连、青岛、宁波、厦门、深圳
- **其他城市（41）**：石家庄、邯郸、太原、呼和浩特、沈阳、长春、大庆、南京、无锡、苏州、湖州、绍兴、衢州、合肥、黄山、福州、泉州、赣州、济南、烟台、郑州、开封、武汉、宜昌、株洲、湘潭、广州、东莞、江门、南宁、海口、成都、泸州、遵义、昆明、拉萨、咸阳、兰州、西宁、银川、乌鲁木齐

> **注意**：首次运行时如已有旧数据，可能看不到预置数据。可清除应用数据后重新运行。

## 开发指南

### 代码规范

- 使用函数式组件和 Hooks
- 使用 `useMemo` 优化列表过滤性能
- 组件注释使用 JSDoc 格式

### 数据结构

**列表 (List)**
```javascript
{
  id: string,          // 唯一标识
  name: string,        // 列表名称
  createdAt: string    // 创建时间 (ISO 8601)
}
```

**项目 (Item)**
```javascript
{
  id: string,          // 唯一标识
  name: string,        // 项目名称
  listId: string,      // 所属列表 ID
  createdAt: string    // 创建时间 (ISO 8601)
}
```

## 许可证

MIT
