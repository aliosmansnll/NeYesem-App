import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

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
    <LinearGradient
      colors={gradients.light}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={gradients.secondary}
                style={styles.iconGradient}
              >
                <Ionicons name="storefront" size={48} color={colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Restoran Kaydı</Text>
            <Text style={styles.subtitle}>Restoranınızı kaydedin ve büyüyün</Text>

            <View style={styles.formContainer}>
              <Input
                label="Restoran Adı *"
                iconName="restaurant"
                placeholder="Restoranınızın adı"
                value={formData.ad}
                onChangeText={(value) => updateField('ad', value)}
                autoCapitalize="words"
              />

              <Input
                label="E-posta *"
                iconName="mail"
                placeholder="ornek@restoran.com"
                value={formData.mail}
                onChangeText={(value) => updateField('mail', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="Telefon"
                iconName="call"
                placeholder="5XX XXX XX XX (opsiyonel)"
                value={formData.telefon}
                onChangeText={(value) => updateField('telefon', value)}
                keyboardType="phone-pad"
              />

              <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color={colors.secondary} />
                  <Text style={styles.locationLabel}>Konum (opsiyonel)</Text>
                </View>
                <View style={styles.locationInputs}>
                  <Input
                    iconName="navigate"
                    placeholder="Enlem"
                    value={formData.latitude}
                    onChangeText={(value) => updateField('latitude', value)}
                    keyboardType="decimal-pad"
                  />
                  <Input
                    iconName="compass"
                    placeholder="Boylam"
                    value={formData.longitude}
                    onChangeText={(value) => updateField('longitude', value)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Input
                label="Şifre *"
                iconName="lock-closed"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Şifre Tekrar *"
                iconName="lock-closed"
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Kayıt Ol"
                variant="secondary"
                size="large"
                fullWidth
                loading={loading}
                onPress={handleRegister}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.loginText}>
                  Hesabınız var mı? <Text style={styles.loginTextBold}>Giriş Yap</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.large,
  },
  locationSection: {
    marginBottom: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  locationInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.veryLightGray,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loginText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  loginTextBold: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
