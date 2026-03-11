import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
  Text,
  Surface,
  Chip,
  IconButton,
  Menu,
  Searchbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, EXPIRY_COLORS, EXPIRY_THRESHOLDS } from '../constants';
import useSearch from '../hooks/useSearch';

// 条件导入 DateTimePicker，Web 平台不导入
let DateTimePicker;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (e) {
    DateTimePicker = null;
  }
} else {
  DateTimePicker = null;
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 解析日期字符串为 Date 对象
const parseDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return null;
};

const calculateDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getExpiryColor = (daysLeft) => {
  if (daysLeft < 0) return EXPIRY_COLORS.EXPIRED;
  if (daysLeft < EXPIRY_THRESHOLDS.WARNING_DAYS) return EXPIRY_COLORS.DANGER;
  if (daysLeft < EXPIRY_THRESHOLDS.SAFE_DAYS) return EXPIRY_COLORS.WARNING;
  return EXPIRY_COLORS.SAFE;
};

const getExpiryText = (daysLeft) => {
  if (daysLeft < 0) return `已过期 ${Math.abs(daysLeft)} 天`;
  if (daysLeft === 0) return '今天过期';
  if (daysLeft === 1) return '明天过期';
  return `${daysLeft} 天`;
};

export default function ExpiryCountdownScreen({ navigation }) {
  const [expiryItems, setExpiryItems] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inputMode, setInputMode] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    photoUri: '',
    productionDate: '',
    expiryDate: '',
    shelfLifeDays: '',
  });
  const [errors, setErrors] = useState({});
  const [menuVisible, setMenuVisible] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 日期选择器状态
  const [showProductionDatePicker, setShowProductionDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  // 搜索功能
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(expiryItems, 'name');

  const loadExpiryItems = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXPIRY_ITEMS);
      if (stored) {
        setExpiryItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading expiry items:', error);
    }
  }, []);

  useEffect(() => {
    loadExpiryItems();
  }, [loadExpiryItems]);

  const saveExpiryItems = async (items) => {
    try {
      setExpiryItems(items);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPIRY_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving expiry items:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      photoUri: '',
      productionDate: '',
      expiryDate: '',
      shelfLifeDays: '',
    });
    setErrors({});
    setEditingItem(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '请输入物品名称';
    }
    if (inputMode === 1) {
      if (!formData.productionDate.trim()) {
        newErrors.productionDate = '请输入生产日期';
      }
      if (!formData.shelfLifeDays.trim()) {
        newErrors.shelfLifeDays = '请输入保质期天数';
      } else if (isNaN(parseInt(formData.shelfLifeDays)) || parseInt(formData.shelfLifeDays) <= 0) {
        newErrors.shelfLifeDays = '请输入有效的保质期天数';
      }
    } else {
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = '请输入到期日期';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateExpiryDate = () => {
    if (inputMode === 1 && formData.productionDate && formData.shelfLifeDays) {
      const production = new Date(formData.productionDate);
      const days = parseInt(formData.shelfLifeDays);
      const expiry = new Date(production);
      expiry.setDate(expiry.getDate() + days);
      return expiry.toISOString().split('T')[0];
    }
    return '';
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const expiryDate = inputMode === 1 ? calculateExpiryDate() : formData.expiryDate;
    const newItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: formData.name.trim(),
      photoUri: formData.photoUri,
      productionDate: formData.productionDate,
      expiryDate: expiryDate,
      shelfLifeDays: inputMode === 1 ? parseInt(formData.shelfLifeDays) : null,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = expiryItems.map(item => 
        item.id === editingItem.id ? newItem : item
      );
    } else {
      updatedItems = [...expiryItems, newItem];
    }

    saveExpiryItems(updatedItems);
    setDialogVisible(false);
    resetForm();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      photoUri: item.photoUri || '',
      productionDate: item.productionDate || '',
      expiryDate: item.expiryDate,
      shelfLifeDays: item.shelfLifeDays ? item.shelfLifeDays.toString() : '',
    });
    const days = calculateDaysUntilExpiry(item.expiryDate);
    if (item.shelfLifeDays) {
      setInputMode(1);
    } else {
      setInputMode(2);
    }
    setDialogVisible(true);
    setMenuVisible(null);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogVisible(true);
    setMenuVisible(null);
  };

  const confirmDelete = () => {
    const updatedItems = expiryItems.filter(item => item.id !== itemToDelete.id);
    saveExpiryItems(updatedItems);
    setDeleteDialogVisible(false);
    setItemToDelete(null);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相册权限才能选择照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photoUri: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setFormData({ ...formData, photoUri: result.assets[0].uri });
    }
  };

  // 使用过滤后的数据进行排序
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  }, [filteredItems]);

  const renderExpiryItem = ({ item }) => {
    const daysLeft = calculateDaysUntilExpiry(item.expiryDate);
    const expiryColor = getExpiryColor(daysLeft);
    const expiryText = getExpiryText(daysLeft);

    return (
      <Surface style={styles.itemCard} elevation={2}>
        <View style={styles.itemContent}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <MaterialCommunityIcons name="package-variant" size={30} color="#999" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDate}>到期日期: {item.expiryDate}</Text>
            {item.productionDate && (
              <Text style={styles.itemDate}>生产日期: {item.productionDate}</Text>
            )}
          </View>
          <View style={styles.itemActions}>
            <View style={[styles.daysBadge, { backgroundColor: expiryColor }]}>
              <Text style={styles.daysText}>{expiryText}</Text>
            </View>
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(item.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => handleEdit(item)}
                title="编辑"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => handleDelete(item)}
                title="删除"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <Searchbar
        placeholder="搜索物品名称"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {sortedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="timer-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? '没有找到匹配的物品' : '暂无保质期记录'}
          </Text>
          {!searchQuery && (
            <Text style={styles.emptySubtext}>点击右下角按钮添加物品</Text>
          )}
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {sortedItems.map(item => renderExpiryItem({ item }))}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          resetForm();
          setInputMode(1);
          setDialogVisible(true);
        }}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title>{editingItem ? '编辑物品' : '添加物品'}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.modeSelector}>
              <Chip
                selected={inputMode === 1}
                onPress={() => setInputMode(1)}
                style={styles.modeChip}
                textStyle={styles.modeChipText}
              >
                生产日期+保质期
              </Chip>
              <Chip
                selected={inputMode === 2}
                onPress={() => setInputMode(2)}
                style={styles.modeChip}
                textStyle={styles.modeChipText}
              >
                直接输入到期日
              </Chip>
            </View>

            <TextInput
              label="物品名称 *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <View style={styles.photoSection}>
              {formData.photoUri ? (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: formData.photoUri }} style={styles.photoImage} />
                  <IconButton
                    icon="close-circle"
                    size={24}
                    onPress={() => setFormData({ ...formData, photoUri: '' })}
                    style={styles.removePhotoButton}
                  />
                </View>
              ) : (
                <View style={styles.photoButtons}>
                  <Button mode="outlined" icon="camera" onPress={takePhoto} style={styles.photoButton}>
                    拍照
                  </Button>
                  <Button mode="outlined" icon="image" onPress={pickImage} style={styles.photoButton}>
                    相册
                  </Button>
                </View>
              )}
            </View>

            {inputMode === 1 ? (
              <>
                {Platform.OS === 'web' || !DateTimePicker ? (
                  <TextInput
                    label="生产日期 *"
                    value={formData.productionDate}
                    onChangeText={(text) => setFormData({ ...formData, productionDate: text })}
                    mode="outlined"
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    error={!!errors.productionDate}
                    right={<TextInput.Icon icon="calendar" />}
                  />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowProductionDatePicker(true)}>
                      <View style={styles.datePickerField}>
                        <Text style={styles.datePickerLabel}>生产日期 *</Text>
                        <View style={styles.datePickerValue}>
                          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                          <Text style={styles.datePickerText}>
                            {formData.productionDate || '点击选择日期'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {showProductionDatePicker && DateTimePicker && (
                      <DateTimePicker
                        value={parseDate(formData.productionDate) || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowProductionDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            setFormData({ ...formData, productionDate: formatDate(selectedDate) });
                          }
                        }}
                      />
                    )}
                  </>
                )}
                {errors.productionDate && <Text style={styles.errorText}>{errors.productionDate}</Text>}

                <TextInput
                  label="保质期天数 *"
                  value={formData.shelfLifeDays}
                  onChangeText={(text) => setFormData({ ...formData, shelfLifeDays: text })}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                  error={!!errors.shelfLifeDays}
                />
                {errors.shelfLifeDays && <Text style={styles.errorText}>{errors.shelfLifeDays}</Text>}

                {formData.productionDate && formData.shelfLifeDays && !errors.shelfLifeDays && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewLabel}>计算到期日期:</Text>
                    <Text style={styles.previewValue}>{calculateExpiryDate()}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {Platform.OS === 'web' || !DateTimePicker ? (
                  <TextInput
                    label="到期日期 *"
                    value={formData.expiryDate}
                    onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
                    mode="outlined"
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    error={!!errors.expiryDate}
                    right={<TextInput.Icon icon="calendar" />}
                  />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowExpiryDatePicker(true)}>
                      <View style={styles.datePickerField}>
                        <Text style={styles.datePickerLabel}>到期日期 *</Text>
                        <View style={styles.datePickerValue}>
                          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                          <Text style={styles.datePickerText}>
                            {formData.expiryDate || '点击选择日期'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {showExpiryDatePicker && DateTimePicker && (
                      <DateTimePicker
                        value={parseDate(formData.expiryDate) || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowExpiryDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            setFormData({ ...formData, expiryDate: formatDate(selectedDate) });
                          }
                        }}
                      />
                    )}
                  </>
                )}
                {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
              </>
            )}

            {formData.expiryDate && !errors.expiryDate && (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>距离到期:</Text>
                <View style={[styles.previewBadge, { backgroundColor: getExpiryColor(calculateDaysUntilExpiry(formData.expiryDate)) }]}>
                  <Text style={styles.previewBadgeText}>
                    {getExpiryText(calculateDaysUntilExpiry(formData.expiryDate))}
                  </Text>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button onPress={handleSave}>{editingItem ? '保存' : '添加'}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除 "{itemToDelete?.name}" 吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>取消</Button>
            <Button onPress={confirmDelete}>删除</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  daysBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  daysText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196F3',
  },
  dialog: {
    maxHeight: '80%',
  },
  modeSelector: {
    marginBottom: 16,
  },
  modeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  modeChipText: {
    fontSize: 13,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  photoSection: {
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    flex: 1,
  },
  photoPreview: {
    position: 'relative',
    alignItems: 'center',
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
  },
  previewSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  datePickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});
