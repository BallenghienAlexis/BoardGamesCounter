import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { GameMode } from '../types/SkullKing';

interface GameTypeSelectorProps {
  onSelectType: (type: GameMode) => void;
}

export function GameTypeSelector({ onSelectType }: GameTypeSelectorProps) {
  const { colors } = useTheme();

  const gameTypes = [
    {
      id: 'base' as GameMode,
      name: 'Jeu de Base',
      description: 'Les règles classiques de Skull King',
      icon: '🏴‍☠️',
    },
    {
      id: 'base-extension' as GameMode,
      name: 'Jeu de Base + Extension',
      description: 'Avec cartes additionnelles et variantes',
      icon: '🌊',
    },
    {
      id: 'incremental' as GameMode,
      name: 'Mode Incremental',
      description: 'Scoring simplifié: +1/-1 par mise',
      icon: '📊',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardPressed: {
      backgroundColor: colors.primary,
      opacity: 0.9,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    icon: {
      fontSize: 32,
    },
    titleSection: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 4,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
    },
    arrow: {
      marginLeft: 8,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.scrollContent}>
        {gameTypes.map(type => (
          <TouchableOpacity
            key={type.id}
            style={styles.card}
            onPress={() => onSelectType(type.id)}
            activeOpacity={0.7}
          >
            <View style={styles.header}>
              <Text style={styles.icon}>{type.icon}</Text>
              <View style={styles.titleSection}>
                <Text style={styles.title}>{type.name}</Text>
                <Text style={styles.description}>{type.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} style={styles.arrow} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

