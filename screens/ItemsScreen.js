import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { FAB, List, Dialog, Portal, TextInput, Button, Text, Searchbar, Checkbox, IconButton, Menu } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

/**
 * 项目管理屏幕
 * 显示指定列表的所有项目，支持添加、编辑、删除、搜索和批量操作
 */
const ItemsScreen = ({ items, saveItems, clearListItems }) => {
  const route = useRoute();
  const { listId, listName } = route.params;

  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
   * 打开创建项目对话框
   */
  const openDialog = () => {
    setItemName('');
    setEditingItem(null);
    setVisible(true);
  };

  /**
   * 打开编辑项目对话框
   */
  const openEditDialog = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setEditVisible(true);
  };

  /**
   * 关闭对话框
   */
  const closeDialog = () => {
    setVisible(false);
    setEditVisible(false);
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
   * 添加新项目
   */
  const addItem = () => {
    if (!itemName.trim()) {
      Alert.alert('提示', '请输入项目名称');
      return;
    }

    if (isDuplicateName(itemName)) {
      Alert.alert('提示', '项目名称已存在，请使用其他名称');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      listId,
      createdAt: new Date().toISOString(),
    };

    saveItems([...items, newItem]);
    closeDialog();
  };

  /**
   * 编辑项目
   */
  const editItem = () => {
    if (!itemName.trim()) {
      Alert.alert('提示', '请输入项目名称');
      return;
    }

    if (isDuplicateName(itemName, editingItem.id)) {
      Alert.alert('提示', '项目名称已存在，请使用其他名称');
      return;
    }

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? { ...item, name: itemName.trim() } : item
    );

    saveItems(updatedItems);
    closeDialog();
  };

  /**
   * 删除单个项目
   */
  const deleteItem = (item) => {
    Alert.alert(
      '删除项目',
      `确定要删除项目 "${item.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const updatedItems = items.filter(i => i.id !== item.id);
            saveItems(updatedItems);
          },
        },
      ],
      { cancelable: true }
    );
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
   * 批量删除所选项目
   */
  const batchDeleteItems = () => {
    if (selectedItems.length === 0) {
      Alert.alert('提示', '请先选择要删除的项目');
      return;
    }

    Alert.alert(
      '批量删除',
      `确定要删除选中的 ${selectedItems.length} 个项目吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const updatedItems = items.filter(item => !selectedItems.includes(item.id));
            saveItems(updatedItems);
            setSelectedItems([]);
            setBatchMode(false);
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * 清空所有项目
   */
  const handleClearAll = () => {
    Alert.alert(
      '清空列表',
      `确定要清空列表 "${listName}" 中的所有项目吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => {
            clearListItems(listId);
            setBatchMode(false);
            setSelectedItems([]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * 渲染项目项
   */
  const renderItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={`添加于 ${new Date(item.createdAt).toLocaleDateString()}`}
      left={() => batchMode && (
        <Checkbox
          status={selectedItems.includes(item.id) ? 'checked' : 'unchecked'}
          onPress={() => toggleItemSelection(item.id)}
        />
      )}
      right={() => (
        <IconButton
          icon="pencil"
          onPress={() => openEditDialog(item)}
        />
      )}
      onPress={() => !batchMode && deleteItem(item)}
      style={styles.listItem}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索项目"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {batchMode ? (
        <View style={styles.batchActions}>
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
            删除所选 ({selectedItems.length})
          </Button>
        </View>
      ) : (
        <>
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={openDialog}
            label="添加项目"
          />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <FAB
                style={styles.menuFab}
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
            style={styles.menu}
          >
            <Menu.Item
              title="批量选择"
              onPress={() => setBatchMode(true)}
            />
            <Menu.Item
              title="清空列表"
              onPress={handleClearAll}
              leadingIcon="delete-sweep"
            />
          </Menu>
        </>
      )}

      <Portal>
        <Dialog visible={visible} onDismiss={closeDialog}>
          <Dialog.Title>添加新项目</Dialog.Title>
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
            <Button onPress={closeDialog}>取消</Button>
            <Button onPress={addItem}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={editVisible} onDismiss={closeDialog}>
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
            <Button onPress={closeDialog}>取消</Button>
            <Button onPress={editItem}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {filteredItems.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? '没有找到匹配的项目' : '暂无项目'}
          </Text>
          {!searchQuery && (
            <Text style={styles.emptySubText}>点击右下角按钮添加新项目</Text>
          )}
        </View>
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
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  listItem: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  menuFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  menu: {
    position: 'absolute',
    right: 16,
    bottom: 120,
  },
  input: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  batchButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ItemsScreen;