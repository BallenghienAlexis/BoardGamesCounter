import React from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import HomeScreen from '@/app/(tabs)/index';
import { renderWithProviders, seedStorage } from '@/test-utils/render';
import { mockRouter } from '@/test-utils/router';
import { makeConfig, makeGame } from '@/test-utils/fixtures';
import type { SkullKingGameState } from '@/src/types/SkullKing';

/** Partie créée par l'écran, lue depuis la sauvegarde automatique. */
async function createdGame(): Promise<SkullKingGameState> {
  let key: string | undefined;
  await waitFor(async () => {
    key = (await AsyncStorage.getAllKeys()).find(k => k.startsWith('skull_king_game_'));
    expect(key).toBeDefined();
  });
  return JSON.parse((await AsyncStorage.getItem(key!))!);
}

const VARIANTS = ['Jeu de Base', 'Jeu de Base + Extension', 'Mode Incremental', 'Mode Rascal'];

async function startVariant(variant: string, players: string[]) {
  renderWithProviders(<HomeScreen />);
  fireEvent.press(await screen.findByText('Skull King'));
  fireEvent.press(screen.getAllByText('Jouer')[VARIANTS.indexOf(variant)]);
  for (const name of players) {
    fireEvent.press(await screen.findByText(name));
  }
  fireEvent.press(screen.getByText('Commencer la Partie'));
}

describe('HomeScreen - ongoing games', () => {
  const ongoing = makeGame({
    gameId: '100',
    currentRound: 3,
    players: [
      { id: 'player_0', name: 'Alice' },
      { id: 'player_1', name: 'Bob' },
      { id: 'ghost_barbe_grise', name: 'Fantôme de Barbe Grise' },
    ],
  });
  const solo = makeGame({ gameId: '200', currentRound: 1, players: [{ id: 'player_0', name: 'Alice' }] });
  const finished = makeGame({ gameId: '300', currentRound: 11 });
  const generic = { id: '400', name: 'Belote', players: [{ id: 'p', name: 'A', score: 0, history: [] }], createdAt: '', rounds: 2 };

  beforeEach(async () => {
    await seedStorage({
      skull_king_game_100: ongoing,
      skull_king_game_200: solo,
      skull_king_game_300: finished,
      board_games_counter_games: [generic],
    });
  });

  it('lists unfinished Skull King games and generic games', async () => {
    renderWithProviders(<HomeScreen />);
    expect(await screen.findByText('⚓ Manche 3/10')).toBeTruthy();
    expect(screen.getByText('30%')).toBeTruthy();
    // Le fantôme n'est pas compté
    expect(screen.getByText('👥 2 joueurs')).toBeTruthy();
    expect(screen.getByText('👥 1 joueur')).toBeTruthy();
    expect(screen.getByText('Belote')).toBeTruthy();
    expect(screen.getByText('👥 1 joueur • Manche 2')).toBeTruthy();
    expect(screen.queryByText('⚓ Manche 11/10')).toBeNull();
  });

  it('resumes a Skull King game', async () => {
    renderWithProviders(<HomeScreen />);
    await screen.findByText('⚓ Manche 3/10');
    fireEvent.press(screen.getAllByText('Continuer')[1]);
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/skull-king/[gameId]', params: { gameId: '100' } })
    );
  });

  it('resumes a generic game', async () => {
    renderWithProviders(<HomeScreen />);
    await screen.findByText('Belote');
    fireEvent.press(screen.getAllByText('Continuer')[2]);
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/[gameId]', params: { gameId: '400' } });
  });

  it('deletes a Skull King game after confirmation', async () => {
    renderWithProviders(<HomeScreen />);
    await screen.findByText('⚓ Manche 3/10');
    const trash = () => screen.UNSAFE_getAllByProps({ name: 'trash' });

    fireEvent.press(trash()[1]);
    fireEvent.press(screen.getByText('Annuler'));
    expect(screen.getByText('⚓ Manche 3/10')).toBeTruthy();

    fireEvent.press(trash()[1]);
    fireEvent.press(screen.getByText('Supprimer'));
    await waitFor(async () => expect(await AsyncStorage.getItem('skull_king_game_100')).toBeNull());
    expect(screen.queryByText('⚓ Manche 3/10')).toBeNull();
  });

  it('deletes a generic game after confirmation', async () => {
    renderWithProviders(<HomeScreen />);
    await screen.findByText('Belote');
    fireEvent.press(screen.UNSAFE_getAllByProps({ name: 'trash' })[2]);
    fireEvent.press(screen.getByText('Supprimer'));
    await waitFor(() => expect(screen.queryByText('Belote')).toBeNull());
  });
});

