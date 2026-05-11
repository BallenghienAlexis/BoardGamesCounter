import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useSkullKingGame } from '../../../src/contexts/SkullKingContext';
import { Button } from '../../../src/components/Button';

export default function GameEndScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { gameState } = useSkullKingGame();

  const sortedPlayers = useMemo(() => {
    if (!gameState) return [];
    return [...gameState.players].sort((a, b) => {
      const scoreA = gameState.playerScores[a.id] || 0;
      const scoreB = gameState.playerScores[b.id] || 0;
      return scoreB - scoreA;
    });
  }, [gameState]);

  if (!gameState) {
    return null;
  }

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
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    winnerCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 24,
    },
    winnerIcon: {
      marginBottom: 12,
    },
    winnerName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 8,
    },
    winnerScore: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    winnerLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 4,
    },
    leaderboard: {
      marginTop: 24,
    },
    leaderboardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    playerRow: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    playerName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    playerScore: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Poppins_700Bold',
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎉 Partie Terminée</Text>
        <Text style={styles.subtitle}>Bravo à tous les pirates!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedPlayers.length > 0 && (
          <View style={styles.winnerCard}>
            <Text style={styles.winnerIcon}>👑</Text>
            <Text style={styles.winnerName}>{sortedPlayers[0].name}</Text>
            <Text style={styles.winnerScore}>{gameState.playerScores[sortedPlayers[0].id] || 0}</Text>
            <Text style={styles.winnerLabel}>Capitaine des Sept Mers!</Text>
          </View>
        )}

        <View style={styles.leaderboard}>
          <Text style={styles.leaderboardTitle}>Classement Final</Text>
          {sortedPlayers.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerScore}>{gameState.playerScores[player.id] || 0}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Nouvelle Partie"
          variant="primary"
          onPress={() => router.replace('/(tabs)')}
        />
        <Button
          title="Retour à l'Accueil"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </SafeAreaView>
  );
}

