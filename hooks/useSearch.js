import { useState, useMemo, useCallback } from 'react';

/**
 * 搜索过滤 Hook
 * 封装搜索查询和过滤逻辑
 * @param {Array} items - 要搜索的数据列表
 * @param {string} searchKey - 搜索字段名，默认为 'name'
 * @returns {Object} 搜索相关的状态和方法
 */
const useSearch = (items = [], searchKey = 'name') => {
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤后的结果
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item[searchKey]?.toLowerCase().includes(query)
    );
  }, [items, searchQuery, searchKey]);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 是否正在搜索
  const isSearching = searchQuery.trim().length > 0;

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    filteredItems,
    isSearching,
  };
};

export default useSearch;
