import { useState, useCallback, useMemo } from 'react';

/**
 * 批量选择 Hook
 * 封装批量选择、全选、取消选择等逻辑
 * @param {Array} items - 可选择的项目列表
 * @returns {Object} 批量选择相关的状态和方法
 */
const useBatchSelection = (items = []) => {
  // 合并 batchMode 和 selectedIds 到一个状态对象，减少渲染次数
  const [batchState, setBatchState] = useState({
    mode: false,
    selectedIds: [],
  });

  // 切换选择状态
  const toggleSelection = useCallback((id) => {
    setBatchState(prev => {
      const newSelectedIds = prev.selectedIds.includes(id)
        ? prev.selectedIds.filter(itemId => itemId !== id)
        : [...prev.selectedIds, id];
      return { ...prev, selectedIds: newSelectedIds };
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    setBatchState(prev => {
      if (prev.selectedIds.length === items.length && items.length > 0) {
        return { ...prev, selectedIds: [] };
      }
      return { ...prev, selectedIds: items.map(item => item.id) };
    });
  }, [items]);

  // 进入批量模式
  const enterBatchMode = useCallback(() => {
    setBatchState({ mode: true, selectedIds: [] });
  }, []);

  // 退出批量模式
  const exitBatchMode = useCallback(() => {
    setBatchState({ mode: false, selectedIds: [] });
  }, []);

  // 是否全选
  const isAllSelected = useMemo(() => {
    return items.length > 0 && batchState.selectedIds.length === items.length;
  }, [items, batchState.selectedIds]);

  // 选中数量
  const selectedCount = batchState.selectedIds.length;

  // 是否选中某个项目
  const isSelected = useCallback((id) => {
    return batchState.selectedIds.includes(id);
  }, [batchState.selectedIds]);

  return {
    batchMode: batchState.mode,
    selectedIds: batchState.selectedIds,
    selectedCount,
    isAllSelected,
    isSelected,
    toggleSelection,
    toggleSelectAll,
    enterBatchMode,
    exitBatchMode,
  };
};

export default useBatchSelection;
