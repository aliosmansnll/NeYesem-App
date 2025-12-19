import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro gibi orta boy bir telefon)
const baseWidth = 375;
const baseHeight = 812;

// Genişlik bazlı ölçekleme
export const scale = (size) => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

// Yükseklik bazlı ölçekleme
export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

// Hem genişlik hem yükseklik için ortalama ölçekleme
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Font boyutları için optimize edilmiş ölçekleme
export const scaleFontSize = (size) => {
  const newSize = scale(size);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Ekran boyutları
export const width = SCREEN_WIDTH;
export const height = SCREEN_HEIGHT;

// Yüzde bazlı genişlik
export const wp = (percentage) => {
  return (percentage * SCREEN_WIDTH) / 100;
};

// Yüzde bazlı yükseklik
export const hp = (percentage) => {
  return (percentage * SCREEN_HEIGHT) / 100;
};

// Telefon tipi kontrolü
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

export default {
  scale,
  verticalScale,
  moderateScale,
  scaleFontSize,
  width,
  height,
  wp,
  hp,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
};
