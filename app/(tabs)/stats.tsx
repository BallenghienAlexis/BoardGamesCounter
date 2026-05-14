import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useStats } from '@/src/contexts/StatsContext';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/PageHeader';
import type { GameMode } from '@/src/types/SkullKing';

const GAME_MODE_NAMES: Record<GameMode, string> = {
  base: '⚓ Jeu de Base',
  'base-extension': '🌊 Jeu de Base + Extension',
  incremental: '📊 Mode Incremental',
  rascal: '🎲 Mode Rascal',
};

// Helper to get full game label (game type + mode)
const getFullGameLabel = (mode: GameMode | null) => {
  if (!mode) return 'N/A';
  const modeLabel = GAME_MODE_NAMES[mode];
  return `💀 Skull King - ${modeLabel}`;
};

export default function StatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { stats, loadStats } = useStats();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  useFocusEffect(() => {
    loadStats();
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingVertical: 16,
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
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    cardHighlight: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statRowLast: {
      borderBottomWidth: 0,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    statHighlight: {
      fontSize: 18,
      color: colors.primary,
    },
    modeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: colors.border,
    },
    modeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    modeButtonTextActive: {
      color: colors.background,
    },
    playerName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: colors.surfaceLight,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
    },
    toggleContainer: {
      flexDirection: 'row',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    toggleButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    toggleButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
    },
    toggleButtonTextActive: {
      color: colors.background,
    },
  });

  if (!stats) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <PageHeader title="Statistiques" subtitle="Score et victoires" />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chargement des statistiques...</Text>
        </View>
      </View>
    );
  }

  if (stats.totalGamesPlayed === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <PageHeader title="Statistiques" subtitle="Score et victoires" />
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>
            Jouez des parties pour voir vos statistiques apparaître ici!
          </Text>
        </View>
      </View>
    );
   }

    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <PageHeader title="Statistiques" subtitle="Score et victoires" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
         {/* STATS GLOBALES */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>📈 Vue Globale</Text>
           <View style={[styles.card, styles.cardHighlight]}>
             <View style={styles.statRow}>
               <Text style={[styles.playerName, { color: colors.background }]}>Parties jouées</Text>
               <Text style={[styles.statValue, { color: colors.background, fontSize: 24 }]}>
                 {stats.totalGamesPlayed}
               </Text>
             </View>
           </View>
            <View style={styles.card}>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Jeu préféré</Text>
                <Text style={styles.statValue}>
                  {getFullGameLabel(stats.favoriteMode)}
                </Text>
              </View>
            </View>
         </View>

         {/* CLASSEMENT GLOBAL DES JOUEURS */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>👥 Classement des Joueurs</Text>
           {Object.values(stats.playerStats)
             .sort((a, b) => b.wins - a.wins)
             .map((playerStats, idx) => (
               <View key={playerStats.playerId} style={styles.card}>
                 <View style={styles.statRow}>
                   <View style={{ flex: 1 }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                       <Text style={[styles.sectionTitle, { marginBottom: 0, fontSize: 14 }]}>
                         #{idx + 1}
                       </Text>
                       <Text style={styles.playerName}>{playerStats.playerName}</Text>
                     </View>
                   </View>
                   <Text style={[styles.statValue, styles.statHighlight]}>
                     {playerStats.wins}W
                   </Text>
                 </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Parties jouées</Text>
                    <Text style={styles.badgeText}>{playerStats.totalGames}</Text>
                  </View>
                  <View style={[styles.statRow, styles.statRowLast]}>
                    <Text style={styles.statLabel}>Taux de victoire</Text>
                    <Text style={styles.badgeText}>{playerStats.winRate.toFixed(0)}%</Text>
                  </View>
               </View>
             ))}
         </View>

          {/* MODES DE JEU */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Skull King - Variantes</Text>

            {/* SKULL KING */}
            <View style={{ marginBottom: 0 }}>
              <View style={{ marginLeft: 0, gap: 8 }}>
                {(['base', 'base-extension', 'incremental', 'rascal'] as GameMode[]).map(mode => {
                  const modeStats = stats.stats[mode];
                  const isSelected = selectedMode === mode;

                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setSelectedMode(isSelected ? null : mode)}
                    >
                      <View style={[styles.modeButton, isSelected && styles.modeButtonActive]}>
                        <Text style={[styles.modeButtonText, isSelected && styles.modeButtonTextActive]}>
                          {GAME_MODE_NAMES[mode]}
                        </Text>
                        <View style={[styles.badge, isSelected && { backgroundColor: colors.background + '30' }]}>
                          <Ionicons
                            name="game-controller"
                            size={12}
                            color={isSelected ? colors.background : colors.textSecondary}
                          />
                          <Text style={[styles.badgeText, { color: isSelected ? colors.background : undefined }]}>
                            {modeStats.totalGames} parties
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* DÉTAILS DU MODE SÉLECTIONNÉ */}
          {(() => {
            if (!selectedMode) return null;
            const modeStats = stats.stats[selectedMode];
            if (modeStats.totalGames === 0) return null;

            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  💀 Skull King - {GAME_MODE_NAMES[selectedMode]}
                </Text>

               {/* STATISTIQUES GLOBALES DU MODE */}
               <View style={styles.card}>
                 <View style={styles.statRow}>
                   <Text style={styles.statLabel}>Parties jouées</Text>
                   <Text style={styles.statValue}>{modeStats.totalGames}</Text>
                 </View>
                 <View style={styles.statRow}>
                   <Text style={styles.statLabel}>Joueurs différents</Text>
                   <Text style={styles.statValue}>{modeStats.totalPlayers}</Text>
                 </View>
                 <View style={[styles.statRow, styles.statRowLast]}>
                   <Text style={styles.statLabel}>Joueurs par partie (moy.)</Text>
                   <Text style={styles.statValue}>
                     {(modeStats.totalPlayers / modeStats.totalGames).toFixed(1)}
                   </Text>
                 </View>
               </View>

               {/* TOP PLAYERS POUR CE MODE */}
               <Text style={[styles.sectionTitle, { marginTop: 12 }]}>🏆 Meilleurs Joueurs de ce Mode</Text>
               {Object.values(modeStats.playerStats)
                 .sort((a: any, b: any) => b.wins - a.wins)
                 .slice(0, 5)
                 .map((playerStats: any, idx: number) => (
                   <View key={playerStats.playerId} style={styles.card}>
                     <View style={styles.statRow}>
                       <View style={{ flex: 1 }}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                           <Text style={[styles.sectionTitle, { marginBottom: 0, fontSize: 14 }]}>
                             #{idx + 1}
                           </Text>
                           <Text style={styles.playerName}>{playerStats.playerName}</Text>
                         </View>
                       </View>
                       <Text style={[styles.statValue, styles.statHighlight]}>
                         {playerStats.wins}W
                       </Text>
                     </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Parties</Text>
                        <Text style={styles.badgeText}>{playerStats.totalGames}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Taux de victoire</Text>
                        <Text style={styles.badgeText}>{playerStats.winRate.toFixed(0)}%</Text>
                      </View>
                      <View style={[styles.statRow, styles.statRowLast]}>
                        <Text style={styles.statLabel}>Meilleur/Pire</Text>
                        <Text style={styles.badgeText}>
                          {playerStats.bestScore}/{playerStats.worstScore}
                        </Text>
                      </View>
                   </View>
                 ))}
             </View>
           );
         })()}

         <View style={{ height: 20 }} />
       </ScrollView>
     </View>
   );
 }

