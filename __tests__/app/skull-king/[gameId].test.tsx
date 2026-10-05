import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import SkullKingGameScreen from '@/app/skull-king/[gameId]';
import { flushAsync, renderWithGame, renderWithProviders } from '@/test-utils/render';
import { mockRouter } from '@/test-utils/router';
import { makeConfig, makeGame, PLAYERS } from '@/test-utils/fixtures';
import type { SkullKingGameConfig, SkullKingGameState } from '@/src/types/SkullKing';

const GAME_ID = '1700000000000';

const icons = (name: 'add' | 'remove') => screen.UNSAFE_getAllByProps({ name });
const tap = (name: 'add' | 'remove', index: number, times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.press(icons(name)[index]);
};
const next = (label: string) => fireEvent.press(screen.getByText(label));

async function renderRound(config: Partial<SkullKingGameConfig> = {}, game: Partial<SkullKingGameState> = {}) {
  jest.mocked(useLocalSearchParams).mockReturnValue({ gameId: GAME_ID });
  await renderWithGame(<SkullKingGameScreen />, makeGame({ config: makeConfig(config), ...game }));
}

async function storedGame(): Promise<SkullKingGameState> {
  return JSON.parse((await AsyncStorage.getItem(`skull_king_game_${GAME_ID}`))!);
}

it('goes back home when there is no active game', async () => {
  renderWithProviders(<SkullKingGameScreen />);
  await flushAsync();
  expect(mockRouter.replace).toHaveBeenCalledWith('/');
});

describe('a Skull King round', () => {
  it('walks through bets, tricks, bonuses and summary, then starts the next round', async () => {
    await renderRound({ cardsPerRound: [1, 2] });
    expect(screen.getByText('Manche 1')).toBeTruthy();
    expect(screen.getByText('1 carte')).toBeTruthy();
    expect(screen.getByText('📋 Phase 1: Mises')).toBeTruthy();

    // Mises bornées entre 0 et le nombre de cartes : Alice 1, Bob 0, Chloé 1
    tap('add', 0, 2);
    tap('remove', 1);
    tap('add', 2);
    expect(screen.getAllByText(/^[01]$/).map(t => t.props.children)).toEqual([1, 0, 1]);

    next('Suivant: Levées');
    expect(screen.getByText('🎯 Phase 2: Levées Remportées')).toBeTruthy();
    expect(screen.getAllByText('Mise: 1 plis')).toHaveLength(2);
    tap('add', 0); // Alice remporte le pli

    next('Suivant: Bonus');
    expect(screen.getByText('🎁 Phase 3: Points Bonus')).toBeTruthy();
    expect(screen.queryByText('Second capturé')).toBeNull();
    tap('add', 1); // Alice : 14 noir
    tap('remove', 2); // aucun effet en dessous de 0

    next('Calculer les Scores');
    expect(screen.getByText('📊 Résumé des Scores')).toBeTruthy();
    // Alice : +20 (mise) +20 (14 noir) ; Bob : mise 0 réussie +10 ; Chloé : -10
    expect(screen.getAllByText('+40')).toHaveLength(2);
    expect(screen.getAllByText('+10')).toHaveLength(2);
    expect(screen.getAllByText('-10')).toHaveLength(2);

    next('Manche Suivante');
    expect(screen.getByText('Manche 2')).toBeTruthy();
    expect(screen.getByText('2 cartes')).toBeTruthy();
    expect(screen.getByText('📋 Phase 1: Mises')).toBeTruthy();
    expect(screen.getAllByText('0')).toHaveLength(3);

    await waitFor(async () =>
      expect((await storedGame()).playerScores).toEqual({ player_0: 40, player_1: 10, player_2: -10 })
    );
    expect((await storedGame()).currentRound).toBe(2);
  });

  it('allows going back to previous phases', async () => {
    await renderRound();
    next('Suivant: Levées');
    next('Retour: Mises');
    expect(screen.getByText('📋 Phase 1: Mises')).toBeTruthy();
    next('Suivant: Levées');
    next('Suivant: Bonus');
    next('Retour: Levées');
    expect(screen.getByText('🎯 Phase 2: Levées Remportées')).toBeTruthy();
  });

  it('adds the cumulated score of previous rounds to the total', async () => {
    await renderRound({}, { currentRound: 3, playerScores: { player_0: 100, player_1: 0, player_2: -30 } });
    expect(screen.getByText('Manche 3')).toBeTruthy();
    next('Suivant: Levées');
    next('Suivant: Bonus');
    next('Calculer les Scores');
    // Mise 0 réussie sur 3 cartes : +30
    expect(screen.getByText('+130')).toBeTruthy();
    expect(screen.getByText('0', { exact: true })).toBeTruthy();
  });

  it('finishes the game after the last round', async () => {
    await renderRound({ cardsPerRound: [1] });
    next('Suivant: Levées');
    next('Suivant: Bonus');
    next('Calculer les Scores');
    next('Fin de Partie');
    expect(mockRouter.replace).toHaveBeenCalledWith({ pathname: '/skull-king/game-end', params: { gameId: GAME_ID } });
    await waitFor(async () => expect((await storedGame()).currentRound).toBe(2));
  });
});

