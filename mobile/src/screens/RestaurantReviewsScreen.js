import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getRestaurantReviews, getRestaurantMenu } from '../services/api';

export default function RestaurantReviewsScreen() {
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
        <View style={styles.reviewHeaderLeft}>
          <Text style={styles.reviewUser}>
            {item.kullaniciAd && item.kullaniciSoyad
              ? `${item.kullaniciAd} ${item.kullaniciSoyad}`
              : `Kullanıcı #${item.kullaniciID || 0}`}
          </Text>
          {item.menuID && menuItems[item.menuID] && (
            <View style={styles.menuBadgeContainer}>
              <Text style={styles.menuBadge}>🍴 {menuItems[item.menuID]}</Text>
            </View>
          )}
        </View>
        <Text style={styles.reviewDate}>
          {item.yorumTarih ? new Date(item.yorumTarih).toLocaleDateString('tr-TR') : 'Tarih yok'}
        </Text>
      </View>

      {item.puan && (
        <Text style={styles.reviewRating}>{renderStars(item.puan)}</Text>
      )}

      {item.yorum && (
        <Text style={styles.reviewText}>{item.yorum || '-'}</Text>
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
      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.averageSection}>
          <Text style={styles.averageValue}>{String(stats.average)}</Text>
          <Text style={styles.averageLabel}>/ 5.0</Text>
          <Text style={styles.totalReviews}>{String(stats.total)} değerlendirme</Text>
        </View>

        <View style={styles.distributionSection}>
          {[5, 4, 3, 2, 1].map((star) => (
            <View key={star} style={styles.distributionRow}>
              <Text style={styles.starLabel}>{String(star)} ⭐</Text>
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
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#4ECDC4" />
              <Text style={styles.loadingMoreText}>Yüklüyor...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz yorum yok 💬</Text>
          </View>
        }
      />
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
  statsHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  averageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  averageLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalReviews: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  distributionSection: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starLabel: {
    width: 50,
    fontSize: 14,
    color: '#666',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  countLabel: {
    width: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  list: {
    padding: 15,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewHeaderLeft: {
    flex: 1,
    marginRight: 10,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuBadgeContainer: {
    marginTop: 4,
  },
  menuBadge: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    fontSize: 16,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#999',
  },
});
