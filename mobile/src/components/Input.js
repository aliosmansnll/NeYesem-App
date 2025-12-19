import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { moderateScale, scaleFontSize } from '../utils/responsive';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  iconName = null,  // Ionicons icon adı
  error = null,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
      ]}>
        {iconName && (
          <Ionicons 
            name={iconName} 
            size={20} 
            color={isFocused ? colors.primary : colors.lightGray} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={colors.gray} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(spacing.md),
    flex: 1,
  },
  label: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: moderateScale(spacing.xs),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: moderateScale(borderRadius.lg),
    paddingHorizontal: moderateScale(spacing.md),
    borderWidth: 2,
    borderColor: colors.veryLightGray,
    ...shadows.small,
  },
  focused: {
    borderColor: colors.primary,
    ...shadows.medium,
  },
  error: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: moderateScale(spacing.sm),
  },
  input: {
    flex: 1,
    paddingVertical: moderateScale(spacing.md),
    fontSize: scaleFontSize(16),
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: moderateScale(spacing.xs),
  },
  errorText: {
    fontSize: scaleFontSize(12),
    color: colors.error,
    marginTop: moderateScale(spacing.xs),
    marginLeft: moderateScale(spacing.xs),
  },
});
