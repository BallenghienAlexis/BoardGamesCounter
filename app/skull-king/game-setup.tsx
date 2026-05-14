import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { Button } from '@/src/components/Button';
import { PageHeader } from '@/src/components/PageHeader';

export default function GameSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { gameState } = useSkullKingGame();
  const insets = useSafeAreaInsets();


  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    }
  }, [gameState, router]);

  if (!gameState) {
    return null;
  }

  const handleStartGame = () => {
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
    ruleCard: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    ruleTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Poppins_700Bold',
      marginBottom: 6,
    },
    ruleText: {
      fontSize: 11,
      color: colors.text,
      fontFamily: 'Poppins_400Regular',
      lineHeight: 16,
      fontWeight: '500',
    },
  });

  const gameModeNames: Record<string, string> = {
    'base': 'Jeu de Base',
    'base-extension': 'Jeu de Base + Extension',
    'incremental': 'Mode Incremental',
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <PageHeader title="Configuration" subtitle="Vérifiez les paramètres avant de commencer" size="large" />

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
            {gameState.players.map((player: any, index: number) => (
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
          <Text style={styles.sectionTitle}>Règles du Jeu</Text>
          
          {/* Mode de jeu */}
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>📋 Mode: {gameModeNames[gameState.config.mode]}</Text>
            {gameState.config.mode === 'incremental' ? (
              <Text style={styles.ruleText}>
                Scoring simplifié: +1 pour une mise exacte, -1 pour un écart
              </Text>
            ) : (
              <Text style={styles.ruleText}>
                Système Skull King classique avec bonus et pénalités précises
              </Text>
            )}
          </View>

          {/* Manches */}
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>🎲 Manches & Cartes</Text>
            <Text style={styles.ruleText}>
              {gameState.config.cardsPerRound.length} manches{'\n'}
              Progression: 1 à {gameState.config.cardsPerRound[gameState.config.cardsPerRound.length - 1]} cartes par manche
            </Text>
          </View>

          {/* Mise */}
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>💰 Phase 1: Mise</Text>
            <Text style={styles.ruleText}>
              Chaque joueur annonce le nombre EXACT de plis remportés avant de voir les cartes jouées. La mise est cruciale!
            </Text>
          </View>

          {/* Scoring */}
          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>🎯 Phase 2-3: Levées & Scoring</Text>
            <Text style={styles.ruleText}>
              Mise exacte: +20×plis remportés{'\n'}
              Mise 0 exacte: +10×cartes{'\n'}
              Écart: -10 points par différence{'\n'}
              Bonus: ajoutés seulement si mise exacte
            </Text>
          </View>

           {/* Bonus */}
           <View style={styles.ruleCard}>
             <Text style={styles.ruleTitle}>🎁 Bonus disponibles</Text>
             <Text style={styles.ruleText}>
               • 14 régulières: +10 pts/carte{'\n'}
               • 14 noir: +20 pts{'\n'}
               • Sirène capturée: +20 pts{'\n'}
               • Pirate capturé: +30 pts{'\n'}
               • SK (Sirène): +40 pts{'\n'}
               • Butin (Alliance): +20 pts chacun si les 2 joueurs misent correctement
             </Text>
           </View>

           {/* Extension Bonuses */}
           {gameState.config.include7And8 && (
             <View style={styles.ruleCard}>
               <Text style={styles.ruleTitle}>🎁 Bonus Supplémentaires (Extension)</Text>
               <Text style={styles.ruleText}>
                 • Second capturé (SK/Sirène): +30 pts{'\n'}
                 • Casier DJ (par léviathan): +20 pts{'\n'}
                 • Cartes 8: +5 pts par carte {'\n'}
                 • Cartes 7: -5 pts par carte
               </Text>
             </View>
           )}

           {/* Butin Card Details */}
            <View style={styles.ruleCard}>
              <Text style={styles.ruleTitle}>💎 Carte Butin - Système d&apos;Alliance</Text>
              <Text style={styles.ruleText}>
               {`En jouant une carte Butin, vous CONCLUEZ UNE ALLIANCE avec le joueur qui la remportera.\n\nCondition du bonus: SI VOUS MISEZ TOUS LES DEUX CORRECTEMENT, vous gagnez CHACUN 20 points bonus.\n\nExemple: Vous jouez Butin, Alice la remporte. Si vous misez correctement ET Alice aussi, vous gagnez +20 pts chacun.`}
             </Text>
           </View>

          {/* Extensions */}
          {gameState.config.includeKraken && (
            <View style={styles.ruleCard}>
              <Text style={styles.ruleTitle}>🐙 Kraken Activé</Text>
              <Text style={styles.ruleText}>
                Dévore tous les cartes du pli. Personne ne le gagne. Le joueur qui aurait dû le remporter commence le prochain pli.
              </Text>
            </View>
          )}

           {gameState.config.includeWhaleWhite && (
             <View style={styles.ruleCard}>
               <Text style={styles.ruleTitle}>🐋 Baleine Blanche Activée</Text>
               <Text style={styles.ruleText}>
                 Affecte le pli: cartes spéciales détruites, cartes numérotées: plus haute gagne sans tenir compte de la couleur.
               </Text>
             </View>
           )}

           {gameState.config.include7And8 && (
             <View style={styles.ruleCard}>
               <Text style={styles.ruleTitle}>7️⃣ Cartes 7 et 8</Text>
               <Text style={styles.ruleText}>
                 {`Les 7 et 8 sont joués comme des cartes classiques. Si plusieurs cartes de même valeur remportent le pli, la première jouée l'emporte (si pari correct).\n• Carte 7: -5 pts\n• Carte 8: +5 pts`}
               </Text>
             </View>
           )}

            {gameState.config.include7And8 && (
              <View style={styles.ruleCard}>
                <Text style={styles.ruleTitle}>👻 Le Second</Text>
                <Text style={styles.ruleText}>
                  Le Second bat toutes les cartes sauf le Skull King et les Sirènes. Il peut utiliser les pouvoirs des pirates qu&apos;il capture, mais ne gagne aucun bonus pour ces captures. Si le Skull King ou une Sirène le capture: +30 pts.
                </Text>
              </View>
            )}

            {gameState.config.include7And8 && (
              <View style={styles.ruleCard}>
                <Text style={styles.ruleTitle}>☠️ Casier de Davy Jones</Text>
                <Text style={styles.ruleText}>
                  Cette carte ne gagne pas de pli. Elle détruit tous les léviathans du pli. La carte la plus forte remporte alors le pli. Gagnez 20 points par léviathan détruit, quel que soit l&apos;ordre des cartes.
                </Text>
              </View>
             )}

           {gameState.config.scoringSystem === 'rascal' && (
              <>
                <View style={styles.ruleCard}>
                  <Text style={styles.ruleTitle}>🎲 Mode Rascal - Système Équilibré</Text>
                  <Text style={styles.ruleText}>
                    {`À chaque manche, TOUS les joueurs ont le même potentiel de points: 10 pts × cartes distribuées.\n\nExemple: 5 cartes distribuées = potentiel de 50 pts, peu importe si vous misez sur 0, 1, 3, 4 ou 5.`}
                  </Text>
                </View>

                <View style={styles.ruleCard}>
                  <Text style={styles.ruleTitle}>🎯 Niveaux de Précision</Text>
                  <Text style={styles.ruleText}>
                    {`• Coup direct (mise exacte): Gagnez 100% des points en jeu\n• Frappe à revers (écart de 1): Gagnez 50% des points en jeu\n• Échec cuisant (écart de 2+): Gagnez 0 point\n\nLes bonus suivent les mêmes règles: 100%, 50%, 0%.`}
                  </Text>
                </View>
              </>
            )}

           {gameState.config.twoPlayerVariant && (
              <View style={styles.ruleCard}>
                <Text style={styles.ruleTitle}>👻 Fantôme de Barbe Grise (2 joueurs)</Text>
                <Text style={styles.ruleText}>
                  {`3 paquets de cartes au total. Vous et votre adversaire commencez alternativement, mais le Fantôme joue TOUJOURS en 2e position.\n\nSes cartes sont retournées aléatoirement et il ne suit pas la couleur.\n\nQuand le Fantôme gagne un pli, il commence le suivant. Sinon, il reste 2e.\n\nLe Fantôme ne mise pas et ne marque pas - il joue uniquement pour vous exaspérer!`}
                </Text>
              </View>
            )}
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
    </View>
  );
}