describe('butin (treasure alliance)', () => {
  async function toBonusPhase() {
    await renderRound();
    // Tout le monde mise 0 et ne fait aucun pli : mises réussies
    next('Suivant: Levées');
    next('Suivant: Bonus');
  }

  // Boutons dans l'ordre : Alice→[Bob, Chloé], Bob→[Alice, Chloé], Chloé→[Alice, Bob]
  const allianceButton = (wonBy: string, occurrence: number) => screen.getAllByText(wonBy)[occurrence];

  it('gives +20 to both players when both bets are correct', async () => {
    await toBonusPhase();
    fireEvent.press(allianceButton('Bob', 1)); // Alice a joué le butin, Bob l'a remporté
    expect(allianceButton('Bob', 1)).toHaveStyle({ fontWeight: '700' });

    next('Calculer les Scores');
    // Mise 0 réussie (+10) + butin (+20) pour Alice et Bob, +10 pour Chloé
    expect(screen.getAllByText('+30')).toHaveLength(4);
    expect(screen.getAllByText('+10')).toHaveLength(2);
  });

  it('removes the alliance on a second tap', async () => {
    await toBonusPhase();
    fireEvent.press(allianceButton('Bob', 1));
    fireEvent.press(allianceButton('Bob', 1));
    expect(allianceButton('Bob', 1)).toHaveStyle({ fontWeight: '600' });

    next('Calculer les Scores');
    expect(screen.getAllByText('+10')).toHaveLength(6);
  });

  it('counts two crossed alliances for each player', async () => {
    await toBonusPhase();
    fireEvent.press(allianceButton('Bob', 1)); // Alice → Bob
    fireEvent.press(allianceButton('Alice', 1)); // Bob → Alice
    next('Calculer les Scores');
    expect(screen.getAllByText('+50')).toHaveLength(4);
  });
});

describe('game modes', () => {
  it('skips the bonus phase in incremental mode', async () => {
    await renderRound({ mode: 'incremental' });
    tap('add', 0); // Alice mise 1, ne fait aucun pli
    next('Suivant: Levées');
    expect(screen.queryByText('Suivant: Bonus')).toBeNull();
    next('Calculer les Scores');
    expect(screen.getByText('Calcul: +1 si mise exacte, -1 sinon')).toBeTruthy();
    // Score de manche puis total
    expect(screen.getAllByText('-1')).toHaveLength(2);
    expect(screen.getAllByText('+1')).toHaveLength(4);
  });

  it('uses the Rascal scoring and rules', async () => {
    await renderRound({ mode: 'rascal', scoringSystem: 'rascal', cardsPerRound: [2] });
    tap('add', 0, 2); // Alice mise 2
    next('Suivant: Levées');
    tap('add', 0); // Alice fait 1 pli : frappe à revers
    next('Suivant: Bonus');
    expect(screen.getByText(/Potentiel: 20 pts/)).toBeTruthy();
    next('Calculer les Scores');
    // Alice : 50 % de 20 ; Bob et Chloé : coup direct, 20
    expect(screen.getAllByText('+10')).toHaveLength(2);
    expect(screen.getAllByText('+20')).toHaveLength(4);
  });

  it('shows and applies the extension bonuses', async () => {
    await renderRound({ mode: 'base-extension', include7And8: true });
    next('Suivant: Levées');
    next('Suivant: Bonus');
    expect(screen.getAllByText('Second capturé')).toHaveLength(3);
    expect(screen.getAllByText('Cartes 7')).toHaveLength(3);
    // 9 bonus par joueur : le 6e (index 5) est « Second capturé » pour Alice
    tap('add', 5);
    next('Calculer les Scores');
    expect(screen.getAllByText('+40')).toHaveLength(2);
  });
});

describe('two-player ghost', () => {
  const players = [...PLAYERS.slice(0, 2), { id: 'ghost_barbe_grise', name: 'Fantôme de Barbe Grise' }];

  it('hides the ghost from bets, bonuses and summary but asks for its tricks', async () => {
    await renderRound({ playerCount: 2, twoPlayerVariant: true }, { players });
    expect(screen.queryByText('Fantôme de Barbe Grise')).toBeNull();
    next('Suivant: Levées');
    expect(screen.getByText('Fantôme de Barbe Grise')).toBeTruthy();
    next('Suivant: Bonus');
    expect(screen.queryByText('Fantôme de Barbe Grise')).toBeNull();
    next('Calculer les Scores');
    expect(screen.queryByText('Fantôme de Barbe Grise')).toBeNull();
  });
});

describe('leaving the game', () => {
  it('asks for confirmation, saves and goes home', async () => {
    await renderRound();
    fireEvent.press(screen.UNSAFE_getByProps({ name: 'close' }));
    fireEvent.press(screen.getByText('Annuler'));
    expect(screen.queryByText('Quitter la partie')).toBeNull();

    fireEvent.press(screen.UNSAFE_getByProps({ name: 'close' }));
    jest.mocked(AsyncStorage.setItem).mockClear();
    fireEvent.press(screen.getByText('Quitter'));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/'));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(`skull_king_game_${GAME_ID}`, expect.any(String));
  });
});
