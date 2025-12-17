import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  // Başlıklar
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.dark,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark,
  },
  
  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    lineHeight: 24,
  },
  
  // Small Text
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.lightGray,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
  },
  
  // Button Text
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
