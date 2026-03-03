import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { FAB, List, Dialog, Portal, TextInput, Button, Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * 列表管理屏幕
 * 显示所有列表，支持创建新列表和搜索
 */
const ListsScreen = ({ lists, saveLists, deleteListWithItems }) => {
  const navigation = useNavigation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [alertDialogVisible, setAlertDialogVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 搜索过滤
  const filteredLists = useMemo(() => {
    if (!searchQuery) return lists;
    return lists.filter(list => 
      list.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lists, searchQuery]);

  /**
   * 显示添加列表对话框
   */
  const showAddDialog = () => {
    setListName('');
    setDialogVisible(true);
  };

  /**
   * 保存列表
   */
  const handleSave = () => {
    if (!listName.trim()) {
      setAlertMessage('请输入列表名称');
      setAlertDialogVisible(true);
      return;
    }

    const nameExists = lists.some(list => list.name === listName.trim());
    if (nameExists) {
      setAlertMessage('列表名称已存在');
      setAlertDialogVisible(true);
      return;
    }

    const newList = {
      id: Date.now().toString(),
      name: listName.trim(),
      createdAt: new Date().toISOString(),
    };

    saveLists([...lists, newList]);
    setDialogVisible(false);
  };

  /**
   * 显示删除确认对话框
   */
  const showDeleteDialog = (list) => {
    setListToDelete(list);
    setDeleteDialogVisible(true);
  };

  /**
   * 确认删除列表
   */
  const confirmDelete = () => {
    if (listToDelete) {
      deleteListWithItems(listToDelete.id);
    }
    setDeleteDialogVisible(false);
    setListToDelete(null);
  };

  /**
   * 处理列表点击
   */
  const handleListPress = (list) => {
    navigation.navigate('Items', { listId: list.id, listName: list.name });
  };

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索列表"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* 列表总数 */}
      {lists.length > 0 && (
        <View style={styles.countBanner}>
          <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#2196F3" />
          <Text style={styles.countText}>共 {lists.length} 个列表</Text>
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {filteredLists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '没有找到匹配的列表' : '暂无列表'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubText}>请点击右下角按钮添加</Text>
            )}
          </View>
        ) : (
          <List.Section>
            {filteredLists.map((list) => (
              <List.Item
                key={list.id}
                title={list.name}
                description={`创建于 ${new Date(list.createdAt).toLocaleDateString()}`}
                onPress={() => handleListPress(list)}
                right={() => (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => showDeleteDialog(list)}
                    >
                      <Text style={styles.deleteText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ))}
          </List.Section>
        )}
      </ScrollView>

      {/* 添加列表对话框 */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>添加列表</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="列表名称"
              value={listName}
              onChangeText={setListName}
              style={styles.input}
              placeholder="例如：发票抽奖城市"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button onPress={handleSave}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除列表 "{listToDelete?.name}" 吗？</Text>
            <Text style={{ color: '#ff3b30', marginTop: 8 }}>将同时删除该列表下的所有项目</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>取消</Button>
            <Button onPress={confirmDelete} textColor="#ff3b30">删除</Button>
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

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={showAddDialog}
      />
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 14,
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
});

export default ListsScreen;
