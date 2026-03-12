import { StyleSheet } from 'react-native';

// 西瓜红可爱风主题色
export const THEME_COLORS = {
  primary: '#FF6B6B',      // 西瓜红
  primaryLight: '#FF8E8E', // 浅西瓜红
  accent: '#FFB6C1',       // 浅粉色
  accentLight: '#FFD1DC',  // 更浅的粉色
  background: '#FFF5F5',   // 浅粉背景
  card: '#FFFFFF',
  text: '#5D4E60',         // 柔和的深紫色
  textLight: '#8B7E8B',    // 浅紫色文字
  border: '#FFE4E1',       // 浅粉边框
  danger: '#FF6B6B',
  success: '#7BC47F',      // 柔和的绿色
};

/**
 * 公共样式
 * 两个屏幕共用的样式定义
 */
const commonStyles = StyleSheet.create({
  // 容器
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  
  // 搜索栏
  searchBar: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: THEME_COLORS.card,
    borderRadius: 25,
    elevation: 2,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // 滚动视图
  scrollView: {
    flex: 1,
  },
  
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: THEME_COLORS.textLight,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: THEME_COLORS.accent,
    textAlign: 'center',
    marginTop: 8,
  },
  
  // 计数栏
  countBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.border,
    marginTop: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginHorizontal: 16,
  },
  countText: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  bannerActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  bannerAction: {
    marginLeft: 16,
  },
  
  // 操作按钮
  actionText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteText: {
    color: THEME_COLORS.danger,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
  },
  
  // 输入框
  input: {
    marginBottom: 16,
    backgroundColor: THEME_COLORS.card,
  },
  
  // 浮动按钮
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 30,
    elevation: 4,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  // 批量操作栏
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME_COLORS.card,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.border,
  },
  batchLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  selectedCount: {
    fontSize: 14,
    color: THEME_COLORS.text,
    marginLeft: 8,
  },
  batchRightActions: {
    flexDirection: 'row',
  },
  batchButton: {
    marginLeft: 8,
    borderRadius: 20,
  },
});

export default commonStyles;
