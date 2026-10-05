import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { GameProvider, useGames, type Game } from '../GameContext';
import { storageService } from '../../utils/StorageService';

const KEY = 'board_games_counter_games';

const renderGames = async () => {
  const hook = renderHook(() => useGames(), { wrapper: GameProvider });
  await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith(KEY));
  return hook;
};

const storedGames = async (): Promise<Game[]> => JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(Date, 'now').mockReturnValue(1000);
});
afterEach(() => jest.restoreAllMocks());

describe('GameContext', () => {
  it('loads saved games on mount', async () => {
    const saved: Game[] = [{ id: '1', name: 'Belote', players: [], createdAt: '2026-01-01', rounds: 3 }];
    await AsyncStorage.setItem(KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useGames(), { wrapper: GameProvider });
    await waitFor(() => expect(result.current.games).toEqual(saved));
  });

  it('starts empty when stored data is corrupted', async () => {
    await AsyncStorage.setItem(KEY, 'oops');
    const { result } = renderHook(() => useGames(), { wrapper: GameProvider });
    await waitFor(() => expect(warn).toHaveBeenCalledWith('Could not load games from storage:', expect.any(Error)));
    expect(result.current.games).toEqual([]);
  });

  it('creates a game, selects it and persists it', async () => {
    const { result } = await renderGames();
    act(() => result.current.createGame('Belote', ['Alice', 'Bob']));

    const game = result.current.games[0];
    expect(game).toMatchObject({ id: '1000', name: 'Belote', rounds: 1 });
    expect(game.players).toEqual([
      { id: 'player_0', name: 'Alice', score: 0, history: [] },
      { id: 'player_1', name: 'Bob', score: 0, history: [] },
    ]);
    expect(result.current.currentGame).toEqual(game);
    await waitFor(async () => expect(await storedGames()).toHaveLength(1));
  });

  it('adds points, keeps a history and undoes the last move', async () => {
    const { result } = await renderGames();
    act(() => result.current.createGame('Belote', ['Alice', 'Bob']));
    act(() => result.current.updatePlayerScore('1000', 'player_0', 10));
    act(() => result.current.updatePlayerScore('1000', 'player_0', 5));

    expect(result.current.games[0].players[0]).toMatchObject({ score: 15, history: [10, 15] });
    expect(result.current.games[0].players[1].score).toBe(0);
    expect(result.current.currentGame?.players[0].score).toBe(15);

    act(() => result.current.undoLastMove('1000', 'player_0'));
    expect(result.current.games[0].players[0]).toMatchObject({ score: 10, history: [10] });

    act(() => result.current.undoLastMove('1000', 'player_0'));
    expect(result.current.games[0].players[0]).toMatchObject({ score: 0, history: [] });

    // Rien à annuler : l'état ne change pas
    act(() => result.current.undoLastMove('1000', 'player_0'));
    expect(result.current.games[0].players[0]).toMatchObject({ score: 0, history: [] });
  });

  it('resets scores and rounds, and adds rounds', async () => {
    const { result } = await renderGames();
    act(() => result.current.createGame('Belote', ['Alice']));
    act(() => result.current.updatePlayerScore('1000', 'player_0', 10));
    act(() => result.current.addRound('1000'));
    act(() => result.current.addRound('1000'));
    expect(result.current.games[0].rounds).toBe(3);
    expect(result.current.currentGame?.rounds).toBe(3);

    act(() => result.current.resetGame('1000'));
    expect(result.current.games[0]).toMatchObject({ rounds: 1, players: [{ score: 0, history: [] }] });
    expect(result.current.currentGame?.rounds).toBe(1);
  });

  it('only touches the targeted game', async () => {
    const { result } = await renderGames();
    act(() => result.current.createGame('A', ['Alice']));
    jest.mocked(Date.now).mockReturnValue(2000);
    act(() => result.current.createGame('B', ['Bob']));
    // B est la partie courante : modifier A ne doit pas la changer
    act(() => result.current.updatePlayerScore('1000', 'player_0', 1));
    act(() => result.current.undoLastMove('1000', 'player_0'));
    act(() => result.current.addRound('1000'));
    act(() => result.current.resetGame('1000'));

    expect(result.current.currentGame?.name).toBe('B');
    expect(result.current.games[1]).toMatchObject({ name: 'B', rounds: 1, players: [{ score: 0 }] });
  });

  it('deletes a game and clears the selection if needed', async () => {
    const { result } = await renderGames();
    act(() => result.current.createGame('A', ['Alice']));
    jest.mocked(Date.now).mockReturnValue(2000);
    act(() => result.current.createGame('B', ['Bob']));

    act(() => result.current.deleteGame('1000'));
    expect(result.current.games.map(g => g.name)).toEqual(['B']);
    expect(result.current.currentGame?.name).toBe('B');

    act(() => result.current.deleteGame('2000'));
    expect(result.current.games).toEqual([]);
    expect(result.current.currentGame).toBeNull();
  });

  it('allows selecting the current game', async () => {
    const { result } = await renderGames();
    const game: Game = { id: 'x', name: 'X', players: [], createdAt: '', rounds: 1 };
    act(() => result.current.setCurrentGame(game));
    expect(result.current.currentGame).toBe(game);
  });

  it('logs when saving fails', async () => {
    jest.spyOn(storageService, 'setItem').mockRejectedValue(new Error('boom'));
    renderHook(() => useGames(), { wrapper: GameProvider });
    await waitFor(() => expect(warn).toHaveBeenCalledWith('Could not save games to storage:', expect.any(Error)));
  });

  it('throws outside of the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useGames())).toThrow('useGames must be used within GameProvider');
  });
});
