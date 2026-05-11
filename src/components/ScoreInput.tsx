import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';

interface ScoreInputProps {
  playerName: string;
  currentScore: number;
  onAddScore: (amount: number) => void;
  onUndo: () => void;
}

export function ScoreInput({ playerName, currentScore, onAddScore, onUndo }: ScoreInputProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAddScore = (value: number) => {
    onAddScore(value);
  };

  const handleCustomScore = () => {
    const value = parseInt(amount, 10);
    if (!isNaN(value)) {
      handleAddScore(value);
      setAmount('');
      setModalVisible(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 8,
      marginVertical: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    playerName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
    },
    buttonsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 16,
    },
    smallButton: {
      width: '30%',
      paddingVertical: 12,
      paddingHorizontal: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    largeButton: {
      width: '48%',
      paddingVertical: 14,
    },
    largeButtonText: {
      fontSize: 16,
    },
    actionButton: {
      width: '48%',
      paddingVertical: 12,
    },
    actionButtonText: {
      fontSize: 13,
    },
    bottomActions: {
      flexDirection: 'row',
      gap: 10,
      width: '100%',
    },
    customButton: {
      flex: 1,
    },
    undoButton: {
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surfaceLight,
      borderRadius: 12,
      padding: 12,
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.playerName}>{playerName}</Text>

        <View style={styles.buttonsGrid}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.success }]}
            onPress={() => handleAddScore(1)}
          >
            <Text style={styles.smallButtonText}>+1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.primary }]}
            onPress={() => handleAddScore(5)}
          >
            <Text style={styles.smallButtonText}>+5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.accent }]}
            onPress={() => handleAddScore(10)}
          >
            <Text style={styles.smallButtonText}>+10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.warning }]}
            onPress={() => handleAddScore(50)}
          >
            <Text style={styles.smallButtonText}>+50</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.accent }]}
            onPress={() => handleAddScore(100)}
          >
            <Text style={styles.smallButtonText}>+100</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.danger }]}
            onPress={() => handleAddScore(-1)}
          >
            <Text style={styles.smallButtonText}>-1</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomActions}>
          <Button
            title="Personnalisé"
            variant="secondary"
            onPress={() => setModalVisible(true)}
            style={styles.customButton}
          />
          <Button
            title="Annuler"
            variant="secondary"
            onPress={onUndo}
            style={styles.undoButton}
          />
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter des points</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de points"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="Annuler"
                variant="secondary"
                onPress={() => {
                  setModalVisible(false);
                  setAmount('');
                }}
                style={styles.modalButton}
              />
              <Button
                title="Ajouter"
                variant="primary"
                onPress={handleCustomScore}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

