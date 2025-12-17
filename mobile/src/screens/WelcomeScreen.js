import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

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
      colors={['#FFE5E5', '#F8F9FA']}
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
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>NeYesem</Text>
          <Text style={styles.subtitle}>Lezzetin Dijital Adresi</Text>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>✨ Keşfet • Değerlendir • Paylaş</Text>
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
            icon="👤"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('UserLogin')}
          />

          <Button
            title="Restoran Girişi"
            icon="🏪"
            variant="secondary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('RestaurantLogin')}
          />

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Restoran Bul</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⭐</Text>
              <Text style={styles.featureText}>Değerlendir</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📍</Text>
              <Text style={styles.featureText}>Yol Tarifi Al</Text>
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
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.gray,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  taglineContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '600',
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.veryLightGray,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
  },
});
