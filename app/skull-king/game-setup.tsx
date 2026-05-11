import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useSkullKingGame } from '../../../src/contexts/SkullKingContext';
import { Button } from '../../../src/components/Button';

export default function GameSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { gameState } = useSkullKingGame();

  const [startedGame, setStartedGame] = useState(false);

  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    }
  }, [gameState, router]);

  if (!gameState) {
    return null;
  }

  const handleStartGame = () => {
    setStartedGame(true);
    router.push({
      pathname: '/skull-king/[gameId]',
      params: { gameId: gameState.gameId },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 12,
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    gameTypeLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 4,
    },
    gameTypeValue: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Poppins_400Regular',
    },
    playersList: {
      gap: 8,
    },
    playerCard: {
      backgroundColor: colors.surfaceLight,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    playerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playerName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Poppins_600SemiBold',
      flex: 1,
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

  const gameModeNames: Record<string, string> = {
    'base': 'Jeu de Base',
    'base-extension': 'Jeu de Base + Extension',
    'incremental': 'Mode Incremental',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration</Text>
        <Text style={styles.subtitle}>Vérifiez les paramètres avant de commencer</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de Jeu</Text>
          <View style={styles.card}>
            <Text style={styles.gameTypeLabel}>
              {gameModeNames[gameState.config.mode] || gameState.config.mode}
            </Text>
            <Text style={styles.gameTypeValue}>
              {gameState.config.mode === 'incremental'
                ? 'Scoring simplifié'
                : `Système ${gameState.config.scoringSystem}`}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Joueurs ({gameState.players.length})</Text>
          <View style={styles.playersList}>
            {gameState.players.map((player, index) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerIcon}>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={styles.playerName}>{player.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règles</Text>
          <View style={styles.card}>
            <Text style={styles.gameTypeValue}>
              • {gameState.config.cardsPerRound.length} manches
              {'\n'}
              • Cartes : 1 à {gameState.config.cardsPerRound[gameState.config.cardsPerRound.length - 1]}
              {gameState.config.includeKraken && '\n• Kraken activé'}
              {gameState.config.includeWhaleWhite && '\n• Baleine blanche activée'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Retour"
          variant="secondary"
          onPress={() => router.back()}
        />
        <Button
          title="Commencer la Partie"
          variant="primary"
          onPress={handleStartGame}
        />
      </View>
    </SafeAreaView>
  );
}

