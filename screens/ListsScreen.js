import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FAB, List, Dialog, Portal, TextInput, Button, Text, Searchbar, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useBatchSelection from '../hooks/useBatchSelection';
import useDialog from '../hooks/useDialog';
import useSearch from '../hooks/useSearch';
import commonStyles from '../components/commonStyles';
import WallpaperSettings from '../components/WallpaperSettings';
import { BUILT_IN_WALLPAPERS, SCREEN_NAMES } from '../constants';

// 对话框类型
const DIALOG_TYPES = ['add', 'delete', 'alert'];

/**
 * 列表管理屏幕
 * 显示所有列表，支持创建新列表、搜索和批量操作
 */
const ListsScreen = ({ 
  lists, 
  saveLists, 
  deleteListWithItems, 
  wallpaperSettings, 
  saveWallpaperSettings,
  customWallpapers,
  saveCustomWallpapers,
}) => {
  const navigation = useNavigation();
  
  // 对话框状态
  const { dialogs, showDialog, hideDialog, showAlert, hideAlert, alertMessage } = useDialog(DIALOG_TYPES);
  
  // 壁纸设置对话框状态
  const [wallpaperDialogVisible, setWallpaperDialogVisible] = useState(false);
  
  // 输入状态
  const [listName, setListName] = useState('');
  const [listToDelete, setListToDelete] = useState(null);
  
  // 搜索状态
  const { searchQuery, setSearchQuery, filteredItems: filteredLists } = useSearch(lists);
  
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
  } = useBatchSelection(filteredLists);

  // 获取当前壁纸（支持内置和自定义）
  const currentWallpaper = useMemo(() => {
    const wallpaperId = wallpaperSettings?.wallpaperId;
    if (!wallpaperId || wallpaperId === 'none') {
      return BUILT_IN_WALLPAPERS[0];
    }
    // 先在内置壁纸中查找
    const builtIn = BUILT_IN_WALLPAPERS.find(w => w.id === wallpaperId);
    if (builtIn) return builtIn;
    // 再在自定义壁纸中查找
    const custom = customWallpapers.find(w => w.id === wallpaperId);
    return custom || BUILT_IN_WALLPAPERS[0];
  }, [wallpaperSettings, customWallpapers]);

  const wallpaperOpacity = wallpaperSettings?.opacity ?? 0.3;

  /**
   * 显示添加列表对话框
   */
  const showAddDialog = useCallback(() => {
    setListName('');
    showDialog('add');
  }, [showDialog]);

  /**
   * 保存列表
   */
  const handleSave = useCallback(() => {
    if (!listName.trim()) {
      showAlert('请输入列表名称');
      return;
    }

    const nameExists = lists.some(list => list.name === listName.trim());
    if (nameExists) {
      showAlert('列表名称已存在');
      return;
    }

    const newList = {
      id: Date.now().toString(),
      name: listName.trim(),
      createdAt: new Date().toISOString(),
    };

    saveLists([...lists, newList]);
    hideDialog('add');
  }, [listName, lists, saveLists, showAlert, hideDialog]);

  /**
   * 显示删除确认对话框
   */
  const showDeleteDialog = useCallback((list) => {
    setListToDelete(list);
    showDialog('delete');
  }, [showDialog]);

  /**
   * 确认删除列表
   */
  const confirmDelete = useCallback(() => {
    if (listToDelete) {
      deleteListWithItems(listToDelete.id);
    }
    hideDialog('delete');
    setListToDelete(null);
  }, [listToDelete, deleteListWithItems, hideDialog]);

  /**
   * 批量删除所选列表
   */
  const batchDeleteLists = useCallback(() => {
    if (selectedIds.length === 0) {
      showAlert('请先选择要删除的列表');
      return;
    }

    selectedIds.forEach(listId => {
      deleteListWithItems(listId);
    });
    exitBatchMode();
  }, [selectedIds, deleteListWithItems, exitBatchMode, showAlert]);

  /**
   * 处理列表点击
   */
  const handleListPress = useCallback((list) => {
    navigation.navigate('Items', { listId: list.id, listName: list.name });
  }, [navigation]);

  /**
   * 保存壁纸设置
   */
  const handleSaveWallpaper = useCallback((settings) => {
    saveWallpaperSettings(settings);
    setWallpaperDialogVisible(false);
  }, [saveWallpaperSettings]);

  // 渲染内容
  const renderContent = () => (
    <>
      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索列表"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={commonStyles.searchBar}
      />

      {/* 列表总数和操作栏 */}
      {lists.length > 0 && (
        <View style={commonStyles.countBanner}>
          <MaterialCommunityIcons name="format-list-bulleted" size={16} color="#2196F3" />
          <Text style={commonStyles.countText}>共 {lists.length} 个列表</Text>
          {!batchMode && (
            <View style={commonStyles.bannerActions}>
              <TouchableOpacity onPress={() => setWallpaperDialogVisible(true)} style={commonStyles.bannerAction}>
                <Text style={commonStyles.actionText}>壁纸</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={enterBatchMode} style={commonStyles.bannerAction}>
                <Text style={commonStyles.actionText}>批量选择</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      <ScrollView style={commonStyles.scrollView}>
        {filteredLists.length === 0 ? (
          <View style={commonStyles.emptyContainer}>
            <Text style={commonStyles.emptyText}>
              {searchQuery ? '没有找到匹配的列表' : '暂无列表'}
            </Text>
            {!searchQuery && (
              <Text style={commonStyles.emptySubText}>请点击右下角按钮添加</Text>
            )}
          </View>
        ) : (
          <List.Section>
            {filteredLists.map((list) => (
              <List.Item
                key={list.id}
                title={list.name}
                description={`创建于 ${new Date(list.createdAt).toLocaleDateString()}`}
                left={() => batchMode && (
                  <Checkbox
                    status={isSelected(list.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleSelection(list.id)}
                  />
                )}
                right={() => !batchMode && (
                  <View style={commonStyles.actionButtons}>
                    <TouchableOpacity
                      style={commonStyles.actionButton}
                      onPress={() => showDeleteDialog(list)}
                    >
                      <Text style={commonStyles.deleteText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                )}
                onPress={() => batchMode ? toggleSelection(list.id) : handleListPress(list)}
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
              onPress={batchDeleteLists}
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
          <Dialog.Title>添加列表</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="列表名称"
              value={listName}
              onChangeText={setListName}
              style={commonStyles.input}
              placeholder="例如：发票抽奖城市"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog('add')}>取消</Button>
            <Button onPress={handleSave}>保存</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogs.delete} onDismiss={() => hideDialog('delete')}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除列表 "{listToDelete?.name}" 吗？</Text>
            <Text style={{ color: '#ff3b30', marginTop: 8 }}>将同时删除该列表下的所有项目</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog('delete')}>取消</Button>
            <Button onPress={confirmDelete} textColor="#ff3b30">删除</Button>
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

      {/* 壁纸设置对话框 */}
      <WallpaperSettings
        visible={wallpaperDialogVisible}
        onDismiss={() => setWallpaperDialogVisible(false)}
        currentSettings={wallpaperSettings}
        onSave={handleSaveWallpaper}
        customWallpapers={customWallpapers}
        saveCustomWallpapers={saveCustomWallpapers}
      />

      {!batchMode && (
        <FAB style={commonStyles.fab} icon="plus" onPress={showAddDialog} />
      )}
    </>
  );

  // 如果有壁纸，使用绝对定位的 Image 作为背景
  if (currentWallpaper.uri) {
    // 区分内置壁纸(require对象)和自定义壁纸(字符串路径)
    const imageSource = currentWallpaper.isCustom 
      ? { uri: currentWallpaper.uri }
      : currentWallpaper.uri;
    
    return (
      <View style={commonStyles.container}>
        <Image
          source={imageSource}
          style={styles.wallpaperImage}
          resizeMode="cover"
        />
        <View style={[styles.overlay, { backgroundColor: `rgba(255, 255, 255, ${1 - wallpaperOpacity})` }]}>
          {renderContent()}
        </View>
      </View>
    );
  }

  // 无壁纸时直接渲染
  return <View style={commonStyles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  wallpaperImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ListsScreen;
