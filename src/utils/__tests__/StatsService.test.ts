import AsyncStorage from '@react-native-async-storage/async-storage';
import { statsService } from '../StatsService';
import { storageService } from '../StorageService';
import type { PlayerGameResult } from '../../types/Stats';
import type { GameMode } from '../../types/SkullKing';

const KEY = 'skull_king_game_stats';

function result(playerId: string, finalScore: number, isWinner: boolean, gameMode: GameMode = 'base'): PlayerGameResult {
  return {
    playerId,
    playerName: playerId.toUpperCase(),
    finalScore,
    rank: isWinner ? 1 : 2,
    isWinner,
    gameMode,
    timestamp: '2026-01-01T00:00:00.000Z',
    gameId: 'g',
  };
}

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe('getStats', () => {
  it('returns empty stats for every mode when nothing is stored', async () => {
    const stats = await statsService.getStats();
    expect(stats.totalGamesPlayed).toBe(0);
    expect(stats.favoriteMode).toBeNull();
    expect(Object.keys(stats.stats)).toEqual(['base', 'base-extension', 'incremental', 'rascal']);
    expect(stats.playerStats).toEqual({});
  });

  it('returns empty stats when stored data is corrupted', async () => {
    await AsyncStorage.setItem(KEY, '{not json');
    const stats = await statsService.getStats();
    expect(stats.totalGamesPlayed).toBe(0);
    expect(warn).toHaveBeenCalledWith('Could not load stats:', expect.any(SyntaxError));
  });
});

describe('recordGameResult', () => {
  it('aggregates global and per-mode player stats across games', async () => {
    await statsService.recordGameResult('g1', 'base', [result('a', 100, true), result('b', 40, false)]);
    await statsService.recordGameResult('g2', 'base', [result('a', 20, false), result('b', 80, true)]);

    const stats = await statsService.getStats();
    expect(stats.totalGamesPlayed).toBe(2);
    expect(stats.favoriteMode).toBe('base');
    expect(stats.stats.base.totalGames).toBe(2);
    expect(stats.stats.base.totalPlayers).toBe(4);

    expect(stats.playerStats.a).toEqual({
      playerId: 'a',
      playerName: 'A',
      totalGames: 2,
      wins: 1,
      losses: 1,
      totalScore: 120,
      avgScore: 60,
      bestScore: 100,
      worstScore: 20,
      winRate: 50,
    });
    expect(stats.stats.base.playerStats.b).toMatchObject({ wins: 1, losses: 1, bestScore: 80, worstScore: 40 });
  });

  it('picks the mode with the most games as favourite', async () => {
    await statsService.recordGameResult('g1', 'rascal', [result('a', 10, true, 'rascal')]);
    await statsService.recordGameResult('g2', 'incremental', [result('a', 3, true, 'incremental')]);
    await statsService.recordGameResult('g3', 'incremental', [result('a', 5, true, 'incremental')]);

    const stats = await statsService.getStats();
    expect(stats.favoriteMode).toBe('incremental');
    expect(stats.stats.rascal.playerStats.a.totalGames).toBe(1);
    expect(stats.stats.incremental.playerStats.a.winRate).toBe(100);
  });

  it('creates the mode entry when older stored stats do not have it', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ totalGamesPlayed: 0, favoriteMode: null, stats: {}, playerStats: {} }));
    await statsService.recordGameResult('g1', 'rascal', [result('a', 10, true, 'rascal')]);
    expect((await statsService.getModeStats('rascal'))?.totalGames).toBe(1);
  });

  it('logs and does not throw when saving fails', async () => {
    jest.spyOn(statsService, 'getStats').mockRejectedValueOnce(new Error('boom'));
    await expect(statsService.recordGameResult('g', 'base', [])).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith('Could not record game result:', expect.any(Error));
  });
});

describe('getPlayerStats / getModeStats', () => {
  it('returns the stats of a known player or mode, null otherwise', async () => {
    await statsService.recordGameResult('g1', 'base', [result('a', 50, true)]);
    expect((await statsService.getPlayerStats('a'))?.totalGames).toBe(1);
    expect(await statsService.getPlayerStats('unknown')).toBeNull();
    expect((await statsService.getModeStats('base'))?.totalGames).toBe(1);
    expect(await statsService.getModeStats('nope' as GameMode)).toBeNull();
  });

  it('return null when stats cannot be read', async () => {
    jest.spyOn(statsService, 'getStats').mockRejectedValue(new Error('boom'));
    expect(await statsService.getPlayerStats('a')).toBeNull();
    expect(await statsService.getModeStats('base')).toBeNull();
    jest.mocked(statsService.getStats).mockRestore();
  });
});

describe('resetStats', () => {
  it('stores empty stats', async () => {
    await statsService.recordGameResult('g1', 'base', [result('a', 50, true)]);
    await statsService.resetStats();
    const stats = await statsService.getStats();
    expect(stats.totalGamesPlayed).toBe(0);
    expect(stats.playerStats).toEqual({});
  });

  it('logs and does not throw when the write fails', async () => {
    jest.spyOn(storageService, 'setItem').mockRejectedValueOnce(new Error('boom'));
    await expect(statsService.resetStats()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith('Could not reset stats:', expect.any(Error));
  });
});
