import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getRestaurantReviews, getRestaurantMenu } from '../services/api';

export default function RestaurantReviewsScreen({ navigation }) {
  const { restaurant } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  useEffect(() => {
    if (restaurant?.restorantID) {
      fetchReviews();
    }
  }, [restaurant?.restorantID]);

  const fetchReviews = async () => {
    if (!restaurant?.restorantID) return;
    
    try {
      const [reviewsData, menuData] = await Promise.all([
        getRestaurantReviews(restaurant.restorantID),
        getRestaurantMenu(restaurant.restorantID)
      ]);
      
      console.log('Toplam yorum sayısı:', reviewsData.length);
      console.log('Menü yorumları:', reviewsData.filter(r => r.menuID).length);
      console.log('Menü verileri:', menuData.length);
      
      // Backend'den zaten tarihe göre sıralı geliyor (en yeni en üstte)
      setReviews(reviewsData);
      
      // İlk sayfayı yükle
      setDisplayedReviews(reviewsData.slice(0, ITEMS_PER_PAGE));
      setPage(1);
      
      // Menü bilgilerini ID'ye göre mapping yap
      const menuMap = {};
      menuData.forEach(menu => {
        menuMap[menu.menuID] = menu.yemekadi;
      });
      setMenuItems(menuMap);
      console.log('Menü mapping:', menuMap);

      // İstatistikleri hesapla
      const total = reviewsData.length;
      const sum = reviewsData.reduce((acc, r) => acc + (r.puan || 0), 0);
      const average = total > 0 ? (sum / total).toFixed(1) : '0';

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviewsData.forEach((r) => {
        if (r.puan) distribution[r.puan]++;
      });

      setStats({ total, average, distribution });
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const loadMore = () => {
    if (loadingMore || displayedReviews.length >= reviews.length) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    const newReviews = reviews.slice(0, nextPage * ITEMS_PER_PAGE);
    
    setTimeout(() => {
      setDisplayedReviews(newReviews);
      setPage(nextPage);
      setLoadingMore(false);
    }, 300);
  };

  const renderStars = (rating) => {
    if (!rating) return '☆☆☆☆☆';
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {item.kullaniciAd ? item.kullaniciAd.charAt(0).toUpperCase() : '?'}
            </Text>
          </LinearGradient>
        </View>
        
        <View style={styles.reviewHeaderContent}>
          <Text style={styles.reviewUser}>
            {item.kullaniciAd && item.kullaniciSoyad
              ? `${item.kullaniciAd} ${item.kullaniciSoyad}`
              : `Kullanıcı #${item.kullaniciID || 0}`}
          </Text>
          <Text style={styles.reviewDate}>
            {item.yorumTarih ? new Date(item.yorumTarih).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'Tarih yok'}
          </Text>
        </View>

        {item.puan && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>{item.puan}</Text>
          </View>
        )}
      </View>

      {item.menuID && menuItems[item.menuID] && (
        <View style={styles.menuChip}>
          <Ionicons name="restaurant" size={14} color="#FF6B6B" />
          <Text style={styles.menuChipText}>{menuItems[item.menuID]}</Text>
        </View>
      )}

      {item.yorum && (
        <Text style={styles.reviewText}>{item.yorum}</Text>
      )}
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
      {/* Custom Header with Back Button */}
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.customHeader}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yorumlar</Text>
      </LinearGradient>

      {/* Modern Stats Header */}
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsHeader}
      >
        <View style={styles.statsCard}>
          <View style={styles.averageSection}>
            <Text style={styles.averageValue}>{String(stats.average)}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(stats.average) ? "star" : "star-outline"}
                  size={20}
                  color="#FFC107"
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>{String(stats.total)} değerlendirme</Text>
          </View>

          <View style={styles.distributionSection}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.distributionRow}>
                <Text style={styles.starLabel}>{String(star)}</Text>
                <Ionicons name="star" size={12} color="#FFC107" />
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${stats.total > 0 ? (stats.distribution[star] / stats.total) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.countLabel}>{String(stats.distribution[star])}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Reviews List */}
      <FlatList
        data={displayedReviews}
        renderItem={renderReview}
        keyExtractor={(item) => String(item.yorumID || Math.random())}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#4ECDC4" />
              <Text style={styles.loadingMoreText}>Yükleniyor...</Text>
            </View>
          ) : displayedReviews.length > 0 && displayedReviews.length >= reviews.length ? (
            <View style={styles.endContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
              <Text style={styles.endText}>Tüm yorumlar gösteriliyor</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>Henüz yorum yok</Text>
            <Text style={styles.emptySubtitle}>İlk yorumu yapan siz olun!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  customHeader: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Geri butonunu dengelemek için
  },
  statsHeader: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  averageSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  averageValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#4ECDC4',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  distributionSection: {
    gap: 10,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    width: 20,
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 5,
  },
  countLabel: {
    width: 35,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewHeaderContent: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
  menuChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  menuChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  reviewText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  endContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  endText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});
