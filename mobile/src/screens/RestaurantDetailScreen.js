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
  Image,
  Dimensions,
  ImageBackground,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  getRestaurantMenu,
  getRestaurantReviews,
  getRestaurantOnlyReviews,
  getRestaurantPhotos,
  API_URL,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // menu, reviews, photos
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuData, allReviews, restReviews, photosData] = await Promise.all([
        getRestaurantMenu(restaurant.restorantID),
        getRestaurantReviews(restaurant.restorantID),
        getRestaurantOnlyReviews(restaurant.restorantID),
        getRestaurantPhotos(restaurant.restorantID),
      ]);
      setMenu(menuData);
      setReviews(allReviews);
      setRestaurantReviews(restReviews);
      // Vitrin fotoğrafını önce göster
      const sortedPhotos = photosData.sort((a, b) => (b.vitrin ? 1 : 0) - (a.vitrin ? 1 : 0));
      setPhotos(sortedPhotos);
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
    if (!reviewsList || reviewsList.length === 0) return '0';
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

  const vitrinPhoto = photos.find(p => p.vitrin) || photos[0];
  const vitrinPhotoUrl = vitrinPhoto 
    ? `${vitrinPhoto.fotoURL.startsWith('http') ? '' : API_URL}${vitrinPhoto.fotoURL}`
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B6B']} />
        }
      >
        {/* Hero Image with Restaurant Info */}
        <View style={styles.heroSection}>
          {vitrinPhotoUrl ? (
            <ImageBackground
              source={{ uri: vitrinPhotoUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.heroGradient}
              >
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.heroContent}>
                  <Text style={styles.heroRestaurantName}>{restaurant.ad || 'Restoran'}</Text>
                  <View style={styles.heroRating}>
                    <Ionicons name="star" size={20} color="#FFD700" />
                    <Text style={styles.heroRatingText}>
                      {String(calculateAverageRating(restaurantReviews))}
                    </Text>
                    <Text style={styles.heroReviewCount}>
                      ({String(restaurantReviews.length)} değerlendirme)
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={['#FF6B9D', '#C06C84']}
              style={styles.heroImage}
            >
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.heroContent}>
                <Ionicons name="restaurant" size={60} color="rgba(255,255,255,0.5)" style={{ marginBottom: 10 }} />
                <Text style={styles.heroRestaurantName}>{restaurant.ad || 'Restoran'}</Text>
                <View style={styles.heroRating}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.heroRatingText}>
                    {String(calculateAverageRating(restaurantReviews))}
                  </Text>
                  <Text style={styles.heroReviewCount}>
                    ({String(restaurantReviews.length)} değerlendirme)
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>
          {(restaurant.sehir || restaurant.ilce) && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#FF6B6B" />
              <Text style={styles.infoText}>
                {[restaurant.ilce, restaurant.sehir ? restaurant.sehir.replace(/\s*Merkez\s*$/i, '').trim() : ''].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
          {restaurant.telefon && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#4ECDC4" />
              <Text style={styles.infoText}>{String(restaurant.telefon)}</Text>
            </View>
          )}
        </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
        >
          <Ionicons 
            name={activeTab === 'menu' ? 'restaurant' : 'restaurant-outline'} 
            size={20} 
            color={activeTab === 'menu' ? '#FF6B6B' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
            Menü ({String(menu.length)})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
        >
          <Ionicons 
            name={activeTab === 'photos' ? 'images' : 'images-outline'} 
            size={20} 
            color={activeTab === 'photos' ? '#FF6B6B' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
            Fotoğraflar ({String(photos.length)})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Ionicons 
            name={activeTab === 'reviews' ? 'chatbubbles' : 'chatbubbles-outline'} 
            size={20} 
            color={activeTab === 'reviews' ? '#FF6B6B' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Yorumlar ({String(restaurantReviews.length)})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'menu' && (
          <View style={styles.section}>
            {menu.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz menü bulunmuyor 🍽️</Text>
              </View>
            ) : (
              menu.map((item) => (
                <TouchableOpacity
                  key={String(item.menuID || Math.random())}
                  style={styles.menuCard}
                  onPress={() => handleMenuItemPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuCardContent}>
                    <View style={styles.menuIconContainer}>
                      <LinearGradient
                        colors={['#FF6B9D', '#C06C84']}
                        style={styles.menuIconGradient}
                      >
                        <Ionicons name="fast-food" size={24} color="#fff" />
                      </LinearGradient>
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.yemekadi || 'Yemek'}</Text>
                      {item.aciklama && (
                        <Text style={styles.menuDescription} numberOfLines={2}>{item.aciklama}</Text>
                      )}
                      {item.kategoriad && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{item.kategoriad}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.menuPrice}>{String(item.fiyat || 0)} ₺</Text>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'photos' && (
          <View style={styles.section}>
            {photos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz fotoğraf bulunmuyor 📸</Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {/* Vitrin fotoğrafı önce göster */}
                {photos.map((photo, index) => (
                  <TouchableOpacity 
                    key={photo.fotoID} 
                    style={styles.photoItemContainer}
                    onPress={() => setSelectedPhoto(photo)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: `${photo.fotoURL.startsWith('http') ? '' : API_URL}${photo.fotoURL}` }}
                      style={styles.photoItem}
                      resizeMode="cover"
                    />
                    {photo.vitrin && (
                      <View style={styles.vitrinBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.vitrinText}>Vitrin</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={handleAddReview}
            >
              <LinearGradient
                colors={['#FF6B6B', '#EE5A6F']}
                style={styles.addReviewGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.addReviewButtonText}>Restoran Yorumu Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>

            {restaurantReviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Henüz yorum bulunmuyor 💬</Text>
              </View>
            ) : (
              restaurantReviews.map((review) => (
                <View key={String(review.yorumID || Math.random())} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserAvatar}>
                      <Ionicons name="person" size={20} color="#fff" />
                    </View>
                    <View style={styles.reviewUserInfo}>
                      <Text style={styles.reviewUser}>
                        {review.kullaniciAd && review.kullaniciSoyad 
                          ? `${review.kullaniciAd} ${review.kullaniciSoyad}`
                          : `Kullanıcı #${review.kullaniciID || 0}`}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {review.yorumTarih ? new Date(review.yorumTarih).toLocaleDateString('tr-TR') : 'Tarih yok'}
                      </Text>
                    </View>
                  </View>
                  {review.puan && (
                    <View style={styles.reviewRatingContainer}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons 
                          key={i}
                          name={i < review.puan ? 'star' : 'star-outline'} 
                          size={16} 
                          color="#FFD700" 
                        />
                      ))}
                    </View>
                  )}
                  {review.yorum && (
                    <Text style={styles.reviewText}>{review.yorum}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>
      </ScrollView>

      {/* Full Screen Photo Modal */}
      {selectedPhoto && (
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
                source={{ uri: `${selectedPhoto.fotoURL.startsWith('http') ? '' : API_URL}${selectedPhoto.fotoURL}` }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPhoto(null)}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>

            {selectedPhoto.vitrin && (
              <View style={styles.fullScreenVitrinBadge}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.fullScreenVitrinText}>Vitrin Fotoğraf</Text>
              </View>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  heroSection: {
    height: 280,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  heroContent: {
    paddingBottom: 20,
  },
  heroRestaurantName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroRatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  heroReviewCount: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: -30,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFF5F5',
  },
  tabText: {
    fontSize: 13,
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
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIconContainer: {
    marginRight: 12,
  },
  menuIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#4299E1',
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'center',
    gap: 4,
  },
  menuPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  addReviewButton: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  addReviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addReviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItemContainer: {
    width: (width - 46) / 3,
    height: (width - 46) / 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoItem: {
    width: '100%',
    height: '100%',
  },
  vitrinBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 5,
  },
  fullScreenVitrinBadge: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullScreenVitrinText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
