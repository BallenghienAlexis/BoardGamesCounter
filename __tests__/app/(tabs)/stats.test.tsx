import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import StatsScreen from '@/app/(tabs)/stats';
import { flushAsync, renderWithProviders } from '@/test-utils/render';
import { statsService } from '@/src/utils/StatsService';
import type { PlayerGameResult } from '@/src/types/Stats';
import type { GameMode } from '@/src/types/SkullKing';

async function renderStats() {
  renderWithProviders(<StatsScreen />);
  // Les stats sont chargées par le provider puis par l'écran au focus
  await flushAsync();
}

const result = (playerId: string, playerName: string, finalScore: number, isWinner: boolean, gameMode: GameMode): PlayerGameResult => ({
  playerId,
  playerName,
  finalScore,
  rank: isWinner ? 1 : 2,
  isWinner,
  gameMode,
  timestamp: '2026-01-01T00:00:00.000Z',
  gameId: 'g',
});

describe('StatsScreen', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows a loading message before stats are loaded', () => {
    jest.spyOn(statsService, 'getStats').mockReturnValue(new Promise(() => {}));
    renderWithProviders(<StatsScreen />);
    expect(screen.getByText('Chargement des statistiques...')).toBeTruthy();
  });

  it('invites to play when no game was recorded', async () => {
    await renderStats();
    expect(await screen.findByText('Jouez des parties pour voir vos statistiques apparaître ici!')).toBeTruthy();
  });

  describe('with recorded games', () => {
    beforeEach(async () => {
      await statsService.recordGameResult('g1', 'base', [result('a', 'Alice', 120, true, 'base'), result('b', 'Bob', 40, false, 'base')]);
      await statsService.recordGameResult('g2', 'base', [result('a', 'Alice', 80, true, 'base'), result('b', 'Bob', 90, false, 'base')]);
      await statsService.recordGameResult('g3', 'rascal', [result('b', 'Bob', 50, true, 'rascal')]);
    });

    it('shows the global view and the player ranking by wins', async () => {
      await renderStats();
      expect(screen.getByText('📈 Vue Globale')).toBeTruthy();
      // Premier « 3 » : parties jouées dans la vue globale
      expect(screen.getAllByText('3')[0]).toHaveStyle({ fontSize: 24 });
      expect(screen.getByText('💀 Skull King - ⚓ Jeu de Base')).toBeTruthy();

      const names = screen.getAllByText(/^(Alice|Bob)$/).map(n => n.props.children);
      expect(names).toEqual(['Alice', 'Bob']);
      expect(screen.getByText('100%')).toBeTruthy();
      expect(screen.getByText('33%')).toBeTruthy();
    });

    it('shows the number of games per mode and the details of a selected mode', async () => {
      await renderStats();
      expect(screen.getByText('2 parties')).toBeTruthy();
      expect(screen.getByText('1 parties')).toBeTruthy();
      expect(screen.getAllByText('0 parties')).toHaveLength(2);

      fireEvent.press(screen.getByText('⚓ Jeu de Base'));
      // Jeu préféré + titre du détail
      expect(screen.getAllByText('💀 Skull King - ⚓ Jeu de Base')).toHaveLength(2);
      expect(screen.getByText('🏆 Meilleurs Joueurs de ce Mode')).toBeTruthy();
      expect(screen.getByText('2.0')).toBeTruthy();
      expect(screen.getByText('120/80')).toBeTruthy();
      expect(screen.getByText('90/40')).toBeTruthy();

      // Un second appui replie le détail
      fireEvent.press(screen.getByText('⚓ Jeu de Base'));
      expect(screen.queryByText('🏆 Meilleurs Joueurs de ce Mode')).toBeNull();
    });

    it('shows nothing more for a mode without games', async () => {
      await renderStats();
      fireEvent.press(screen.getByText('📊 Mode Incremental'));
      expect(screen.queryByText('🏆 Meilleurs Joueurs de ce Mode')).toBeNull();
    });
  });

  it('shows N/A when there is no favourite mode', async () => {
    jest.spyOn(statsService, 'getStats').mockResolvedValue({
      ...(await statsService.getStats()),
      totalGamesPlayed: 1,
      favoriteMode: null,
    });
    await renderStats();
    expect(screen.getByText('N/A')).toBeTruthy();
  });
});
