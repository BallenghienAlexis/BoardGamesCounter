import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Player } from '../contexts/GameContext';

interface PlayerCardProps {
  player: Player;
  rank: number;
  totalPlayers: number;
}

const { width } = Dimensions.get('window');

export function PlayerCard({ player, rank, totalPlayers }: PlayerCardProps) {
  const { colors } = useTheme();

  // Assign colors based on ranking
  const getRankColor = () => {
    if (totalPlayers === 1) return colors.primary;
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.primary;
  };

  const styles = StyleSheet.create({
    container: {
      width: (width - 48) / 2,
      backgroundColor: colors.surfaceLight,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 8,
      marginVertical: 8,
      borderWidth: 2,
      borderColor: getRankColor(),
      alignItems: 'center',
      shadowColor: getRankColor(),
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    rank: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    scoreContainer: {
      alignItems: 'center',
    },
    scoreLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 4,
    },
    score: {
      fontSize: 32,
      fontWeight: '700',
      color: getRankColor(),
      fontFamily: 'Poppins_700Bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.rank}>#{rank}</Text>
      <Text style={styles.name}>{player.name}</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Points</Text>
        <Text style={styles.score}>{player.score}</Text>
      </View>
    </View>
  );
}

