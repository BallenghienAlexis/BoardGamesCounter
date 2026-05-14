import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  size?: 'small' | 'large';
}

export function PageHeader({ title, subtitle, size = 'small' }: PageHeaderProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    titleSmall: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    titleLarge: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 4,
    },
  });

  const titleStyle = size === 'large' ? styles.titleLarge : styles.titleSmall;

  return (
    <View style={styles.header}>
      <Text style={titleStyle}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}


