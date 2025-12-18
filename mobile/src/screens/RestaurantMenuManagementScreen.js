import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getRestaurantMenu, createMenuItem, deleteMenuItem } from '../services/api';

const KATEGORILER = ['Tatlı', 'Döner', 'Burger', 'Etli Ekmek', 'Restorana Özel'];

export default function RestaurantMenuManagementScreen() {
  const { restaurant } = useAuth();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    yemekadi: '',
    aciklama: '',
    fiyat: '',
    kategoriad: 'Restorana Özel',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const data = await getRestaurantMenu(restaurant.restorantID);
      setMenu(data);
    } catch (error) {
      Alert.alert('Hata', 'Menü yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenu();
  };

  const handleAddMenuItem = async () => {
    const { yemekadi, fiyat } = formData;

    if (!yemekadi || !fiyat) {
      Alert.alert('Hata', 'Yemek adı ve fiyat zorunludur');
      return;
    }

    const price = parseInt(fiyat);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Hata', 'Geçerli bir fiyat girin');
      return;
    }

    setSubmitting(true);
    try {
      await createMenuItem({
        restorantID: restaurant.restorantID,
        yemekadi: formData.yemekadi,
        aciklama: formData.aciklama || '',
        fiyat: price,
        kategoriad: formData.kategoriad,
      });

      Alert.alert('Başarılı', 'Menü öğesi eklendi!');
      setModalVisible(false);
      setFormData({ yemekadi: '', aciklama: '', fiyat: '', kategoriad: 'Restorana Özel' });
      fetchMenu();
    } catch (error) {
      console.error('Menü ekleme hatası:', error);
      Alert.alert('Hata', typeof error === 'string' ? error : 'Menü öğesi eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMenuItem = (item) => {
    Alert.alert(
      'Menü Öğesini Sil',
      `"${item.yemekadi}" silinsin mi?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenuItem(item.menuID);
              Alert.alert('Başarılı', 'Menü öğesi silindi');
              fetchMenu();
            } catch (error) {
              Alert.alert('Hata', error || 'Silinemedi');
            }
          },
        },
      ]
    );
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuCard}>
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.yemekadi || 'Yemek'}</Text>
        {item.aciklama && (
          <Text style={styles.menuDescription}>{item.aciklama || '-'}</Text>
        )}
        {item.kategoriad && (
          <Text style={styles.menuCategory}>🏷️ {item.kategoriad || '-'}</Text>
        )}
        <Text style={styles.menuPrice}>{String(item.fiyat || 0)} ₺</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMenuItem(item)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={menu}
        renderItem={renderMenuItem}
        keyExtractor={(item) => String(item.menuID || Math.random())}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4ECDC4']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz menü öğesi yok 🍽️</Text>
            <Text style={styles.emptySubText}>Hemen ekleyin!</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Menü Ekle</Text>
      </TouchableOpacity>

      {/* Add Menu Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Yeni Menü Ekle</Text>

              <TextInput
                style={styles.input}
                placeholder="Yemek Adı *"
                placeholderTextColor="#999"
                value={formData.yemekadi}
                onChangeText={(text) => setFormData({ ...formData, yemekadi: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Açıklama"
                placeholderTextColor="#999"
                value={formData.aciklama}
                onChangeText={(text) => setFormData({ ...formData, aciklama: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.input}
                placeholder="Fiyat (₺) *"
                placeholderTextColor="#999"
                value={formData.fiyat}
                onChangeText={(text) => setFormData({ ...formData, fiyat: text })}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setCategoryModalVisible(true)}
              >
                <View style={styles.categorySelectorContent}>
                  <View>
                    <Text style={styles.categorySelectorLabel}>Kategori</Text>
                    <Text style={styles.categorySelectorValue}>{formData.kategoriad}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={24} color="#666" />
                </View>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setFormData({ yemekadi: '', aciklama: '', fiyat: '', kategoriad: 'Restorana Özel' });
                  }}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleAddMenuItem}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Ekle</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Kategori Seçim Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.categoryModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCategoryModalVisible(false)}
          />
          <View style={styles.categoryModalContent}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Kategori Seçin</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            {KATEGORILER.map((kategori) => (
              <TouchableOpacity
                key={kategori}
                style={[
                  styles.categoryOption,
                  formData.kategoriad === kategori && styles.categoryOptionSelected
                ]}
                onPress={() => {
                  setFormData({ ...formData, kategoriad: kategori });
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  formData.kategoriad === kategori && styles.categoryOptionTextSelected
                ]}>
                  {kategori}
                </Text>
                {formData.kategoriad === kategori && (
                  <Ionicons name="checkmark" size={24} color="#4ECDC4" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  menuCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  deleteButtonText: {
    fontSize: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: '#4ECDC4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  categorySelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  categorySelectorValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  categoryOptionSelected: {
    backgroundColor: '#f0fffe',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  categoryOptionTextSelected: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
