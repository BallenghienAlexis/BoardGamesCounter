import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PlayersProvider, usePlayers } from '../PlayersContext';
import { storageService } from '../../utils/StorageService';

const KEY = 'board_games_saved_players';
const DEFAULTS = ['Alban', 'Alexandre', 'Alexis', 'Anatole', 'Aurélien', 'Benjamin', 'Quentin', 'Timéo'];

const renderPlayers = () => renderHook(() => usePlayers(), { wrapper: PlayersProvider });

/** Attend la fin du chargement initial (qui écrit les joueurs par défaut). */
const renderLoadedPlayers = async () => {
  const hook = renderPlayers();
  await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalledWith(KEY, JSON.stringify(DEFAULTS)));
  return hook;
};

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('PlayersContext', () => {
  it('initialises storage with the default players on first launch', async () => {
    const { result } = renderPlayers();
    expect(result.current.savedPlayers).toEqual(DEFAULTS);
    await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem(KEY))!)).toEqual(DEFAULTS));
  });

  it('loads previously saved players', async () => {
    await AsyncStorage.setItem(KEY, JSON.stringify(['Zoé']));
    const { result } = renderPlayers();
    await waitFor(() => expect(result.current.savedPlayers).toEqual(['Zoé']));
  });

  it('falls back to the defaults when stored data is corrupted', async () => {
    await AsyncStorage.setItem(KEY, 'oops');
    const { result } = renderPlayers();
    await waitFor(() => expect(warn).toHaveBeenCalledWith('Could not load players from storage:', expect.any(Error)));
    expect(result.current.savedPlayers).toEqual(DEFAULTS);
  });

  it('adds a trimmed new player and persists the list', async () => {
    const { result } = await renderLoadedPlayers();
    await act(() => result.current.addPlayer('  Zoé  '));
    expect(result.current.savedPlayers).toEqual([...DEFAULTS, 'Zoé']);
    expect(JSON.parse((await AsyncStorage.getItem(KEY))!)).toContain('Zoé');
  });

  it('ignores empty names and duplicates', async () => {
    const { result } = await renderLoadedPlayers();
    await act(() => result.current.addPlayer('   '));
    await act(() => result.current.addPlayer('Alexis'));
    expect(result.current.savedPlayers).toEqual(DEFAULTS);
  });

  it('removes a player and persists the list', async () => {
    const { result } = await renderLoadedPlayers();
    await act(() => result.current.removePlayer('Alexis'));
    expect(result.current.savedPlayers).not.toContain('Alexis');
    expect(JSON.parse((await AsyncStorage.getItem(KEY))!)).not.toContain('Alexis');
  });

  it('logs storage failures when adding or removing', async () => {
    const { result } = await renderLoadedPlayers();
    jest.spyOn(storageService, 'setItem').mockRejectedValue(new Error('boom'));
    await act(() => result.current.addPlayer('Zoé'));
    await act(() => result.current.removePlayer('Zoé'));
    expect(warn).toHaveBeenCalledWith('Could not add player to storage:', expect.any(Error));
    expect(warn).toHaveBeenCalledWith('Could not remove player from storage:', expect.any(Error));
  });

  it('throws outside of the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => usePlayers())).toThrow('usePlayers must be used within PlayersProvider');
  });
});
