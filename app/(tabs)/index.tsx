import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { useGames } from '@/src/contexts/GameContext';
import { AlertModal } from '@/src/components/AlertModal';
import { PlayerSetupModal } from '@/src/components/PlayerSetupModal';
import { PageHeader } from '@/src/components/PageHeader';
import { GameMode, SkullKingGameConfig, SkullKingGameState } from '@/src/types/SkullKing';

interface GameVariant {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
}

interface GameFolder {
  id: string;
  name: string;
  icon: string;
  variants: GameVariant[];
}

const GAME_FOLDERS: GameFolder[] = [
  {
    id: 'skull-king',
    name: 'Skull King',
    icon: '🏴‍☠️',
    variants: [
      {
        id: 'base',
        name: 'Jeu de Base',
        description: 'Les règles classiques',
        icon: '⚓',
      },
      {
        id: 'base-extension',
        name: 'Jeu de Base + Extension',
        description: 'Avec cartes additionnelles',
        icon: '🌊',
      },
      {
        id: 'incremental',
        name: 'Mode Incremental',
        description: 'Scoring simplifié: +1/-1',
        icon: '📊',
      },
      {
        id: 'rascal' as unknown as GameMode,
        name: 'Mode Rascal',
        description: 'Scoring équilibré (coup direct/frappe/échec)',
        icon: '🎲',
      },
    ],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { createSkullKingGame, getUnfinishedGames, loadGameState, deleteGame: deleteSkullKingGame } = useSkullKingGame();
  const { games: genericGames, deleteGame: deleteGenericGame } = useGames();
  const insets = useSafeAreaInsets();

  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [unfinishedGames, setUnfinishedGames] = useState<SkullKingGameState[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  // Alert states
  const [showDeleteSkullKingAlert, setShowDeleteSkullKingAlert] = useState<string | null>(null);
  const [showDeleteGenericAlert, setShowDeleteGenericAlert] = useState<string | null>(null);
  const [showTwoPlayerAlert, setShowTwoPlayerAlert] = useState<{ players: { id: string; name: string }[] } | null>(null);

  const loadUnfinishedGames = useCallback(async () => {
    setLoadingGames(true);
    try {
      const games = await getUnfinishedGames();
      setUnfinishedGames(games);
    } catch (error) {
      console.warn('Could not load unfinished games:', error);
      setUnfinishedGames([]);
    } finally {
      setLoadingGames(false);
    }
  }, [getUnfinishedGames]);

  useFocusEffect(
    useCallback(() => {
      loadUnfinishedGames();
    }, [loadUnfinishedGames])
  );

  const handleDeleteSkullKingGame = (gameId: string) => {
    setShowDeleteSkullKingAlert(gameId);
  };

  const handleDeleteGenericGame = (gameId: string) => {
    setShowDeleteGenericAlert(gameId);
  };

  const handleResumeGame = async (gameId: string) => {
    try {
      await loadGameState(gameId);
      router.push({
        pathname: '/skull-king/[gameId]',
        params: { gameId },
      });
    } catch (error) {
      console.error('Could not resume game:', error);
    }
  };

  const handleResumeGenericGame = (gameId: string) => {
    router.push({
      pathname: '/[gameId]',
      params: { gameId },
    });
  };

  const handleSelectGameMode = (mode: GameMode) => {
    setSelectedGameMode(mode);
    setShowPlayerSetup(true);
  };

   const handlePlayersSelected = (players: { id: string; name: string }[]) => {
     if (!selectedGameMode) return;

     // If exactly 2 players, ask about 2-player ghost variant
     if (players.length === 2) {
       setShowTwoPlayerAlert({ players });
     } else {
       createGameWithPlayers(players, false);
     }
   };

   const createGameWithPlayers = (players: { id: string; name: string }[], useTwoPlayerGhost: boolean) => {
     if (!selectedGameMode) return;

    const cardsPerRound = selectedGameMode === 'incremental'
       ? [1, 2, 3, 4, 5, 4, 3, 2, 1]
       : (selectedGameMode as any) === 'rascal'
       ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1]
       : selectedGameMode === 'base-extension'
       ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
       : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

     const config: SkullKingGameConfig = {
       mode: selectedGameMode,
       scoringSystem: (selectedGameMode as any) === 'rascal' ? 'rascal' : 'skull-king',
       includeKraken: selectedGameMode === 'base-extension',
       includeWhaleWhite: selectedGameMode === 'base-extension',
       includePiratesPowers: false,
       include7And8: selectedGameMode === 'base-extension',
       cardsPerRound,
       playerCount: players.length as 2 | 3 | 4 | 5 | 6,
       twoPlayerVariant: players.length === 2 && useTwoPlayerGhost,
     } as any;

     let playerList = players;

     // Add Ghost player if 2-player mode with ghost variant
     if (players.length === 2 && useTwoPlayerGhost) {
       playerList = [
         ...players,
         {
           id: 'ghost_barbe_grise',
           name: 'Fantôme de Barbe Grise',
         },
       ];
     }

     createSkullKingGame(playerList, config);
     router.push('/skull-king/game-setup');
   };

  const handleCancel = () => {
    setShowPlayerSetup(false);
    setSelectedGameMode(null);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolder(expandedFolder === folderId ? null : folderId);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      flex: 1,
      paddingVertical: 16,
      paddingBottom: 32,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    emptyState: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      textAlign: 'center',
      marginBottom: 24,
    },
    folderContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    folderHeader: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    folderIcon: {
      fontSize: 28,
    },
    folderInfo: {
      flex: 1,
    },
    folderName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    folderVariantCount: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginTop: 2,
    },
    expandIcon: {
      marginLeft: 8,
    },
    variantsContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
      gap: 8,
    },
    variantCard: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      marginLeft: 12,
    },
    variantIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    variantName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 4,
    },
    variantDescription: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      opacity: 0.8,
      marginBottom: 8,
    },
    playButton: {
      backgroundColor: colors.text,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    playButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'Poppins_600SemiBold',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 16,
    },
    modalActions: {
      gap: 12,
    },
    resumeButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    resumeButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    cancelButton: {
      backgroundColor: colors.border,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
    },
    unfinishedSection: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    unfinishedHeader: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 12,
    },
    gameCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    gameCardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    gameCardTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    gameCardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      flex: 1,
    },
    deleteButton: {
      padding: 4,
      marginLeft: 8,
    },
    gameCardRound: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'Poppins_600SemiBold',
    },
    gameCardPlayers: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 8,
    },
    continueButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
    },
    continueButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    loadingContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
  });


  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <PageHeader title="Mes Jeux" subtitle="Gérer vos parties" />

       <ScrollView
         style={styles.content}
         showsVerticalScrollIndicator={false}
         contentContainerStyle={styles.scrollContent}
       >
         {/* Section: Parties non terminées */}
         {(unfinishedGames.length > 0 || genericGames.length > 0) && (
           <View style={styles.unfinishedSection}>
             <Text style={styles.unfinishedHeader}>📋 Parties en cours</Text>

              {/* Jeux Skull King non terminés */}
              {unfinishedGames.map(game => {
                const totalRounds = game.config.cardsPerRound.length;
                const progress = Math.round((game.currentRound / totalRounds) * 100);
                return (
                  <View key={`skull-${game.gameId}`} style={styles.gameCard}>
                    <View style={styles.gameCardRow}>
                      <View style={styles.gameCardTitleContainer}>
                        <Text style={styles.gameCardTitle}>
                          ⚓ Manche {game.currentRound}/{totalRounds}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteSkullKingGame(game.gameId)}
                        >
                          <Ionicons name="trash" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.gameCardRound}>{progress}%</Text>
                    </View>
                    <Text style={styles.gameCardPlayers}>
                      👥 {game.players.filter(p => !p.id.includes('ghost')).length} joueur{game.players.filter(p => !p.id.includes('ghost')).length > 1 ? 's' : ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.continueButton}
                      onPress={() => handleResumeGame(game.gameId)}
                    >
                      <Text style={styles.continueButtonText}>Continuer</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Jeux génériques de comptage */}
              {genericGames.map(game => (
                <View key={`game-${game.id}`} style={styles.gameCard}>
                  <View style={styles.gameCardRow}>
                    <View style={styles.gameCardTitleContainer}>
                      <Text style={styles.gameCardTitle}>{game.name}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteGenericGame(game.id)}
                      >
                        <Ionicons name="trash" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.gameCardPlayers}>
                    👥 {game.players.length} joueur{game.players.length > 1 ? 's' : ''} • Manche {game.rounds}
                  </Text>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => handleResumeGenericGame(game.id)}
                  >
                    <Text style={styles.continueButtonText}>Continuer</Text>
                  </TouchableOpacity>
                </View>
              ))}
           </View>
         )}

         {loadingGames && (
           <View style={styles.loadingContainer}>
             <ActivityIndicator size="large" color={colors.primary} />
           </View>
         )}

         <View style={styles.emptyState}>
           <Ionicons
             name="dice"
             size={48}
             color={colors.primary}
             style={styles.emptyIcon}
           />
           <Text style={styles.emptyTitle}>Sélectionnez un jeu</Text>
         </View>

        {GAME_FOLDERS.map(folder => (
          <View key={folder.id}>
            <View style={styles.folderContainer}>
              <TouchableOpacity
                style={styles.folderHeader}
                onPress={() => toggleFolder(folder.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.folderIcon}>{folder.icon}</Text>
                <View style={styles.folderInfo}>
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Text style={styles.folderVariantCount}>
                    {folder.variants.length} variante{folder.variants.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <Ionicons
                  name={expandedFolder === folder.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={colors.primary}
                  style={styles.expandIcon}
                />
              </TouchableOpacity>
            </View>

            {expandedFolder === folder.id && (
              <View style={styles.variantsContainer}>
                {folder.variants.map(variant => (
                  <View key={variant.id} style={styles.variantCard}>
                    <Text style={styles.variantIcon}>{variant.icon}</Text>
                    <Text style={styles.variantName}>{variant.name}</Text>
                    <Text style={styles.variantDescription}>{variant.description}</Text>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handleSelectGameMode(variant.id)}
                    >
                      <Ionicons name="play" size={14} color={colors.primary} />
                      <Text style={styles.playButtonText}>Jouer</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

       </ScrollView>

       {/* PLAYER SETUP MODAL */}
       <PlayerSetupModal
         visible={showPlayerSetup}
         onPlayersSelected={handlePlayersSelected}
         onCancel={handleCancel}
       />

       {/* DELETE SKULL KING GAME ALERT */}
       <AlertModal
        visible={showDeleteSkullKingAlert !== null}
        title="Supprimer la partie"
        message="Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est irréversible."
        buttons={[
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              if (showDeleteSkullKingAlert) {
                try {
                  await deleteSkullKingGame(showDeleteSkullKingAlert);
                  setUnfinishedGames(prev => prev.filter(g => g.gameId !== showDeleteSkullKingAlert));
                } catch (error) {
                  console.error('Could not delete game:', error);
                }
              }
            },
          },
        ]}
        onDismiss={() => setShowDeleteSkullKingAlert(null)}
      />

      {/* DELETE GENERIC GAME ALERT */}
      <AlertModal
        visible={showDeleteGenericAlert !== null}
        title="Supprimer la partie"
        message="Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est irréversible."
        buttons={[
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => {
              if (showDeleteGenericAlert) {
                try {
                  deleteGenericGame(showDeleteGenericAlert);
                  loadUnfinishedGames();
                } catch (error) {
                  console.error('Could not delete game:', error);
                }
              }
            },
          },
        ]}
        onDismiss={() => setShowDeleteGenericAlert(null)}
      />

      {/* TWO PLAYER GHOST VARIANT ALERT */}
      <AlertModal
        visible={showTwoPlayerAlert !== null}
        title="Mode 2 joueurs"
        message="Voulez-vous jouer avec le Fantôme de Barbe Grise ? (Mode 2 joueurs spécifique)"
        buttons={[
          {
            text: 'Non',
            style: 'cancel',
            onPress: () => {
              if (showTwoPlayerAlert) {
                createGameWithPlayers(showTwoPlayerAlert.players, false);
              }
            },
          },
          {
            text: 'Oui',
            style: 'default',
            onPress: () => {
              if (showTwoPlayerAlert) {
                createGameWithPlayers(showTwoPlayerAlert.players, true);
              }
            },
          },
        ]}
        onDismiss={() => setShowTwoPlayerAlert(null)}
      />
    </View>
  );
}

