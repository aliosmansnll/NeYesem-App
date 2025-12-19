import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { scaleFontSize } from '../utils/responsive';

export const typography = StyleSheet.create({
  // Başlıklar
  h1: {
    fontSize: scaleFontSize(32),
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: scaleFontSize(28),
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: scaleFontSize(24),
    fontWeight: '600',
    color: colors.dark,
  },
  h4: {
    fontSize: scaleFontSize(20),
    fontWeight: '600',
    color: colors.dark,
  },
  
  // Body Text
  body: {
    fontSize: scaleFontSize(16),
    fontWeight: '400',
    color: colors.gray,
    lineHeight: scaleFontSize(24),
  },
  bodyBold: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.dark,
    lineHeight: scaleFontSize(24),
  },
  
  // Small Text
  caption: {
    fontSize: scaleFontSize(14),
    fontWeight: '400',
    color: colors.lightGray,
  },
  captionBold: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: colors.gray,
  },
  
  // Button Text
  button: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
