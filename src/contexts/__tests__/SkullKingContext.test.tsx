import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { SkullKingProvider, useSkullKingGame } from '../SkullKingContext';
import { storageService } from '../../utils/StorageService';
import { makeConfig, makeGame, PLAYERS } from '@/test-utils/fixtures';

const PREFIX = 'skull_king_game_';

const renderSkullKing = () => renderHook(() => useSkullKingGame(), { wrapper: SkullKingProvider });

const stored = async (gameId: string) => JSON.parse((await AsyncStorage.getItem(PREFIX + gameId)) ?? 'null');

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(Date, 'now').mockReturnValue(1000);
});
afterEach(() => jest.restoreAllMocks());

function startGame(cardsPerRound = [1, 2, 3]) {
  const hook = renderSkullKing();
  act(() => hook.result.current.createSkullKingGame(PLAYERS, makeConfig({ cardsPerRound })));
  return hook;
}

describe('createSkullKingGame', () => {
  it('creates the first round and zero scores, then auto-saves', async () => {
    const { result } = startGame();
    const state = result.current.gameState!;
    expect(state.gameId).toBe('1000');
    expect(state.currentRound).toBe(1);
    expect(state.rounds).toEqual([
      {
        roundNumber: 1,
        cardsDistributed: 1,
        playerBets: {},
        playerTricks: {},
        roundScores: {},
        bonuses: { player_0: {}, player_1: {}, player_2: {} },
      },
    ]);
    expect(state.playerScores).toEqual({ player_0: 0, player_1: 0, player_2: 0 });
    await waitFor(async () => expect((await stored('1000'))?.gameId).toBe('1000'));
  });
});

describe('round updates', () => {
  it('records bets, tricks and bonuses for a round', () => {
    const { result } = startGame();
    act(() => {
      result.current.updatePlayerBet(0, 'player_0', 1);
      result.current.updatePlayerTricks(0, 'player_0', 1);
      result.current.addBonus(0, 'player_0', 'card14Black', 1);
    });
    const round = result.current.gameState!.rounds[0];
    expect(round.playerBets).toEqual({ player_0: 1 });
    expect(round.playerTricks).toEqual({ player_0: 1 });
    expect(round.bonuses.player_0).toEqual({ card14Black: 1 });
  });

  it('computes the cumulative total from previous rounds', () => {
    const { result } = startGame();
    act(() => result.current.updateRoundScore(0, 'player_0', 20));
    act(() => result.current.nextRound());
    act(() => result.current.updateRoundScore(1, 'player_0', -10));
    expect(result.current.gameState!.playerScores.player_0).toBe(10);
    expect(result.current.gameState!.rounds[1].roundScores).toEqual({ player_0: -10 });
  });

  it('counts a round without a score for the player as zero', () => {
    const { result } = startGame();
    act(() => result.current.nextRound());
    act(() => result.current.updateRoundScore(1, 'player_1', 40));
    expect(result.current.gameState!.playerScores.player_1).toBe(40);
  });

  it('ignores updates for a round that does not exist', () => {
    const { result } = startGame();
    const before = result.current.gameState;
    act(() => {
      result.current.updatePlayerBet(5, 'player_0', 1);
      result.current.updatePlayerTricks(5, 'player_0', 1);
      result.current.updateRoundScore(5, 'player_0', 1);
      result.current.addBonus(5, 'player_0', 'card14Black', 1);
    });
    expect(result.current.gameState).toBe(before);
  });

  it('ignores updates when there is no game', () => {
    const { result } = renderSkullKing();
    act(() => {
      result.current.updatePlayerBet(0, 'player_0', 1);
      result.current.updatePlayerTricks(0, 'player_0', 1);
      result.current.updateRoundScore(0, 'player_0', 1);
      result.current.addBonus(0, 'player_0', 'card14Black', 1);
      result.current.nextRound();
      result.current.finishGame();
      result.current.resetGameWithSamePlayers();
    });
    expect(result.current.gameState).toBeNull();
  });
});

describe('nextRound / finishGame', () => {
  it('adds rounds with the configured card count up to the last round', () => {
    const { result } = startGame([1, 3]);
    act(() => result.current.nextRound());
    expect(result.current.gameState!.currentRound).toBe(2);
    expect(result.current.gameState!.rounds[1]).toMatchObject({ roundNumber: 2, cardsDistributed: 3 });

    act(() => result.current.nextRound());
    expect(result.current.gameState!.currentRound).toBe(2);
    expect(result.current.gameState!.rounds).toHaveLength(2);
  });

  it('marks the game as finished with currentRound = rounds + 1', () => {
    const { result } = startGame([1, 2]);
    act(() => result.current.finishGame());
    expect(result.current.gameState!.currentRound).toBe(3);
  });
});