describe('HomeScreen - new game', () => {
  it('shows a loader then the game folder, collapsed by default', async () => {
    renderWithProviders(<HomeScreen />);
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(await screen.findByText('4 variantes')).toBeTruthy();
    expect(screen.queryByText('Jouer')).toBeNull();

    fireEvent.press(screen.getByText('Skull King'));
    expect(screen.getAllByText('Jouer')).toHaveLength(4);
    fireEvent.press(screen.getByText('Skull King'));
    expect(screen.queryByText('Jouer')).toBeNull();
  });

  it.each([
    ['Jeu de Base', 'base', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'skull-king', false],
    ['Jeu de Base + Extension', 'base-extension', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 'skull-king', true],
    ['Mode Incremental', 'incremental', [1, 2, 3, 4, 5, 4, 3, 2, 1], 'skull-king', false],
    ['Mode Rascal', 'rascal', [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1], 'rascal', false],
  ])('creates a %s game with 3 players', async (variant, mode, cardsPerRound, scoringSystem, extension) => {
    await startVariant(variant, ['Alban', 'Alexis', 'Quentin']);

    const game = await createdGame();
    expect(game.players.map(p => p.name)).toEqual(['Alban', 'Alexis', 'Quentin']);
    expect(game.config).toEqual({
      mode,
      scoringSystem,
      includeKraken: extension,
      includeWhaleWhite: extension,
      includePiratesPowers: false,
      include7And8: extension,
      cardsPerRound,
      playerCount: 3,
      twoPlayerVariant: false,
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/skull-king/game-setup');
  });

  it('offers the Grey Beard ghost with two players and adds it on "Oui"', async () => {
    await startVariant('Jeu de Base', ['Alban', 'Alexis']);
    expect(await screen.findByText('Mode 2 joueurs')).toBeTruthy();
    fireEvent.press(screen.getByText('Oui'));

    const game = await createdGame();
    expect(game.players.map(p => p.id)).toEqual(['player_0', 'player_1', 'ghost_barbe_grise']);
    expect(game.config.twoPlayerVariant).toBe(true);
  });

  it('creates a plain two-player game on "Non"', async () => {
    await startVariant('Jeu de Base', ['Alban', 'Alexis']);
    fireEvent.press(await screen.findByText('Non'));

    const game = await createdGame();
    expect(game.players).toHaveLength(2);
    expect(game.config.twoPlayerVariant).toBe(false);
  });

  // Régression : la sélection restait ouverte sous l'écran de configuration
  it('closes the player selection once the game is created', async () => {
    await startVariant('Jeu de Base', ['Alban', 'Alexis', 'Quentin']);
    await createdGame();
    expect(screen.queryByText('Sélectionner les Joueurs')).toBeNull();
  });

  it('closes the player selection on cancel', async () => {
    renderWithProviders(<HomeScreen />);
    fireEvent.press(await screen.findByText('Skull King'));
    fireEvent.press(screen.getAllByText('Jouer')[0]);
    expect(screen.getByText('Sélectionner les Joueurs')).toBeTruthy();
    fireEvent.press(screen.getByText('Annuler'));
    expect(screen.queryByText('Sélectionner les Joueurs')).toBeNull();
  });
});

it('uses the round count of the config for the progress', async () => {
  await seedStorage({ skull_king_game_1: makeGame({ gameId: '1', currentRound: 2, config: makeConfig({ cardsPerRound: [1, 2, 3, 4] }) }) });
  renderWithProviders(<HomeScreen />);
  expect(await screen.findByText('50%')).toBeTruthy();
});
