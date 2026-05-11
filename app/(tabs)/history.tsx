import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { LineChart } from 'react-native-chart-kit';
import { PageHeader } from '@/src/components/PageHeader';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { gameState, getUnfinishedGames } = useSkullKingGame();
  const [unfinishedGames, setUnfinishedGames] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const games = await getUnfinishedGames();
      setUnfinishedGames(games);
      if (games.length > 0) {
        setSelectedGameId(games[0].gameId);
      }
    } catch (error) {
      console.warn('Could not load games:', error);
    }
  };

  const selectedGame = unfinishedGames.find(g => g.gameId === selectedGameId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingVertical: 16,
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    gameList: {
      gap: 8,
    },
    gameItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 2,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    gameItemActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    gameInfo: {
      flex: 1,
    },
    gameName: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    gameStats: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 4,
    },
    chartContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    statCard: {
      flex: 1,
      minWidth: '48%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Poppins_700Bold',
    },
    emptyState: {
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
      marginTop: 16,
    },
  });

  const buildChartData = (game: any) => {
    if (!game.rounds || game.rounds.length === 0) {
      return null;
    }

    const roundLabels = game.rounds.map((_, idx) => `M${idx + 1}`);
    const datasets = game.players
      .filter((p: any) => !p.id.includes('ghost'))
      .map((player: any) => {
        const data: number[] = [];
        let cumulativeScore = 0;

        game.rounds.forEach((round: any) => {
          cumulativeScore += round.roundScores[player.id] || 0;
          data.push(cumulativeScore);
        });

        return {
          data,
          strokeWidth: 2,
          color: () => colors.primary,
          label: player.name,
        };
      });

    return {
      labels: roundLabels,
      datasets: datasets,
    };
  };

  const chartData = selectedGame ? buildChartData(selectedGame) : null;
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <PageHeader title="Historique" subtitle="Évolution des parties" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {unfinishedGames.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document" size={64} color={colors.primary} />
            <Text style={styles.emptyText}>
              Aucune partie en cours
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Parties en Cours</Text>
              <View style={styles.gameList}>
                {unfinishedGames.map(game => (
                  <TouchableOpacity
                    key={game.gameId}
                    style={[styles.gameItem, selectedGameId === game.gameId && styles.gameItemActive]}
                    onPress={() => setSelectedGameId(game.gameId)}
                  >
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>
                        {game.config.mode === 'incremental' ? '📊' : '⚓'} Manche {game.currentRound}/{game.config.cardsPerRound.length}
                      </Text>
                      <Text style={styles.gameStats}>
                        {game.players.filter((p: any) => !p.id.includes('ghost')).length} joueur(s)
                      </Text>
                    </View>
                    {selectedGameId === game.gameId && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedGame && chartData && (
              <>
                <View style={styles.section}>
                  <Text style={styles.chartTitle}>📈 Évolution des Scores</Text>
                  <View style={styles.chartContainer}>
                    <LineChart
                      data={chartData}
                      width={screenWidth}
                      height={220}
                      chartConfig={{
                        backgroundColor: colors.surface,
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 0,
                        color: () => colors.primary,
                        labelColor: () => colors.textSecondary,
                        style: {
                          borderRadius: 12,
                        },
                        propsForDots: {
                          r: '4',
                          strokeWidth: '2',
                          stroke: colors.primary,
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '0',
                          stroke: colors.border,
                          strokeWidth: 1,
                        },
                      }}
                      style={{
                        marginVertical: 8,
                        borderRadius: 12,
                      }}
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.chartTitle}>📊 État Actuel</Text>
                  <View style={styles.statsGrid}>
                    {selectedGame.players
                      .filter((p: any) => !p.id.includes('ghost'))
                      .sort((a: any, b: any) => (selectedGame.playerScores[b.id] || 0) - (selectedGame.playerScores[a.id] || 0))
                      .map((player: any, idx: number) => (
                        <View key={player.id} style={styles.statCard}>
                          <Text style={styles.statLabel}>
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {player.name}
                          </Text>
                          <Text style={styles.statValue}>
                            {selectedGame.playerScores[player.id] || 0} pts
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

