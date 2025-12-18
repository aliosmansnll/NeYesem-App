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

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    mail: '',
    telefon: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { registerAsUser } = useAuth();

  const handleRegister = async () => {
    const { ad, soyad, mail, telefon, password, confirmPassword } = formData;

    if (!ad || !soyad || !mail || !password) {
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
    const result = await registerAsUser({
      ad,
      soyad,
      mail,
      telefon: telefon || null,
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
                colors={gradients.accent}
                style={styles.iconGradient}
              >
                <Ionicons name="person-add" size={48} color={colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Aramıza Katıl!</Text>
            <Text style={styles.subtitle}>Lezzet dünyasına hoş geldin</Text>

            <View style={styles.formContainer}>
              <View style={styles.formRow}>
                <Input
                  label="Ad *"
                  iconName="person"
                  placeholder="Adın"
                  value={formData.ad}
                  onChangeText={(value) => updateField('ad', value)}
                  autoCapitalize="words"
                />

                <Input
                  label="Soyad *"
                  iconName="person-outline"
                  placeholder="Soyadın"
                  value={formData.soyad}
                  onChangeText={(value) => updateField('soyad', value)}
                  autoCapitalize="words"
                />
              </View>

              <Input
                label="E-posta *"
                iconName="mail"
                placeholder="ornek@email.com"
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
                placeholder="Şifreni tekrar gir"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Hesap Oluştur"
                variant="primary"
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
                  Zaten hesabın var mı? <Text style={styles.loginTextBold}>Giriş Yap</Text>
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
  backButtonText: {
    fontSize: 24,
    color: colors.dark,
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
  icon: {
    fontSize: 48,
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
  formRow: {
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
    color: colors.primary,
    fontWeight: '700',
  },
});
