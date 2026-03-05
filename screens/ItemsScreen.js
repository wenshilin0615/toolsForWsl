import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { FAB, List, Dialog, Portal, TextInput, Button, Text, Searchbar, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import useBatchSelection from '../hooks/useBatchSelection';
import useDialog from '../hooks/useDialog';
import useSearch from '../hooks/useSearch';
import commonStyles from '../components/commonStyles';

// 对话框类型
const DIALOG_TYPES = ['add', 'edit', 'delete', 'clear', 'alert'];

/**
 * 项目管理屏幕
 * 显示指定列表的所有项目，支持添加、编辑、删除、搜索和批量操作
 */
const ItemsScreen = ({ items, saveItems, clearListItems }) => {
  const route = useRoute();
  const { listId, listName } = route.params;

  // 对话框状态
  const { dialogs, showDialog, hideDialog, showAlert, hideAlert, alertMessage } = useDialog(DIALOG_TYPES);
  
  // 输入状态
  const [itemName, setItemName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 过滤当前列表的项目
  const listItems = useMemo(() => {
    return items.filter(item => item.listId === listId);
  }, [items, listId]);

  // 搜索状态
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(listItems);

  // 批量选择状态
  const {
    batchMode,
    selectedIds,
    selectedCount,
    isAllSelected,
    isSelected,
    toggleSelection,
    toggleSelectAll,
    enterBatchMode,
    exitBatchMode,
  } = useBatchSelection(filteredItems);

  /**
   * 检查项目名称是否重复
   */
  const isDuplicateName = useCallback((name, excludeId = null) => {
    return listItems.some(item => 
      item.name === name.trim() && item.id !== excludeId
    );
  }, [listItems]);

  /**
   * 显示添加项目对话框
   */
  const showAddDialog = useCallback(() => {
    setItemName('');
    showDialog('add');
  }, [showDialog]);

  /**
   * 显示编辑项目对话框
   */
  const showEditDialog = useCallback((item) => {
    setEditingItem(item);
    setItemName(item.name);
    showDialog('edit');
  }, [showDialog]);

  /**
   * 显示删除确认对话框
   */
  const showDeleteDialog = useCallback((item) => {
    setItemToDelete(item);
    showDialog('delete');
  }, [showDialog]);

  /**
   * 解析输入文本，支持逗号、分号、顿号、空格分隔
   * 返回去重后的名称数组
   */
  const parseNames = useCallback((text) => {
    // 支持分隔符：逗号、分号、中文顿号、空格、换行
    const separators = /[,;，、\s\n]+/;
    const names = text
      .split(separators)
      .map(name => name.trim())
      .filter(name => name.length > 0);
    // 对输入本身去重
    return [...new Set(names)];
  }, []);

  /**
   * 保存新项目（支持批量新增）
   */
  const handleSave = useCallback(() => {
    if (!itemName.trim()) {
      showAlert('请输入项目名称');
      return;
    }

    const names = parseNames(itemName);
    if (names.length === 0) {
      showAlert('请输入有效的项目名称');
      return;
    }

    // 过滤掉数据库中已存在的名称
    const existingNames = names.filter(name => isDuplicateName(name));
    const validNames = names.filter(name => !isDuplicateName(name));

    if (validNames.length === 0) {
      showAlert('所有名称已存在');
      return;
    }

    // 批量创建新项目，使用时间戳+索引生成唯一ID
    const timestamp = Date.now();
    const newItems = validNames.map((name, index) => ({
      id: `${timestamp}_${index}`,
      name,
      listId,
      createdAt: new Date().toISOString(),
    }));

    saveItems([...items, ...newItems]);
    hideDialog('add');

    // 如果有已存在的名称，提示用户
    if (existingNames.length > 0) {
      setTimeout(() => {
        showAlert(`已跳过 ${existingNames.length} 个已存在名称：${existingNames.join('、')}`);
      }, 100);
    }
  }, [itemName, listId, items, saveItems, isDuplicateName, showAlert, hideDialog, parseNames]);

  /**
   * 保存编辑
   */
  const handleEditSave = useCallback(() => {
    if (!itemName.trim()) {
      showAlert('请输入项目名称');
      return;
    }

    if (isDuplicateName(itemName, editingItem.id)) {
      showAlert('项目名称已存在');
      return;
    }

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? { ...item, name: itemName.trim() } : item
    );

    saveItems(updatedItems);
    hideDialog('edit');
  }, [itemName, editingItem, items, saveItems, isDuplicateName, showAlert, hideDialog]);

  /**
   * 确认删除项目
   */
  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      const updatedItems = items.filter(i => i.id !== itemToDelete.id);
      saveItems(updatedItems);
    }
    hideDialog('delete');
    setItemToDelete(null);
  }, [itemToDelete, items, saveItems, hideDialog]);

  /**
   * 批量删除所选项目
   */
  const batchDeleteItems = useCallback(() => {
    if (selectedIds.length === 0) {
      showAlert('请先选择要删除的项目');
      return;
    }

    const updatedItems = items.filter(item => !selectedIds.includes(item.id));
    saveItems(updatedItems);
    exitBatchMode();
  }, [selectedIds, items, saveItems, exitBatchMode, showAlert]);

  /**
   * 确认清空列表
   */
  const confirmClear = useCallback(() => {
    clearListItems(listId);
    hideDialog('clear');
    exitBatchMode();
  }, [listId, clearListItems, hideDialog, exitBatchMode]);

  return (
    <View style={commonStyles.container}>
      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索项目"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={commonStyles.searchBar}
      />

      {/* 项目总数和操作栏 */}
      {listItems.length > 0 && (
        <View style={commonStyles.countBanner}>
          <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#2196F3" />
          <Text style={commonStyles.countText}>共 {listItems.length} 个项目</Text>
          {!batchMode && (
            <View style={commonStyles.bannerActions}>
              <TouchableOpacity onPress={enterBatchMode} style={commonStyles.bannerAction}>
                <Text style={commonStyles.actionText}>批量选择</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showDialog('clear')} style={commonStyles.bannerAction}>
                <Text style={commonStyles.deleteText}>清空</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      <ScrollView style={commonStyles.scrollView}>
        {filteredItems.length === 0 ? (
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyText}>
              {searchQuery ? '没有找到匹配的项目' : '暂无项目'}
            </Text>
            {!searchQuery && (
              <Text style={commonStyles.emptySubText}>请点击右下角按钮添加</Text>
            )}
          </View>
        ) : (
          <List.Section>
            {filteredItems.map((item) => (
              <List.Item
                key={item.id}
                title={item.name}
                description={`添加于 ${new Date(item.createdAt).toLocaleDateString()}`}
                left={() => batchMode && (
                  <Checkbox
                    status={isSelected(item.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleSelection(item.id)}
                  />
                )}
                right={() => !batchMode && (
                  <View style={commonStyles.actionButtons}>
                    <TouchableOpacity
                      style={commonStyles.actionButton}
                      onPress={() => showEditDialog(item)}
                    >
                      <Text style={commonStyles.actionText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={commonStyles.actionButton}
                      onPress={() => showDeleteDialog(item)}
                    >
                      <Text style={commonStyles.deleteText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                )}
                onPress={() => batchMode && toggleSelection(item.id)}
              />
            ))}
          </List.Section>
        )}
      </ScrollView>

      {/* 批量操作栏 */}
      {batchMode && (
        <View style={commonStyles.batchActions}>
          <View style={commonStyles.batchLeftActions}>
            <TouchableOpacity onPress={toggleSelectAll} style={commonStyles.selectAllButton}>
              <Text style={commonStyles.actionText}>
                {isAllSelected ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
            <Text style={commonStyles.selectedCount}>已选 {selectedCount} 项</Text>
          </View>
          <View style={commonStyles.batchRightActions}>
            <Button mode="outlined" onPress={exitBatchMode} style={commonStyles.batchButton}>
              取消
            </Button>
            <Button
              mode="contained"
              onPress={batchDeleteItems}
              style={commonStyles.batchButton}
              disabled={selectedCount === 0}
            >
              删除
            </Button>
          </View>
        </View>
      )}

      {/* 对话框 */}
      <Portal>
        <Dialog visible={dialogs.add} onDismiss={() => hideDialog('add')}>
          <Dialog.Title>添加项目</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="项目名称"
              value={itemName}
              onChangeText={setItemName}
              style={commonStyles.input}
              placeholder="例如：北京，上海，广州"
              multiline
            />
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              支持批量添加，用逗号、分号、顿号或空格分隔
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog('add')}>取消</Button>
            <Button onPress={handleSave}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogs.edit} onDismiss={() => hideDialog('edit')}>
          <Dialog.Title>编辑项目</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="项目名称"
              value={itemName}
              onChangeText={setItemName}
              style={commonStyles.input}
              placeholder="例如：北京"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog('edit')}>取消</Button>
            <Button onPress={handleEditSave}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogs.delete} onDismiss={() => hideDialog('delete')}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除项目 "{itemToDelete?.name}" 吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog('delete')}>取消</Button>
            <Button onPress={confirmDelete} textColor="#ff3b30">删除</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogs.clear} onDismiss={() => hideDialog('clear')}>
          <Dialog.Title>确认清空</Dialog.Title>
          <Dialog.Content>
            <Text>确定要清空列表 "{listName}" 中的所有项目吗？</Text>
            <Text style={{ color: '#ff3b30', marginTop: 8 }}>此操作不可恢复</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog('clear')}>取消</Button>
            <Button onPress={confirmClear} textColor="#ff3b30">清空</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogs.alert} onDismiss={hideAlert}>
          <Dialog.Title>提示</Dialog.Title>
          <Dialog.Content>
            <Text>{alertMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideAlert}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {!batchMode && (
        <FAB style={commonStyles.fab} icon="plus" onPress={showAddDialog} />
      )}
    </View>
  );
};

export default ItemsScreen;