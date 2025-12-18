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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllRestaurants } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

export default function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user, logout } = useAuth();

  const PAGE_SIZE = 6;

  useEffect(() => {
    fetchRestaurants(true);
  }, []);

  const fetchRestaurants = async (isInitial = false) => {
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
      const data = await getAllRestaurants(skip, PAGE_SIZE);
      
      // Ortalama puana göre sırala (yüksekten düşüğe)
      const sorted = data.sort((a, b) => {
        const avgA = a.ortalamaPuan || 0;
        const avgB = b.ortalamaPuan || 0;
        return avgB - avgA;
      });

      if (isInitial) {
        setRestaurants(sorted);
        setPage(0);
      } else {
        setRestaurants(prev => [...prev, ...sorted]);
        setPage(prev => prev + 1);
      }

      // Eğer gelen veri sayısı PAGE_SIZE'dan azsa, daha fazla veri yok demektir
      setHasMore(sorted.length === PAGE_SIZE);
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
        <LinearGradient
          colors={['#FF6B9D', '#C06C84']}
          style={styles.imagePlaceholder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="restaurant" size={40} color="white" />
        </LinearGradient>
        
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
        <Text style={styles.sectionTitle}>Popüler Restoranlar</Text>
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
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    paddingTop: spacing.xxxl + spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
