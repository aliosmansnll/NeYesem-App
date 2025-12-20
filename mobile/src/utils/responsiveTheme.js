/**
 * Tüm ekranlara uygulanan responsive tema değerleri
 * Bu dosyayı import ederek tutarlı responsive değerler kullanabilirsiniz
 */

import { moderateScale, scaleFontSize, verticalScale, wp, hp } from './responsive';

// Responsive Font Boyutları
export const fontSizes = {
  xs: scaleFontSize(10),
  sm: scaleFontSize(12),
  md: scaleFontSize(14),
  base: scaleFontSize(16),
  lg: scaleFontSize(18),
  xl: scaleFontSize(20),
  xxl: scaleFontSize(24),
  xxxl: scaleFontSize(32),
  huge: scaleFontSize(48),
};

// Responsive Spacing (Padding & Margin)
export const responsiveSpacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  base: moderateScale(16),
  lg: moderateScale(20),
  xl: moderateScale(24),
  xxl: moderateScale(32),
  xxxl: moderateScale(48),
};

// Responsive Border Radius
export const responsiveBorderRadius = {
  sm: moderateScale(4),
  md: moderateScale(8),
  lg: moderateScale(12),
  xl: moderateScale(16),
  xxl: moderateScale(24),
  full: 9999,
};

// Responsive Icon Sizes
export const iconSizes = {
  xs: scaleFontSize(12),
  sm: scaleFontSize(16),
  md: scaleFontSize(20),
  lg: scaleFontSize(24),
  xl: scaleFontSize(32),
  xxl: scaleFontSize(48),
};

// Responsive Button Heights
export const buttonHeights = {
  sm: verticalScale(36),
  md: verticalScale(44),
  lg: verticalScale(52),
  xl: verticalScale(60),
};

// Responsive Image Heights
export const imageHeights = {
  small: verticalScale(100),
  medium: verticalScale(140),
  large: verticalScale(200),
  xlarge: verticalScale(250),
};

export default {
  fontSizes,
  responsiveSpacing,
  responsiveBorderRadius,
  iconSizes,
  buttonHeights,
  imageHeights,
};
