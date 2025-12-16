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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getRestaurantMenu, createMenuItem, deleteMenuItem } from '../services/api';

export default function RestaurantMenuManagementScreen() {
  const { restaurant } = useAuth();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    yemekadi: '',
    aciklama: '',
    fiyat: '',
    kategoriad: '',
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
        aciklama: formData.aciklama || null,
        fiyat: price,
        kategoriad: formData.kategoriad || null,
      });

      Alert.alert('Başarılı', 'Menü öğesi eklendi!');
      setModalVisible(false);
      setFormData({ yemekadi: '', aciklama: '', fiyat: '', kategoriad: '' });
      fetchMenu();
    } catch (error) {
      Alert.alert('Hata', error || 'Menü öğesi eklenemedi');
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
        <Text style={styles.menuName}>{item.yemekadi}</Text>
        {item.aciklama && (
          <Text style={styles.menuDescription}>{item.aciklama}</Text>
        )}
        {item.kategoriad && (
          <Text style={styles.menuCategory}>🏷️ {item.kategoriad}</Text>
        )}
        <Text style={styles.menuPrice}>{item.fiyat} ₺</Text>
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
        keyExtractor={(item) => item.menuID.toString()}
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Menü Ekle</Text>

            <TextInput
              style={styles.input}
              placeholder="Yemek Adı *"
              value={formData.yemekadi}
              onChangeText={(text) => setFormData({ ...formData, yemekadi: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Açıklama"
              value={formData.aciklama}
              onChangeText={(text) => setFormData({ ...formData, aciklama: text })}
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="Fiyat (₺) *"
              value={formData.fiyat}
              onChangeText={(text) => setFormData({ ...formData, fiyat: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Kategori (Ana Yemek, İçecek vb.)"
              value={formData.kategoriad}
              onChangeText={(text) => setFormData({ ...formData, kategoriad: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setFormData({ yemekadi: '', aciklama: '', fiyat: '', kategoriad: '' });
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
        </KeyboardAvoidingView>
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
