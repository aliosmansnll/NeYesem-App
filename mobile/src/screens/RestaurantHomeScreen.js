import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getRestaurantMenu, getRestaurantReviews } from '../services/api';

export default function RestaurantHomeScreen({ navigation }) {
  const { restaurant, logout } = useAuth();
  const [stats, setStats] = useState({
    menuCount: 0,
    reviewCount: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [menuData, reviewsData] = await Promise.all([
        getRestaurantMenu(restaurant.restorantID),
        getRestaurantReviews(restaurant.restorantID),
      ]);

      const avgRating = reviewsData.length > 0
        ? (reviewsData.reduce((sum, r) => sum + (r.puan || 0), 0) / reviewsData.length).toFixed(1)
        : 0;

      setStats({
        menuCount: menuData.length,
        reviewCount: reviewsData.length,
        averageRating: avgRating,
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hoş Geldiniz! 🏪</Text>
          <Text style={styles.restaurantName}>{restaurant?.ad}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#4ECDC4" style={styles.loader} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📋</Text>
              <Text style={styles.statValue}>{stats.menuCount}</Text>
              <Text style={styles.statLabel}>Menü Öğesi</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statValue}>{stats.reviewCount}</Text>
              <Text style={styles.statLabel}>Yorum</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{stats.averageRating}</Text>
              <Text style={styles.statLabel}>Ortalama Puan</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('RestaurantMenuManagement')}
          >
            <Text style={styles.actionIcon}>🍽️</Text>
            <Text style={styles.actionText}>Menü Yönetimi</Text>
            <Text style={styles.actionSubtext}>Menü ekle, düzenle veya sil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('RestaurantReviews')}
          >
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionText}>Yorumlar</Text>
            <Text style={styles.actionSubtext}>Müşteri yorumlarını gör</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
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
          >
            <Text style={styles.actionIcon}>👁️</Text>
            <Text style={styles.actionText}>Restoranı Görüntüle</Text>
            <Text style={styles.actionSubtext}>Müşteri gözüyle gör</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 15,
    gap: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
