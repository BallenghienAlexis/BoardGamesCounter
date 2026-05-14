import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { useStats } from '@/src/contexts/StatsContext';
import { Button } from '@/src/components/Button';
import { PageHeader } from '@/src/components/PageHeader';
import type { PlayerGameResult } from '@/src/types/Stats';

export default function GameEndScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { gameState, resetGameWithSamePlayers } = useSkullKingGame();
  const { recordGameResult } = useStats();
  const insets = useSafeAreaInsets();

   const sortedPlayers = useMemo(() => {
     if (!gameState) return [];
     return [...gameState.players]
       .filter(p => !p.id.includes('ghost')) // Filter out ghost player
       .sort((a, b) => {
         const scoreA = gameState.playerScores[a.id] || 0;
         const scoreB = gameState.playerScores[b.id] || 0;
         return scoreB - scoreA;
       });
   }, [gameState]);

   // Enregistrer les résultats de la partie quand la page est chargée
   useEffect(() => {
     if (gameState && sortedPlayers.length > 0) {
       const playerResults: PlayerGameResult[] = sortedPlayers.map((player, idx) => ({
         playerId: player.id,
         playerName: player.name,
         finalScore: gameState.playerScores[player.id] || 0,
         rank: idx + 1,
         isWinner: idx === 0, // Premier joueur est le gagnant
         gameMode: gameState.config.mode,
         timestamp: new Date().toISOString(),
         gameId: gameState.gameId,
       }));

       recordGameResult(gameState.gameId, gameState.config.mode, playerResults).catch(
         error => console.warn('Could not record game result:', error)
       );
     }
   }, [gameState, sortedPlayers, recordGameResult]);

  if (!gameState) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <PageHeader title="🎉 Partie Terminée" subtitle="Bravo à tous les pirates!" size="large" />

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
           onPress={() => {
             resetGameWithSamePlayers();
             router.replace('/skull-king/game-setup');
           }}
         />
         <Button
           title="Retour à l'Accueil"
           variant="secondary"
           onPress={() => router.replace('/(tabs)')}
         />
       </View>
    </View>
  );
}




