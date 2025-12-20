import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AddReviewScreen({ route, navigation }) {
  const { restaurant, menuItem, onReviewAdded } = route.params;
  const [yorum, setYorum] = useState('');
  const [puan, setPuan] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (puan === 0) {
      Alert.alert('Hata', 'Lütfen bir puan seçin');
      return;
    }

    setLoading(true);
    try {
      await createReview({
        kullaniciID: user.kullaniciID,
        restorantID: restaurant.restorantID,
        menuID: menuItem?.menuID || null,
        yorum: yorum.trim() || null,
        puan,
        fotoURL: null,
      });

      Alert.alert('Başarılı', 'Yorumunuz eklendi!', [
        {
          text: 'Tamam',
          onPress: () => {
            if (onReviewAdded) onReviewAdded();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', error || 'Yorum eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setPuan(star)}
            style={styles.starButton}
          >
            <Text style={styles.star}>
              {star <= puan ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {menuItem ? 'Menü Yorumu' : 'Restoran Yorumu'}
          </Text>
          <Text style={styles.subtitle}>{restaurant?.ad || 'Restoran'}</Text>
          {menuItem && (
            <Text style={styles.menuName}>{menuItem?.yemekadi || 'Yemek'}</Text>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Puanınız *</Text>
          {renderStars()}
          <Text style={styles.selectedRating}>
            {puan > 0 ? `${String(puan)}/5 seçildi` : 'Puan seçin'}
          </Text>

          <Text style={styles.label}>Yorumunuz (opsiyonel)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Deneyiminizi paylaşın..."
            value={yorum}
            onChangeText={setYorum}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Yorumu Gönder</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  menuName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
  },
  selectedRating: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    minHeight: 120,
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});
