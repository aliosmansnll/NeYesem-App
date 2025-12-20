/**
 * TEXT İÇİN RESPONSIVE YARDIMCI COMPONENT
 * Metinlerin her ekran boyutunda düzgün görünmesini sağlar
 */

import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { scaleFontSize } from '../utils/responsive';

export default function ResponsiveText({ 
  children, 
  style, 
  numberOfLines,
  ellipsizeMode = 'tail',
  size = 'base', // 'xs', 'sm', 'md', 'base', 'lg', 'xl', 'xxl'
  ...props 
}) {
  const fontSizes = {
    xs: scaleFontSize(10),
    sm: scaleFontSize(12),
    md: scaleFontSize(14),
    base: scaleFontSize(16),
    lg: scaleFontSize(18),
    xl: scaleFontSize(20),
    xxl: scaleFontSize(24),
  };

  const responsiveStyle = {
    fontSize: typeof size === 'number' ? scaleFontSize(size) : fontSizes[size] || fontSizes.base,
  };

  return (
    <RNText
      style={[responsiveStyle, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </RNText>
  );
}
