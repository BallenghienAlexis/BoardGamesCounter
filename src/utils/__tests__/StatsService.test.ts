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

describe('recording each game once', () => {
  it('ignores a game that was already recorded', async () => {
    await statsService.recordGameResult('g1', 'base', [result('a', 100, true)]);
    await statsService.recordGameResult('g1', 'base', [result('a', 100, true)]);
    const stats = await statsService.getStats();
    expect(stats.totalGamesPlayed).toBe(1);
    expect(stats.playerStats.a.totalGames).toBe(1);
    expect(stats.recordedGameIds).toEqual(['g1']);
  });
});

describe('stats stored by versions ≤ 1.2.7', () => {
  const legacyEntry = (playerId: string, playerName: string, games: number, wins: number, totalScore: number, best: number, worst: number) => ({
    playerId,
    playerName,
    totalGames: games,
    wins,
    losses: games - wins,
    totalScore,
    avgScore: totalScore / games,
    bestScore: best,
    worstScore: worst,
    winRate: (wins / games) * 100,
  });

  // Forme réelle produite par la 1.2.7 : clés positionnelles, sans recordedGameIds
  const legacy = {
    totalGamesPlayed: 3,
    favoriteMode: 'base',
    stats: {
      base: {
        mode: 'base',
        totalGames: 3,
        totalPlayers: 5,
        playerStats: { player_0: legacyEntry('player_0', 'Alexis', 3, 2, 300, 150, 50) },
      },
    },
    playerStats: {
      player_0: legacyEntry('player_0', 'Alexis', 3, 2, 300, 150, 50),
      player_1: legacyEntry('player_1', 'Alban', 2, 1, 100, 80, 20),
    },
  };

  it('re-keys positional ids by player name', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(legacy));
    const stats = await statsService.getStats();
    expect(Object.keys(stats.playerStats)).toEqual(['Alexis', 'Alban']);
    expect(stats.playerStats.Alexis).toMatchObject({ playerId: 'Alexis', totalGames: 3, wins: 2 });
    expect(Object.keys(stats.stats.base.playerStats)).toEqual(['Alexis']);
  });

  it('merges a legacy entry with the new entry of the same person', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(legacy));
    await statsService.recordGameResult('new', 'base', [
      { ...result('Alexis', 10, false), playerName: 'Alexis' },
    ]);
    const alexis = (await statsService.getStats()).playerStats.Alexis;
    expect(alexis).toMatchObject({ totalGames: 4, wins: 2, losses: 2, totalScore: 310, bestScore: 150, worstScore: 10, winRate: 50 });
    expect(alexis.avgScore).toBeCloseTo(77.5);
  });

  it('merges two legacy entries that now share a name', async () => {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ ...legacy, playerStats: { player_0: legacy.playerStats.player_0, Alexis: legacyEntry('Alexis', 'Alexis', 1, 0, 40, 40, 40) } })
    );
    const alexis = (await statsService.getStats()).playerStats.Alexis;
    expect(alexis).toMatchObject({ totalGames: 4, wins: 2, losses: 2, totalScore: 340, worstScore: 40 });
  });

  it('is idempotent and keeps non positional ids', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...legacy, playerStats: { custom: legacyEntry('custom', 'Zoé', 1, 1, 10, 10, 10) } }));
    const once = await statsService.getStats();
    await AsyncStorage.setItem(KEY, JSON.stringify(once));
    const twice = await statsService.getStats();
    expect(twice).toEqual(once);
    expect(Object.keys(twice.playerStats)).toEqual(['custom']);
  });

  it('tolerates missing sections and nameless entries', async () => {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ totalGamesPlayed: 0, favoriteMode: null, stats: { base: { mode: 'base', totalGames: 0, totalPlayers: 0 } }, playerStats: { player_3: { ...legacyEntry('player_3', '', 0, 0, 0, 0, 0) } } })
    );
    const stats = await statsService.getStats();
    expect(stats.stats.base.playerStats).toEqual({});
    expect(Object.keys(stats.playerStats)).toEqual(['player_3']);

    await AsyncStorage.setItem(KEY, JSON.stringify({ totalGamesPlayed: 0, favoriteMode: null }));
    expect((await statsService.getStats()).playerStats).toEqual({});
  });
});
