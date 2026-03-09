import React, { useState, useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert, Platform } from 'react-native';
import { Dialog, Text, Button, ActivityIndicator, Portal, Checkbox } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { BUILT_IN_WALLPAPERS } from '../constants';

const { width } = Dimensions.get('window');
const GRID_PADDING = 24; // 内容区域内边距
const GRID_GAP = 8; // 缩略图间距
const COLUMNS = 5; // 每行显示数量
const THUMBNAIL_SIZE = Math.floor((width - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS);

/**
 * 壁纸设置组件
 * 用于选择壁纸和调整透明度
 */
const WallpaperSettings = ({
  visible,
  onDismiss,
  currentSettings,
  onSave,
  customWallpapers,
  saveCustomWallpapers,
}) => {
  const [selectedWallpaperId, setSelectedWallpaperId] = useState('none');
  const [opacity, setOpacity] = useState(0.3);
  const [loading, setLoading] = useState(false);

  // 批量删除模式
  const [batchMode, setBatchMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState([]);

  // 用于跟踪是否已初始化，避免 useEffect 重置用户选择
  const initializedRef = useRef(false);
  const prevVisibleRef = useRef(false);
  const customWallpapersRef = useRef(customWallpapers);

  // 更新 ref
  useEffect(() => {
    customWallpapersRef.current = customWallpapers;
  }, [customWallpapers]);

  // 同步当前设置 - 只在弹窗打开时执行一次
  useEffect(() => {
    // 弹窗从关闭变为打开时，重置初始化标志并同步设置
    if (visible && !prevVisibleRef.current) {
      initializedRef.current = false;
      
      if (currentSettings) {
        const wallpaperId = currentSettings.wallpaperId || 'none';
        const currentCustomWallpapers = customWallpapersRef.current;
        
        // 检查 wallpaperId 是否在有效列表中
        const isBuiltIn = BUILT_IN_WALLPAPERS.find(w => w.id === wallpaperId);
        const isCustom = currentCustomWallpapers.find(w => w.id === wallpaperId);
        const isNone = wallpaperId === 'none';
        
        if (isBuiltIn || isCustom || isNone) {
          setSelectedWallpaperId(wallpaperId);
        } else {
          // 如果 wallpaperId 无效，尝试选择自定义壁纸列表中的第一个
          if (currentCustomWallpapers.length > 0) {
            setSelectedWallpaperId(currentCustomWallpapers[0].id);
          } else {
            setSelectedWallpaperId('none');
          }
        }
        
        setOpacity(currentSettings.opacity ?? 0.3);
        initializedRef.current = true;
      }
    }
    prevVisibleRef.current = visible;
  }, [visible]); // 只依赖 visible

  /**
   * 从相册选择图片
   */
  const pickImage = async () => {
    try {
      // 请求权限（移动端）
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('权限提示', '需要相册权限才能选择图片');
          return;
        }
      }

      setLoading(true);

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16], // 竖屏比例
        quality: 0.8,
        base64: Platform.OS === 'web', // Web 平台需要 base64
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let wallpaperUri;

        if (Platform.OS === 'web') {
          // Web 平台：使用 base64 data URL
          if (asset.base64) {
            wallpaperUri = `data:image/jpeg;base64,${asset.base64}`;
          } else {
            // 如果没有 base64，尝试使用原始 URI
            wallpaperUri = asset.uri;
          }
        } else {
          // 移动端：复制文件到应用目录
          const wallpaperDir = `${FileSystem.documentDirectory}wallpapers/`;
          const dirInfo = await FileSystem.getInfoAsync(wallpaperDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(wallpaperDir, { intermediates: true });
          }

          const fileName = `custom_${Date.now()}.jpg`;
          const destPath = `${wallpaperDir}${fileName}`;

          await FileSystem.copyAsync({
            from: asset.uri,
            to: destPath,
          });

          wallpaperUri = destPath;
        }

        // 添加到自定义壁纸列表
        const timestamp = Date.now();
        const newWallpaper = {
          id: `custom_${timestamp}`,
          name: `自定义壁纸`,
          uri: wallpaperUri,
          isCustom: true,
          createdAt: timestamp,
        };

        const updatedWallpapers = [...customWallpapers, newWallpaper];
        await saveCustomWallpapers(updatedWallpapers);
        
        // 自动选中新添加的壁纸
        setSelectedWallpaperId(newWallpaper.id);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除自定义壁纸
   */
  const deleteCustomWallpaper = async (wallpaper) => {
    // Web 平台使用 confirm
    if (Platform.OS === 'web') {
      if (!window.confirm(`确定要删除 "${wallpaper.name}" 吗？`)) {
        return;
      }
    }

    // 移动端使用 Alert
    if (Platform.OS !== 'web') {
      return new Promise((resolve) => {
        Alert.alert(
          '删除壁纸',
          `确定要删除 "${wallpaper.name}" 吗？`,
          [
            { text: '取消', style: 'cancel', onPress: () => resolve(false) },
            { text: '删除', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      }).then(async (confirmed) => {
        if (confirmed) {
          await performDelete(wallpaper);
        }
      });
    } else {
      await performDelete(wallpaper);
    }
  };

  // 执行删除操作
  const performDelete = async (wallpaper) => {
    try {
      // 保存当前选中的壁纸ID和列表，避免闭包问题
      const currentSelected = selectedWallpaperId;
      const currentList = [...customWallpapers];

      // 移动端删除文件
      if (Platform.OS !== 'web' && wallpaper.uri && !wallpaper.uri.startsWith('data:')) {
        const fileInfo = await FileSystem.getInfoAsync(wallpaper.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(wallpaper.uri);
        }
      }

      // 从列表中移除
      const updatedWallpapers = currentList.filter(w => w.id !== wallpaper.id);
      await saveCustomWallpapers(updatedWallpapers);

      // 如果没有剩余壁纸
      if (updatedWallpapers.length === 0) {
        setSelectedWallpaperId('none');
        return;
      }

      // 如果删除的不是当前选中的壁纸，且当前选中的还在剩余列表中，保持当前选中
      const currentStillExists = updatedWallpapers.find(w => w.id === currentSelected);
      if (wallpaper.id !== currentSelected && currentStillExists) {
        return;
      }

      // 找到被删除壁纸在原列表中的索引
      const deletedIndex = currentList.findIndex(w => w.id === wallpaper.id);

      let nextId = 'none';

      // 尝试选中前一张（从被删除位置往前找）
      for (let i = deletedIndex - 1; i >= 0; i--) {
        const prevWallpaper = currentList[i];
        if (updatedWallpapers.find(w => w.id === prevWallpaper.id)) {
          nextId = prevWallpaper.id;
          break;
        }
      }

      // 如果前面没有，尝试选中后一张
      if (nextId === 'none') {
        for (let i = deletedIndex + 1; i < currentList.length; i++) {
          const nextWallpaper = currentList[i];
          if (updatedWallpapers.find(w => w.id === nextWallpaper.id)) {
            nextId = nextWallpaper.id;
            break;
          }
        }
      }

      // 如果还找不到，选择剩余列表中的第一个
      if (nextId === 'none' && updatedWallpapers.length > 0) {
        nextId = updatedWallpapers[0].id;
      }

      setSelectedWallpaperId(nextId);
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
    }
  };

  const handleSave = () => {
    onSave({
      wallpaperId: selectedWallpaperId,
      opacity,
    });
    onDismiss();
  };

  // 进入批量删除模式
  const enterBatchMode = () => {
    setBatchMode(true);
    setSelectedForDelete([]);
  };

  // 退出批量删除模式
  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedForDelete([]);
  };

  // 切换选择
  const toggleSelectForDelete = (id) => {
    setSelectedForDelete(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedForDelete.length === customWallpapers.length) {
      setSelectedForDelete([]);
    } else {
      setSelectedForDelete(customWallpapers.map(w => w.id));
    }
  };

  // 批量删除
  const batchDelete = async () => {
    if (selectedForDelete.length === 0) return;

    const confirmMsg = `确定要删除选中的 ${selectedForDelete.length} 张壁纸吗？`;

    if (Platform.OS === 'web') {
      if (!window.confirm(confirmMsg)) return;
    } else {
      return new Promise((resolve) => {
        Alert.alert('批量删除', confirmMsg, [
          { text: '取消', style: 'cancel', onPress: () => resolve(false) },
          { text: '删除', style: 'destructive', onPress: () => resolve(true) },
        ]);
      }).then(async (confirmed) => {
        if (!confirmed) return;
        await performBatchDelete();
      });
    }

    if (Platform.OS === 'web') {
      await performBatchDelete();
    }
  };

  // 执行批量删除
  const performBatchDelete = async () => {
    try {
      // 保存当前选中的壁纸ID和列表，避免闭包问题
      const currentSelected = selectedWallpaperId;
      const currentList = [...customWallpapers];
      const toDelete = [...selectedForDelete];

      // 移动端删除文件
      if (Platform.OS !== 'web') {
        for (const id of toDelete) {
          const wallpaper = currentList.find(w => w.id === id);
          if (wallpaper?.uri && !wallpaper.uri.startsWith('data:')) {
            const fileInfo = await FileSystem.getInfoAsync(wallpaper.uri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(wallpaper.uri);
            }
          }
        }
      }

      // 从列表中移除
      const updatedWallpapers = currentList.filter(w => !toDelete.includes(w.id));
      await saveCustomWallpapers(updatedWallpapers);

      // 如果没有剩余壁纸，选中 'none'
      if (updatedWallpapers.length === 0) {
        setSelectedWallpaperId('none');
        exitBatchMode();
        return;
      }

      // 如果当前选中的壁纸没有被删除，保持不变
      const currentStillExists = updatedWallpapers.find(w => w.id === currentSelected);
      if (currentSelected !== 'none' && currentStillExists) {
        exitBatchMode();
        return;
      }

      // 当前选中的壁纸被删除了，或者当前选中的是 'none'
      // 找到被删除壁纸中索引最小的那个
      let minDeletedIndex = currentList.length;
      for (const id of toDelete) {
        const idx = currentList.findIndex(w => w.id === id);
        if (idx !== -1 && idx < minDeletedIndex) {
          minDeletedIndex = idx;
        }
      }

      let nextId = 'none';

      // 尝试找前面未被删除的壁纸
      for (let i = minDeletedIndex - 1; i >= 0; i--) {
        const wallpaper = currentList[i];
        if (!toDelete.includes(wallpaper.id)) {
          nextId = wallpaper.id;
          break;
        }
      }

      // 如果前面没有，尝试找后面未被删除的壁纸
      if (nextId === 'none') {
        for (let i = minDeletedIndex + 1; i < currentList.length; i++) {
          const wallpaper = currentList[i];
          if (!toDelete.includes(wallpaper.id)) {
            nextId = wallpaper.id;
            break;
          }
        }
      }

      // 如果还找不到，选择剩余列表中的第一个
      if (nextId === 'none' && updatedWallpapers.length > 0) {
        nextId = updatedWallpapers[0].id;
      }

      setSelectedWallpaperId(nextId);
      exitBatchMode();
    } catch (error) {
      console.error('Error batch deleting wallpapers:', error);
    }
  };

  const handleOpacityChange = (value) => {
    setOpacity(Math.round(value * 100) / 100);
  };

  // 渲染壁纸项
  const renderWallpaperItem = (wallpaper, isCustom = false) => (
    <View key={wallpaper.id} style={styles.thumbnailWrapper}>
      <TouchableOpacity
        style={[
          styles.thumbnailContainer,
          selectedWallpaperId === wallpaper.id && styles.thumbnailSelected,
          batchMode && isCustom && selectedForDelete.includes(wallpaper.id) && styles.thumbnailBatchSelected,
        ]}
        onPress={() => {
          if (batchMode && isCustom) {
            toggleSelectForDelete(wallpaper.id);
          } else if (!batchMode) {
            setSelectedWallpaperId(wallpaper.id);
          }
        }}
        activeOpacity={0.7}
      >
        {wallpaper.uri ? (
          <Image
            source={isCustom ? { uri: wallpaper.uri } : wallpaper.uri}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.noWallpaper]}>
            <Text style={styles.noWallpaperText}>无</Text>
          </View>
        )}
        {/* 批量模式下的选择框 */}
        {batchMode && isCustom && (
          <View style={styles.checkboxContainer} pointerEvents="none">
            <Checkbox
              status={selectedForDelete.includes(wallpaper.id) ? 'checked' : 'unchecked'}
              color="#2196F3"
            />
          </View>
        )}
      </TouchableOpacity>
      {/* 自定义壁纸显示删除按钮（非批量模式） */}
      {isCustom && !batchMode && (
        <TouchableOpacity
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => deleteCustomWallpaper(wallpaper)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>壁纸设置</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 内置壁纸 */}
            <Text style={styles.sectionTitle}>内置壁纸</Text>
            <View style={styles.wallpaperGrid}>
              {BUILT_IN_WALLPAPERS.map(w => renderWallpaperItem(w, false))}
            </View>

            {/* 自定义壁纸 */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleInline}>自定义壁纸</Text>
              {customWallpapers.length > 0 && !batchMode && (
                <TouchableOpacity onPress={enterBatchMode}>
                  <Text style={styles.batchButtonText}>批量删除</Text>
                </TouchableOpacity>
              )}
              {batchMode && (
                <TouchableOpacity onPress={toggleSelectAll}>
                  <Text style={styles.batchButtonText}>
                    {selectedForDelete.length === customWallpapers.length ? '取消全选' : '全选'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.wallpaperGrid}>
              {customWallpapers.map(w => renderWallpaperItem(w, true))}
              {/* 添加按钮（非批量模式） */}
              {!batchMode && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={pickImage}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#2196F3" />
                  ) : (
                    <Text style={styles.addButtonText}>+</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {/* 批量删除操作栏 */}
            {batchMode && (
              <View style={styles.batchActions}>
                <Text style={styles.selectedCount}>已选 {selectedForDelete.length} 项</Text>
                <View style={styles.batchButtons}>
                  <Button mode="outlined" onPress={exitBatchMode} style={styles.batchButton}>
                    取消
                  </Button>
                  <Button
                    mode="contained"
                    onPress={batchDelete}
                    style={styles.batchButton}
                    disabled={selectedForDelete.length === 0}
                    buttonColor="#ff3b30"
                  >
                    删除
                  </Button>
                </View>
              </View>
            )}

            {/* 透明度调节 */}
            <Text style={styles.sectionTitle}>透明度: {Math.round(opacity * 100)}%</Text>
            <View style={styles.opacityContainer}>
              <TouchableOpacity
                style={styles.opacityButton}
                onPress={() => handleOpacityChange(Math.max(0.1, opacity - 0.1))}
              >
                <Text style={styles.opacityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.opacityBar}>
                <View style={[styles.opacityFill, { flex: opacity }]} />
                <View style={[styles.opacityEmpty, { flex: 1 - opacity }]} />
              </View>
              <TouchableOpacity
                style={styles.opacityButton}
                onPress={() => handleOpacityChange(Math.min(1, opacity + 0.1))}
              >
                <Text style={styles.opacityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss}>取消</Button>
          <Button onPress={handleSave}>保存</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '70%',
  },
  content: {
    paddingHorizontal: 12,
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitleInline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  batchButtonText: {
    fontSize: 13,
    color: '#2196F3',
  },
  hintText: {
    fontSize: 11,
    color: '#999',
    fontWeight: 'normal',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#2196F3',
  },
  thumbnailBatchSelected: {
    borderColor: '#ff3b30',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  noWallpaper: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWallpaperText: {
    fontSize: 10,
    color: '#999',
  },
  addButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  addButtonText: {
    fontSize: 28,
    color: '#999',
  },
  opacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  opacityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  opacityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  opacityBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 10,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  opacityFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  opacityEmpty: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    marginTop: -4,
  },
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedCount: {
    fontSize: 13,
    color: '#666',
  },
  batchButtons: {
    flexDirection: 'row',
  },
  batchButton: {
    marginLeft: 8,
  },
});

export default WallpaperSettings;