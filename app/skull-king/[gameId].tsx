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
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { AlertModal } from '@/src/components/AlertModal';
import { Button } from '@/src/components/Button';
import {
  calculateSkullKingScore,
  calculateIncrementalScore,
  calculateRascalScore,
} from '@/src/utils/SkullKingRules';
import { type RoundBonus, type TreasureAllianceBonus } from '@/src/types/SkullKing';

export default function SkullKingGameScreen(){
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { gameState, updateRoundScore, nextRound } = useSkullKingGame();
  const insets = useSafeAreaInsets();

  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'bet' | 'tricks' | 'bonus' | 'summary'>('bet');
  const [playerData, setPlayerData] = useState<Record<string, {
    bet: number;
    tricks: number;
    bonuses: Partial<RoundBonus>;
  }>>({});
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});
  const [showExitAlert, setShowExitAlert] = useState(false);

  // Détermine si la phase bonus doit être affichée (non affiché en mode incremental)
  const isIncrementalMode = gameState?.config.mode === 'incremental';

  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    }
  }, [gameState, router]);

  if (!gameState) {
    return null;
  }

   const maxCards = gameState.config.cardsPerRound[currentRound - 1];

   // Filter out ghost player from displayed players (for bet/tricks/bonus phases)
   const playersToDisplay = gameState.players.filter(p => !p.id.includes('ghost'));

   // But include ghost for scoring calculations

  const handleExitGame = () => {
    setShowExitAlert(true);
  };

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
      const bonusValue = prev[playerId]?.bonuses[bonusType];
      // Handle treasureAlliance specially - always treat as number for UI
      let newValue: number;
      if (bonusType === 'treasureAlliance') {
        const current = typeof bonusValue === 'number' ? bonusValue : 0;
        newValue = Math.max(0, current + increment);
      } else {
        const current = (typeof bonusValue === 'number' ? bonusValue : 0) as number;
        newValue = Math.max(0, current + increment);
      }

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

    // Build bets and tricks maps for alliance verification
    const playerBets: Record<string, number> = {};
    const playerTricks: Record<string, number> = {};
    gameState.players.forEach(player => {
      playerBets[player.id] = playerData[player.id]?.bet || 0;
      playerTricks[player.id] = playerData[player.id]?.tricks || 0;
    });

    gameState.players.forEach(player => {
      const bet = playerData[player.id]?.bet || 0;
      const tricks = playerData[player.id]?.tricks || 0;
      const bonuses = playerData[player.id]?.bonuses || {};

      let score = 0;
      if (gameState.config.mode === 'incremental') {
        score = calculateIncrementalScore(bet, tricks);
      } else if (gameState.config.scoringSystem === 'rascal') {
        const isExtension = gameState.config.mode === 'base-extension';
        const result = calculateRascalScore(bet, tricks, maxCards, bonuses, false, isExtension, player.id, playerBets, playerTricks);
        score = result.totalScore;
      } else {
        const isExtension = gameState.config.mode === 'base-extension';
        const result = calculateSkullKingScore(bet, tricks, maxCards, bonuses, isExtension, player.id, playerBets, playerTricks);
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
      setPhase('bet');
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
    phaseInfo: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      marginHorizontal: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      borderRadius: 8,
    },
    phaseTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 6,
    },
    phaseDescription: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      lineHeight: 18,
      fontWeight: '500',
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
        <TouchableOpacity onPress={handleExitGame}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
         {/* PHASE 1: MISE */}
         {phase === 'bet' && (
           <>
             <View style={styles.phaseInfo}>
               <Text style={styles.phaseTitle}>📋 Phase 1: Mises</Text>
               <Text style={styles.phaseDescription}>
                 {`Chaque joueur annonce le nombre EXACT de plis qu'il pense remporter (0 à ${maxCards}).`}
               </Text>
             </View>
             {playersToDisplay.map(player => (
               <View key={player.id} style={styles.playerSection}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Mise</Text>
                  <View style={styles.inputGroup}>
                    <TouchableOpacity style={styles.button} onPress={() => updatePlayerField(player.id, 'bet', -1)}>
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.value}>
                      <Text style={styles.valueText}>{playerData[player.id]?.bet || 0}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => updatePlayerField(player.id, 'bet', 1)}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* PHASE 2: LEVÉES */}
        {phase === 'tricks' && (
          <>
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseTitle}>🎯 Phase 2: Levées Remportées</Text>
              <Text style={styles.phaseDescription}>
                Saisissez le nombre RÉEL de plis remportés. Total = {maxCards} cartes.
              </Text>
            </View>
            {gameState.players.map(player => (
              <View key={player.id} style={styles.playerSection}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Mise: {playerData[player.id]?.bet || 0} plis
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Levées</Text>
                  <View style={styles.inputGroup}>
                    <TouchableOpacity style={styles.button} onPress={() => updatePlayerField(player.id, 'tricks', -1)}>
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.value}>
                      <Text style={styles.valueText}>{playerData[player.id]?.tricks || 0}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => updatePlayerField(player.id, 'tricks', 1)}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

         {/* PHASE 3: BONUS - NON AFFICHÉ EN MODE INCREMENTAL */}
         {phase === 'bonus' && !isIncrementalMode && (
           <>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseTitle}>🎁 Phase 3: Points Bonus</Text>
                <Text style={styles.phaseDescription}>
                  {`Les bonus s'ajoutent indépendamment de la mise (sauf le Butin):`}
                </Text>
              </View>
             <View style={[styles.playerSection, { marginHorizontal: 16, marginBottom: 12 }]}>
               <Text style={styles.playerName}>📌 Règles du Scoring</Text>
               {gameState.config.scoringSystem === 'rascal' ? (
                 <Text style={[styles.phaseDescription, { marginVertical: 8 }]}>
                   {`Potentiel: ${maxCards * 10} pts (${maxCards} × 10pts/carte)\n• Coup direct (exacte): 100% = ${maxCards * 10} pts\n• Frappe à revers (±1): 50% = ${maxCards * 5} pts\n• Échec cuisant (±2+): 0 pts\n\nLes bonus s'appliquent: 100% en coup direct, 50% en frappe, 0% en échec`}
                 </Text>
               ) : (
                  <Text style={[styles.phaseDescription, { marginVertical: 8 }]}>
                    {`• Mise exacte: +20 × plis remportés\n• Mise 0 exacte: +10 × cartes\n• Écart: -10 points par différence\n• Bonus: ajoutés indépendamment de la mise`}
                  </Text>
               )}
              </View>


              {playersToDisplay.map(player => (
                <View key={player.id} style={styles.playerSection}>
                 <Text style={styles.playerName}>{player.name}</Text>
                 <View style={styles.bonusSection}>
                   <View style={styles.bonusGrid}>
                     {[
                       { key: 'card14Regular' as const, label: '14 régulières' },
                       { key: 'card14Black' as const, label: '14 noir' },
                       { key: 'sirenCapturedByPirate' as const, label: 'Sirènes (P)' },
                       { key: 'pirateCapturedBySkullKing' as const, label: 'Pirates (SK)' },
                       { key: 'sirenCapturedSkullKing' as const, label: 'SK (Sirène)' },
                       ...(gameState.config.mode === 'base-extension' ? [
                         { key: 'secondCaptured' as const, label: 'Second capturé' },
                         { key: 'davyJonesCasketCount' as const, label: 'Casier DJ (léviathan)' },
                         { key: 'eightCardBonus' as const, label: 'Cartes 8' },
                         { key: 'sevenCardBonus' as const, label: 'Cartes 7' },
                       ] : []),
                     ].map(bonus => (
                       <View key={bonus.key} style={styles.bonusItem}>
                         <Text style={styles.bonusLabel}>{bonus.label}</Text>
                         <View style={styles.inputGroup}>
                           <TouchableOpacity style={[styles.button, { width: 26, height: 26 }]} onPress={() => updateBonus(player.id, bonus.key, -1)}>
                             <Ionicons name="remove" size={14} color={colors.text} />
                           </TouchableOpacity>
                            <View style={[styles.value, { minWidth: 32 }]}>
                              <Text style={[styles.valueText, { fontSize: 12 }]}>
                                {(() => {
                                  const value = playerData[player.id]?.bonuses[bonus.key];
                                  return typeof value === 'number' ? value : 0;
                                })()}
                              </Text>
                            </View>
                           <TouchableOpacity style={[styles.button, { width: 26, height: 26 }]} onPress={() => updateBonus(player.id, bonus.key, 1)}>
                             <Ionicons name="add" size={14} color={colors.text} />
                           </TouchableOpacity>
                         </View>
                       </View>
                     ))}
                   </View>
                 </View>
                </View>
              ))}

              {/* TREASURE ALLIANCE SELECTION */}
              <View style={[styles.playerSection, { marginHorizontal: 16, marginBottom: 12 }]}>
                <Text style={styles.playerName}>📋 Important - Butin</Text>
                 <Text style={[styles.phaseDescription, { marginVertical: 8 }]}>
                   {`La carte Butin crée une ALLIANCE. Si vous jouez Butin et que l'autre joueur la remporte, vous gagnez CHACUN +20 pts de bonus SEULEMENT si vous misez TOUS LES DEUX correctement.`}
                 </Text>
               </View>

               <View style={[styles.playerSection, { marginHorizontal: 16, marginBottom: 12 }]}>
                 <Text style={styles.playerName}>💎 Sélectionner les Alliances Butin</Text>
                 <Text style={[styles.phaseDescription, { marginVertical: 8, fontSize: 12 }]}>
                   Sélectionnez qui a remporté le butin joué par chaque joueur
                 </Text>
                 {playersToDisplay.map(player => (
                   <View key={`treasure-${player.id}`} style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                     <Text style={[styles.bonusLabel, { marginBottom: 8 }]}>
                       🎯 {player.name} a joué Butin, remporté par:
                     </Text>
                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                       {playersToDisplay.filter(p => p.id !== player.id).map(otherPlayer => {
                         const alliances = playerData[player.id]?.bonuses?.treasureAlliance;
                         const isSelected = Array.isArray(alliances) && alliances.some(
                           (a: TreasureAllianceBonus) => a.playedBy === player.id && a.wonBy === otherPlayer.id
                         );

                         return (
                           <TouchableOpacity
                             key={`alliance-${player.id}-${otherPlayer.id}`}
                             style={[
                               { borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: isSelected ? colors.primary : colors.surface },
                             ]}
                             onPress={() => {
                               // Toggle treasure alliance selection
                               setPlayerData(prev => {
                                 const current = prev[player.id]?.bonuses?.treasureAlliance;
                                 const newAlliances = Array.isArray(current) ? [...current] : [];

                                 const allianceIndex = newAlliances.findIndex(
                                   (a: TreasureAllianceBonus) => a.playedBy === player.id && a.wonBy === otherPlayer.id
                                 );

                                 if (allianceIndex >= 0) {
                                   newAlliances.splice(allianceIndex, 1);
                                 } else {
                                   newAlliances.push({
                                     playedBy: player.id,
                                     wonBy: otherPlayer.id,
                                   });
                                 }

                                 return {
                                   ...prev,
                                   [player.id]: {
                                     ...prev[player.id] || { bet: 0, tricks: 0 },
                                     bonuses: {
                                       ...prev[player.id]?.bonuses,
                                       treasureAlliance: newAlliances.length > 0 ? newAlliances : 0
                                     }
                                   }
                                 };
                               });
                             }}
                           >
                             <Text style={[
                               styles.bonusLabel,
                               {
                                 color: isSelected ? colors.text : colors.textSecondary,
                                 fontWeight: isSelected ? '700' : '600'
                               }
                             ]}>
                               {otherPlayer.name}
                             </Text>
                           </TouchableOpacity>
                         );
                       })}
                     </View>
                   </View>
                 ))}
               </View>
            </>
          )}

          {/* PHASE 4: RÉSUMÉ */}
         {phase === 'summary' && (
           <>
             <View style={styles.phaseInfo}>
               <Text style={styles.phaseTitle}>📊 Résumé des Scores</Text>
               {isIncrementalMode ? (
                 <Text style={styles.phaseDescription}>
                   Calcul: +1 si mise exacte, -1 sinon
                 </Text>
               ) : (
                 <Text style={styles.phaseDescription}>
                   Calcul: Mise exacte (+20×plis, 0 exact +10×cartes) - Écart (-10×différence) + Bonus
                 </Text>
               )}
             </View>
              {playersToDisplay.map(player => {
                const roundScore = roundScores[player.id] || 0;
                // Score cumulé de tous les manches précédentes (déjà stocké dans gameState.playerScores)
                const previousTotalScore = gameState.playerScores[player.id] || 0;
                // Total = score précédent + score de cette manche
                const totalScore = previousTotalScore + roundScore;

                return (
                  <View key={player.id} style={styles.summaryContainer}>
                    <Text style={styles.summaryName}>{player.name}</Text>
                    <Text style={[styles.phaseDescription, { marginBottom: 8 }]}>
                      Mise: {playerData[player.id]?.bet || 0} | Levées réelles: {playerData[player.id]?.tricks || 0}
                    </Text>
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <Text style={[styles.phaseDescription]}>
                          Score manche:
                        </Text>
                        <Text style={[styles.summaryScore, { fontSize: 18 }]}>
                          {isIncrementalMode
                            ? (playerData[player.id]?.bet === playerData[player.id]?.tricks ? '+1' : '-1')
                            : `${roundScore > 0 ? '+' : ''}${roundScore}`
                          }
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, backgroundColor: colors.primary + '20', paddingHorizontal: 12, borderRadius: 8 }}>
                        <Text style={[styles.phaseDescription, { fontWeight: '700', flex: 1 }]}>
                          Total:
                        </Text>
                        <Text style={[styles.summaryScore, { fontSize: 20, fontWeight: '700', color: colors.primary }]}>
                          {totalScore > 0 ? '+' : ''}{totalScore}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
           </>
         )}
      </ScrollView>

       <View style={styles.footer}>
         {phase === 'bet' && (
           <Button
             title="Suivant: Levées"
             variant="primary"
             onPress={() => setPhase('tricks')}
           />
         )}

         {phase === 'tricks' && (
           <>
             <Button
               title="Retour: Mises"
               variant="secondary"
               onPress={() => setPhase('bet')}
             />
             <Button
               title={isIncrementalMode ? 'Calculer les Scores' : 'Suivant: Bonus'}
               variant="primary"
               onPress={() => (isIncrementalMode ? calculateScores() : setPhase('bonus'))}
             />
           </>
         )}

         {phase === 'bonus' && !isIncrementalMode && (
           <>
             <Button
               title="Retour: Levées"
               variant="secondary"
               onPress={() => setPhase('tricks')}
             />
             <Button
               title="Calculer les Scores"
               variant="primary"
               onPress={calculateScores}
             />
           </>
         )}

         {phase === 'summary' && (
           <Button
             title={currentRound < gameState.config.cardsPerRound.length ? 'Manche Suivante' : 'Fin de Partie'}
             variant="primary"
             onPress={handleNextRound}
           />
          )}
        </View>

      <AlertModal
        visible={showExitAlert}
        title="Quitter la partie"
        message="Êtes-vous sûr de vouloir quitter la partie ? La partie sera sauvegardée et vous pourrez la reprendre plus tard."
        buttons={[
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Quitter',
            style: 'destructive',
            onPress: () => router.replace('/'),
          },
        ]}
        onDismiss={() => setShowExitAlert(false)}
      />
     </View>
   );
 }

