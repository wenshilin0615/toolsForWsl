import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { FAB, List, Dialog, Portal, TextInput, Button, Text, Searchbar, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

/**
 * 项目管理屏幕
 * 显示指定列表的所有项目，支持添加、编辑、删除、搜索和批量操作
 */
const ItemsScreen = ({ items, saveItems, clearListItems }) => {
  const route = useRoute();
  const { listId, listName } = route.params;

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [alertDialogVisible, setAlertDialogVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [itemName, setItemName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [batchMode, setBatchMode] = useState(false);

  // 过滤当前列表的项目
  const listItems = useMemo(() => {
    return items.filter(item => item.listId === listId);
  }, [items, listId]);

  // 搜索过滤
  const filteredItems = useMemo(() => {
    if (!searchQuery) return listItems;
    return listItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listItems, searchQuery]);

  /**
   * 显示添加项目对话框
   */
  const showAddDialog = () => {
    setItemName('');
    setDialogVisible(true);
  };

  /**
   * 显示编辑项目对话框
   */
  const showEditDialog = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setEditDialogVisible(true);
  };

  /**
   * 显示删除确认对话框
   */
  const showDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogVisible(true);
  };

  /**
   * 检查项目名称是否重复
   */
  const isDuplicateName = (name, excludeId = null) => {
    return listItems.some(item => 
      item.name === name.trim() && item.id !== excludeId
    );
  };

  /**
   * 保存新项目
   */
  const handleSave = () => {
    if (!itemName.trim()) {
      setAlertMessage('请输入项目名称');
      setAlertDialogVisible(true);
      return;
    }

    if (isDuplicateName(itemName)) {
      setAlertMessage('项目名称已存在');
      setAlertDialogVisible(true);
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      listId,
      createdAt: new Date().toISOString(),
    };

    saveItems([...items, newItem]);
    setDialogVisible(false);
  };

  /**
   * 保存编辑
   */
  const handleEditSave = () => {
    if (!itemName.trim()) {
      setAlertMessage('请输入项目名称');
      setAlertDialogVisible(true);
      return;
    }

    if (isDuplicateName(itemName, editingItem.id)) {
      setAlertMessage('项目名称已存在');
      setAlertDialogVisible(true);
      return;
    }

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? { ...item, name: itemName.trim() } : item
    );

    saveItems(updatedItems);
    setEditDialogVisible(false);
  };

  /**
   * 确认删除项目
   */
  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedItems = items.filter(i => i.id !== itemToDelete.id);
      saveItems(updatedItems);
    }
    setDeleteDialogVisible(false);
    setItemToDelete(null);
  };

  /**
   * 切换项目选择状态
   */
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  /**
   * 批量删除所选项目
   */
  const batchDeleteItems = () => {
    if (selectedItems.length === 0) {
      setAlertMessage('请先选择要删除的项目');
      setAlertDialogVisible(true);
      return;
    }

    const updatedItems = items.filter(item => !selectedItems.includes(item.id));
    saveItems(updatedItems);
    setSelectedItems([]);
    setBatchMode(false);
  };

  /**
   * 确认清空列表
   */
  const confirmClear = () => {
    clearListItems(listId);
    setClearDialogVisible(false);
    setBatchMode(false);
    setSelectedItems([]);
  };

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索项目"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* 项目总数和操作栏 */}
      {listItems.length > 0 && (
        <View style={styles.countBanner}>
          <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#2196F3" />
          <Text style={styles.countText}>共 {listItems.length} 个项目</Text>
          {!batchMode && (
            <View style={styles.bannerActions}>
              <TouchableOpacity onPress={() => setBatchMode(true)} style={styles.bannerAction}>
                <Text style={styles.actionText}>批量选择</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setClearDialogVisible(true)} style={styles.bannerAction}>
                <Text style={styles.deleteText}>清空</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '没有找到匹配的项目' : '暂无项目'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubText}>请点击右下角按钮添加</Text>
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
                    status={selectedItems.includes(item.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleItemSelection(item.id)}
                  />
                )}
                right={() => !batchMode && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => showEditDialog(item)}
                    >
                      <Text style={styles.actionText}>编辑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => showDeleteDialog(item)}
                    >
                      <Text style={styles.deleteText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                )}
                onPress={() => batchMode && toggleItemSelection(item.id)}
              />
            ))}
          </List.Section>
        )}
      </ScrollView>

      {/* 批量操作栏 */}
      {batchMode && (
        <View style={styles.batchActions}>
          <View style={styles.batchLeftActions}>
            <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.actionText}>
                {selectedItems.length === filteredItems.length ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>已选 {selectedItems.length} 项</Text>
          </View>
          <View style={styles.batchRightActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setBatchMode(false);
                setSelectedItems([]);
              }}
              style={styles.batchButton}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={batchDeleteItems}
              style={styles.batchButton}
              disabled={selectedItems.length === 0}
            >
              删除
            </Button>
          </View>
        </View>
      )}

      {/* 添加项目对话框 */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>添加项目</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="项目名称"
              value={itemName}
              onChangeText={setItemName}
              style={styles.input}
              placeholder="例如：北京"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button onPress={handleSave}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        {/* 编辑项目对话框 */}
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>编辑项目</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="项目名称"
              value={itemName}
              onChangeText={setItemName}
              style={styles.input}
              placeholder="例如：北京"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>取消</Button>
            <Button onPress={handleEditSave}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除项目 "{itemToDelete?.name}" 吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>取消</Button>
            <Button onPress={confirmDelete} textColor="#ff3b30">删除</Button>
          </Dialog.Actions>
        </Dialog>

        {/* 清空确认对话框 */}
        <Dialog visible={clearDialogVisible} onDismiss={() => setClearDialogVisible(false)}>
          <Dialog.Title>确认清空</Dialog.Title>
          <Dialog.Content>
            <Text>确定要清空列表 "{listName}" 中的所有项目吗？</Text>
            <Text style={{ color: '#ff3b30', marginTop: 8 }}>此操作不可恢复</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearDialogVisible(false)}>取消</Button>
            <Button onPress={confirmClear} textColor="#ff3b30">清空</Button>
          </Dialog.Actions>
        </Dialog>

        {/* 提示对话框 */}
        <Dialog visible={alertDialogVisible} onDismiss={() => setAlertDialogVisible(false)}>
          <Dialog.Title>提示</Dialog.Title>
          <Dialog.Content>
            <Text>{alertMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAlertDialogVisible(false)}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {!batchMode && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={showAddDialog}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
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
  input: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
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

export default ItemsScreen;
