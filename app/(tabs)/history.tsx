import React, { useState, useEffect, useCallback } from 'react';
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
import { PageHeader } from '@/src/components/PageHeader';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { getUnfinishedGames } = useSkullKingGame();
  const [unfinishedGames, setUnfinishedGames] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      const games = await getUnfinishedGames();
      setUnfinishedGames(games);
      if (games.length > 0) {
        setSelectedGameId(games[0].gameId);
      }
    } catch (error) {
      console.warn('Could not load games:', error);
    }
  }, [getUnfinishedGames]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

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

     const playerData: Record<string, { x: number; y: number }[]> = {};

    // Build dataset for each player
    game.players
      .filter((p: any) => !p.id.includes('ghost'))
      .forEach((player: any) => {
        const data: { x: number; y: number }[] = [];
        let cumulativeScore = 0;

        game.rounds.forEach((round: any, idx: number) => {
          cumulativeScore += round.roundScores[player.id] || 0;
          data.push({
            x: idx,
            y: cumulativeScore,
          });
        });

        playerData[player.id] = data;
      });

    return playerData;
  };

  const SimpleLineChart = ({
    allPlayerData,
    players,
    width = 300,
    height = 200,
  }: {
    allPlayerData: Record<string, { x: number; y: number }[]>;
    players: any[];
    width?: number;
    height?: number;
  }) => {
    if (!allPlayerData || Object.keys(allPlayerData).length === 0) return null;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Collect all data points to find min/max
    const allPoints = Object.values(allPlayerData).flat();
    const maxX = Math.max(...allPoints.map(d => d.x)) + 1;
    const maxY = Math.max(...allPoints.map(d => d.y), 1) * 1.1;

    // Color palette for different players
    const colors_palette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

    return (
      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <Svg width={width} height={height} style={{ backgroundColor: colors.surface, borderRadius: 8 }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <Line
              key={`hline-${i}`}
              x1={padding}
              y1={padding + (i * chartHeight / 4)}
              x2={width - padding}
              y2={padding + (i * chartHeight / 4)}
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Axes */}
          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke={colors.textSecondary}
            strokeWidth="2"
          />
          <Line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke={colors.textSecondary}
            strokeWidth="2"
          />

          {/* Line chart for each player */}
          {Object.entries(allPlayerData).map(([playerId, data], playerIdx) => {
            const playerColor = colors_palette[playerIdx % colors_palette.length];
            const points = data.map(d => ({
              screenX: padding + (d.x / maxX) * chartWidth,
              screenY: height - padding - (d.y / maxY) * chartHeight,
            }));

            return (
              <React.Fragment key={`player-${playerId}`}>
                {/* Lines */}
                {points.map((point, idx) => {
                  if (idx === points.length - 1) return null;
                  const nextPoint = points[idx + 1];
                  return (
                    <Line
                      key={`line-${playerId}-${idx}`}
                      x1={point.screenX}
                      y1={point.screenY}
                      x2={nextPoint.screenX}
                      y2={nextPoint.screenY}
                      stroke={playerColor}
                      strokeWidth="2.5"
                    />
                  );
                })}

                {/* Data points */}
                {points.map((point, idx) => (
                  <Circle
                    key={`dot-${playerId}-${idx}`}
                    cx={point.screenX}
                    cy={point.screenY}
                    r="3"
                    fill={playerColor}
                  />
                ))}
              </React.Fragment>
            );
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = Math.round((maxY / 4) * i);
            return (
              <SvgText
                key={`ylabel-${i}`}
                x={padding - 5}
                y={height - padding - (i * chartHeight / 4) + 3}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="end"
              >
                {value}
              </SvgText>
            );
          })}
        </Svg>

        {/* Legend */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, gap: 12 }}>
          {players
            .filter((p: any) => !p.id.includes('ghost'))
            .map((player: any, idx: number) => {
              const playerColor = colors_palette[idx % colors_palette.length];
              return (
                <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: playerColor,
                    }}
                  />
                  <Text style={[styles.statLabel, { marginBottom: 0 }]}>{player.name}</Text>
                </View>
              );
            })}
        </View>
      </View>
    );
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
                    <SimpleLineChart
                      allPlayerData={chartData}
                      players={selectedGame.players}
                      width={screenWidth}
                      height={250}
                    />
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

