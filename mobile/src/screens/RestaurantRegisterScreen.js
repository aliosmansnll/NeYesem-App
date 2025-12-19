import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

export default function RestaurantRegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    ad: '',
    mail: '',
    telefon: '',
    latitude: '',
    longitude: '',
    sehir: '',
    ilce: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [region, setRegion] = useState({
    latitude: 39.9334, // Türkiye merkezi
    longitude: 32.8597,
    latitudeDelta: 8,
    longitudeDelta: 8,
  });
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const { registerAsRestaurant } = useAuth();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum izni vermeniz önerilir ancak zorunlu değil');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      setMarkerCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      updateField('latitude', location.coords.latitude.toString());
      updateField('longitude', location.coords.longitude.toString());
      
      // Reverse geocoding ile şehir ve ilçe bilgisini al
      await getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Konum alınamadı:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoordinate(coordinate);
    updateField('latitude', coordinate.latitude.toString());
    updateField('longitude', coordinate.longitude.toString());
    
    // Reverse geocoding ile şehir ve ilçe bilgisini al
    await getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address && address.length > 0) {
        const location = address[0];
        
        // İl bilgisi: region (İl düzeyinde bilgi)
        let city = location.region || location.city || '';
        
        // İlçe bilgisi: district veya city (district yoksa city'yi ilçe olarak kullan)
        // Ama eğer city zaten region ile aynıysa, subregion'ı kullan
        let district = location.district || '';
        if (!district && location.city && location.city !== city) {
          district = location.city;
        }
        
        // Şehir adından 'Merkez' kelimesini temizle
        city = city.replace(/\s*Merkez\s*$/i, '').trim();
        district = district.replace(/\s*Merkez\s*$/i, '').trim();
        
        updateField('sehir', city);
        updateField('ilce', district);
      }
    } catch (error) {
      console.error('Adres bilgisi alınamadı:', error);
    }
  };

  const handleRegister = async () => {
    const { ad, mail, telefon, password, confirmPassword } = formData;

    if (!ad || !mail || !telefon || !password) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    if (!markerCoordinate) {
      Alert.alert('Hata', 'Lütfen haritadan restoranınızın konumunu seçin');
      return;
    }

    if (telefon.length < 10) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası girin (en az 10 haneli)');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    const result = await registerAsRestaurant({
      ad,
      mail,
      telefon,
      latitude: markerCoordinate.latitude,
      longitude: markerCoordinate.longitude,
      sehir: formData.sehir,
      ilce: formData.ilce,
      password,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Hata', result.error || 'Kayıt başarısız');
    }
  };

  const updateField = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  return (
    <LinearGradient
      colors={gradients.light}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={gradients.secondary}
                style={styles.iconGradient}
              >
                <Ionicons name="storefront" size={48} color={colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Restoran Kaydı</Text>
            <Text style={styles.subtitle}>Restoranınızı kaydedin ve büyüyün</Text>

            <View style={styles.formContainer}>
              <Input
                label="Restoran Adı *"
                iconName="restaurant"
                placeholder="Restoranınızın adı"
                value={formData.ad}
                onChangeText={(value) => updateField('ad', value)}
                autoCapitalize="words"
              />

              <Input
                label="E-posta *"
                iconName="mail"
                placeholder="ornek@restoran.com"
                value={formData.mail}
                onChangeText={(value) => updateField('mail', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="Telefon *"
                iconName="call"
                placeholder="5XX XXX XX XX"
                value={formData.telefon}
                onChangeText={(value) => updateField('telefon', value)}
                keyboardType="phone-pad"
              />

              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color={colors.secondary} />
                  <Text style={styles.locationLabel}>Restoran Konumu *</Text>
                </View>
                <Text style={styles.locationHint}>
                  Harita üzerinde tıklayarak restoranınızın konumunu seçin
                </Text>
                
                <View style={styles.mapContainer}>
                  {loadingLocation ? (
                    <View style={styles.mapLoading}>
                      <ActivityIndicator size="large" color={colors.secondary} />
                      <Text style={styles.loadingText}>Konum alınıyor...</Text>
                    </View>
                  ) : (
                    <MapView
                      style={styles.map}
                      region={region}
                      onPress={handleMapPress}
                      showsUserLocation
                      showsMyLocationButton
                    >
                      {markerCoordinate && (
                        <Marker
                          coordinate={markerCoordinate}
                          title="Restoran Konumu"
                          description={formData.ad || "Restoranınız"}
                          pinColor={colors.secondary}
                        />
                      )}
                    </MapView>
                  )}
                </View>

                {markerCoordinate && (
                  <View style={styles.coordinatesInfo}>
                    <Ionicons name="checkmark-circle" size={16} color="#4ECDC4" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coordinatesText}>
                        📍 {formData.sehir && formData.ilce ? `${formData.ilce}, ${formData.sehir}` : 'Konum seçildi'}
                      </Text>
                      <Text style={styles.coordinatesSubText}>
                        {markerCoordinate.latitude.toFixed(6)}, {markerCoordinate.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  <Ionicons name="locate" size={18} color={colors.white} />
                  <Text style={styles.locationButtonText}>Şu Anki Konumumu Kullan</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Şifre *"
                iconName="lock-closed"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Şifre Tekrar *"
                iconName="lock-closed"
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Kayıt Ol"
                variant="secondary"
                size="large"
                fullWidth
                loading={loading}
                onPress={handleRegister}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.loginText}>
                  Hesabınız var mı? <Text style={styles.loginTextBold}>Giriş Yap</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.large,
  },
  locationSection: {
    marginBottom: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  locationHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  mapContainer: {
    height: 250,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.veryLightGray,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: '#E8F8F5',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  coordinatesSubText: {
    fontSize: 10,
    color: '#27AE60',
    opacity: 0.7,
    marginTop: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  locationButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  locationInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.veryLightGray,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loginText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  loginTextBold: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
