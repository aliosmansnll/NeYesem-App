import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={gradients.light}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={gradients.primary}
              style={styles.logoGradient}
            >
              <Ionicons name="restaurant" size={64} color={colors.white} />
            </LinearGradient>
          </View>
          
          <Text style={styles.title}>NeYesem</Text>
          <Text style={styles.subtitle}>Lezzetin Dijital Adresi</Text>
          
          <View style={styles.taglineContainer}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.tagline}>Keşfet • Değerlendir • Paylaş</Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Button
            title="Kullanıcı Girişi"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('UserLogin')}
          />

          <Button
            title="Restoran Girişi"
            variant="secondary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('RestaurantLogin')}
          />

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="search" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Restoran Bul</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="star" size={24} color={colors.accent} />
              </View>
              <Text style={styles.featureText}>Değerlendir</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="location" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.featureText}>Yol Tarifi</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingTop: spacing.xxxl * 2,
    paddingBottom: spacing.xxxl,
  },
  headerContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginTop: spacing.md,
    ...shadows.small,
  },
  tagline: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  feature: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
