import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { sizes, weights } from '../theme/typography';
import {
  getCurrentAPIURL,
  setManualIP,
  clearManualIP,
  reinitializeAPI,
} from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const [currentIP, setCurrentIP] = useState('');
  const [manualIP, setManualIPInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentIP();
  }, []);

  const loadCurrentIP = () => {
    const url = getCurrentAPIURL();
    // URL'den IP'yi çıkar (http:// ve :8000 kısmını çıkar)
    const ip = url.replace('http://', '').replace(':8000', '');
    setCurrentIP(ip);
  };

  const handleSetManualIP = async () => {
    if (!manualIP) {
      Alert.alert('Hata', 'Lütfen bir IP adresi girin');
      return;
    }

    // IP formatını kontrol et (basit kontrol)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(manualIP)) {
      Alert.alert('Hata', 'Geçersiz IP adresi formatı. Örnek: 192.168.1.5');
      return;
    }

    setLoading(true);
    try {
      await setManualIP(manualIP);
      loadCurrentIP();
      Alert.alert('Başarılı', 'IP adresi ayarlandı');
      setManualIPInput('');
    } catch (error) {
      Alert.alert('Hata', 'IP adresi ayarlanamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleClearManualIP = async () => {
    Alert.alert(
      'Otomatik Algılamayı Aç',
      'Manuel IP ayarı kaldırılsın ve otomatik algılama kullanılsın mı?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            setLoading(true);
            try {
              await clearManualIP();
              loadCurrentIP();
              Alert.alert('Başarılı', 'Otomatik IP algılama aktif edildi');
            } catch (error) {
              Alert.alert('Hata', 'İşlem başarısız');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRefreshIP = async () => {
    setLoading(true);
    try {
      await reinitializeAPI();
      loadCurrentIP();
      Alert.alert('Başarılı', 'IP adresi yenilendi');
    } catch (error) {
      Alert.alert('Hata', 'IP yenilenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>API Ayarları</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Şu Anki API Adresi:</Text>
          <View style={styles.currentIPContainer}>
            <Text style={styles.currentIP}>{getCurrentAPIURL()}</Text>
          </View>
          <Text style={styles.hint}>
            IP: {currentIP}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manuel IP Ayarla</Text>
          <Text style={styles.description}>
            Backend sunucunuzun IP adresini manuel olarak girmek isterseniz aşağıya yazın.
            Otomatik algılama çalışmazsa bu seçeneği kullanın.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Örnek: 192.168.1.5"
            value={manualIP}
            onChangeText={setManualIPInput}
            keyboardType="numeric"
            autoCapitalize="none"
          />
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSetManualIP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Ayarlanıyor...' : 'Manuel IP Ayarla'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otomatik Algılama</Text>
          <Text style={styles.description}>
            Otomatik IP algılamayı kullanmak için manuel ayarı kaldırın.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleClearManualIP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Otomatik Algılamayı Aç</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleRefreshIP}
            disabled={loading}
          >
            <Text style={styles.buttonTextDark}>IP'yi Yenile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Bilgi</Text>
          <Text style={styles.infoText}>
            • Otomatik algılama, aynı WiFi ağındaki backend sunucusunu bulur
          </Text>
          <Text style={styles.infoText}>
            • Backend bulunamazsa, bilgisayarınızın IP'sini manuel girin
          </Text>
          <Text style={styles.infoText}>
            • IP adresini öğrenmek için bilgisayarda: ipconfig (Windows) veya ifconfig (Mac/Linux)
          </Text>
          <Text style={styles.infoText}>
            • Backend sunucunuz 8000 portunda çalışmalıdır
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  currentIPContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  currentIP: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
  button: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  tertiaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  buttonTextDark: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  infoSection: {
    backgroundColor: '#E3F2FD',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  backButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});

export default SettingsScreen;
