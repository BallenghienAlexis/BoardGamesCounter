import { act, renderHook, waitFor } from '@testing-library/react-native';
import { StatsProvider, useStats } from '../StatsContext';
import { statsService } from '../../utils/StatsService';
import type { PlayerGameResult } from '../../types/Stats';

const result: PlayerGameResult = {
  playerId: 'a',
  playerName: 'Alice',
  finalScore: 120,
  rank: 1,
  isWinner: true,
  gameMode: 'base',
  timestamp: '2026-01-01T00:00:00.000Z',
  gameId: 'g1',
};

const renderStats = async () => {
  const hook = renderHook(() => useStats(), { wrapper: StatsProvider });
  await waitFor(() => expect(hook.result.current.stats).not.toBeNull());
  return hook;
};

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('StatsContext', () => {
  it('loads stats on mount', async () => {
    const { result: hook } = await renderStats();
    expect(hook.current.loading).toBe(false);
    expect(hook.current.stats?.totalGamesPlayed).toBe(0);
  });

  it('records a game result and reloads the stats', async () => {
    const { result: hook } = await renderStats();
    await act(() => hook.current.recordGameResult('g1', 'base', [result]));
    expect(hook.current.stats?.totalGamesPlayed).toBe(1);
    expect(hook.current.getPlayerStats('a')?.wins).toBe(1);
    expect(hook.current.getPlayerStats('nobody')).toBeNull();
    expect(hook.current.getModeStats('base')?.totalGames).toBe(1);
    expect(hook.current.getModeStats('unknown' as never)).toBeNull();
  });

  it('resets the stats', async () => {
    const { result: hook } = await renderStats();
    await act(() => hook.current.recordGameResult('g1', 'base', [result]));
    await act(() => hook.current.resetStats());
    expect(hook.current.stats?.totalGamesPlayed).toBe(0);
  });

  it('returns null getters while stats are not loaded', () => {
    jest.spyOn(statsService, 'getStats').mockReturnValue(new Promise(() => {}));
    const { result: hook } = renderHook(() => useStats(), { wrapper: StatsProvider });
    expect(hook.current.stats).toBeNull();
    expect(hook.current.loading).toBe(true);
    expect(hook.current.getPlayerStats('a')).toBeNull();
    expect(hook.current.getModeStats('base')).toBeNull();
  });

  it('logs service failures', async () => {
    const { result: hook } = await renderStats();
    jest.spyOn(statsService, 'getStats').mockRejectedValue(new Error('load'));
    jest.spyOn(statsService, 'recordGameResult').mockRejectedValue(new Error('record'));
    jest.spyOn(statsService, 'resetStats').mockRejectedValue(new Error('reset'));

    await act(() => hook.current.loadStats());
    await act(() => hook.current.recordGameResult('g', 'base', []));
    await act(() => hook.current.resetStats());

    expect(warn).toHaveBeenCalledWith('Could not load stats:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith('Could not record game result:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith('Could not reset stats:', expect.any(Error));
    expect(hook.current.loading).toBe(false);
  });

  it('throws outside of the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useStats())).toThrow('useStats must be used within StatsProvider');
  });
});
