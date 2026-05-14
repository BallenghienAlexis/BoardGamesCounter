import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { usePlayers } from '../contexts/PlayersContext';
import { Button } from './Button';

interface PlayerSetupModalProps {
  visible?: boolean;
  onPlayersSelected: (players: { id: string; name: string }[]) => void;
  onCancel: () => void;
}

export function PlayerSetupModal({ visible = true, onPlayersSelected, onCancel }: PlayerSetupModalProps) {
  const { colors } = useTheme();
  const { savedPlayers, addPlayer } = usePlayers();
  const insets = useSafeAreaInsets();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState('');

  // Filter players based on input AND exclude already selected players
  const filteredPlayers = useMemo(() => {
    let filtered = savedPlayers;

    // Filter by input text
    if (playerInput.trim()) {
      filtered = filtered.filter(p =>
        p.toLowerCase().includes(playerInput.toLowerCase())
      );
    }

    // Exclude already selected players
    return filtered.filter(p => !selectedPlayers.includes(p));
  }, [playerInput, savedPlayers, selectedPlayers]);

  const handleSelectPlayer = (playerName: string) => {
    if (!selectedPlayers.includes(playerName)) {
      setSelectedPlayers([...selectedPlayers, playerName]);
      setPlayerInput('');
      Keyboard.dismiss();
    }
  };

  const handleAddNewPlayer = async () => {
    const trimmed = playerInput.trim();
    if (!trimmed) return;

    await addPlayer(trimmed);
    setSelectedPlayers([...selectedPlayers, trimmed]);
    setPlayerInput('');
    Keyboard.dismiss();
  };

  const removeSelectedPlayer = (playerName: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p !== playerName));
  };

  const handleStartGame = () => {
    if (selectedPlayers.length >= 2) {
      const playersWithIds = selectedPlayers.map((name, index) => ({
        id: `player_${index}`,
        name,
      }));
      onPlayersSelected(playersWithIds);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    closeButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    inputSection: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      backgroundColor: colors.surfaceLight,
      borderRadius: 12,
      padding: 12,
      color: colors.text,
      fontSize: 14,
      fontFamily: 'Poppins_400Regular',
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 200,
      overflow: 'hidden',
    },
    suggestionItem: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    suggestionItemLast: {
      borderBottomWidth: 0,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      flex: 1,
    },
    suggestionIcon: {
      marginLeft: 8,
    },
    selectedSection: {
      marginTop: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    selectedTitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    selectedList: {
      gap: 8,
    },
    selectedItem: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedItemText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    removeButton: {
      padding: 4,
    },
    emptyMessage: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
      fontStyle: 'italic',
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
  });

  // Check if input is a new player (not in saved list)
  const isNewPlayer = playerInput.trim() && !savedPlayers.includes(playerInput.trim());

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Sélectionner les Joueurs</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Ajouter un joueur</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Chercher ou ajouter un joueur..."
              placeholderTextColor={colors.textSecondary}
              value={playerInput}
              onChangeText={setPlayerInput}
            />
          </View>

           {(playerInput.trim() || filteredPlayers.length > 0) && (
            <View style={styles.suggestionsContainer}>
              <ScrollView nestedScrollEnabled>
                {/* Filtered existing players */}
                {filteredPlayers.map((playerName, index) => (
                  <TouchableOpacity
                    key={playerName}
                    style={[
                      styles.suggestionItem,
                      index === filteredPlayers.length - 1 && !isNewPlayer && styles.suggestionItemLast,
                    ]}
                    onPress={() => handleSelectPlayer(playerName)}
                  >
                    <Text style={styles.suggestionText}>{playerName}</Text>
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={colors.primary}
                      style={styles.suggestionIcon}
                    />
                  </TouchableOpacity>
                ))}

                {/* Add new player option */}
                {isNewPlayer && (
                  <TouchableOpacity
                    style={[styles.suggestionItem, styles.suggestionItemLast]}
                    onPress={handleAddNewPlayer}
                  >
                    <Text style={styles.suggestionText}>
                      Ajouter &quot;{playerInput.trim()}&quot;
                    </Text>
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={colors.primary}
                      style={styles.suggestionIcon}
                    />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {selectedPlayers.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>
              Joueurs sélectionnés ({selectedPlayers.length})
            </Text>
            <View style={styles.selectedList}>
              {selectedPlayers.map(playerName => (
                <View key={playerName} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>{playerName}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSelectedPlayer(playerName)}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedPlayers.length === 0 && (
          <Text style={[styles.emptyMessage, { marginTop: 24 }]}>
            Sélectionnez au moins 2 joueurs pour commencer
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Annuler"
          variant="secondary"
          onPress={onCancel}
        />
        <Button
          title="Commencer la Partie"
          variant="primary"
          onPress={handleStartGame}
          disabled={selectedPlayers.length < 2}
        />
      </View>
    </View>
    </Modal>
  );
}

