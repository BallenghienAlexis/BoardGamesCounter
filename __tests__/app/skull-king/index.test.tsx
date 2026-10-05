import React from 'react';
import { Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import SkullKingHomeScreen from '@/app/skull-king/index';
import { flushAsync, renderWithProviders, seedStorage } from '@/test-utils/render';
import { mockRouter } from '@/test-utils/router';
import { makeConfig, makeGame } from '@/test-utils/fixtures';
import type { SkullKingGameState } from '@/src/types/SkullKing';

async function renderScreen() {
  renderWithProviders(<SkullKingHomeScreen />);
  await flushAsync();
}

async function createdGame(): Promise<SkullKingGameState> {
  let key: string | undefined;
  await waitFor(async () => {
    key = (await AsyncStorage.getAllKeys()).find(k => k.startsWith('skull_king_game_'));
    expect(key).toBeDefined();
  });
  return JSON.parse((await AsyncStorage.getItem(key!))!);
}

const openModal = () => fireEvent.press(screen.UNSAFE_getByProps({ name: 'add' }));

describe('SkullKingHomeScreen - ongoing games', () => {
  it('shows an empty state', async () => {
    await renderScreen();
    expect(screen.getByText('Aucune partie en cours')).toBeTruthy();
  });

  it('lists ongoing games with their scores and resumes one', async () => {
    await seedStorage({
      skull_king_game_1: makeGame({ gameId: '1', currentRound: 4, playerScores: { player_0: 60 } }),
      skull_king_game_2: makeGame({ gameId: '2', config: makeConfig({ mode: 'incremental' }) }),
      skull_king_game_3: makeGame({ gameId: '3', config: makeConfig({ mode: 'base-extension' }) }),
    });
    await renderScreen();
    expect(screen.getByText('Manche 4/10')).toBeTruthy();
    expect(screen.getByText('Mode: Base')).toBeTruthy();
    expect(screen.getByText('Mode: Incrémental')).toBeTruthy();
    expect(screen.getByText('Mode: Base + Extension')).toBeTruthy();
    expect(screen.getByText('1. Alice — 60 pts')).toBeTruthy();
    expect(screen.getAllByText('Alice, Bob, Chloé')).toHaveLength(3);

    // Liste triée de la plus récente à la plus ancienne : la partie « 1 » est la dernière
    fireEvent.press(screen.getAllByText('Reprendre la partie')[2]);
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/skull-king/[gameId]', params: { gameId: '1' } })
    );
  });

  // BUG : une partie Rascal est présentée comme « Base + Extension ».
  it.failing('labels Rascal games correctly', async () => {
    await seedStorage({ skull_king_game_1: makeGame({ gameId: '1', config: makeConfig({ mode: 'rascal' }) }) });
    await renderScreen();
    expect(screen.queryByText('Mode: Base + Extension')).toBeNull();
  });
});

