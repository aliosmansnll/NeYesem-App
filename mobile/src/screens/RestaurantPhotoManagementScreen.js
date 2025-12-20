import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { 
  getRestaurantPhotos, 
  uploadRestaurantPhoto, 
  deleteRestaurantPhoto,
  setVitrinPhoto,
  API_URL
} from '../services/api';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 45) / 3; // 3 sütunlu grid için

export default function RestaurantPhotoManagementScreen() {
  const { restaurant } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (restaurant?.restorantID) {
      fetchPhotos();
    }
  }, [restaurant?.restorantID]);

  const fetchPhotos = async () => {
    if (!restaurant?.restorantID) return;
    
    try {
      const data = await getRestaurantPhotos(restaurant.restorantID);
      setPhotos(data);
    } catch (error) {
      console.error('Fotoğraflar yüklenemedi:', error);
      Alert.alert('Hata', 'Fotoğraflar yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekiyor');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
    }
  };

  const uploadImage = async (imageUri) => {
    setUploading(true);
    try {
      await uploadRestaurantPhoto(restaurant.restorantID, imageUri);
      Alert.alert('Başarılı', 'Fotoğraf yüklendi!');
      fetchPhotos();
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error);
      Alert.alert('Hata', typeof error === 'string' ? error : 'Fotoğraf yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (photo) => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurantPhoto(photo.fotoID);
              Alert.alert('Başarılı', 'Fotoğraf silindi');
              setSelectedPhoto(null);
              fetchPhotos();
            } catch (error) {
              Alert.alert('Hata', error || 'Fotoğraf silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleSetVitrinPhoto = async (photo) => {
    try {
      await setVitrinPhoto(photo.fotoID);
      Alert.alert('Başarılı', 'Vitrin fotoğraf olarak ayarlandı');
      setSelectedPhoto(null);
      fetchPhotos();
    } catch (error) {
      Alert.alert('Hata', error || 'Vitrin fotoğraf ayarlanamadı');
    }
  };

  const renderPhoto = ({ item }) => {
    const photoUrl = `${item.fotoURL.startsWith('http') ? '' : API_URL}${item.fotoURL}`;
    
    return (
      <TouchableOpacity
        style={styles.photoCard}
        onPress={() => setSelectedPhoto(item)}
      >
        <Image
          source={{ uri: photoUrl }}
          style={styles.photo}
          resizeMode="cover"
        />
        {item.vitrin && (
          <View style={styles.vitrinBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.vitrinText}>Vitrin</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFullScreenPhoto = () => {
    if (!selectedPhoto) return null;

    const photoUrl = `${selectedPhoto.fotoURL.startsWith('http') ? '' : API_URL}${selectedPhoto.fotoURL}`;

    return (
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setSelectedPhoto(null)}
          >
            <Image
              source={{ uri: photoUrl }}
              style={styles.fullScreenPhoto}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
            
            {!selectedPhoto.vitrin && (
              <TouchableOpacity
                style={[styles.modalButton, styles.vitrinModalButton]}
                onPress={() => handleSetVitrinPhoto(selectedPhoto)}
              >
                <Ionicons name="star" size={40} color="#FFD700" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteModalButton]}
              onPress={() => handleDeletePhoto(selectedPhoto)}
            >
              <Ionicons name="trash" size={40} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
        data={photos.sort((a, b) => (b.vitrin ? 1 : 0) - (a.vitrin ? 1 : 0))}
        renderItem={renderPhoto}
        keyExtractor={(item) => String(item.fotoID)}
        numColumns={3}
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4ECDC4']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Henüz fotoğraf yok 📸</Text>
            <Text style={styles.emptySubText}>Restoran fotoğraflarınızı ekleyin!</Text>
          </View>
        }
      />

      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickImage}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>Fotoğraf Ekle</Text>
          </>
        )}
      </TouchableOpacity>

      {renderFullScreenPhoto()}
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
  grid: {
    padding: 5,
    paddingBottom: 100,
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  vitrinBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vitrinText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    left: 20,
    backgroundColor: '#4ECDC4',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadButtonText: {
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
    marginTop: 20,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPhoto: {
    width: width,
    height: '80%',
  },
  modalActions: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'column',
    gap: 20,
  },
  modalButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 5,
  },
  vitrinModalButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  deleteModalButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
