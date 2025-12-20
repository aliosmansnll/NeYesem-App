import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import { updateRestaurant } from '../services/api';

export default function RestaurantEditScreen({ navigation }) {
  const { restaurant, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ad: restaurant?.ad || '',
    telefon: restaurant?.telefon || '',
    sehir: restaurant?.sehir || '',
    ilce: restaurant?.ilce || '',
  });
  const [markerCoordinate, setMarkerCoordinate] = useState(
    restaurant?.latitude && restaurant?.longitude
      ? {
          latitude: parseFloat(restaurant.latitude),
          longitude: parseFloat(restaurant.longitude),
        }
      : null
  );
  const [region, setRegion] = useState({
    latitude: restaurant?.latitude ? parseFloat(restaurant.latitude) : 41.0082,
    longitude: restaurant?.longitude ? parseFloat(restaurant.longitude) : 28.9784,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  const updateField = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleMapPress = async (coordinate) => {
    setMarkerCoordinate(coordinate);
    await getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address && address.length > 0) {
        const place = address[0];
        
        // İl bilgisi: region (İl düzeyinde bilgi)
        let city = place.region || place.city || '';
        
        // İlçe bilgisi: district veya city (district yoksa city'yi ilçe olarak kullan)
        // Ama eğer city zaten region ile aynıysa, subregion'ı kullan
        let district = place.district || '';
        if (!district && place.city && place.city !== city) {
          district = place.city;
        }
        
        // Şehir adından 'Merkez' kelimesini temizle
        city = city.replace(/\s*Merkez\s*$/i, '').trim();
        district = district.replace(/\s*Merkez\s*$/i, '').trim();
        
        updateField('sehir', city);
        updateField('ilce', district);
      }
    } catch (error) {
      console.error('Adres alınamadı:', error);
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Konum izni reddedildi');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newCoordinate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setMarkerCoordinate(newCoordinate);
      setRegion({
        ...newCoordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      await getAddressFromCoordinates(newCoordinate.latitude, newCoordinate.longitude);
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı');
      console.error(error);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!formData.ad.trim()) {
      Alert.alert('Hata', 'Restoran adı gereklidir');
      return;
    }

    if (!formData.telefon.trim()) {
      Alert.alert('Hata', 'Telefon numarası gereklidir');
      return;
    }

    if (!markerCoordinate) {
      Alert.alert('Hata', 'Lütfen haritadan restoranınızın konumunu seçin');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ad: formData.ad,
        telefon: formData.telefon,
        latitude: markerCoordinate.latitude,
        longitude: markerCoordinate.longitude,
        sehir: formData.sehir,
        ilce: formData.ilce,
      };
      
      await updateRestaurant(restaurant.restorantID, updateData);
      
      Alert.alert(
        'Başarılı',
        'Restoran bilgileri güncellendi',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme başarısız oldu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bilgileri Düzenle</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Restoran Adı *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="restaurant-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Restoran adınızı girin"
              value={formData.ad}
              onChangeText={(value) => updateField('ad', value)}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Phone */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefon Numarası *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Telefon numaranızı girin"
              value={formData.telefon}
              onChangeText={(value) => updateField('telefon', value)}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Konum *</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#4ECDC4" />
              ) : (
                <>
                  <Ionicons name="locate" size={16} color="#4ECDC4" />
                  <Text style={styles.locationButtonText}>Mevcut Konum</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            <MapComponent
              style={styles.map}
              initialLocation={region}
              markerLocation={markerCoordinate}
              onLocationSelect={handleMapPress}
            />
          </View>

          {markerCoordinate && (
            <View style={styles.coordinatesContainer}>
              <Ionicons name="location" size={16} color="#4ECDC4" />
              <Text style={styles.coordinatesText}>
                {[formData.ilce, formData.sehir].filter(Boolean).join(', ') || 'Konum seçildi'}
              </Text>
            </View>
          )}
          <Text style={styles.helperText}>Haritaya dokunarak konum seçin</Text>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.updateButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.updateButtonText}>Güncelle</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: '#333',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  locationButtonText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F0FFFE',
    borderRadius: 8,
    gap: 6,
  },
  coordinatesText: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  updateButton: {
    borderRadius: 12,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
