import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RestaurantRegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    ad: '',
    mail: '',
    telefon: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { registerAsRestaurant } = useAuth();

  const handleRegister = async () => {
    const { ad, mail, password, confirmPassword } = formData;

    if (!ad || !mail || !password) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);
    const result = await registerAsRestaurant({
      ad,
      mail,
      telefon: formData.telefon || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      password,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Hata', result.error || 'Kayıt başarısız');
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.icon}>🏪</Text>
          <Text style={styles.title}>Restoran Kaydı</Text>
          <Text style={styles.subtitle}>Restoranınızı kaydedin 🎉</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Restoran Adı *"
              value={formData.ad}
              onChangeText={(value) => updateField('ad', value)}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="E-posta *"
              value={formData.mail}
              onChangeText={(value) => updateField('mail', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Telefon (opsiyonel)"
              value={formData.telefon}
              onChangeText={(value) => updateField('telefon', value)}
              keyboardType="phone-pad"
            />

            <View style={styles.locationContainer}>
              <Text style={styles.locationLabel}>Konum (opsiyonel)</Text>
              <View style={styles.locationInputs}>
                <TextInput
                  style={[styles.input, styles.locationInput]}
                  placeholder="Enlem"
                  value={formData.latitude}
                  onChangeText={(value) => updateField('latitude', value)}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.locationInput]}
                  placeholder="Boylam"
                  value={formData.longitude}
                  onChangeText={(value) => updateField('longitude', value)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Şifre *"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Şifre Tekrar *"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>
                Hesabınız var mı? <Text style={styles.loginTextBold}>Giriş Yap</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.backText}>← Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  icon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4ECDC4',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  locationContainer: {
    marginBottom: 15,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  backText: {
    color: '#999',
    fontSize: 14,
  },
});
