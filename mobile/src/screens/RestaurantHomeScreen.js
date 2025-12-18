import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getRestaurantMenu, getRestaurantReviews } from '../services/api';

const { width } = Dimensions.get('window');

export default function RestaurantHomeScreen({ navigation }) {
  const { restaurant, logout } = useAuth();
  const [stats, setStats] = useState({
    menuCount: 0,
    reviewCount: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sayfa her açıldığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      if (restaurant?.restorantID) {
        fetchStats();
      }
    }, [restaurant?.restorantID])
  );

  const fetchStats = async (isRefreshing = false) => {
    if (!restaurant?.restorantID) return;
    
    if (!isRefreshing) setLoading(true);
    try {
      const [menuData, reviewsData] = await Promise.all([
        getRestaurantMenu(restaurant.restorantID),
        getRestaurantReviews(restaurant.restorantID),
      ]);

      const avgRating = reviewsData.length > 0
        ? (reviewsData.reduce((sum, r) => sum + (r.puan || 0), 0) / reviewsData.length).toFixed(1)
        : '0';

      setStats({
        menuCount: menuData.length,
        reviewCount: reviewsData.length,
        averageRating: avgRating,
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats(true);
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

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Yönetim Paneli</Text>
            <Text style={styles.restaurantName}>{restaurant?.ad || 'Restoran'}</Text>
            <Text style={styles.restaurantInfo}>
              {restaurant?.telefon || 'Telefon belirtilmemiş'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#4ECDC4" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
          />
        }
      >
        {/* Stats Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#4ECDC4" style={styles.loader} />
        ) : (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Genel Bakış</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.statCardPrimary]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="restaurant" size={28} color="#4ECDC4" />
                  </View>
                  <Text style={styles.statValue}>{String(stats.menuCount)}</Text>
                  <Text style={styles.statLabel}>Menü Öğesi</Text>
                  <View style={styles.statBadge}>
                    <Ionicons name="trending-up" size={12} color="#4ECDC4" />
                  </View>
                </View>

                <View style={[styles.statCard, styles.statCardSecondary]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="chatbubbles" size={28} color="#FF6B6B" />
                  </View>
                  <Text style={styles.statValue}>{String(stats.reviewCount)}</Text>
                  <Text style={styles.statLabel}>Toplam Yorum</Text>
                  <View style={styles.statBadge}>
                    <Ionicons name="people" size={12} color="#FF6B6B" />
                  </View>
                </View>

                <View style={[styles.statCard, styles.statCardTertiary]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="star" size={28} color="#FFA94D" />
                  </View>
                  <Text style={styles.statValue}>{String(stats.averageRating)}</Text>
                  <Text style={styles.statLabel}>Ortalama Puan</Text>
                  <View style={styles.statBadge}>
                    <Ionicons name="trophy" size={12} color="#FFA94D" />
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
              
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => navigation.navigate('RestaurantMenuManagement')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryActionGradient}
                >
                  <View style={styles.actionContent}>
                    <View style={styles.actionIconCircle}>
                      <Ionicons name="add-circle" size={32} color="#fff" />
                    </View>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.primaryActionText}>Menü Yönetimi</Text>
                      <Text style={styles.primaryActionSubtext}>
                        Yemeklerinizi ekleyin, düzenleyin
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.secondaryActionsGrid}>
                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => navigation.navigate('RestaurantReviews')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#FFF5F5' }]}>
                    <Ionicons name="star-outline" size={28} color="#FF6B6B" />
                  </View>
                  <Text style={styles.secondaryActionText}>Yorumlar</Text>
                  <Text style={styles.secondaryActionSubtext}>
                    {String(stats.reviewCount)} yorum
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => {
                    navigation.navigate('RestaurantDetail', {
                      restaurant: {
                        restorantID: restaurant.restorantID,
                        ad: restaurant.ad,
                        mail: restaurant.mail,
                        telefon: restaurant.telefon,
                      },
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#F0F9FF' }]}>
                    <Ionicons name="eye-outline" size={28} color="#4299E1" />
                  </View>
                  <Text style={styles.secondaryActionText}>Önizleme</Text>
                  <Text style={styles.secondaryActionSubtext}>
                    Müşteri görünümü
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color="#4ECDC4" />
                <Text style={styles.infoTitle}>Restoran Bilgileri</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{restaurant?.mail || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{restaurant?.telefon || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {restaurant?.koordinat ? `${restaurant.koordinat}` : 'Konum belirtilmemiş'}
                </Text>
              </View>
            </View>
          </>
        )}
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
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '500',
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  restaurantInfo: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsSection: {
    padding: 20,
    paddingTop: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  statCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: '#4ECDC4',
  },
  statCardSecondary: {
    borderTopWidth: 3,
    borderTopColor: '#FF6B6B',
  },
  statCardTertiary: {
    borderTopWidth: 3,
    borderTopColor: '#FFA94D',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  statBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.3,
  },
  actionsSection: {
    padding: 20,
    paddingTop: 10,
  },
  primaryActionButton: {
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryActionGradient: {
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  primaryActionSubtext: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  secondaryActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  secondaryActionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
});
