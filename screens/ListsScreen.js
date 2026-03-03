import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { FAB, List, Dialog, Portal, TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

/**
 * 列表管理屏幕
 * 显示所有列表，支持创建新列表
 */
const ListsScreen = ({ lists, saveLists, deleteListWithItems }) => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [listName, setListName] = useState('');

  /**
   * 打开创建列表对话框
   */
  const openDialog = () => {
    setListName('');
    setVisible(true);
  };

  /**
   * 关闭创建列表对话框
   */
  const closeDialog = () => {
    setVisible(false);
  };

  /**
   * 创建新列表
   */
  const createList = () => {
    if (!listName.trim()) {
      Alert.alert('提示', '请输入列表名称');
      return;
    }

    // 检查列表名称是否已存在
    const isDuplicate = lists.some(list => list.name === listName.trim());
    if (isDuplicate) {
      Alert.alert('提示', '列表名称已存在，请使用其他名称');
      return;
    }

    const newList = {
      id: Date.now().toString(),
      name: listName.trim(),
      createdAt: new Date().toISOString(),
    };

    saveLists([...lists, newList]);
    closeDialog();
  };

  /**
   * 处理列表点击，导航到项目屏幕
   */
  const handleListPress = (list) => {
    navigation.navigate('Items', { listId: list.id, listName: list.name });
  };

  /**
   * 处理列表长按，显示删除选项
   */
  const handleListLongPress = (list) => {
    Alert.alert(
      '删除列表',
      `确定要删除列表 "${list.name}" 及其所有项目吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deleteListWithItems(list.id),
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * 渲染列表项
   */
  const renderList = ({ item }) => (
    <List.Item
      title={item.name}
      description={`创建于 ${new Date(item.createdAt).toLocaleDateString()}`}
      onPress={() => handleListPress(item)}
      onLongPress={() => handleListLongPress(item)}
      style={styles.listItem}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openDialog}
        label="创建列表"
      />

      {lists.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无列表</Text>
          <Text style={styles.emptySubText}>点击右下角按钮创建新列表</Text>
        </View>
      )}

      <Portal>
        <Dialog visible={visible} onDismiss={closeDialog}>
          <Dialog.Title>创建新列表</Dialog.Title>
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
            <Button onPress={closeDialog}>取消</Button>
            <Button onPress={createList}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
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
});

export default ListsScreen;