describe('resetGameWithSamePlayers', () => {
  it('starts a new game with the same players and config', () => {
    const { result } = startGame();
    act(() => result.current.updateRoundScore(0, 'player_0', 20));
    jest.mocked(Date.now).mockReturnValue(2000);
    act(() => result.current.resetGameWithSamePlayers());

    const state = result.current.gameState!;
    expect(state.gameId).toBe('2000');
    expect(state.players).toEqual(PLAYERS);
    expect(state.currentRound).toBe(1);
    expect(state.rounds).toHaveLength(1);
    expect(state.playerScores.player_0).toBe(0);
  });
});

describe('persistence', () => {
  it('loads a saved game', async () => {
    const game = makeGame({ gameId: '42', currentRound: 4 });
    await AsyncStorage.setItem(PREFIX + '42', JSON.stringify(game));
    const { result } = renderSkullKing();
    await act(() => result.current.loadGameState('42'));
    expect(result.current.gameState).toEqual(game);
  });

  it('keeps the current state when the game does not exist or is corrupted', async () => {
    await AsyncStorage.setItem(PREFIX + 'bad', 'oops');
    const { result } = renderSkullKing();
    await act(() => result.current.loadGameState('missing'));
    await act(() => result.current.loadGameState('bad'));
    expect(result.current.gameState).toBeNull();
    expect(warn).toHaveBeenCalledWith('Could not load Skull King game state:', expect.any(Error));
  });

  it('lists unfinished games and all games, most recent first', async () => {
    const ongoing = makeGame({ gameId: '100', currentRound: 10 });
    const finished = makeGame({ gameId: '300', currentRound: 11 });
    const recent = makeGame({ gameId: '200', currentRound: 1 });
    await AsyncStorage.multiSet([
      [PREFIX + '100', JSON.stringify(ongoing)],
      [PREFIX + '300', JSON.stringify(finished)],
      [PREFIX + '200', JSON.stringify(recent)],
      [PREFIX + 'legacy', JSON.stringify({ gameId: 'legacy' })],
      ['board_games_saved_players', '[]'],
    ]);

    const { result } = renderSkullKing();
    const unfinished = await result.current.getUnfinishedGames();
    expect(unfinished.map(g => g.gameId)).toEqual(['200', '100']);

    const all = await result.current.getAllGames();
    expect(all.map(g => g.gameId)).toEqual(['300', '200', '100']);
  });

  it('skips keys whose value disappeared', async () => {
    jest.spyOn(storageService, 'getAllKeys').mockResolvedValue([PREFIX + 'ghost']);
    const { result } = renderSkullKing();
    expect(await result.current.getUnfinishedGames()).toEqual([]);
    expect(await result.current.getAllGames()).toEqual([]);
  });

  it('returns an empty list when storage cannot be read', async () => {
    jest.spyOn(storageService, 'getAllKeys').mockRejectedValue(new Error('boom'));
    const { result } = renderSkullKing();
    expect(await result.current.getUnfinishedGames()).toEqual([]);
    expect(await result.current.getAllGames()).toEqual([]);
    expect(warn).toHaveBeenCalledWith('Could not load unfinished games:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith('Could not load all games:', expect.any(Error));
  });

  it('deletes a game and clears it if it is the active one', async () => {
    const { result } = startGame();
    await waitFor(async () => expect(await stored('1000')).not.toBeNull());

    await act(() => result.current.deleteGame('other'));
    expect(result.current.gameState).not.toBeNull();

    await act(() => result.current.deleteGame('1000'));
    expect(result.current.gameState).toBeNull();
    expect(await stored('1000')).toBeNull();
  });

  it('logs when deleting fails', async () => {
    jest.spyOn(storageService, 'removeItem').mockRejectedValue(new Error('boom'));
    const { result } = renderSkullKing();
    await act(() => result.current.deleteGame('1'));
    expect(warn).toHaveBeenCalledWith('Could not delete game:', expect.any(Error));
  });

  it('saves explicitly on exit', async () => {
    const { result } = startGame();
    jest.mocked(AsyncStorage.setItem).mockClear();
    await act(() => result.current.exitGameCleanly());
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(PREFIX + '1000', JSON.stringify(result.current.gameState));
  });

  it('does nothing on save or exit without a game', async () => {
    const { result } = renderSkullKing();
    await act(() => result.current.saveGameState());
    await act(() => result.current.exitGameCleanly());
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('logs when saving fails', async () => {
    const { result } = startGame();
    jest.spyOn(storageService, 'setItem').mockRejectedValue(new Error('boom'));
    await act(() => result.current.saveGameState());
    await act(() => result.current.exitGameCleanly());
    expect(warn).toHaveBeenCalledWith('Could not save Skull King game state:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith('Could not save game state on exit:', expect.any(Error));
  });
});

it('throws outside of the provider', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderHook(() => useSkullKingGame())).toThrow('useSkullKingGame must be used within SkullKingProvider');
});
