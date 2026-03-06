import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native';
import { Dialog, Text, Button, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { BUILT_IN_WALLPAPERS } from '../constants';

const { width } = Dimensions.get('window');
const THUMBNAIL_SIZE = (width - 72) / 5;

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

  // 同步当前设置
  useEffect(() => {
    if (currentSettings) {
      setSelectedWallpaperId(currentSettings.wallpaperId || 'none');
      setOpacity(currentSettings.opacity ?? 0.3);
    }
  }, [currentSettings]);

  /**
   * 从相册选择图片
   */
  const pickImage = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限提示', '需要相册权限才能选择图片');
        return;
      }

      setLoading(true);

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16], // 竖屏比例
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // 创建存储目录
        const wallpaperDir = `${FileSystem.documentDirectory}wallpapers/`;
        const dirInfo = await FileSystem.getInfoAsync(wallpaperDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(wallpaperDir, { intermediates: true });
        }

        // 生成文件名
        const fileName = `custom_${Date.now()}.jpg`;
        const destPath = `${wallpaperDir}${fileName}`;

        // 复制文件到应用目录
        await FileSystem.copyAsync({
          from: asset.uri,
          to: destPath,
        });

        // 添加到自定义壁纸列表
        const newWallpaper = {
          id: `custom_${Date.now()}`,
          name: `自定义 ${customWallpapers.length + 1}`,
          uri: destPath,
          isCustom: true,
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
    Alert.alert(
      '删除壁纸',
      `确定要删除 "${wallpaper.name}" 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 删除文件
              const fileInfo = await FileSystem.getInfoAsync(wallpaper.uri);
              if (fileInfo.exists) {
                await FileSystem.deleteAsync(wallpaper.uri);
              }

              // 从列表中移除
              const updatedWallpapers = customWallpapers.filter(w => w.id !== wallpaper.id);
              await saveCustomWallpapers(updatedWallpapers);

              // 如果删除的是当前选中的壁纸，重置为无壁纸
              if (selectedWallpaperId === wallpaper.id) {
                setSelectedWallpaperId('none');
              }
            } catch (error) {
              console.error('Error deleting wallpaper:', error);
            }
          },
        },
      ]
    );
  };

  const handleSave = () => {
    onSave({
      wallpaperId: selectedWallpaperId,
      opacity,
    });
    onDismiss();
  };

  const handleOpacityChange = (value) => {
    setOpacity(Math.round(value * 100) / 100);
  };

  // 渲染壁纸项
  const renderWallpaperItem = (wallpaper) => (
    <TouchableOpacity
      key={wallpaper.id}
      style={[
        styles.thumbnailContainer,
        selectedWallpaperId === wallpaper.id && styles.thumbnailSelected,
      ]}
      onPress={() => setSelectedWallpaperId(wallpaper.id)}
      onLongPress={() => wallpaper.isCustom && deleteCustomWallpaper(wallpaper)}
    >
      {wallpaper.uri ? (
        <Image 
          source={wallpaper.isCustom ? { uri: wallpaper.uri } : wallpaper.uri}
          style={styles.thumbnail} 
        />
      ) : (
        <View style={[styles.thumbnail, styles.noWallpaper]}>
          <Text style={styles.noWallpaperText}>无</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>壁纸设置</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* 内置壁纸 */}
            <Text style={styles.sectionTitle}>内置壁纸</Text>
            <View style={styles.wallpaperGrid}>
              {BUILT_IN_WALLPAPERS.map(renderWallpaperItem)}
            </View>

            {/* 自定义壁纸 */}
            <Text style={styles.sectionTitle}>
              自定义壁纸
              <Text style={styles.hintText}> (长按删除)</Text>
            </Text>
            <View style={styles.wallpaperGrid}>
              {customWallpapers.map(renderWallpaperItem)}
              {/* 添加按钮 */}
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
            </View>

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
                <View style={[styles.opacityFill, { width: `${opacity * 100}%` }]} />
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
        <Dialog.Actions>
          <Button onPress={onDismiss}>取消</Button>
          <Button onPress={handleSave}>保存</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '60%',
  },
  content: {
    paddingHorizontal: 8,
  },
  scrollView: {
    maxHeight: 250,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 11,
    color: '#999',
    fontWeight: 'normal',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginBottom: 4,
    marginRight: 4,
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
    marginBottom: 4,
    marginRight: 4,
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
    overflow: 'hidden',
  },
  opacityFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
});

export default WallpaperSettings;