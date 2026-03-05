import { StyleSheet } from 'react-native';

/**
 * 公共样式
 * 两个屏幕共用的样式定义
 */
const commonStyles = StyleSheet.create({
  // 容器
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // 搜索栏
  searchBar: {
    margin: 16,
    marginBottom: 0,
  },
  
  // 滚动视图
  scrollView: {
    flex: 1,
  },
  
  // 空状态
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // 计数栏
  countBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 16,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
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
    color: '#2196F3',
    fontSize: 14,
  },
  deleteText: {
    color: '#ff3b30',
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
  },
  
  // 浮动按钮
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  
  // 批量操作栏
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    color: '#666',
    marginLeft: 8,
  },
  batchRightActions: {
    flexDirection: 'row',
  },
  batchButton: {
    marginLeft: 8,
  },
});

export default commonStyles;
