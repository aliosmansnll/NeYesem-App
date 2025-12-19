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
  Linking,
  FlatList,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getRestaurantMenu,
  getRestaurantReviews,
  getRestaurantOnlyReviews,
  getRestaurantPhotos,
  getTikTokVideos,
  API_URL,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [displayedReviewsCount, setDisplayedReviewsCount] = useState(5);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // menu, reviews, photos, tiktok
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuData, allReviews, restReviews, photosData, tiktokData] = await Promise.all([
        getRestaurantMenu(restaurant.restorantID),
        getRestaurantReviews(restaurant.restorantID),
        getRestaurantOnlyReviews(restaurant.restorantID),
        getRestaurantPhotos(restaurant.restorantID),
        getTikTokVideos(restaurant.restorantID),
      ]);
      setMenu(menuData);
      setReviews(allReviews);
      
      // allReviews hem restoran hem menü yorumlarını içerir
      setRestaurantReviews(allReviews);
      setDisplayedReviewsCount(5); // Reset to initial count
      
      // Vitrin fotoğrafını önce göster
      const sortedPhotos = photosData.sort((a, b) => (b.vitrin ? 1 : 0) - (a.vitrin ? 1 : 0));
      setPhotos(sortedPhotos);
      
      // TikTok videolarını yükle
      setTiktokVideos(tiktokData);
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

  // TikTok kısa linkini gerçek video ID'sine çevir
  const openTikTokVideo = async (tiktokURL) => {
    try {
      console.log('TikTok URL açılıyor:', tiktokURL);
      
      // Direkt URL'yi aç - tarayıcı veya TikTok uygulaması otomatik yönlendirecek
      await Linking.openURL(tiktokURL);
    } catch (error) {
      console.error('TikTok açma hatası:', error);
      Alert.alert('Hata', 'Video açılamadı. Lütfen TikTok uygulamasının yüklü olduğundan emin olun.');
    }
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

  const handleScroll = (event) => {
    if (activeTab !== 'reviews' || loadingMoreReviews) return;
    if (displayedReviewsCount >= restaurantReviews.length) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      loadMoreReviews();
    }
  };

  const loadMoreReviews = () => {
    if (loadingMoreReviews || displayedReviewsCount >= restaurantReviews.length) return;
    
    setLoadingMoreReviews(true);
    setTimeout(() => {
      setDisplayedReviewsCount(prev => Math.min(prev + 5, restaurantReviews.length));
      setLoadingMoreReviews(false);
    }, 300);
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
        onScroll={handleScroll}
        scrollEventThrottle={400}
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
          <View style={styles.infoRow}>
            {restaurant.telefon && (
              <>
                <Ionicons name="call" size={20} color="#4ECDC4" />
                <Text style={styles.infoText}>{String(restaurant.telefon)}</Text>
              </>
            )}
            {restaurant.telefon && (restaurant.sehir || restaurant.ilce) && (
              <Text style={styles.infoSeparator}>•</Text>
            )}
            {(restaurant.sehir || restaurant.ilce) && (
              <>
                <Ionicons name="location" size={18} color="#FF6B6B" />
                <Text style={styles.infoLocationText}>
                  {[restaurant.ilce, restaurant.sehir ? restaurant.sehir.replace(/\s*Merkez\s*$/i, '').trim() : ''].filter(Boolean).join(', ')}
                </Text>
              </>
            )}
          </View>
        </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.activeTab]}
          onPress={() => setActiveTab('menu')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={activeTab === 'menu' ? ['#FF6B6B', '#EE5A6F'] : ['#F8F9FA', '#F8F9FA']}
            style={styles.tabGradient}
          >
            <View style={styles.tabIconBox}>
              <Ionicons 
                name={activeTab === 'menu' ? 'restaurant' : 'restaurant-outline'} 
                size={22} 
                color={activeTab === 'menu' ? '#fff' : '#666'} 
              />
            </View>
            <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
              Menü
            </Text>
            <View style={[styles.tabBadge, activeTab === 'menu' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'menu' && styles.activeTabBadgeText]}>
                {String(menu.length)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
          onPress={() => setActiveTab('photos')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={activeTab === 'photos' ? ['#FFA94D', '#F76B1C'] : ['#F8F9FA', '#F8F9FA']}
            style={styles.tabGradient}
          >
            <View style={styles.tabIconBox}>
              <Ionicons 
                name={activeTab === 'photos' ? 'images' : 'images-outline'} 
                size={22} 
                color={activeTab === 'photos' ? '#fff' : '#666'} 
              />
            </View>
            <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
              Galeri
            </Text>
            <View style={[styles.tabBadge, activeTab === 'photos' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'photos' && styles.activeTabBadgeText]}>
                {String(photos.length)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tiktok' && styles.activeTab]}
          onPress={() => setActiveTab('tiktok')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={activeTab === 'tiktok' ? ['#FF0050', '#EE0A6F'] : ['#F8F9FA', '#F8F9FA']}
            style={styles.tabGradient}
          >
            <View style={styles.tabIconBox}>
              <Ionicons 
                name="logo-tiktok"
                size={22} 
                color={activeTab === 'tiktok' ? '#fff' : '#666'} 
              />
            </View>
            <Text style={[styles.tabText, activeTab === 'tiktok' && styles.activeTabText]}>
              TikTok
            </Text>
            <View style={[styles.tabBadge, activeTab === 'tiktok' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'tiktok' && styles.activeTabBadgeText]}>
                {tiktokVideos.length}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={activeTab === 'reviews' ? ['#4ECDC4', '#44A08D'] : ['#F8F9FA', '#F8F9FA']}
            style={styles.tabGradient}
          >
            <View style={styles.tabIconBox}>
              <Ionicons 
                name={activeTab === 'reviews' ? 'chatbubbles' : 'chatbubbles-outline'} 
                size={22} 
                color={activeTab === 'reviews' ? '#fff' : '#666'} 
              />
            </View>
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Yorumlar
            </Text>
            <View style={[styles.tabBadge, activeTab === 'reviews' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'reviews' && styles.activeTabBadgeText]}>
                {String(restaurantReviews.length)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

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

        {activeTab === 'tiktok' && tiktokVideos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.tiktokHeader}>
              <Ionicons name="logo-tiktok" size={24} color="#FF6B6B" />
              <Text style={styles.tiktokTitle}>TikTok Videoları ({tiktokVideos.length})</Text>
            </View>
            
            {/* 3 Column Grid */}
            <View style={styles.tiktokGrid}>
              {tiktokVideos.map((video, index) => (
                <TouchableOpacity
                  key={video.tiktokID}
                  style={styles.tiktokGridItem}
                  onPress={() => openTikTokVideo(video.tiktokURL)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tiktokThumbnailContainer}>
                    {video.thumbnailURL ? (
                      /* Gerçek TikTok thumbnail */
                      <Image
                        source={{ uri: video.thumbnailURL }}
                        style={styles.tiktokThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      /* Fallback gradient */
                      <LinearGradient
                        colors={['#FF0050', '#00F2EA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tiktokThumbnail}
                      >
                        <Ionicons name="logo-tiktok" size={50} color="rgba(255,255,255,0.4)" />
                      </LinearGradient>
                    )}
                    <View style={styles.tiktokOverlay}>
                      <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
              <>
                {restaurantReviews.slice(0, displayedReviewsCount).map((review) => (
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
                    {review.menuID && review.menuAd && (
                      <View style={styles.menuBadge}>
                        <Ionicons name="restaurant" size={14} color="#FF6B6B" />
                        <Text style={styles.menuBadgeText}>{review.menuAd}</Text>
                      </View>
                    )}
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
                ))}
                
                {loadingMoreReviews && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#4ECDC4" />
                    <Text style={styles.loadingMoreText}>Yüklüyor...</Text>
                  </View>
                )}
              </>
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
  },
  infoSeparator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  infoLocationText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 6,
  },
  tabsContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  tabsContent: {
    paddingHorizontal: 15,
    gap: 12,
  },
  tab: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  tabIconBox: {
    marginBottom: 6,
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabBadgeText: {
    color: '#fff',
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
  menuBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  menuBadgeText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
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
  tiktokHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tiktokTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  tiktokGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tiktokGridItem: {
    width: '31%',
    marginBottom: 12,
  },
  tiktokThumbnailContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  tiktokThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiktokOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiktokExternalModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tiktokExternalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  tiktokExternalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tiktokExternalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  tiktokExternalDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  tiktokOpenButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tiktokOpenGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  tiktokOpenText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  tiktokCancelButton: {
    padding: 12,
  },
  tiktokCancelText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  tiktokModalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiktokFloatingCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  tiktokModalContent: {
    width: width * 0.9,
    height: width * 0.9 * (16 / 9),
    maxHeight: '75%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tiktokModalWebView: {
    flex: 1,
    backgroundColor: '#000',
  },
  tiktokLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    gap: 12,
  },
  tiktokLoadingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
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
