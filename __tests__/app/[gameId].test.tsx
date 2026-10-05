import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import GameScreen from '@/app/[gameId]';
import { renderWithProviders, seedStorage } from '@/test-utils/render';
import { mockRouter } from '@/test-utils/router';

const game = {
  id: '42',
  name: 'Belote',
  createdAt: '2026-01-01T00:00:00.000Z',
  rounds: 3,
  players: [
    { id: 'player_0', name: 'Alice', score: 10, history: [10] },
    { id: 'player_1', name: 'Bob', score: 30, history: [30] },
  ],
};

async function renderGame(gameId = '42') {
  jest.mocked(useLocalSearchParams).mockReturnValue({ gameId });
  await seedStorage({ board_games_counter_games: [game] });
  renderWithProviders(<GameScreen />);
}

describe('Generic counter screen', () => {
  it('shows a fallback for an unknown game', async () => {
    await renderGame('unknown');
    expect(await screen.findByText('Jeu non trouvé')).toBeTruthy();
    fireEvent.press(screen.getByText('Retour'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('shows the game, its round and a score input per player', async () => {
    await renderGame();
    expect(await screen.findByText('Belote')).toBeTruthy();
    expect(screen.getByText('Manche 3')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('adds points, undoes them and shows the ranking', async () => {
    await renderGame();
    await screen.findByText('Belote');
    fireEvent.press(screen.getAllByText('+50')[0]);
    fireEvent.press(screen.getAllByText('+5')[0]);
    fireEvent.press(screen.getAllByText('Annuler')[0]);

    fireEvent.press(screen.getByText('Score'));
    // Alice : 10 + 50 = 60 (le +5 a été annulé), première du classement
    expect(screen.getByText('60')).toBeTruthy();
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getAllByText(/^(Alice|Bob)$/).map(t => t.props.children)).toEqual(['Alice', 'Bob']);

    fireEvent.press(screen.getByText('Fermer'));
    expect(screen.queryByText('#1')).toBeNull();
  });

  it('announces the leader when finishing and goes back', async () => {
    await renderGame();
    fireEvent.press(await screen.findByText('Terminer'));
    expect(screen.getByText('Bob a remporté la victoire ! 🎉')).toBeTruthy();
    fireEvent.press(screen.getByText('Retour'));
    expect(mockRouter.back).toHaveBeenCalled();
    expect(screen.queryByText('Terminer le jeu')).toBeNull();
  });

  it('goes back with the header chevron and ignores the refresh icon', async () => {
    await renderGame();
    await screen.findByText('Belote');
    fireEvent.press(screen.UNSAFE_getByProps({ name: 'refresh' }));
    fireEvent.press(screen.UNSAFE_getByProps({ name: 'chevron-back' }));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('resets every score with "Nouvelle manche"', async () => {
    await renderGame();
    fireEvent.press(await screen.findByText('Nouvelle manche'));
    fireEvent.press(screen.getByText('Score'));
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  // BUG : le bouton « Nouvelle manche » appelle resetGame(), qui remet la manche à 1
  // au lieu de l'incrémenter (addRound existe mais n'est pas utilisé).
  it.failing('increments the round number with "Nouvelle manche"', async () => {
    await renderGame();
    fireEvent.press(await screen.findByText('Nouvelle manche'));
    expect(screen.getByText('Manche 4')).toBeTruthy();
  });
});
