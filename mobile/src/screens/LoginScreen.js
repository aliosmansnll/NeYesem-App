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

export default function LoginScreen({ navigation }) {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAsUser } = useAuth();

  const handleLogin = async () => {
    if (!mail || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    const result = await loginAsUser(mail, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Hata', result.error || 'Giriş başarısız');
    }
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
              onPress={() => navigation.navigate('Welcome')}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={gradients.primary}
                style={styles.iconGradient}
              >
                <Ionicons name="person" size={48} color={colors.white} />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Hoş Geldin!</Text>
            <Text style={styles.subtitle}>Lezzet yolculuğuna devam et</Text>

            <View style={styles.formContainer}>
              <Input
                label="E-posta"
                iconName="mail"
                placeholder="ornek@email.com"
                value={mail}
                onChangeText={setMail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="Şifre"
                iconName="lock-closed"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Giriş Yap"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                onPress={handleLogin}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('UserRegister')}
              >
                <Text style={styles.registerText}>
                  Hesabın yok mu? <Text style={styles.registerTextBold}>Kayıt Ol</Text>
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
  registerLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  registerText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  registerTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
