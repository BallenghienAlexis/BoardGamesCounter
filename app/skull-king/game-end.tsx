import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { useStats } from '@/src/contexts/StatsContext';
import { Button } from '@/src/components/Button';
import { PageHeader } from '@/src/components/PageHeader';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
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

   const buildChartData = (game: any) => {
     if (!game.rounds || game.rounds.length === 0) {
       return null;
     }

     const playerData: Record<string, { x: number; y: number }[]> = {};

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

   const GameProgressChart = ({
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

     const allPoints = Object.values(allPlayerData).flat();
     const maxX = Math.max(...allPoints.map(d => d.x)) + 1;
     const maxY = Math.max(...allPoints.map(d => d.y), 1) * 1.1;

     const colors_palette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

     return (
       <View style={styles.chartContainer}>
         <Svg width={width} height={height} style={{ backgroundColor: colors.surface, borderRadius: 8 }}>
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

           {Object.entries(allPlayerData).map(([playerId, data], playerIdx) => {
             const playerColor = colors_palette[playerIdx % colors_palette.length];
             const points = data.map(d => ({
               screenX: padding + (d.x / maxX) * chartWidth,
               screenY: height - padding - (d.y / maxY) * chartHeight,
             }));

             return (
               <React.Fragment key={`player-${playerId}`}>
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

         <View style={styles.legendContainer}>
           {players
             .filter((p: any) => !p.id.includes('ghost'))
             .map((player: any, idx: number) => {
               const playerColor = colors_palette[idx % colors_palette.length];
               return (
                 <View key={player.id} style={styles.legendItem}>
                   <View
                     style={[
                       styles.legendColor,
                       { backgroundColor: playerColor },
                     ]}
                   />
                   <Text style={styles.legendLabel}>{player.name}</Text>
                 </View>
               );
             })}
         </View>
       </View>
     );
   };

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
     chartSection: {
       marginBottom: 24,
       backgroundColor: colors.surface,
       borderRadius: 12,
       padding: 12,
       borderWidth: 1,
       borderColor: colors.border,
     },
     chartTitle: {
       fontSize: 14,
       fontWeight: '700',
       color: colors.text,
       fontFamily: 'Poppins_700Bold',
       marginBottom: 12,
     },
     chartContainer: {
       alignItems: 'center',
     },
     legendContainer: {
       flexDirection: 'row',
       flexWrap: 'wrap',
       justifyContent: 'center',
       marginTop: 12,
       gap: 12,
     },
     legendItem: {
       flexDirection: 'row',
       alignItems: 'center',
       gap: 6,
     },
     legendColor: {
       width: 10,
       height: 10,
       borderRadius: 2,
     },
     legendLabel: {
       fontSize: 11,
       color: colors.textSecondary,
       fontFamily: 'Poppins_400Regular',
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

         {(() => {
           const chartData = buildChartData(gameState);
           const screenWidth = Dimensions.get('window').width - 32;
           return chartData ? (
             <View style={styles.chartSection}>
               <Text style={styles.chartTitle}>📈 Évolution de la Partie</Text>
               <GameProgressChart
                 allPlayerData={chartData}
                 players={gameState.players}
                 width={screenWidth}
                 height={220}
               />
             </View>
           ) : null;
         })()}

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




