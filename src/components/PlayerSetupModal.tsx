import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';

interface PlayerSetupModalProps {
  onPlayersSelected: (players: { id: string; name: string }[]) => void;
  onCancel: () => void;
}

export function PlayerSetupModal({ onPlayersSelected, onCancel }: PlayerSetupModalProps) {
  const { colors } = useTheme();
  const [playerNames, setPlayerNames] = useState<string[]>(['Joueur 1', 'Joueur 2']);
  const [playerInput, setPlayerInput] = useState('');

  const addPlayer = () => {
    if (playerInput.trim()) {
      setPlayerNames([...playerNames, playerInput.trim()]);
      setPlayerInput('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const handleCreateGame = () => {
    if (playerNames.length >= 2) {
      const playersWithIds = playerNames.map((name, index) => ({
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
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      marginTop: 16,
    },
    playersContainer: {
      marginBottom: 20,
    },
    playerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceLight,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
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
      marginBottom: 24,
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
      flex: 1,
    },
    addButton: {
      width: 44,
      paddingVertical: 12,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Joueurs</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Joueurs ({playerNames.length})</Text>
        <View style={styles.playersContainer}>
          {playerNames.map((name, index) => (
            <View key={index} style={styles.playerItem}>
              <Text style={styles.playerName}>{name}</Text>
              {playerNames.length > 2 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(index)}
                >
                  <Ionicons name="close-circle" size={20} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.label}>Ajouter un joueur</Text>
        <View style={styles.addPlayerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom du joueur"
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
            style={styles.addButton}
          />
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button
          title="Annuler"
          variant="secondary"
          onPress={onCancel}
          style={styles.actionButton}
        />
        <Button
          title="Commencer"
          variant="primary"
          onPress={handleCreateGame}
          disabled={playerNames.length < 2}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

