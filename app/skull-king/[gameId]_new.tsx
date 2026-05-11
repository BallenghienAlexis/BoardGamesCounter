import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSkullKingGame } from '../../src/contexts/SkullKingContext';
import { Button } from '../../src/components/Button';
import {
  calculateSkullKingScore,
  calculateIncrementalScore,
  type RoundBonus,
} from '../../src/utils/SkullKingRules';

export default function SkullKingGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { gameState, updateRoundScore, nextRound } = useSkullKingGame();
  const insets = useSafeAreaInsets();

  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'input' | 'summary'>('input');
  const [playerData, setPlayerData] = useState<Record<string, {
    bet: number;
    tricks: number;
    bonuses: Partial<RoundBonus>;
  }>>({});
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    }
  }, [gameState, router]);

  if (!gameState) {
    return null;
  }

  const maxCards = gameState.config.cardsPerRound[currentRound - 1];

  const updatePlayerField = (playerId: string, field: 'bet' | 'tricks', increment: number) => {
    setPlayerData(prev => {
      const current = prev[playerId]?.[field] || 0;
      const newValue = Math.max(0, Math.min(maxCards, current + increment));
      return {
        ...prev,
        [playerId]: { ...prev[playerId] || { bonuses: {} }, [field]: newValue }
      };
    });
  };

  const updateBonus = (playerId: string, bonusType: keyof RoundBonus, increment: number) => {
    setPlayerData(prev => {
      const current = prev[playerId]?.bonuses[bonusType] || 0;
      const newValue = Math.max(0, current + increment);
      return {
        ...prev,
        [playerId]: {
          ...prev[playerId] || { bet: 0, tricks: 0 },
          bonuses: { ...prev[playerId]?.bonuses, [bonusType]: newValue }
        }
      };
    });
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {};

    gameState.players.forEach(player => {
      const bet = playerData[player.id]?.bet || 0;
      const tricks = playerData[player.id]?.tricks || 0;
      const bonuses = playerData[player.id]?.bonuses || {};

      let score = 0;
      if (gameState.config.mode === 'incremental') {
        score = calculateIncrementalScore(bet, tricks);
      } else {
        const result = calculateSkullKingScore(bet, tricks, maxCards, bonuses);
        score = result.totalScore;
      }

      scores[player.id] = score;
    });

    setRoundScores(scores);
    setPhase('summary');
  };

  const handleNextRound = () => {
    Object.entries(roundScores).forEach(([playerId, score]) => {
      updateRoundScore(currentRound - 1, playerId, score);
    });

    if (currentRound < gameState.config.cardsPerRound.length) {
      nextRound();
      setCurrentRound(currentRound + 1);
      setPhase('input');
      setPlayerData({});
      setRoundScores({});
    } else {
      router.replace({
        pathname: '/skull-king/game-end',
        params: { gameId },
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    headerSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 1,
    },
    content: {
      flex: 1,
      paddingVertical: 12,
    },
    playerSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    playerName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
    },
    inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    button: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      minWidth: 40,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.surfaceLight,
      borderRadius: 6,
      alignItems: 'center',
    },
    valueText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    bonusSection: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bonusGrid: {
      gap: 6,
    },
    bonusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    bonusLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    summaryContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryName: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 8,
    },
    summaryScore: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: 'Poppins_700Bold',
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Manche {currentRound}</Text>
          <Text style={styles.headerSubtitle}>{maxCards} carte{maxCards > 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {phase === 'input' && (
          gameState.players.map(player => (
            <View key={player.id} style={styles.playerSection}>
              <Text style={styles.playerName}>{player.name}</Text>

              {/* Mise et Levées */}
              <View style={styles.row}>
                <Text style={styles.label}>Mise (0-{maxCards})</Text>
                <View style={styles.inputGroup}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePlayerField(player.id, 'bet', -1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.value}>
                    <Text style={styles.valueText}>{playerData[player.id]?.bet || 0}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePlayerField(player.id, 'bet', 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.row, { borderBottomWidth: 1 }]}>
                <Text style={styles.label}>Levées (0-{maxCards})</Text>
                <View style={styles.inputGroup}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePlayerField(player.id, 'tricks', -1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.value}>
                    <Text style={styles.valueText}>{playerData[player.id]?.tricks || 0}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => updatePlayerField(player.id, 'tricks', 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bonus */}
              <View style={styles.bonusSection}>
                <View style={styles.bonusGrid}>
                  {[
                    { key: 'card14Regular' as const, label: '14 régulières' },
                    { key: 'card14Black' as const, label: '14 noir' },
                    { key: 'sirenCapturedByPirate' as const, label: 'Sirènes (P)' },
                    { key: 'pirateCapturedBySkullKing' as const, label: 'Pirates (SK)' },
                    { key: 'sirenCapturedSkullKing' as const, label: 'SK (Sirène)' },
                    { key: 'treasureAlliance' as const, label: 'Butin' },
                  ].map(bonus => (
                    <View key={bonus.key} style={styles.bonusItem}>
                      <Text style={styles.bonusLabel}>{bonus.label}</Text>
                      <View style={styles.inputGroup}>
                        <TouchableOpacity
                          style={[styles.button, { width: 26, height: 26 }]}
                          onPress={() => updateBonus(player.id, bonus.key, -1)}
                        >
                          <Ionicons name="remove" size={14} color={colors.text} />
                        </TouchableOpacity>
                        <View style={[styles.value, { minWidth: 32 }]}>
                          <Text style={[styles.valueText, { fontSize: 12 }]}>
                            {playerData[player.id]?.bonuses[bonus.key] || 0}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.button, { width: 26, height: 26 }]}
                          onPress={() => updateBonus(player.id, bonus.key, 1)}
                        >
                          <Ionicons name="add" size={14} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}

        {phase === 'summary' && (
          gameState.players.map(player => (
            <View key={player.id} style={styles.summaryContainer}>
              <Text style={styles.summaryName}>{player.name}</Text>
              <Text style={styles.summaryScore}>
                {roundScores[player.id] || 0} points
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        {phase === 'input' && (
          <Button
            title="Calculer les Scores"
            variant="primary"
            onPress={calculateScores}
          />
        )}

        {phase === 'summary' && (
          <Button
            title={currentRound < gameState.config.cardsPerRound.length ? 'Manche Suivante' : 'Fin de Partie'}
            variant="primary"
            onPress={handleNextRound}
          />
        )}
      </View>
    </View>
  );
}

