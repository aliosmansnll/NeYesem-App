import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  getRestaurantMenu,
  getRestaurantReviews,
  getRestaurantOnlyReviews,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // menu, reviews
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuData, allReviews, restReviews] = await Promise.all([
        getRestaurantMenu(restaurant.restorantID),
        getRestaurantReviews(restaurant.restorantID),
        getRestaurantOnlyReviews(restaurant.restorantID),
      ]);
      setMenu(menuData);
      setReviews(allReviews);
      setRestaurantReviews(restReviews);
    } catch (error) {
      Alert.alert('Hata', 'Veriler yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddReview = () => {
    navigation.navigate('AddReview', {
      restaurant,
      onReviewAdded: fetchData,
    });
  };

  const handleMenuItemPress = (menuItem) => {
    navigation.navigate('MenuDetail', {
      menuItem,
      restaurant,
      onReviewAdded: fetchData,
    });
  };

  const renderStars = (rating) => {
    if (!rating) return '⭐ Henüz puan yok';
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const calculateAverageRating = (reviewsList) => {
    if (!reviewsList || reviewsList.length === 0) return 0;
    const total = reviewsList.reduce((sum, review) => sum + (review.puan || 0), 0);
    return (total / reviewsList.length).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Restaurant Header */}
      <View style={styles.header}>
        <Text style={styles.restaurantName}>{restaurant.ad}</Text>
        {restaurant.telefon && (
          <Text style={styles.headerInfo}>📞 {restaurant.telefon}</Text>
        )}
        <Text style={styles.headerInfo}>📧 {restaurant.mail}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.averageRating}>
            Ortalama Puan: {calculateAverageRating(restaurantReviews)} / 5.0
          </Text>
          <Text style={styles.reviewCount}>
            ({restaurantReviews.length} değerlendirme)
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
            Menü ({menu.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Yorumlar ({restaurantReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        {activeTab === 'menu' && (
          <View style={styles.section}>
            {menu.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz menü bulunmuyor 🍽️</Text>
              </View>
            ) : (
              menu.map((item) => (
                <TouchableOpacity
                  key={item.menuID}
                  style={styles.menuCard}
                  onPress={() => handleMenuItemPress(item)}
                >
                  <View style={styles.menuHeader}>
                    <Text style={styles.menuName}>{item.yemekadi}</Text>
                    <Text style={styles.menuPrice}>{item.fiyat} ₺</Text>
                  </View>
                  {item.aciklama && (
                    <Text style={styles.menuDescription}>{item.aciklama}</Text>
                  )}
                  {item.kategoriad && (
                    <Text style={styles.menuCategory}>🏷️ {item.kategoriad}</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={handleAddReview}
            >
              <Text style={styles.addReviewButtonText}>+ Restoran Yorumu Ekle</Text>
            </TouchableOpacity>

            {restaurantReviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz yorum bulunmuyor 💬</Text>
              </View>
            ) : (
              restaurantReviews.map((review) => (
                <View key={review.yorumID} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>
                      {review.kullaniciAd && review.kullaniciSoyad 
                        ? `${review.kullaniciAd} ${review.kullaniciSoyad}`
                        : `Kullanıcı #${review.kullaniciID}`}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.yorumTarih).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  {review.puan && (
                    <Text style={styles.reviewRating}>{renderStars(review.puan)}</Text>
                  )}
                  {review.yorum && (
                    <Text style={styles.reviewText}>{review.yorum}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  headerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  averageRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  menuPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  menuCategory: {
    fontSize: 12,
    color: '#999',
  },
  addReviewButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addReviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
});
