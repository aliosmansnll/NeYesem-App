import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>NeYesem</Text>
        <Text style={styles.subtitle}>Lezzetin Adresi 🍽️</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.userButton]}
            onPress={() => navigation.navigate('UserLogin')}
          >
            <Text style={styles.buttonIcon}>👤</Text>
            <Text style={styles.buttonText}>Kullanıcı Girişi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.restaurantButton]}
            onPress={() => navigation.navigate('RestaurantLogin')}
          >
            <Text style={styles.buttonIcon}>🏪</Text>
            <Text style={styles.buttonText}>Restoran Girişi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 60,
  },
  buttonsContainer: {
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userButton: {
    backgroundColor: '#FF6B6B',
  },
  restaurantButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
