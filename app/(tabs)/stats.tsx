import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function StatsScreen() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 4,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Statistiques</Text>
        <Text style={styles.subtitle}>Bientôt disponible</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emptyText}>
          Les statistiques de vos parties apparaîtront ici
        </Text>
      </View>
    </SafeAreaView>
  );
}

