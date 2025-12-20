import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { moderateScale } from '../utils/responsive';

export default function Card({ 
  children, 
  onPress = null,
  style = {},
}) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(borderRadius.lg),
    padding: moderateScale(spacing.lg),
    marginBottom: moderateScale(spacing.md),
    ...shadows.medium,
  },
});
