import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGames } from '@/src/contexts/GameContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { ScoreInput } from '@/src/components/ScoreInput';
import { PlayerCard } from '@/src/components/PlayerCard';
import { Button } from '@/src/components/Button';

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { games, updatePlayerScore, undoLastMove, resetGame } = useGames();
  const { colors } = useTheme();
  const [showScores, setShowScores] = useState(false);

  const game = useMemo(() => games.find(g => g.id === gameId), [games, gameId]);

  // Sort players by score (descending)
  const sortedPlayers = useMemo(() => {
    if (!game) return [];
    return [...game.players].sort((a, b) => b.score - a.score);
  }, [game]);

  if (!game) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Jeu non trouvé</Text>
          <Button title="Retour" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      flex: 1,
    },
    gameTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    roundBadge: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 4,
    },
    headerRight: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      padding: 8,
    },
    scoreboardButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreboardButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
    content: {
      flex: 1,
    },
    scorecards: {
      paddingVertical: 8,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    playersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
    },
    footerActions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
      flex: 1,
    },
  });


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.gameTitle}>{game.name}</Text>
            <Text style={styles.roundBadge}>Manche {game.rounds}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.scoreboardButton}
            onPress={() => setShowScores(!showScores)}
          >
            <Ionicons
              name={showScores ? 'close' : 'list'}
              size={16}
              color={colors.text}
            />
            <Text style={styles.scoreboardButtonText}>
              {showScores ? 'Fermer' : 'Score'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setResetModalVisible(true)}
          >
            <Ionicons name="refresh" size={20} color={colors.warning} />
          </TouchableOpacity>
        </View>
      </View>

      {showScores ? (
        <View style={styles.content}>
          <ScrollView style={styles.scorecards}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 12 }}>
              <View style={styles.playersGrid}>
                {sortedPlayers.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    totalPlayers={game.players.length}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scrollContent}>
            {game.players.map(player => (
              <ScoreInput
                key={player.id}
                playerName={player.name}
                currentScore={player.score}
                onAddScore={(amount: number) =>
                  updatePlayerScore(gameId, player.id, amount)
                }
                onUndo={() => undoLastMove(gameId, player.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.footerActions}>
        <Button
          title="Nouvelle manche"
          variant="success"
          style={styles.footerButton}
          onPress={() => {
            // Reset all scores but increment rounds
            resetGame(gameId);
          }}
        />
        <Button
          title="Terminer"
          variant="danger"
          style={styles.footerButton}
          onPress={() => {
            Alert.alert(
              'Terminer le jeu',
              `${sortedPlayers[0].name} a remporté la victoire ! 🎉`,
              [
                {
                  text: 'Retour',
                  onPress: () => router.back(),
                  style: 'default',
                },
              ]
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

