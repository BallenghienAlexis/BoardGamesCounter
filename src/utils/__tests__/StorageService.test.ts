import AsyncStorage from '@react-native-async-storage/async-storage';

type Service = typeof import('../StorageService').storageService;

// Chaque test part d'une instance neuve : le repli mémoire est un état de module.
function freshService(): Service {
  let service!: Service;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    service = require('../StorageService').storageService;
  });
  return service;
}

function breakAsyncStorage() {
  const error = new Error('native module unavailable');
  jest.mocked(AsyncStorage.removeItem).mockRejectedValueOnce(error);
  jest.mocked(AsyncStorage.getAllKeys).mockRejectedValueOnce(error);
  jest.mocked(AsyncStorage.clear).mockRejectedValueOnce(error);
}

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());

describe('StorageService with AsyncStorage available', () => {
  it('reads, writes and removes items through AsyncStorage', async () => {
    const service = freshService();
    await service.setItem('k', 'v');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('k', 'v');
    expect(await service.getItem('k')).toBe('v');

    await service.removeItem('k');
    expect(await service.getItem('k')).toBeNull();
  });

  it('lists keys and clears storage', async () => {
    const service = freshService();
    await service.setItem('a', '1');
    await service.setItem('b', '2');
    expect((await service.getAllKeys()).sort()).toEqual(['a', 'b']);

    await service.clear();
    expect(await service.getAllKeys()).toEqual([]);
  });
});

describe('StorageService memory fallback', () => {
  it('switches to memory when a read fails and keeps using it', async () => {
    const service = freshService();
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('boom'));

    expect(await service.getItem('missing')).toBeNull();
    expect(warn).toHaveBeenCalled();

    await service.setItem('k', 'v');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await service.getItem('k')).toBe('v');
    expect(await service.getAllKeys()).toEqual(['k']);

    await service.removeItem('k');
    expect(await service.getItem('k')).toBeNull();

    await service.setItem('x', '1');
    await service.clear();
    expect(await service.getAllKeys()).toEqual([]);
  });

  it('stores the value in memory when a write fails', async () => {
    const service = freshService();
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('boom'));

    await service.setItem('k', 'v');
    expect(await service.getItem('k')).toBe('v');
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
  });

  it('falls back to memory when remove, getAllKeys or clear fail', async () => {
    breakAsyncStorage();
    const removing = freshService();
    await removing.removeItem('k');
    expect(await removing.getAllKeys()).toEqual(expect.any(Array));

    const listing = freshService();
    expect(await listing.getAllKeys()).toEqual(expect.any(Array));

    const clearing = freshService();
    await clearing.clear();
    expect(await clearing.getAllKeys()).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(3);
  });
});
