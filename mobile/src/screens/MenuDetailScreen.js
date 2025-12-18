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
import { getMenuReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MenuDetailScreen({ route, navigation }) {
  const { menuItem, restaurant, onReviewAdded } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getMenuReviews(menuItem.menuID);
      setReviews(data);
    } catch (error) {
      Alert.alert('Hata', 'Yorumlar yüklenemedi');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleAddReview = () => {
    navigation.navigate('AddReview', {
      restaurant,
      menuItem,
      onReviewAdded: () => {
        fetchReviews();
        if (onReviewAdded) onReviewAdded();
      },
    });
  };

  const renderStars = (rating) => {
    if (!rating) return '⭐ Henüz puan yok';
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return '0';
    const total = reviews.reduce((sum, review) => sum + (review.puan || 0), 0);
    return (total / reviews.length).toFixed(1);
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
      {/* Menu Item Header */}
      <View style={styles.header}>
        <Text style={styles.menuName}>{menuItem.yemekadi || 'Yemek'}</Text>
        <Text style={styles.price}>{String(menuItem.fiyat || 0)} ₺</Text>
        
        {menuItem.aciklama && (
          <Text style={styles.description}>{menuItem.aciklama || '-'}</Text>
        )}
        
        {menuItem.kategoriad && (
          <Text style={styles.category}>🏷️ {menuItem.kategoriad || '-'}</Text>
        )}
        
        <View style={styles.ratingContainer}>
          <Text style={styles.averageRating}>
            Ortalama Puan: {String(calculateAverageRating())} / 5.0
          </Text>
          <Text style={styles.reviewCount}>
            ({String(reviews.length)} değerlendirme)
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={handleAddReview}
        >
          <Text style={styles.addReviewButtonText}>+ Yorum Ekle</Text>
        </TouchableOpacity>

        {reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz yorum bulunmuyor 💬</Text>
            <Text style={styles.emptySubText}>İlk yorumu siz yapın!</Text>
          </View>
        ) : (
          <View style={styles.reviewsContainer}>
            {reviews.map((review) => (
              <View key={String(review.yorumID || Math.random())} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>
                    {review.kullaniciAd && review.kullaniciSoyad 
                      ? `${review.kullaniciAd} ${review.kullaniciSoyad}`
                      : `Kullanıcı #${review.kullaniciID || 0}`}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {review.yorumTarih ? new Date(review.yorumTarih).toLocaleDateString('tr-TR') : 'Tarih yok'}
                  </Text>
                </View>
                {review.puan && (
                  <Text style={styles.reviewRating}>{renderStars(review.puan)}</Text>
                )}
                {review.yorum && (
                  <Text style={styles.reviewText}>{review.yorum || '-'}</Text>
                )}
              </View>
            ))}
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
  menuName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  category: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  ratingContainer: {
    paddingTop: 15,
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
  content: {
    flex: 1,
    padding: 15,
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
  reviewsContainer: {
    paddingBottom: 20,
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
    marginTop: 80,
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
});
