import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getAllRestaurants, getRestaurantPhotos, API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { moderateScale, scaleFontSize, verticalScale, wp, hp } from '../utils/responsive';

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantPhotos, setRestaurantPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [citySearch, setCitySearch] = useState('');
  const [userCity, setUserCity] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { user, logout } = useAuth();

  const PAGE_SIZE = 6;

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // İzin verilmediyse tüm restoranları göster
        fetchRestaurants(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address && address.length > 0) {
        const place = address[0];
        let city = place.region || place.city || '';
        city = city.replace(/\s*Merkez\s*$/i, '').trim();
        
        setUserCity(city);
        // Kullanıcının şehrine göre restoranları getir (city'yi direkt gönder)
        fetchRestaurants(true, city);
      } else {
        fetchRestaurants(true);
      }
    } catch (error) {
      console.error('Konum alınamadı:', error);
      fetchRestaurants(true);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSearch = () => {
    fetchRestaurants(true);
  };

  const handleClearSearch = () => {
    setCitySearch('');
    // citySearch'ü temizledikten sonra userCity ile filtrele
    fetchRestaurantsWithCity('');
  };

  const fetchRestaurantsWithCity = async (searchCity) => {
    setLoading(true);
    setPage(0);
    setHasMore(true);

    try {
      const skip = 0;
      
      // searchCity varsa onu kullan, yoksa userCity kullan
      const searchQuery = searchCity || userCity || null;
      const data = await getAllRestaurants(skip, PAGE_SIZE, searchQuery);
      
      setRestaurants(data);
      setPage(0);

      // Her restoran için fotoğrafları çek
      const photos = {};
      await Promise.all(
        data.map(async (restaurant) => {
          try {
            const photoData = await getRestaurantPhotos(restaurant.restorantID);
            if (photoData && photoData.length > 0) {
              const vitrinPhoto = photoData.find(p => p.vitrin);
              photos[restaurant.restorantID] = vitrinPhoto || photoData[0];
            }
          } catch (error) {
            console.log(`Fotoğraf yüklenemedi: ${restaurant.restorantID}`);
          }
        })
      );
      
      setRestaurantPhotos(prev => ({ ...prev, ...photos }));
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      Alert.alert('Hata', 'Restoranlar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async (isInitial = false, locationCity = null) => {
    if (isInitial) {
      setLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      if (!hasMore || loadingMore) return;
      setLoadingMore(true);
    }

    try {
      const skip = isInitial ? 0 : (page + 1) * PAGE_SIZE;
      
      // Arama varsa onu kullan, yoksa locationCity veya userCity kullan
      const searchQuery = citySearch || locationCity || userCity || null;
      const data = await getAllRestaurants(skip, PAGE_SIZE, searchQuery);
      
      // Backend zaten sıralı gönderiyor, frontend'de sıralamaya gerek yok

      if (isInitial) {
        setRestaurants(data);
        setPage(0);
      } else {
        setRestaurants(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }

      // Her restoran için fotoğrafları çek
      const photos = {};
      await Promise.all(
        data.map(async (restaurant) => {
          try {
            const photoData = await getRestaurantPhotos(restaurant.restorantID);
            if (photoData && photoData.length > 0) {
              // Vitrin fotoğraf varsa onu, yoksa ilk fotoğrafı al
              const vitrinPhoto = photoData.find(p => p.vitrin);
              photos[restaurant.restorantID] = vitrinPhoto || photoData[0];
            }
          } catch (error) {
            console.log(`Fotoğraf yüklenemedi: ${restaurant.restorantID}`);
          }
        })
      );
      
      setRestaurantPhotos(prev => ({ ...prev, ...photos }));

      // Eğer gelen veri sayısı PAGE_SIZE'dan azsa, daha fazla veri yok demektir
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      Alert.alert('Hata', 'Restoranlar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRestaurants(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const renderRestaurant = ({ item }) => {
    const rating = item.ortalamaPuan || 0;
    const reviewCount = item.yorumSayisi || 0;
    const photo = restaurantPhotos[item.restorantID];
    
    // 0-5 arası direkt göster, 5'ten fazla ise 5'in katlarına yuvarla
    let displayCount;
    if (reviewCount <= 5) {
      displayCount = String(reviewCount);
    } else {
      const roundedCount = Math.floor(reviewCount / 5) * 5;
      displayCount = `${roundedCount}+`;
    }
    
    return (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
      activeOpacity={0.7}
    >
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        {photo ? (
          <Image
            source={{ uri: `${photo.fotoURL.startsWith('http') ? '' : API_URL}${photo.fotoURL}` }}
            style={styles.restaurantImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#FF6B9D', '#C06C84']}
            style={styles.imagePlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="restaurant" size={40} color="white" />
          </LinearGradient>
        )}
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{String(rating.toFixed(1))}</Text>
          <Text style={styles.reviewCountText}>({displayCount})</Text>
        </View>
      </View>

      {/* Restaurant Info */}
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantCardName} numberOfLines={1}>
          {item.ad || 'Restoran'}
        </Text>
        {(item.sehir || item.ilce) && (
          <View style={styles.phoneRow}>
            <Ionicons name="location-outline" size={12} color="#FF6B6B" />
            <Text style={styles.locationText} numberOfLines={1}>
              {[item.ilce, item.sehir ? item.sehir.replace(/\s*Merkez\s*$/i, '').trim() : ''].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
        {item.telefon && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={12} color={colors.textMuted} />
            <Text style={styles.phoneText} numberOfLines={1}>{String(item.telefon)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={gradients.light}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Restoranlar yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color={colors.white} />
            </View>
            <View>
              <Text style={styles.greeting}>Merhaba!</Text>
              <Text style={styles.userName}>{user?.ad || 'Kullanıcı'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subGreeting}>Ne yemek istersin bugün?</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="restaurant" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statNumber}>{String(restaurants.length)}</Text>
          <Text style={styles.statLabel}>Restoran</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="star" size={20} color={colors.accent} />
          </View>
          <Text style={styles.statNumber}>{String(user?.puan || 0)}</Text>
          <Text style={styles.statLabel}>Puanın</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flame" size={20} color={colors.error} />
          </View>
          <Text style={styles.statNumber}>Yeni</Text>
          <Text style={styles.statLabel}>Keşfet</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        {/* Şehir Arama */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şehir veya ilçe ara..."
            placeholderTextColor="#999"
            value={citySearch}
            onChangeText={setCitySearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {citySearch.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle} numberOfLines={1} adjustsFontSizeToFit>
          {citySearch 
            ? `${citySearch} - Popüler Restoranlar` 
            : (userCity ? `${userCity} - Yakındaki Restoranlar` : 'Yakındaki Restoranlar')
          }
        </Text>
        <FlatList
          data={restaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => String(item.restorantID || Math.random())}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="restaurant-outline" size={64} color={colors.lightGray} />
              </View>
              <Text style={styles.emptyTitle}>Henüz restoran yok</Text>
              <Text style={styles.emptyText}>İlk restoranı keşfet!</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadMoreText}>Daha fazla yükleniyor...</Text>
              </View>
            ) : !hasMore && restaurants.length > 0 ? (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>Tüm restoranlar gösteriliyor</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: moderateScale(spacing.md),
    fontSize: scaleFontSize(16),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    paddingTop: moderateScale(spacing.xxxl + spacing.lg),
    paddingBottom: moderateScale(spacing.xl),
    paddingHorizontal: moderateScale(spacing.xl),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    ...shadows.large,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    marginTop: spacing.xs / 2,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.xl,
    marginTop: -spacing.xl,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.veryLightGray,
    marginHorizontal: spacing.md,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    flexShrink: 1,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  restaurantCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantImage: {
    width: '100%',
    height: 140,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    ...shadows.small,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reviewCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: 2,
  },
  restaurantInfo: {
    padding: spacing.md,
  },
  restaurantCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  phoneText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  endContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  endText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xxxl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