describe('SkullKingHomeScreen - new game modal', () => {
  it('creates a base game with the default players', async () => {
    await renderScreen();
    openModal();
    expect(screen.getByText('Nouvelle partie Skull King')).toBeTruthy();
    fireEvent.press(screen.getByText('Créer'));

    const game = await createdGame();
    expect(game.players).toEqual([
      { id: 'player_0', name: 'Joueur 1' },
      { id: 'player_1', name: 'Joueur 2' },
    ]);
    expect(game.config).toMatchObject({ mode: 'base', scoringSystem: 'skull-king', cardsPerRound: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] });
    expect(mockRouter.push).toHaveBeenCalledWith('/skull-king/game-setup');
    expect(screen.queryByText('Nouvelle partie Skull King')).toBeNull();
  });

  it('adds and removes players', async () => {
    await renderScreen();
    openModal();
    const input = screen.getByPlaceholderText('Ajouter un joueur');
    fireEvent.changeText(input, '   ');
    fireEvent.press(screen.getByText('+'));
    expect(screen.getByText('Joueurs (2)')).toBeTruthy();

    fireEvent.changeText(input, 'Zoé');
    fireEvent(input, 'submitEditing');
    expect(screen.getByText('Joueurs (3)')).toBeTruthy();
    expect(screen.getByText('Zoé')).toBeTruthy();

    fireEvent.press(screen.UNSAFE_getAllByProps({ name: 'close-circle' })[0]);
    expect(screen.queryByText('Joueur 1')).toBeNull();
    expect(screen.getByText('Joueurs (2)')).toBeTruthy();
    // Avec 2 joueurs, on ne peut plus en retirer
    expect(screen.UNSAFE_queryAllByProps({ name: 'close-circle' })).toHaveLength(0);
  });

  it('creates an extension game with the Rascal scoring', async () => {
    await renderScreen();
    openModal();
    fireEvent.press(screen.getByText('Base + Extension'));
    fireEvent.press(screen.getAllByText('Rascal')[1]);
    fireEvent.press(screen.getByText('Skull King'));
    fireEvent.press(screen.getAllByText('Rascal')[1]);
    fireEvent.press(screen.getByText('Créer'));

    const game = await createdGame();
    expect(game.config).toMatchObject({
      mode: 'base-extension',
      scoringSystem: 'rascal',
      includeKraken: true,
      include7And8: true,
    });
  });

  it('creates a Rascal game with its own rounds and hides the scoring choice', async () => {
    await renderScreen();
    openModal();
    fireEvent.press(screen.getAllByText('Rascal')[0]);
    expect(screen.queryByText('Système de scoring')).toBeNull();
    fireEvent.press(screen.getByText('Créer'));

    const game = await createdGame();
    expect(game.config).toMatchObject({
      mode: 'rascal',
      scoringSystem: 'rascal',
      cardsPerRound: [1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    });
  });

  it('creates an incremental game', async () => {
    await renderScreen();
    openModal();
    fireEvent.press(screen.getByText('Incrémental'));
    expect(screen.queryByText('Système de scoring')).toBeNull();
    fireEvent.press(screen.getByText('Jeu de Base'));
    expect(screen.getByText('Système de scoring')).toBeTruthy();
    fireEvent.press(screen.getByText('Incrémental'));
    fireEvent.press(screen.getByText('Créer'));
    expect((await createdGame()).config.mode).toBe('incremental');
  });

  it('adds the ghost in two-player mode and drops the option for more players', async () => {
    await renderScreen();
    openModal();
    fireEvent.press(screen.getByText('2'));
    fireEvent.press(screen.getByText(/Joueur vs Barbe Grise/));
    expect(screen.getByText('✓ Joueur vs Barbe Grise')).toBeTruthy();

    fireEvent.press(screen.getByText('4'));
    expect(screen.queryByText('Mode 2 joueurs')).toBeNull();
    fireEvent.press(screen.getByText('2'));
    expect(screen.getByText(' Joueur vs Barbe Grise')).toBeTruthy();

    fireEvent.press(screen.getByText(/Joueur vs Barbe Grise/));
    fireEvent.press(screen.getByText('Créer'));
    const game = await createdGame();
    expect(game.players.map(p => p.id)).toEqual(['player_0', 'player_1', 'ghost_barbe_grise']);
    expect(game.config).toMatchObject({ playerCount: 2, twoPlayerVariant: true });
  });

  it('closes the modal without creating a game', async () => {
    await renderScreen();
    openModal();
    fireEvent.press(screen.getByText('Annuler'));
    expect(screen.queryByText('Nouvelle partie Skull King')).toBeNull();

    openModal();
    fireEvent.press(screen.UNSAFE_getByProps({ name: 'close' }));
    expect(screen.queryByText('Nouvelle partie Skull King')).toBeNull();

    openModal();
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(screen.queryByText('Nouvelle partie Skull King')).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
