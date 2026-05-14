import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { Button } from '@/src/components/Button';
import { PageHeader } from '@/src/components/PageHeader';
import { Ionicons } from '@expo/vector-icons';
import { SkullKingGameState } from '@/src/types/SkullKing';

export default function SkullKingHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { createSkullKingGame, getUnfinishedGames, loadGameState } = useSkullKingGame();
  const [unfinishedGames, setUnfinishedGames] = useState<SkullKingGameState[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>(['Joueur 1', 'Joueur 2']);
  const [playerInput, setPlayerInput] = useState('');
  const [gameMode, setGameMode] = useState<'base' | 'base-extension' | 'incremental' | 'rascal'>('base');
  const [scoringSystem, setScoring] = useState<'skull-king' | 'rascal'>('skull-king');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4 | 5 | 6>(3);
  const [twoPlayerGhost, setTwoPlayerGhost] = useState(false);

  useFocusEffect(() => {
    loadUnfinishedGames();
  });

  const loadUnfinishedGames = async () => {
    setLoading(true);
    try {
      const games = await getUnfinishedGames();
      setUnfinishedGames(games);
    } catch (error) {
      console.warn('Could not load unfinished games:', error);
      setUnfinishedGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeGame = async (gameId: string) => {
    try {
      await loadGameState(gameId);
      // Navigate directly to the game screen
      router.push({
        pathname: '/skull-king/[gameId]',
        params: { gameId },
      });
    } catch (error) {
      console.error('Could not resume game:', error);
    }
  };

  const handleCreateGame = () => {
     const config = {
       mode: gameMode as 'base' | 'base-extension' | 'incremental' | 'rascal',
       scoringSystem: gameMode === 'rascal' ? 'rascal' as const : scoringSystem,
       cardsPerRound: gameMode === 'incremental'
         ? [1, 2, 3, 4, 5, 4, 3, 2, 1]
         : gameMode === 'base'
         ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
         : gameMode === 'rascal'
         ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1]
         : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
       includeKraken: gameMode === 'base-extension',
       includeWhaleWhite: gameMode === 'base-extension',
       includePiratesPowers: false,
       include7And8: gameMode === 'base-extension',
       playerCount: playerCount as 2 | 3 | 4 | 5 | 6,
       twoPlayerVariant: playerCount === 2 && twoPlayerGhost,
     };

    let playerList = playerNames
      .filter(p => p.trim())
      .map((name, index) => ({
        id: `player_${index}`,
        name,
      }));

    // Add Ghost player if 2-player mode with ghost variant
    if (playerCount === 2 && twoPlayerGhost) {
      playerList.push({
        id: 'ghost_barbe_grise',
        name: 'Fantôme de Barbe Grise',
      });
    }

    if (playerList.length >= 2) {
      createSkullKingGame(playerList, config as any);
      setPlayerNames(['Joueur 1', 'Joueur 2']);
      setPlayerInput('');
      setModalVisible(false);

      // Navigate to game setup
      router.push('/skull-king/game-setup');
    }
  };

  const addPlayer = () => {
    if (playerInput.trim()) {
      setPlayerNames([...playerNames, playerInput]);
      setPlayerInput('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

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
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    gameCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    gameCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    gameCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      flex: 1,
    },
    gameCardInfo: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 4,
    },
    playersList: {
      paddingVertical: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginVertical: 8,
    },
    playerItem: {
      fontSize: 12,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      paddingVertical: 4,
    },
    gameCardAction: {
      marginTop: 12,
      gap: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
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
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
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
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    closeButton: {
      padding: 8,
    },
    input: {
      backgroundColor: colors.surfaceLight,
      borderRadius: 12,
      padding: 12,
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 8,
      marginTop: 16,
    },
    playersContainer: {
      marginBottom: 16,
    },
    playerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 8,
      justifyContent: 'space-between',
    },
    playerName: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      flex: 1,
    },
    removeButton: {
      padding: 4,
    },
    addPlayerContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    playerInput: {
      flex: 1,
    },
    addPlayerButton: {
      width: 44,
      paddingVertical: 10,
    },
    gameModeContainer: {
      marginBottom: 20,
    },
    gameModeButtons: {
      gap: 8,
    },
    modeButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.surfaceLight,
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
      textAlign: 'center',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
    },
    roundBadge: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    roundBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="⚓ Skull King" subtitle="Reprenez ou commencez une partie" size="large" />

      {loading ? (
        <View style={[styles.emptyState]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : unfinishedGames.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="skull"
            size={64}
            color={colors.primary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Aucune partie en cours</Text>
          <Text style={styles.emptyText}>
            Créez une nouvelle partie pour commencer à jouer
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📌 Parties en cours</Text>
            {unfinishedGames.map(game => (
              <View key={game.gameId} style={styles.gameCard}>
                <View style={styles.roundBadge}>
                  <Text style={styles.roundBadgeText}>
                    Manche {game.currentRound}/{game.config.cardsPerRound.length}
                  </Text>
                </View>

                <View style={styles.gameCardHeader}>
                  <Text style={styles.gameCardTitle}>
                    {game.players.map(p => p.name).join(', ')}
                  </Text>
                </View>

                <Text style={styles.gameCardInfo}>
                  Mode: {game.config.mode === 'incremental' ? 'Incrémental' : game.config.mode === 'base' ? 'Base' : 'Base + Extension'}
                </Text>

                <View style={styles.playersList}>
                  {game.players.map((player, index) => (
                    <Text key={player.id} style={styles.playerItem}>
                      {index + 1}. {player.name} — {game.playerScores[player.id] || 0} pts
                    </Text>
                  ))}
                </View>

                <View style={styles.gameCardAction}>
                  <Button
                    title="Reprendre la partie"
                    variant="primary"
                    onPress={() => handleResumeGame(game.gameId)}
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={28} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle partie Skull King</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Game Mode Selection */}
            <View style={styles.gameModeContainer}>
              <Text style={styles.label}>Mode de jeu</Text>
              <View style={styles.gameModeButtons}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    gameMode === 'incremental' && styles.modeButtonActive,
                  ]}
                  onPress={() => setGameMode('incremental')}
                >
                  <Text style={styles.modeButtonText}>Incrémental</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    gameMode === 'base' && styles.modeButtonActive,
                  ]}
                  onPress={() => setGameMode('base')}
                >
                  <Text style={styles.modeButtonText}>Jeu de Base</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    gameMode === 'base-extension' && styles.modeButtonActive,
                  ]}
                  onPress={() => setGameMode('base-extension')}
                >
                  <Text style={styles.modeButtonText}>Base + Extension</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    gameMode === 'rascal' && styles.modeButtonActive,
                  ]}
                  onPress={() => setGameMode('rascal')}
                >
                  <Text style={styles.modeButtonText}>Rascal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Scoring System (only for non-incremental and non-rascal) */}
            {gameMode !== 'incremental' && gameMode !== 'rascal' && (
              <View style={styles.gameModeContainer}>
                <Text style={styles.label}>Système de scoring</Text>
                <View style={styles.gameModeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      scoringSystem === 'skull-king' && styles.modeButtonActive,
                    ]}
                    onPress={() => setScoring('skull-king')}
                  >
                    <Text style={styles.modeButtonText}>Skull King</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      scoringSystem === 'rascal' && styles.modeButtonActive,
                    ]}
                    onPress={() => setScoring('rascal')}
                  >
                    <Text style={styles.modeButtonText}>Rascal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Player Count Selection */}
            <View style={styles.gameModeContainer}>
              <Text style={styles.label}>Nombre de joueurs</Text>
              <View style={styles.gameModeButtons}>
                {[2, 3, 4, 5, 6].map(count => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.modeButton,
                      playerCount === count && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setPlayerCount(count as 2 | 3 | 4 | 5 | 6);
                      if (count !== 2) {
                        setTwoPlayerGhost(false);
                      }
                    }}
                  >
                    <Text style={styles.modeButtonText}>{count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2-Player Ghost Variant */}
            {playerCount === 2 && (
              <View style={styles.gameModeContainer}>
                <Text style={styles.label}>Mode 2 joueurs</Text>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    twoPlayerGhost && styles.modeButtonActive,
                  ]}
                  onPress={() => setTwoPlayerGhost(!twoPlayerGhost)}
                >
                  <Text style={styles.modeButtonText}>
                    {twoPlayerGhost ? '✓' : ''} Joueur vs Barbe Grise
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.label, { marginTop: 8, fontSize: 11, fontWeight: '400' }]}>
                  Jouez avec le fantôme de Barbe Grise (il joue ses cartes aléatoirement et ne marque pas)
                </Text>
              </View>
            )}

            {/* Players */}
            <Text style={styles.label}>Joueurs ({playerNames.length})</Text>
            <View style={styles.playersContainer}>
              {playerNames.map((name, index) => (
                <View key={index} style={styles.playerContainer}>
                  <Text style={styles.playerName}>{name}</Text>
                  {playerNames.length > 2 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePlayer(index)}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.danger || '#FF6B6B'} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Add Player */}
            <View style={styles.addPlayerContainer}>
              <TextInput
                style={[styles.input, styles.playerInput]}
                placeholder="Ajouter un joueur"
                placeholderTextColor={colors.textSecondary}
                value={playerInput}
                onChangeText={setPlayerInput}
                onSubmitEditing={addPlayer}
              />
              <Button
                title="+"
                onPress={addPlayer}
                variant="primary"
                size="small"
                style={styles.addPlayerButton}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Annuler"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={styles.actionButton}
              />
              <Button
                title="Créer"
                variant="primary"
                onPress={handleCreateGame}
                disabled={playerNames.filter(p => p.trim()).length < 2}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


