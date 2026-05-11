import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    button: {
      paddingHorizontal: size === 'small' ? 12 : size === 'medium' ? 16 : 20,
      paddingVertical: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        variant === 'primary'
          ? colors.primary
          : variant === 'secondary'
            ? colors.surface
            : variant === 'danger'
              ? colors.danger
              : colors.success,
      opacity: disabled ? 0.5 : 1,
    },
    text: {
      fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
      fontWeight: '600',
      color:
        variant === 'secondary'
          ? colors.text
          : colors.text,
      fontFamily: 'Poppins_600SemiBold',
    },
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.button, style]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

