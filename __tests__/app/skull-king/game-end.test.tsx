import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Line } from 'react-native-svg';
import GameEndScreen from '@/app/skull-king/game-end';
import { flushAsync, renderWithGame, renderWithProviders } from '@/test-utils/render';
import { mockRouter } from '@/test-utils/router';
import { makeGame, makeRound } from '@/test-utils/fixtures';
import { statsService } from '@/src/utils/StatsService';

const finished = makeGame({
  gameId: '900',
  players: [
    { id: 'player_0', name: 'Alice' },
    { id: 'player_1', name: 'Bob' },
    { id: 'ghost_barbe_grise', name: 'Fantôme de Barbe Grise' },
  ],
  currentRound: 3,
  rounds: [makeRound(1, { player_0: 20, player_1: -10 }), makeRound(2, { player_0: -40, player_1: 30 })],
  playerScores: { player_0: -20, player_1: 20 },
});

describe('GameEndScreen', () => {
  it('renders nothing without an active game', async () => {
    renderWithProviders(<GameEndScreen />);
    await flushAsync();
    expect(screen.toJSON()).toBeNull();
  });

  it('crowns the winner, ranks players and draws the score chart without the ghost', async () => {
    await renderWithGame(<GameEndScreen />, finished);
    expect(screen.getByText('🎉 Partie Terminée')).toBeTruthy();
    expect(screen.getByText('Capitaine des Sept Mers!')).toBeTruthy();
    expect(screen.getAllByText('Bob')).toHaveLength(3); // vainqueur, légende, classement
    expect(screen.getAllByText('20')).toHaveLength(2);
    expect(screen.getByText('-20')).toBeTruthy();
    expect(screen.queryByText('Fantôme de Barbe Grise')).toBeNull();
    expect(screen.UNSAFE_getAllByType(Line).filter(l => l.props.strokeWidth === '2.5')).toHaveLength(2);
  });

  it('records the result in the statistics', async () => {
    const record = jest.spyOn(statsService, 'recordGameResult');
    await renderWithGame(<GameEndScreen />, finished);
    await waitFor(() => expect(record).toHaveBeenCalled());
    await flushAsync();
    const [gameId, mode, results] = record.mock.calls[0];
    expect(gameId).toBe('900');
    expect(mode).toBe('base');
    expect(results.map(r => [r.playerName, r.finalScore, r.rank, r.isWinner])).toEqual([
      ['Bob', 20, 1, true],
      ['Alice', -20, 2, false],
    ]);
    record.mockRestore();
  });

  it('logs when recording fails', async () => {
    jest.spyOn(statsService, 'recordGameResult').mockRejectedValue(new Error('boom'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await renderWithGame(<GameEndScreen />, finished);
    // Le contexte intercepte déjà l'erreur
    expect(warn).toHaveBeenCalledWith('Could not record game result:', expect.any(Error));
    jest.restoreAllMocks();
  });

  it('skips the chart for a game without rounds', async () => {
    await renderWithGame(<GameEndScreen />, { ...finished, rounds: [] });
    expect(screen.queryByText('📈 Évolution de la Partie')).toBeNull();
  });

  it('goes home', async () => {
    await renderWithGame(<GameEndScreen />, finished);
    fireEvent.press(screen.getByText("Retour à l'Accueil"));
    await flushAsync();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
  });

  it('starts a new game with the same players', async () => {
    await renderWithGame(<GameEndScreen />, finished);
    fireEvent.press(screen.getByText('Nouvelle Partie'));
    await flushAsync();
    expect(mockRouter.replace).toHaveBeenCalledWith('/skull-king/game-setup');
  });

  // BUG : la partie est enregistrée à chaque changement de gameState. « Nouvelle Partie »
  // remplace l'état avant de quitter l'écran, ce qui enregistre une seconde partie
  // (la nouvelle, à 0 point) dans les statistiques.
  it.failing('records the finished game only once when starting a new game', async () => {
    const record = jest.spyOn(statsService, 'recordGameResult');
    await renderWithGame(<GameEndScreen />, finished);
    fireEvent.press(screen.getByText('Nouvelle Partie'));
    await flushAsync();
    expect(record).toHaveBeenCalledTimes(1);
  });

  // BUG : les identifiants de joueurs sont positionnels (player_0, player_1…), et les
  // statistiques sont indexées par identifiant. Deux personnes différentes placées au même
  // rang dans deux parties sont fusionnées (et gardent le nom de la première).
  it.failing('keeps separate statistics for different people', async () => {
    const first = await renderWithGame(<GameEndScreen />, finished);
    first.unmount();
    const other = { ...finished, gameId: '901', players: [{ id: 'player_0', name: 'Zoé' }, { id: 'player_1', name: 'Yann' }] };
    await renderWithGame(<GameEndScreen />, other);
    const names = Object.values((await statsService.getStats()).playerStats).map(p => p.playerName);
    expect(names.sort()).toEqual(['Alice', 'Bob', 'Yann', 'Zoé']);
  });
});
