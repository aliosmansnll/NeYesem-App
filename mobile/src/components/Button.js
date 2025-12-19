import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';
import { moderateScale, scaleFontSize } from '../utils/responsive';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  icon = null,
  fullWidth = false,
}) {
  const getGradient = () => {
    switch(variant) {
      case 'primary': return gradients.primary;
      case 'secondary': return gradients.secondary;
      case 'sunset': return gradients.sunset;
      case 'ocean': return gradients.ocean;
      default: return gradients.primary;
    }
  };

  const getSize = () => {
    switch(size) {
      case 'small': return { padding: moderateScale(spacing.sm), fontSize: scaleFontSize(14) };
      case 'medium': return { padding: moderateScale(spacing.md), fontSize: scaleFontSize(16) };
      case 'large': return { padding: moderateScale(spacing.lg), fontSize: scaleFontSize(18) };
      default: return { padding: moderateScale(spacing.md), fontSize: scaleFontSize(16) };
    }
  };

  const sizeStyle = getSize();

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.outlineButton,
          { padding: sizeStyle.padding },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.content}>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.outlineText, { fontSize: sizeStyle.fontSize }]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, fullWidth && styles.fullWidth, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { padding: sizeStyle.padding }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.content}>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, { fontSize: sizeStyle.fontSize }]}>
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(borderRadius.md),
    overflow: 'hidden',
    ...shadows.medium,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(spacing.sm),
  },
  text: {
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: scaleFontSize(20),
  },
  disabled: {
    opacity: 0.5,
  },
  // Outline variant
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: moderateScale(borderRadius.md),
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
